import "server-only";

import type { users } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import { describeStripeError } from "@/lib/subscription/stripe-errors";
import { createCreditsCheckoutSession } from "./checkout";
import { recordPurchase } from "./ledger";
import {
  getCreditPackage,
  packageCreditAmount,
  type CreditPackageId,
} from "./packages";
import { CREDITS_PACKAGES_PATH } from "./paths";

export type StartCreditPurchaseResult =
  | { kind: "redirect"; url: string }
  | { kind: "credited" } // modo simulado (sin Stripe)
  | { kind: "error"; message: string };

type PurchaseUser = Pick<
  users,
  "user_id" | "user_email" | "user_stripe_customer_id"
>;

/**
 * Inicia la compra de un paquete. Con Stripe → Checkout; sin él → acredita
 * de inmediato (desarrollo local / e2e), igual que la suscripción simulada.
 */
export async function startCreditPurchase(
  user: PurchaseUser,
  packageId: CreditPackageId,
  returnPath: string = CREDITS_PACKAGES_PATH,
): Promise<StartCreditPurchaseResult> {
  const pkg = getCreditPackage(packageId);
  if (!pkg) {
    return { kind: "error", message: "Ese paquete de créditos no existe." };
  }

  const stripe = getStripe();
  if (!stripe) {
    const simulatedSessionId = `sim_${user.user_id}_${pkg.id}_${Date.now()}`;
    const payment = await prisma.payments.create({
      data: {
        paym_user_id: user.user_id,
        paym_provider: "simulated",
        paym_provider_session_id: simulatedSessionId,
        paym_provider_payment_id: simulatedSessionId,
        paym_amount: pkg.priceMxn,
        paym_currency: "MXN",
        paym_status: "paid",
        paym_paid_at: new Date(),
        paym_raw_payload: {
          package_id: pkg.id,
          credits: pkg.credits,
          simulated: true,
        },
      },
    });
    await recordPurchase({
      userId: user.user_id,
      amount: packageCreditAmount(pkg),
      paymentId: payment.paym_id,
      stripeSessionId: simulatedSessionId,
      metadata: {
        package_id: pkg.id,
        credits: pkg.credits,
        price_mxn: pkg.priceMxn,
        simulated: true,
      },
    });
    return { kind: "credited" };
  }

  try {
    const url = await createCreditsCheckoutSession(
      stripe,
      user,
      packageId,
      returnPath,
    );
    return { kind: "redirect", url };
  } catch (err) {
    return { kind: "error", message: describeStripeError(err) };
  }
}
