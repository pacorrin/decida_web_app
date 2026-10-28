import "server-only";

import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { expireCredits, resetCreditsToPlan } from "./ledger";
import { planFromSubscription, type Plan, type SubscriptionPlanSource } from "./plans";

/** Motivos de factura (Stripe `billing_reason`) que pueden renovar los créditos. */
export type InvoiceGrantInput = {
  billingReason: string | null | undefined;
  amountPaid: number;
  newPlanCredits: number;
  /** Créditos del plan de la última renovación registrada (0 si no hay). */
  lastGrantCredits: number;
};

/**
 * ¿Esta factura pagada restablece los créditos? Pura.
 * - alta del plan y renovación mensual: sí
 * - cambio de plan (`subscription_update`): solo una SUBIDA que se cobró ahora
 *   (la bajada espera a la próxima renovación, cuando el cobro ya es del plan nuevo)
 */
export function shouldGrantForInvoice(input: InvoiceGrantInput): boolean {
  switch (input.billingReason) {
    case "subscription_create":
    case "subscription_cycle":
      return true;
    case "subscription_update":
      return input.amountPaid > 0 && input.newPlanCredits > input.lastGrantCredits;
    default:
      return false;
  }
}

async function lastGrantCredits(userId: string): Promise<number> {
  const last = await prisma.credit_ledger.findFirst({
    where: { cled_user_id: userId, cled_type: "subscription_grant" },
    orderBy: { cled_created_at: "desc" },
    select: { cled_amount: true },
  });
  return last?.cled_amount ?? 0;
}

/** Restablece los créditos al plan, registra el movimiento y emite analítica. */
export async function grantPlanCredits(params: {
  userId: string;
  plan: Plan;
  idempotencyKey: string;
  paymentId?: string | null;
  source: "invoice" | "simulated";
  billingReason?: string | null;
}): Promise<boolean> {
  const result = await resetCreditsToPlan({
    userId: params.userId,
    credits: params.plan.credits,
    idempotencyKey: params.idempotencyKey,
    paymentId: params.paymentId,
    metadata: {
      plan_id: params.plan.id,
      credits: params.plan.credits,
      price_mxn: params.plan.priceMxn,
      source: params.source,
      billing_reason: params.billingReason ?? null,
    },
  });
  if (result.created) {
    await trackServer(params.userId, ANALYTICS_EVENTS.creditsGranted, {
      plan_id: params.plan.id,
      credits: params.plan.credits,
      expired: result.expired,
      billing_reason: params.billingReason ?? null,
      source: params.source,
    });
  }
  return result.created;
}

/**
 * Factura de suscripción pagada → créditos del plan. Idempotente por factura:
 * lo comparten el webhook y el retorno de Checkout.
 */
export async function grantCreditsForInvoice(params: {
  userId: string;
  sub: SubscriptionPlanSource;
  invoice: { id: string; billing_reason?: string | null; amount_paid: number };
}): Promise<boolean> {
  const plan = planFromSubscription(params.sub);
  if (!plan) return false;

  const last = await lastGrantCredits(params.userId);
  const grant = shouldGrantForInvoice({
    billingReason: params.invoice.billing_reason,
    amountPaid: params.invoice.amount_paid,
    newPlanCredits: plan.credits,
    lastGrantCredits: last,
  });
  if (!grant) return false;

  return grantPlanCredits({
    userId: params.userId,
    plan,
    idempotencyKey: `grant:${params.invoice.id}`,
    source: "invoice",
    billingReason: params.invoice.billing_reason,
  });
}

/** Suscripción terminada: los créditos que quedaban vencen. */
export async function expireCreditsForEndedSubscription(
  userId: string,
  subscriptionId: string,
): Promise<number> {
  const { expired } = await expireCredits({
    userId,
    idempotencyKey: `expire:sub_ended:${subscriptionId}`,
    reason: "subscription_ended",
    metadata: { reason: "subscription_ended", subscription_id: subscriptionId },
  });
  if (expired > 0) {
    await trackServer(userId, ANALYTICS_EVENTS.creditsExpired, {
      expired,
      reason: "subscription_ended",
    });
  }
  return expired;
}

/**
 * Red de seguridad si el webhook de cierre se retrasó: una suscripción cancelada
 * cuyo periodo ya terminó no conserva créditos. Barata: no hace nada si no aplica.
 */
export async function expireIfSubscriptionEnded(user: {
  user_id: string;
  user_credits_balance: number;
  user_subscription_status: string;
  user_subscription_period_end: Date | null;
  user_subscription_provider_id: string | null;
}, now: Date = new Date()): Promise<boolean> {
  if (user.user_credits_balance <= 0) return false;
  if (user.user_subscription_status !== "canceled") return false;
  const end = user.user_subscription_period_end;
  if (!end || end > now) return false;
  const key = user.user_subscription_provider_id ?? `end_${end.getTime()}`;
  return (await expireCreditsForEndedSubscription(user.user_id, key)) > 0;
}
