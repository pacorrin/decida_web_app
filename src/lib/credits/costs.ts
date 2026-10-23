/**
 * Costos de análisis en centésimos de crédito (100 = 1 crédito).
 * Básico = 0.5 · Con investigación = 1.5.
 */
export const CREDIT_CENTESIMOS_PER_UNIT = 100;

export const CREDIT_COST_BASIC = 50;
export const CREDIT_COST_RESEARCH = 150;

/** Diferencia a reembolsar si la investigación se degrada (1.00 crédito). */
export const CREDIT_RESEARCH_DIFF = CREDIT_COST_RESEARCH - CREDIT_COST_BASIC;

export function creditCostForResearch(researchEnabled: boolean): number {
  return researchEnabled ? CREDIT_COST_RESEARCH : CREDIT_COST_BASIC;
}

/** Formato legible: 50 → "0.5", 150 → "1.5", 100 → "1", −50 → "−0.5". */
export function formatCredits(centesimos: number): string {
  const units = centesimos / CREDIT_CENTESIMOS_PER_UNIT;
  const abs = Math.abs(units);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (centesimos < 0) return `−${body}`;
  return body;
}
