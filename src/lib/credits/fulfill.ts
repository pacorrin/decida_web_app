import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { recordPurchase } from "./ledger";
import {
  getCreditPackage,
  packageCreditAmount,
  type CreditPackageId,
} from "./packages";

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  );
}

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === "string" ? v : v.id;

export type FulfillResult = "credited" | "already" | "ignored";

/**
 * Acredita el paquete de una Checkout Session pagada.
 * Idempotente por `purchase:{sessionId}` (y unique de payments).
 */
export async function fulfillCreditCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillResult> {
  if (session.mode !== "payment") return "ignored";
  if (session.payment_status !== "paid") return "ignored";

  const userId =
    session.metadata?.user_id ?? session.client_reference_id ?? null;
  const packageId = session.metadata?.package_id as CreditPackageId | undefined;
  if (!userId || !packageId) return "ignored";

  const pkg = getCreditPackage(packageId);
  if (!pkg) return "ignored";

  const paymentIntentId = idOf(session.payment_intent);
  const providerPaymentId = paymentIntentId ?? session.id;
  const amountMxn =
    session.amount_total != null
      ? session.amount_total / 100
      : pkg.priceMxn;
  const currency = (session.currency ?? "mxn").toUpperCase();

  let paymentId: string;
  try {
    const payment = await prisma.payments.create({
      data: {
        paym_user_id: userId,
        paym_asmt_id: null,
        paym_provider: "stripe",
        paym_provider_session_id: session.id,
        paym_provider_payment_id: providerPaymentId,
        paym_amount: amountMxn,
        paym_currency: currency,
        paym_status: "paid",
        paym_paid_at: new Date(),
        paym_raw_payload: {
          session_id: session.id,
          payment_intent_id: paymentIntentId,
          package_id: pkg.id,
          credits: pkg.credits,
        },
      },
    });
    paymentId = payment.paym_id;
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const existing = await prisma.payments.findFirst({
      where: {
        paym_provider: "stripe",
        paym_provider_payment_id: providerPaymentId,
      },
      select: { paym_id: true },
    });
    if (!existing) throw err;
    paymentId = existing.paym_id;
  }

  const result = await recordPurchase({
    userId,
    amount: packageCreditAmount(pkg),
    paymentId,
    stripeSessionId: session.id,
    metadata: {
      package_id: pkg.id,
      credits: pkg.credits,
      price_mxn: pkg.priceMxn,
    },
  });

  if (result.created) {
    await trackServer(userId, ANALYTICS_EVENTS.creditsPurchased, {
      package_id: pkg.id,
      credits: pkg.credits,
      price_mxn: pkg.priceMxn,
    });
  }

  return result.created ? "credited" : "already";
}

/** Confirma una sesión al volver de Checkout (robusto a webhook tardío). */
export async function confirmCreditCheckoutSession(
  stripe: Stripe,
  userId: string,
  sessionId: string,
): Promise<FulfillResult | "pending" | "invalid"> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return "invalid";
  }

  const sessionUser =
    session.metadata?.user_id ?? session.client_reference_id ?? null;
  if (sessionUser !== userId) return "invalid";
  if (session.mode !== "payment") return "invalid";

  if (session.payment_status === "unpaid") return "pending";
  if (session.payment_status !== "paid") return "invalid";

  return fulfillCreditCheckoutSession(session);
}
