/**
 * Límites y modelos de la etapa de investigación. Todo es configurable por
 * entorno; los valores por defecto salen de la decisión de `docs/decision-busqueda.md`
 * y del tope de costo acordado (0.30 USD por reporte).
 */

export const RESEARCH_TOPICS = [
  "tamano_mercado",
  "competidores",
  "precios",
  "costes",
  "canales",
] as const;

export type ResearchTopic = (typeof RESEARCH_TOPICS)[number];

/**
 * Los temas que dependen de fuentes oficiales usan el modelo con filtro de
 * dominios; el resto, un modelo más barato y sin filtro. En orden de prioridad:
 * si el presupuesto no alcanza, se investigan primero los primeros.
 */
export const TOPIC_PLAN: Record<ResearchTopic, { official: boolean }> = {
  tamano_mercado: { official: true },
  competidores: { official: false },
  precios: { official: false },
  costes: { official: false },
  canales: { official: false },
};

/** Precios aproximados en USD por millón de tokens (entrada, salida). Verifícalos antes de fiarte del costo. */
export const MODEL_PRICES_USD_PER_M: Record<string, { in: number; out: number }> = {
  "gpt-4.1": { in: 2, out: 8 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
};

const FALLBACK_PRICE = { in: 2, out: 8 };

/** Tokens de entrada típicos por búsqueda (medidos en las pruebas: ~8 mil con mini, ~17 mil con gpt-4.1). */
const TYPICAL_INPUT_TOKENS = { mini: 9_000, full: 18_000 };

export type ResearchConfig = {
  /** Tope de búsquedas web por reporte. */
  maxSearches: number;
  /** Tope de costo estimado por reporte (USD), búsqueda incluida. */
  maxCostUsd: number;
  maxOutputTokensPerSearch: number;
  searchTimeoutMs: number;
  /** Mercado por defecto cuando la idea no indica ninguno. NO es el país del visitante. */
  defaultCountry: string;
  defaultCountryCode: string;
  /** Tarifa conservadora por llamada a la herramienta de búsqueda (USD). */
  searchFeeUsd: number;
  modelGeneral: string;
  modelOfficial: string;
  modelStructure: string;
};

const num = (value: string | undefined, fallback: number) => {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function researchConfig(env: NodeJS.ProcessEnv = process.env): ResearchConfig {
  return {
    maxSearches: Math.floor(num(env.REPORT_RESEARCH_MAX_SEARCHES, 5)),
    maxCostUsd: num(env.REPORT_RESEARCH_MAX_COST_USD, 0.3),
    maxOutputTokensPerSearch: Math.floor(num(env.REPORT_RESEARCH_MAX_OUTPUT_TOKENS, 1500)),
    searchTimeoutMs: Math.floor(num(env.REPORT_RESEARCH_TIMEOUT_MS, 40_000)),
    defaultCountry: env.REPORT_DEFAULT_MARKET_COUNTRY?.trim() || "México",
    defaultCountryCode: (env.REPORT_DEFAULT_MARKET_COUNTRY_CODE?.trim() || "MX").toUpperCase(),
    searchFeeUsd: num(env.REPORT_RESEARCH_SEARCH_FEE_USD, 0.03),
    modelGeneral: env.OPENAI_MODEL_RESEARCH?.trim() || "gpt-4.1-mini",
    modelOfficial: env.OPENAI_MODEL_RESEARCH_OFFICIAL?.trim() || "gpt-4.1",
    modelStructure: env.OPENAI_MODEL_RESEARCH_STRUCTURE?.trim() || "gpt-4o-mini",
  };
}

const priceOf = (model: string) => MODEL_PRICES_USD_PER_M[model] ?? FALLBACK_PRICE;

export function estimateCallCostUsd(
  model: string,
  usage: { inputTokens: number; outputTokens: number },
  searchCalls: number,
  searchFeeUsd: number,
): number {
  const p = priceOf(model);
  return (
    (usage.inputTokens * p.in + usage.outputTokens * p.out) / 1_000_000 +
    searchCalls * searchFeeUsd
  );
}

/** Peor caso de una búsqueda del tema, para decidir cuáles caben en el presupuesto antes de lanzarlas. */
export function worstCaseSearchCostUsd(topic: ResearchTopic, cfg: ResearchConfig): number {
  const official = TOPIC_PLAN[topic].official;
  const model = official ? cfg.modelOfficial : cfg.modelGeneral;
  return estimateCallCostUsd(
    model,
    {
      inputTokens: official ? TYPICAL_INPUT_TOKENS.full : TYPICAL_INPUT_TOKENS.mini,
      outputTokens: cfg.maxOutputTokensPerSearch,
    },
    1,
    cfg.searchFeeUsd,
  );
}

/**
 * Temas que caben en el presupuesto, en orden de prioridad, y los que quedan
 * fuera (van a «huecos de información»). El tope de búsquedas y el de costo se
 * respetan juntos.
 */
export function planWithinBudget(cfg: ResearchConfig): {
  selected: ResearchTopic[];
  skipped: ResearchTopic[];
  worstCaseUsd: number;
} {
  const selected: ResearchTopic[] = [];
  const skipped: ResearchTopic[] = [];
  let spent = 0;
  for (const topic of RESEARCH_TOPICS) {
    const cost = worstCaseSearchCostUsd(topic, cfg);
    if (selected.length < cfg.maxSearches && spent + cost <= cfg.maxCostUsd) {
      selected.push(topic);
      spent += cost;
    } else {
      skipped.push(topic);
    }
  }
  return { selected, skipped, worstCaseUsd: spent };
}
