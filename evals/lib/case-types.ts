export type EvalProduct = {
  name: string;
  kind: "producto" | "servicio";
  price: number;
  variableCost: number;
  monthlyUnits: number;
};

/**
 * Un caso de evaluación: lo que la persona respondería en el onboarding.
 * Los valores de los campos de rango son los códigos reales de
 * `src/lib/onboarding/options.ts`.
 */
export type EvalCase = {
  id: string;
  /** Tipo de caso, para agrupar resultados. */
  kind: string;
  /** Mercado objetivo esperado (se usa en los evals de la etapa de investigación). */
  expectedMarket: string;
  description: string;
  profile: {
    situation: string;
    goal: string;
    experience: string;
    capital: string;
    acceptableLoss: string;
    hoursPerWeek: string;
    schedule: string;
    timeframe: string;
  };
  fit: {
    enjoyed: string[];
    workPreference: string;
    sales: number;
    uncertainty: number;
    process: number;
    hiring: string;
  };
  financial: {
    initialInvestment: number;
    fixedCostsRange: string;
    products: EvalProduct[];
  };
  market: {
    customerEvidence: string;
    competition: string;
    channel: string;
    dependencies: string[];
    mainConcern: string;
    successCondition: string;
  };
};
