"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { CANCEL_MESSAGES, planCancellation } from "@/lib/subscription/cancel";
import { getStripe } from "@/lib/stripe/client";
import { describeStripeError } from "@/lib/subscription/stripe-errors";
import { avatarKey, deleteUserFile, putUserFile } from "@/lib/storage/user-files";
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

/** La foto llega ya recortada y reducida por el navegador; aquí solo se comprueba que sea una imagen razonable. */
const AVATAR_MAX_BYTES = 400 * 1024;
const AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;

function hasImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  // WebP: "RIFF" .... "WEBP"
  return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

export async function saveAvatar(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };

  const file = formData.get("avatar");
  if (!(file instanceof File)) return { success: false, message: "Elige una imagen." };
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return { success: false, message: "Usa una imagen JPG, PNG o WebP." };
  }
  if (file.size > AVATAR_MAX_BYTES) return { success: false, message: "La imagen es demasiado pesada." };

  const data = new Uint8Array(await file.arrayBuffer());
  if (!hasImageSignature(data, file.type)) return { success: false, message: "El archivo no es una imagen válida." };

  try {
    await putUserFile(avatarKey(user.user_id), data, file.type);
  } catch {
    return { success: false, message: "No pudimos guardar tu foto. Intenta de nuevo." };
  }
  await prisma.users.update({ where: { user_id: user.user_id }, data: { user_avatar_version: new Date() } });

  revalidatePath("/cuenta", "layout");
  return { success: true };
}

export async function removeAvatar(): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };

  try {
    await deleteUserFile(avatarKey(user.user_id));
  } catch {
    return { success: false, message: "No pudimos quitar tu foto. Intenta de nuevo." };
  }
  await prisma.users.update({ where: { user_id: user.user_id }, data: { user_avatar_version: null } });

  revalidatePath("/cuenta", "layout");
  return { success: true };
}
