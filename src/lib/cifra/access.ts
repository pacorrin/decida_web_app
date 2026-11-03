import "server-only";

import { getCurrentUser } from "@/lib/auth/session-server";
import { hasFullAccess } from "@/lib/subscription/access";

export type CifraAccess =
  | { ok: true; userId: string }
  | { ok: false; reason: "no_session" | "no_plan" };

/** Cifra exige sesión y un plan vigente (mínimo Explora). Los datos se conservan sin plan. */
export async function getCifraAccess(): Promise<CifraAccess> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "no_session" };
  if (!hasFullAccess(user)) return { ok: false, reason: "no_plan" };
  return { ok: true, userId: user.user_id };
}

export const CIFRA_ACCESS_MESSAGES = {
  no_session: "Tu sesión expiró. Inicia sesión de nuevo.",
  no_plan: "Cifra requiere un plan activo. Elige uno para seguir registrando.",
} as const;
