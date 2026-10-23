import { CREDIT_COST_BASIC } from "@/lib/credits/costs";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";

/** @deprecated Prefer CREDITS_PACKAGES_PATH; se mantiene por imports legacy. */
export const SUBSCRIPTION_PATH = "/cuenta/suscripcion";

/** Destino cuando no hay saldo para otra evaluación. */
export const PLANS_PATH = `${CREDITS_PACKAGES_PATH}?limite=1`;

export type AssessmentStartDecision = "create" | "resume" | "limit";

/**
 * Decide qué hacer al pedir una nueva evaluación:
 * - sin evaluaciones: la gratuita
 * - en curso: retomar
 * - ya completó alguna: crear solo si saldo ≥ costo básico (50)
 */
export function decideAssessmentStart({
  latest,
  creditsBalance = 0,
}: {
  latest: { completed: boolean } | null;
  /** Centésimos de crédito disponibles. */
  creditsBalance?: number;
}): AssessmentStartDecision {
  if (!latest) return "create";
  if (!latest.completed) return "resume";
  return creditsBalance >= CREDIT_COST_BASIC ? "create" : "limit";
}
