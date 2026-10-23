import "server-only";

import type Stripe from "stripe";
import type { users } from "@/generated/prisma/client";
import { getAppUrl, getStripePriceId } from "@/lib/stripe/config";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import {
  SUBSCRIPTION_CURRENCY,
  SUBSCRIPTION_PRICE_MXN,
} from "./activate";

type CheckoutUser = Pick<users, "user_id" | "user_email" | "user_stripe_customer_id">;

/** Crea la Checkout Session (suscripción mensual en MXN) y devuelve su URL. */
export async function createCheckoutSession(
  stripe: Stripe,
  user: CheckoutUser,
  returnPath: string,
): Promise<string> {
  const customer = await ensureStripeCustomer(stripe, user);
  const base = getAppUrl();
  const priceId = getStripePriceId();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.user_id,
    metadata: { user_id: user.user_id },
    subscription_data: { metadata: { user_id: user.user_id } },
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: SUBSCRIPTION_CURRENCY.toLowerCase(),
              unit_amount: SUBSCRIPTION_PRICE_MXN * 100,
              recurring: { interval: "month" },
              product_data: { name: "Decida — Suscripción" },
            },
          },
    ],
    success_url: `${base}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${returnPath}?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Stripe no devolvió la URL de Checkout.");
  return session.url;
}
