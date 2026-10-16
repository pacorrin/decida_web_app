import "server-only";

import { getStripe } from "@/lib/stripe/client";
import { confirmCheckoutSession } from "./stripe-sync";
import type { SubscriptionEntryPoint } from "./start";

export type CheckoutReturn =
  | "none"
  | "cancelled"
  | "activated" // acabamos de activar (o ya estaba activa)
  | "pending" // pagó pero aún no se refleja: el webhook lo completará
  | "invalid";

/**
 * Interpreta `?checkout=` / `?session_id=` al volver de Stripe Checkout.
 * Recupera la sesión por API, así que no depende de que el webhook llegue
 * primero. Es idempotente y segura de repetir (recarga de la página).
 */
export async function resolveCheckoutReturn(
  userId: string,
  params: { checkout?: string; session_id?: string },
  entryPoint: SubscriptionEntryPoint,
): Promise<CheckoutReturn> {
  if (params.checkout === "cancelled") return "cancelled";
  if (params.checkout !== "success" || !params.session_id) return "none";
  const stripe = getStripe();
  if (!stripe) return "none";
  const result = await confirmCheckoutSession(
    stripe,
    userId,
    params.session_id,
    entryPoint,
  );
  if (result === "invalid") return "invalid";
  return result === "pending" ? "pending" : "activated";
}
