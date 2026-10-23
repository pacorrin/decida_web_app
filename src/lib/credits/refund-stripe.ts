import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { adjustCredits } from "./ledger";

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === "string" ? v : v.id;

/**
 * Ante `charge.refunded`: descuenta del saldo (hasta 0) el monto de la compra
 * de créditos asociada. Idempotente por charge id. Avisa por log para revisión.
 */
export async function handleStripeChargeRefunded(
  charge: Stripe.Charge,
): Promise<"adjusted" | "ignored"> {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return "ignored";

  const payment = await prisma.payments.findFirst({
    where: {
      paym_provider: "stripe",
      OR: [
        { paym_provider_payment_id: paymentIntentId },
        { paym_provider_session_id: paymentIntentId },
      ],
    },
    select: { paym_id: true, paym_user_id: true },
  });
  if (!payment?.paym_user_id) return "ignored";

  const purchase = await prisma.credit_ledger.findFirst({
    where: {
      cled_payment_id: payment.paym_id,
      cled_type: "purchase",
    },
    orderBy: { cled_created_at: "asc" },
  });
  if (!purchase || purchase.cled_amount <= 0) return "ignored";

  const result = await adjustCredits({
    userId: payment.paym_user_id,
    amount: -purchase.cled_amount,
    idempotencyKey: `adjustment:charge_refunded:${charge.id}`,
    metadata: {
      charge_id: charge.id,
      payment_id: payment.paym_id,
      purchase_ledger_id: purchase.cled_id,
    },
  });

  if (result.created) {
    console.warn(
      "[credits] charge.refunded: ajuste de créditos aplicado; revisar manualmente",
      {
        chargeId: charge.id,
        userId: payment.paym_user_id,
        requested: -purchase.cled_amount,
        applied: result.entry.cled_amount,
      },
    );
  }

  return result.created ? "adjusted" : "ignored";
}
