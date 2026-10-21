import { getPostHogClient } from "@/lib/analytics/server";

export const RESEARCH_FLAG_KEY = "report-research";

/**
 * ¿Se hace la etapa de investigación para esta cuenta?
 *
 * `REPORT_RESEARCH_ENABLED`:
 * - `true`  → siempre (también la usan los evals);
 * - `false` → nunca (apagado de emergencia);
 * - `posthog` (por defecto) → la decide el flag `report-research` de PostHog
 *   para esa cuenta, lo que permite activarla por usuario o porcentaje y
 *   comparar con quienes no la tienen. Sin PostHog configurado, queda apagada.
 */
export async function isResearchEnabled(
  distinctId: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const mode = (env.REPORT_RESEARCH_ENABLED ?? "posthog").trim().toLowerCase();
  if (mode === "true" || mode === "on" || mode === "1") return true;
  if (mode === "false" || mode === "off" || mode === "0") return false;

  const ph = getPostHogClient();
  if (!ph || !distinctId) return false;
  try {
    return (await ph.isFeatureEnabled(RESEARCH_FLAG_KEY, distinctId)) === true;
  } catch {
    return false;
  }
}
