import { z } from "zod";

export const SUGGESTION_MIN_LENGTH = 10;
export const SUGGESTION_MAX_LENGTH = 2000;
/** Tope por persona para que el formulario no se use como buzón de spam. */
export const SUGGESTION_MAX_PER_HOUR = 5;

export const suggestionSchema = z.object({
  message: z
    .string()
    .trim()
    .min(SUGGESTION_MIN_LENGTH, "Cuéntanos un poco más (al menos 10 caracteres).")
    .max(SUGGESTION_MAX_LENGTH, "Tu mensaje es demasiado largo (máximo 2,000 caracteres)."),
});

/** Solo rutas internas y cortas: es contexto, nunca una URL arbitraria. */
export function sanitizePage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim().split(/[?#]/)[0];
  return path.startsWith("/") && !path.startsWith("//") && path.length <= 120 ? path : null;
}
