"use server";

import { getCurrentUser } from "@/lib/auth/session-server";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { createSuggestion } from "@/lib/suggestions/create";

export type SuggestionState = { success: boolean; message?: string };

/** Recibe la sugerencia del modal. Quién la envía sale de la sesión, no del formulario. */
export async function sendSuggestion(formData: FormData): Promise<SuggestionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };
  }

  const result = await createSuggestion({
    userId: user.user_id,
    message: formData.get("message"),
    page: formData.get("page"),
  });
  if (!result.ok) return { success: false, message: result.message };

  await trackServer(user.user_id, ANALYTICS_EVENTS.suggestionSent, {});
  return { success: true, message: "¡Gracias! Leemos todas las sugerencias." };
}
