"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { redirect } from "next/navigation";
import { createPortalUrl } from "@/lib/stripe/portal";
import { describeStripeError } from "@/lib/subscription/stripe-errors";
import { startSubscription } from "@/lib/subscription/start";

export type SubscribeState = {
  success: boolean;
  message?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function subscribe(_prev: SubscribeState): Promise<SubscribeState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };
  }

  const result = await startSubscription(user, { returnTo: "account" });
  if (result.kind === "error") return { success: false, message: result.message };
  if (result.kind === "already") {
    return { success: false, message: "Tu cuenta ya tiene una suscripción vigente." };
  }
  if (result.kind === "redirect") redirect(result.url);

  revalidatePath("/cuenta", "layout");
  return { success: true };
}

/** Abre el Customer Portal de Stripe (método de pago y facturas). */
export async function openBillingPortal(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: SubscribeState,
): Promise<SubscribeState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };
  }
  if (!user.user_stripe_customer_id) {
    return { success: false, message: "Tu cuenta no tiene un método de pago registrado." };
  }
  let url: string | null = null;
  try {
    url = await createPortalUrl(user.user_stripe_customer_id);
  } catch (err) {
    return { success: false, message: describeStripeError(err) };
  }
  if (!url) return { success: false, message: "El portal de pagos no está disponible." };
  redirect(url);
}
