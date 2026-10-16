import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { sendBillingEmail } from "@/lib/email/billing";
import { hasFullAccess } from "./access";
import {
  mapStripeSubscription,
  shouldApplyStripeSubscription,
} from "./stripe-mapping";

const USER_FIELDS = {
  user_id: true,
  user_subscription_status: true,
  user_subscription_period_end: true,
  user_subscription_provider_id: true,
} as const;

export type ApplyResult = "activated" | "canceled" | "updated" | "ignored";

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === "string" ? v : v.id;

/** Cuenta dueña de un evento de Stripe: por customer y, si no, por metadata.user_id. */
export async function findUserForStripe(opts: {
  customerId?: string | null;
  userId?: string | null;
}) {
  if (opts.customerId) {
    const byCustomer = await prisma.users.findUnique({
      where: { user_stripe_customer_id: opts.customerId },
      select: USER_FIELDS,
    });
    if (byCustomer) return byCustomer;
  }
  if (opts.userId) {
    return prisma.users.findUnique({
      where: { user_id: opts.userId },
      select: USER_FIELDS,
    });
  }
  return null;
}

/**
 * Refleja una suscripción de Stripe en la cuenta. Idempotente: la comparten
 * el webhook y el retorno de Checkout. `subscription_activated` se emite una
 * sola vez, cuando la cuenta pasa de no tener acceso a tenerlo; el
 * `updateMany` condicional hace de cerrojo si ambos caminos corren a la vez.
 */
export async function applyStripeSubscription(
  userId: string,
  sub: Stripe.Subscription,
  entryPoint = "stripe",
): Promise<ApplyResult> {
  const now = new Date();
  const update = mapStripeSubscription(sub, now);
  if (!update) return "ignored";

  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: USER_FIELDS,
  });
  if (!user || !shouldApplyStripeSubscription(user, sub.id, now)) return "ignored";

  const hadAccess = hasFullAccess(user, now);

  // Cerrojo: solo "gana" quien cambia el estado o la suscripción asociada.
  const claimed = await prisma.users.updateMany({
    where: {
      user_id: userId,
      OR: [
        { user_subscription_status: { not: update.user_subscription_status } },
        { user_subscription_provider_id: null },
        { user_subscription_provider_id: { not: sub.id } },
      ],
    },
    data: update,
  });

  if (claimed.count === 0) {
    // Mismo estado: refresca fechas (renovaciones) sin disparar nada más.
    await prisma.users.update({ where: { user_id: userId }, data: update });
    return "updated";
  }

  if (update.user_subscription_status === "active" && !hadAccess) {
    await trackServer(userId, ANALYTICS_EVENTS.subscriptionActivated, {
      entry_point: entryPoint,
      provider: "stripe",
    });
    await sendBillingEmail(userId, {
      kind: "activated",
      nextDate: update.user_subscription_period_end ?? null,
    });
    return "activated";
  }

  // Reactivación hecha fuera de la app (Customer Portal): estaba cancelada
  // dentro del periodo pagado y vuelve a activa. Desde /cuenta ya quedó activa
  // y el cerrojo no gana, así que no se duplica.
  if (
    update.user_subscription_status === "active" &&
    user.user_subscription_status === "canceled" &&
    hadAccess
  ) {
    await sendBillingEmail(userId, {
      kind: "reactivated",
      nextDate: update.user_subscription_period_end ?? null,
    });
    return "updated";
  }

  // Cancelación hecha fuera de la app (Customer Portal o Dashboard de Stripe).
  // Las hechas desde /cuenta ya dejaron el estado en "canceled", así que aquí
  // el cerrojo no gana y no se duplica el correo.
  if (
    update.user_subscription_status === "canceled" &&
    user.user_subscription_status === "active"
  ) {
    await sendBillingEmail(userId, {
      kind: "canceled",
      accessUntil: update.user_subscription_period_end ?? null,
    });
    return "canceled";
  }
  return "updated";
}

/** Prisma P2002 = violación de unique (pago ya registrado). */
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002"
  );
}

/**
 * Registra el cobro de una factura pagada. Idempotente por
 * (provider, invoice id): un reintento del webhook no duplica la fila.
 * Devuelve true si creó la fila.
 */
export async function recordStripeInvoicePayment(
  userId: string,
  invoice: Stripe.Invoice,
): Promise<boolean> {
  try {
    await prisma.payments.create({
      data: {
        paym_user_id: userId,
        paym_asmt_id: null,
        paym_provider: "stripe",
        paym_provider_payment_id: invoice.id,
        paym_amount: invoice.amount_paid / 100,
        paym_currency: invoice.currency.toUpperCase(),
        paym_status: "paid",
        paym_paid_at: new Date(),
        // Solo ids y motivo; nada de datos de tarjeta ni de contacto.
        paym_raw_payload: {
          invoice_id: invoice.id,
          subscription_id: idOf(invoice.parent?.subscription_details?.subscription),
          billing_reason: invoice.billing_reason ?? null,
        },
      },
    });
    return true;
  } catch (err) {
    if (isUniqueViolation(err)) return false;
    throw err;
  }
}

export type CheckoutConfirmation = "activated" | "already" | "pending" | "invalid";

/**
 * Retorno de Checkout: recupera la sesión por API (robusto a webhook tardío),
 * verifica que es de esta cuenta y que está pagada, y activa.
 */
export async function confirmCheckoutSession(
  stripe: Stripe,
  userId: string,
  sessionId: string,
  entryPoint: string,
): Promise<CheckoutConfirmation> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return "invalid";
  }
  const owner = session.metadata?.user_id ?? session.client_reference_id;
  if (owner !== userId || session.mode !== "subscription") return "invalid";
  if (session.status !== "complete") return "pending";
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return "pending";
  }

  const subId = idOf(session.subscription);
  if (!subId) return "pending";
  const sub = await stripe.subscriptions.retrieve(subId);
  const result = await applyStripeSubscription(userId, sub, entryPoint);
  return result === "activated" ? "activated" : result === "ignored" ? "pending" : "already";
}
