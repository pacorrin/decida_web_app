"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { CANCEL_MESSAGES, planCancellation } from "@/lib/subscription/cancel";

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
  return { success: true, message: "Suscripción cancelada." };
}
