import "server-only";

import type Stripe from "stripe";
import type { users } from "@/generated/prisma/client";
import { getPlan, getStripePriceIdForPlan, type PlanId } from "@/lib/credits/plans";
import { getAppUrl } from "@/lib/stripe/config";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import { SUBSCRIPTION_CURRENCY } from "./activate";

type CheckoutUser = Pick<users, "user_id" | "user_email" | "user_stripe_customer_id">;

/** Crea la Checkout Session (suscripción mensual del plan, en MXN) y devuelve su URL. */
export async function createCheckoutSession(
  stripe: Stripe,
  user: CheckoutUser,
  returnPath: string,
  planId: PlanId,
): Promise<string> {
  const plan = getPlan(planId);
  if (!plan) throw new Error(`Plan desconocido: ${planId}`);

  const customer = await ensureStripeCustomer(stripe, user);
  const base = getAppUrl();
  const priceId = getStripePriceIdForPlan(plan.id);
  const metadata = { user_id: user.user_id, plan_id: plan.id };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.user_id,
    metadata,
    subscription_data: { metadata },
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: SUBSCRIPTION_CURRENCY.toLowerCase(),
              unit_amount: plan.priceMxn * 100,
              recurring: { interval: "month" },
              product_data: {
                name: `Decida ${plan.name}`,
                description: `${plan.credits} créditos al mes`,
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
