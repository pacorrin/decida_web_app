import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

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
      })
  );

  const financialScore = clampScore(
    (metrics.grossMarginPercentage ?? 0) * 0.5 +
      (metrics.estimatedMonthlyNetProfit && metrics.estimatedMonthlyNetProfit > 0
        ? 30
        : 0) +
      (metrics.paybackMonths && metrics.paybackMonths <= 12 ? 20 : 0)
  );

  const commercialScore = clampScore(
    (market?.mrsk_has_talked_to_customers ? 35 : 10) +
      scoreFromRange(market?.mrsk_competition_level, {
        baja: 25,
        media: 18,
        alta: 10,
      }) +
      (market?.mrsk_acquisition_channel ? 15 : 0)
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
      (market?.mrsk_has_talked_to_customers ? 10 : 0)
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
