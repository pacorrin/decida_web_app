import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import {
  parseStoredProducts,
  productsBelowCost,
} from "@/lib/onboarding/products";
import {
  ACCEPTABLE_LOSS_CEILING,
  CAPITAL_RANGE_CEILING,
  CUSTOMER_EVIDENCE_COMMERCIAL_POINTS,
  CUSTOMER_EVIDENCE_RISK_DELTA,
  dependencyRiskPenalty,
  formatMoney,
  parseDependencies,
  rangeCeiling,
  resolveCustomerEvidenceLevel,
} from "./ranges";

export type DimensionKey =
  | "personal_fit"
  | "financial_viability"
  | "commercial_viability"
  | "risk_level"
  | "time_fit"
  | "scalability";

export type CalculatedMetrics = {
  grossMarginPerSale: number | null;
  grossMarginPercentage: number | null;
  estimatedMonthlyGrossProfit: number | null;
  estimatedMonthlyNetProfit: number | null;
  breakEvenSales: number | null;
  paybackMonths: number | null;
};

export type DimensionScore = {
  key: DimensionKey;
  score: number;
  label: string;
};

export type DeterministicScoreResult = {
  dimensions: DimensionScore[];
  metrics: CalculatedMetrics;
  scoringVersion: string;
};

const SCORING_VERSION = "v1.0.0";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromRange(
  value: string | null | undefined,
  map: Record<string, number>
): number {
  if (!value) return 50;
  return map[value] ?? 50;
}

/**
 * Deterministic red flags from the rubric's checklist that depend on the
 * business-dependency selection. Merged into `ascs_red_flags` alongside
 * `detectFinancialRedFlags`. Empty when nothing critical was selected.
 */
export function detectDependencyRedFlags(
  assessment: AssessmentWithRelations
): string[] {
  const deps = parseDependencies(
    assessment.market_risk_inputs?.mrsk_business_dependencies
  );
  const flags: string[] = [];

  if (deps.includes("plataforma")) {
    flags.push(
      "Tu negocio depende de una plataforma externa. Si esa plataforma cambia sus reglas o te suspende, pierdes el canal de un día para otro — ten un plan alterno antes de invertir fuerte."
    );
  }
  if (deps.includes("permiso")) {
    flags.push(
      "Tu negocio requiere un permiso, licencia o regulación para operar. Investígalo a fondo antes de invertir: puede bloquear el arranque o encarecerlo."
    );
  }
  if (deps.includes("cliente_unico")) {
    flags.push(
      "Dependerías de 1 o 2 clientes para la mayoría de tus ingresos. Si uno se va, el negocio tambalea — diversifica la cartera pronto."
    );
  }

  return flags;
}

export type FinancialExposure = {
  /** Declared initial investment exceeds the top of the acceptable-loss range. */
  investmentOverAcceptableLoss: boolean;
  /** Declared initial investment exceeds the top of the available-capital range. */
  investmentOverCapital: boolean;
};

function assessFinancialExposure(
  assessment: AssessmentWithRelations
): FinancialExposure {
  const investment = Number(
    assessment.financial_inputs?.finp_initial_investment ?? 0
  );
  if (!Number.isFinite(investment) || investment <= 0) {
    return {
      investmentOverAcceptableLoss: false,
      investmentOverCapital: false,
    };
  }

  const lossCeiling = rangeCeiling(
    assessment.assessment_profile?.aprf_acceptable_loss_range,
    ACCEPTABLE_LOSS_CEILING
  );
  const capitalCeiling = rangeCeiling(
    assessment.assessment_profile?.aprf_capital_available_range,
    CAPITAL_RANGE_CEILING
  );

  return {
    investmentOverAcceptableLoss: investment > lossCeiling,
    investmentOverCapital: investment > capitalCeiling,
  };
}

/**
 * Deterministic financial red flags derived from cross-referencing the declared
 * initial investment against the capital / acceptable-loss ranges from the
 * profile step. Returns user-facing Spanish strings, ready to merge into
 * `ascs_red_flags` ahead of the AI-generated ones. Empty when the data needed
 * for the comparison is missing (backward compatible with older assessments).
 */
export function detectFinancialRedFlags(
  assessment: AssessmentWithRelations
): string[] {
  const investment = Number(
    assessment.financial_inputs?.finp_initial_investment ?? 0
  );
  const exposure = assessFinancialExposure(assessment);
  const flags: string[] = [];

  if (exposure.investmentOverAcceptableLoss) {
    flags.push(
      `Tu inversión inicial (${formatMoney(investment)}) es mayor que lo que dijiste que podrías perder sin afectar tu estabilidad. Si el negocio no funciona, la pérdida real superaría tu límite declarado — considera arrancar con una versión de menor inversión.`
    );
  }

  if (exposure.investmentOverCapital) {
    flags.push(
      `Tu inversión inicial (${formatMoney(investment)}) supera el capital máximo que declaraste tener disponible para esta idea. Aclara de dónde saldría la diferencia antes de comprometerte.`
    );
  }

  const below = productsBelowCost(
    parseStoredProducts(assessment.financial_inputs?.finp_products)
  );
  if (below.length > 0) {
    const names = below.map((p) => `"${p.name}"`).join(", ");
    flags.push(
      `${below.length === 1 ? "El producto" : "Los productos"} ${names} ${
        below.length === 1 ? "tiene" : "tienen"
      } un precio igual o menor a su costo variable — cada venta pierde dinero. Sube el precio o baja el costo antes de arrancar.`
    );
  }

  return flags;
}

export function calculateFinancialMetrics(
  initialInvestment: number,
  pricePerSale: number,
  variableCostPerSale: number,
  estimatedMonthlySales: number,
  fixedMonthlyCosts: number
): CalculatedMetrics {
  const grossMarginPerSale = pricePerSale - variableCostPerSale;
  const grossMarginPercentage =
    pricePerSale > 0 ? (grossMarginPerSale / pricePerSale) * 100 : null;
  const estimatedMonthlyGrossProfit = grossMarginPerSale * estimatedMonthlySales;
  const estimatedMonthlyNetProfit =
    estimatedMonthlyGrossProfit - fixedMonthlyCosts;
  const breakEvenSales =
    grossMarginPerSale > 0
      ? Math.ceil(fixedMonthlyCosts / grossMarginPerSale)
      : null;
  const paybackMonths =
    estimatedMonthlyNetProfit > 0 && initialInvestment > 0
      ? initialInvestment / estimatedMonthlyNetProfit
      : null;

  return {
    grossMarginPerSale,
    grossMarginPercentage,
    estimatedMonthlyGrossProfit,
    estimatedMonthlyNetProfit,
    breakEvenSales,
    paybackMonths,
  };
}

function estimateFixedCosts(range: string | null | undefined): number {
  const map: Record<string, number> = {
    menos_5k: 3000,
    "5k_15k": 10000,
    "15k_30k": 22000,
    "30k_50k": 40000,
    mas_50k: 60000,
  };
  return map[range ?? ""] ?? 10000;
}

export function calculateDeterministicScores(
  assessment: AssessmentWithRelations
): DeterministicScoreResult {
  const profile = assessment.assessment_profile;
  const fit = assessment.personal_fit_answers;
  const financial = assessment.financial_inputs;
  const market = assessment.market_risk_inputs;

  const fixedCosts = estimateFixedCosts(
    financial?.finp_fixed_monthly_costs_range ?? undefined
  );

  const metrics = financial
    ? calculateFinancialMetrics(
        Number(financial.finp_initial_investment ?? 0),
        Number(financial.finp_price_per_sale ?? 0),
        Number(financial.finp_variable_cost_per_sale ?? 0),
        financial.finp_estimated_monthly_sales ?? 0,
        fixedCosts
      )
    : {
        grossMarginPerSale: null,
        grossMarginPercentage: null,
        estimatedMonthlyGrossProfit: null,
        estimatedMonthlyNetProfit: null,
        breakEvenSales: null,
        paybackMonths: null,
      };

  const personalFitScore = clampScore(
    (fit?.pfit_sales_comfort_score ?? 3) * 12 +
      scoreFromRange(fit?.pfit_work_preference, {
        digital: 15,
        mixto: 12,
        fisico: 10,
      }) +
      scoreFromRange(fit?.pfit_hiring_preference, {
        solo: 10,
        algunos: 12,
        equipo: 15,
      }) +
      (fit?.pfit_uncertainty_comfort_score ?? 3) * 2 + // 2–10 pts (score 1–5 × 2)
      (fit?.pfit_process_comfort_score ?? 3) * 2 // 2–10 pts (score 1–5 × 2)
  );

  const financialScore = clampScore(
    (metrics.grossMarginPercentage ?? 0) * 0.5 +
      (metrics.estimatedMonthlyNetProfit && metrics.estimatedMonthlyNetProfit > 0
        ? 30
        : 0) +
      (metrics.paybackMonths && metrics.paybackMonths <= 12 ? 20 : 0)
  );

  const customerEvidenceLevel = market
    ? resolveCustomerEvidenceLevel(market)
    : "ninguno";

  const commercialScore = clampScore(
    (CUSTOMER_EVIDENCE_COMMERCIAL_POINTS[customerEvidenceLevel] ?? 10) +
      scoreFromRange(market?.mrsk_competition_level, {
        baja: 25,
        media: 18,
        alta: 10,
      }) +
      (market?.mrsk_acquisition_channel ? 15 : 0)
  );

  // Over-exposure: the declared initial investment exceeds what the user said
  // they can lose / have available. Pushes the risk score up (higher = riskier).
  const exposure = assessFinancialExposure(assessment);
  const overExposurePenalty =
    (exposure.investmentOverAcceptableLoss ? 12 : 0) +
    (exposure.investmentOverCapital ? 8 : 0);

  // Weighted penalty for declared business dependencies (rubric dimension 4).
  const dependencyPenalty = dependencyRiskPenalty(
    parseDependencies(market?.mrsk_business_dependencies)
  );

  const riskScore = clampScore(
    100 -
      scoreFromRange(profile?.aprf_acceptable_loss_range, {
        menos_5k: 10,
        "5k_20k": 20,
        "20k_50k": 35,
        "50k_100k": 50,
        mas_100k: 65,
      }) +
      (CUSTOMER_EVIDENCE_RISK_DELTA[customerEvidenceLevel] ?? 0) +
      overExposurePenalty +
      dependencyPenalty
  );

  const timeScore = clampScore(
    scoreFromRange(profile?.aprf_hours_per_week_range, {
      menos_5: 20,
      "5_10": 40,
      "10_20": 65,
      "20_40": 85,
      mas_40: 95,
    })
  );

  const scalabilityScore = clampScore(
    scoreFromRange(fit?.pfit_hiring_preference, {
      solo: 35,
      algunos: 60,
      equipo: 85,
    }) +
      scoreFromRange(profile?.aprf_main_goal, {
        escalar_negocio: 25,
        libertad_financiera: 15,
        reemplazar_empleo: 10,
        ingreso_extra: 5,
        probar_idea: 5,
      })
  );

  return {
    dimensions: [
      { key: "personal_fit", score: personalFitScore, label: "Fit personal" },
      {
        key: "financial_viability",
        score: financialScore,
        label: "Viabilidad financiera",
      },
      {
        key: "commercial_viability",
        score: commercialScore,
        label: "Viabilidad comercial",
      },
      { key: "risk_level", score: riskScore, label: "Nivel de riesgo" },
      { key: "time_fit", score: timeScore, label: "Compatibilidad de tiempo" },
      { key: "scalability", score: scalabilityScore, label: "Escalabilidad" },
    ],
    metrics,
    scoringVersion: SCORING_VERSION,
  };
}
