/**
 * Costos de análisis en créditos (enteros). Básico = 50 · Con investigación = 150.
 * Los créditos vienen del plan mensual y se restablecen en cada renovación.
 */
export const CREDIT_COST_BASIC = 50;
export const CREDIT_COST_RESEARCH = 150;

/** Diferencia a reembolsar si la investigación se degrada (150 − 50). */
export const CREDIT_RESEARCH_DIFF = CREDIT_COST_RESEARCH - CREDIT_COST_BASIC;

export function creditCostForResearch(researchEnabled: boolean): number {
  return researchEnabled ? CREDIT_COST_RESEARCH : CREDIT_COST_BASIC;
}

const numberFormat = new Intl.NumberFormat("es-MX");

/** Formato legible con separador de miles: 2000 → "2,000", −50 → "−50". */
export function formatCredits(credits: number): string {
  const body = numberFormat.format(Math.abs(credits));
  return credits < 0 ? `−${body}` : body;
}
