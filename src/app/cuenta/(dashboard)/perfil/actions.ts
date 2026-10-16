"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { CANCEL_MESSAGES, planCancellation } from "@/lib/subscription/cancel";
import { getStripe } from "@/lib/stripe/client";
import { describeStripeError } from "@/lib/subscription/stripe-errors";
import { trackServer } from "@/lib/analytics/server";
import { sendBillingEmail } from "@/lib/email/billing";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export type CancelSubscriptionState = {
  success: boolean;
  message?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function cancelSubscription(
  _prev: CancelSubscriptionState,
): Promise<CancelSubscriptionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };
  }

  const plan = planCancellation(user);
  if (!plan.ok) {
    return { success: false, message: CANCEL_MESSAGES[plan.reason] };
  }

  // Suscripción cobrada por Stripe: se cancela al fin del periodo allá primero
  // (sin reembolso ni prorrateo); el webhook confirmará el estado.
  if (
    user.user_subscription_provider === "stripe" &&
    user.user_subscription_provider_id
  ) {
    const stripe = getStripe();
    if (!stripe) {
      return {
        success: false,
        message: "No pudimos conectar con el procesador de pagos. Intenta más tarde.",
      };
    }
    try {
      await stripe.subscriptions.update(user.user_subscription_provider_id, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      return { success: false, message: describeStripeError(err) };
    }
  }

  // Condición en el where: evita doble cancelación por carreras.
  const { count } = await prisma.users.updateMany({
    where: { user_id: user.user_id, user_subscription_status: "active" },
    data: plan.data,
  });

  revalidatePath("/cuenta/perfil");
  revalidatePath("/cuenta");

  if (count === 0) {
    return { success: false, message: CANCEL_MESSAGES.already_canceled };
  }

  await trackServer(user.user_id, ANALYTICS_EVENTS.subscriptionCancelled);
  // Solo con cobro real: en modo simulado no hubo pago que confirmar.
  if (user.user_subscription_provider === "stripe") {
    await sendBillingEmail(user.user_id, {
      kind: "canceled",
      accessUntil: user.user_subscription_period_end,
    });
  }
  return { success: true, message: "Suscripción cancelada." };
}
