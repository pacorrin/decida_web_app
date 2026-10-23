import "server-only";

import { getStripe } from "@/lib/stripe/client";
import { confirmCreditCheckoutSession } from "./fulfill";

export type CreditCheckoutReturn =
  | "none"
  | "cancelled"
  | "credited"
  | "pending"
  | "invalid";

/**
 * Interpreta `?checkout=` / `?session_id=` al volver de Checkout de créditos.
 */
export async function resolveCreditCheckoutReturn(
  userId: string,
  params: { checkout?: string; session_id?: string },
): Promise<CreditCheckoutReturn> {
  if (params.checkout === "cancelled") return "cancelled";
  if (params.checkout !== "success" || !params.session_id) return "none";

  const stripe = getStripe();
  if (!stripe) return "none";

  const result = await confirmCreditCheckoutSession(
    stripe,
    userId,
    params.session_id,
  );
  if (result === "invalid") return "invalid";
  if (result === "pending") return "pending";
  return "credited"; // credited | already
}
