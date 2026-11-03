/**
 * Costos de análisis en créditos (enteros). Básico = 50 · Con investigación = 150.
 * Los créditos vienen del plan mensual y se restablecen en cada renovación.
 */
export const CREDIT_COST_BASIC = 50;
export const CREDIT_COST_RESEARCH = 150;

/**
 * Captura inteligente de Cifra (fotos y texto leídos con IA). Precio único por captura, sin
 * importar si se usó texto, dictado, una foto o varias: el costo de IA siempre queda cubierto.
 * Costo estimado de IA ~US$0.002 a 0.01 por captura (≈ MX$0.04 a 0.19); a ~MX$0.19 a 0.27 por
 * crédito (según el plan) 3 créditos dejan margen aun con varias fotos.
 */
export const CREDIT_COST_CIFRA_CAPTURE = 3;

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
