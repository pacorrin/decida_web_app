import "server-only";

import { prisma } from "@/lib/prisma";
import { SUGGESTION_MAX_PER_HOUR, sanitizePage, suggestionSchema } from "./schema";

export type CreateSuggestionResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "rate_limited"; message: string };

/**
 * Guarda una sugerencia de la persona con sesión. El usuario se toma de la
 * sesión (no del formulario) y no se le muestra. Limita a
 * `SUGGESTION_MAX_PER_HOUR` por hora.
 */
export async function createSuggestion(params: {
  userId: string;
  message: unknown;
  page?: unknown;
  now?: Date;
}): Promise<CreateSuggestionResult> {
  const parsed = suggestionSchema.safeParse({ message: params.message });
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: parsed.error.issues[0]?.message ?? "Revisa tu mensaje.",
    };
  }

  const now = params.now ?? new Date();
  const recent = await prisma.suggestions.count({
    where: {
      sugg_user_id: params.userId,
      sugg_created_at: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
    },
  });
  if (recent >= SUGGESTION_MAX_PER_HOUR) {
    return {
      ok: false,
      reason: "rate_limited",
      message: "Ya nos enviaste varias sugerencias seguidas. Intenta de nuevo en un rato.",
    };
  }

  await prisma.suggestions.create({
    data: {
      sugg_user_id: params.userId,
      sugg_message: parsed.data.message,
      sugg_page: sanitizePage(params.page),
      sugg_created_at: now,
    },
  });
  return { ok: true };
}
