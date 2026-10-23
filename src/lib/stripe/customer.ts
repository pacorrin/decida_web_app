import "server-only";

import type Stripe from "stripe";
import type { users } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CheckoutUser = Pick<users, "user_id" | "user_email" | "user_stripe_customer_id">;

/** Reutiliza el Customer de la cuenta o lo crea (sin datos más allá del correo). */
export async function ensureStripeCustomer(
  stripe: Stripe,
  user: CheckoutUser,
): Promise<string> {
  if (user.user_stripe_customer_id) return user.user_stripe_customer_id;
  const customer = await stripe.customers.create(
    { email: user.user_email, metadata: { user_id: user.user_id } },
    { idempotencyKey: `customer-${user.user_id}` },
  );
  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { user_stripe_customer_id: customer.id },
  });
  return customer.id;
}
