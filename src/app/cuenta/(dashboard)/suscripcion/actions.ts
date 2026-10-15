"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { activateSimulatedSubscription } from "@/lib/subscription/subscribe";

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

  revalidatePath("/cuenta", "layout");
  return { success: true };
}
