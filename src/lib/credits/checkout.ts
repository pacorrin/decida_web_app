import "server-only";

import type Stripe from "stripe";
import type { users } from "@/generated/prisma/client";
import { getAppUrl } from "@/lib/stripe/config";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import {
  getCreditPackage,
  getStripePriceIdForPackage,
  type CreditPackageId,
} from "./packages";
import { CREDITS_PACKAGES_PATH } from "./paths";

type CheckoutUser = Pick<users, "user_id" | "user_email" | "user_stripe_customer_id">;

/**
 * Checkout Session one-shot (`mode: payment`) para un paquete de créditos.
 * Metadata: `{ user_id, package_id }`.
 */
export async function createCreditsCheckoutSession(
  stripe: Stripe,
  user: CheckoutUser,
  packageId: CreditPackageId,
  returnPath: string = CREDITS_PACKAGES_PATH,
): Promise<string> {
  const pkg = getCreditPackage(packageId);
  if (!pkg) throw new Error(`Paquete desconocido: ${packageId}`);

  const customer = await ensureStripeCustomer(stripe, user);
  const base = getAppUrl();
  const priceId = getStripePriceIdForPackage(packageId);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer,
    client_reference_id: user.user_id,
    metadata: {
      user_id: user.user_id,
      package_id: pkg.id,
    },
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "mxn",
              unit_amount: pkg.priceMxn * 100,
              product_data: {
                name: `Decida — ${pkg.label}`,
                description: `${pkg.credits} crédito${pkg.credits === 1 ? "" : "s"} (no caducan)`,
              },
            },
          },
    ],
    success_url: `${base}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${returnPath}?checkout=cancelled`,
  });

  if (!session.url) throw new Error("Stripe no devolvió la URL de Checkout.");
  return session.url;
}
