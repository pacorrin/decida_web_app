import "server-only";

import type Stripe from "stripe";
import type { users } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getStripePriceId } from "@/lib/stripe/config";
import {
  SUBSCRIPTION_CURRENCY,
  SUBSCRIPTION_PRICE_MXN,
} from "./activate";

type CheckoutUser = Pick<users, "user_id" | "user_email" | "user_stripe_customer_id">;

/** Reutiliza el Customer de la cuenta o lo crea (sin datos más allá del correo). */
async function ensureCustomer(stripe: Stripe, user: CheckoutUser): Promise<string> {
  if (user.user_stripe_customer_id) return user.user_stripe_customer_id;
  const customer = await stripe.customers.create(
    { email: user.user_email, metadata: { user_id: user.user_id } },
    { idempotencyKey: `customer-${user.user_id}` },
  );
  // El unique evita que dos peticiones guarden clientes distintos.
  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { user_stripe_customer_id: customer.id },
  });
  return customer.id;
}

/** Crea la Checkout Session (suscripción mensual en MXN) y devuelve su URL. */
export async function createCheckoutSession(
  stripe: Stripe,
  user: CheckoutUser,
  returnPath: string,
): Promise<string> {
  const customer = await ensureCustomer(stripe, user);
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
