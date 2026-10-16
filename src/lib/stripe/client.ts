import "server-only";

import Stripe from "stripe";
import { isStripeEnabled } from "./config";

let client: Stripe | null = null;

/** Cliente de Stripe o null si no hay `STRIPE_SECRET_KEY` (modo simulado). */
export function getStripe(): Stripe | null {
  if (!isStripeEnabled()) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
    appInfo: { name: "Decida" },
  });
  return client;
}
