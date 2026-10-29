"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { createPortalUrl } from "@/lib/stripe/portal";
import { describeStripeError } from "@/lib/subscription/stripe-errors";
import { getPlan } from "@/lib/credits/plans";
import { startSubscription } from "@/lib/subscription/start";

export type SubscribeState = {
  success: boolean;
  message?: string;
  /** Destino externo (Stripe): el cliente navega; no se usa `redirect()` para no mostrar un error. */
  redirectUrl?: string;
};

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };
  }

  const plan = getPlan(String(formData.get("planId") ?? ""));
  if (!plan) return { success: false, message: "Ese plan no existe." };

  const result = await startSubscription(user, {
    returnTo: "account",
    planId: plan.id,
  });
  if (result.kind === "error") return { success: false, message: result.message };
  if (result.kind === "already") {
    return { success: false, message: "Tu cuenta ya tiene una suscripción vigente." };
  }
  if (result.kind === "redirect") return { success: true, redirectUrl: result.url };

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
  return { success: true, redirectUrl: url };
}
