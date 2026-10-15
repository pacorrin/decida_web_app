"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { activateSimulatedSubscription } from "@/lib/subscription/subscribe";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

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

  const activated = await activateSimulatedSubscription(user);
  if (!activated) {
    return { success: false, message: "Tu cuenta ya tiene una suscripción vigente." };
  }

  await trackServer(user.user_id, ANALYTICS_EVENTS.subscriptionActivated, {
    entry_point: "account",
  });

  revalidatePath("/cuenta", "layout");
  return { success: true };
}
