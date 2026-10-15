/** Pantalla de planes de la cuenta (no depende de ninguna evaluación). */
export const SUBSCRIPTION_PATH = "/cuenta/suscripcion";
export const PLANS_PATH = `${SUBSCRIPTION_PATH}?limite=1`;

export type AssessmentStartDecision = "create" | "resume" | "limit";

/**
 * Freemium accounts get a single evaluation. Decides what happens when a
 * logged-in user asks to start one and has no in-progress assessment in
 * their cookie:
 * - full access: always a fresh evaluation
 * - no evaluations yet: the free one
 * - latest is still in progress (e.g. cookie lost): resume it
 * - latest is completed: limit reached, send them to the plans screen
 */
export function decideAssessmentStart({
  fullAccess,
  latest,
}: {
  fullAccess: boolean;
  latest: { completed: boolean } | null;
}): AssessmentStartDecision {
  if (fullAccess) return "create";
  if (!latest) return "create";
  return latest.completed ? "limit" : "resume";
}
