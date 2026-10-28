import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { adjustCredits } from "./ledger";

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === "string" ? v : v.id;

/**
 * Ante `charge.refunded` de un cobro de plan: descuenta del saldo (hasta 0) los
 * créditos que abonó esa factura. Solo reembolsos totales; los parciales solo
 * se avisan por log para revisión manual. Idempotente por charge id.
 *
 * El cobro se liga a su factura por `invoicePayments` (la API actual ya no
 * expone `charge.invoice`), y la factura al abono por la clave `grant:{invoiceId}`.
 */
export async function handleStripeChargeRefunded(
  stripe: Stripe,
  charge: Stripe.Charge,
): Promise<"adjusted" | "ignored"> {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return "ignored";

  if (charge.amount_refunded < charge.amount) {
    console.warn("[credits] reembolso parcial: revisar los créditos a mano", {
      chargeId: charge.id,
      refunded: charge.amount_refunded,
      amount: charge.amount,
    });
    return "ignored";
  }

  const invoicePayments = await stripe.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    limit: 1,
  });
  const invoiceId = idOf(invoicePayments.data[0]?.invoice);
  if (!invoiceId) return "ignored";

  const grant = await prisma.credit_ledger.findUnique({
    where: { cled_idempotency_key: `grant:${invoiceId}` },
  });
  if (!grant || grant.cled_amount <= 0) return "ignored";

  const result = await adjustCredits({
    userId: grant.cled_user_id,
    amount: -grant.cled_amount,
    idempotencyKey: `adjustment:charge_refunded:${charge.id}`,
    metadata: {
      charge_id: charge.id,
      invoice_id: invoiceId,
      grant_ledger_id: grant.cled_id,
    },
  });

  if (result.created) {
    console.warn(
      "[credits] charge.refunded: ajuste de créditos aplicado; revisar manualmente",
      {
        chargeId: charge.id,
        userId: grant.cled_user_id,
        requested: -grant.cled_amount,
        applied: result.entry.cled_amount,
      },
    );
  }

  return result.created ? "adjusted" : "ignored";
}
