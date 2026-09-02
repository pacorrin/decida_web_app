import { describe, it, expect } from "vitest";
import { detectDeterministicStrengths } from "../strengths";
import type { CalculatedMetrics } from "../types";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const NEUTRAL_METRICS: CalculatedMetrics = {
  grossMarginPerSale: null,
  grossMarginPercentage: null,
  estimatedMonthlyGrossProfit: null,
  estimatedMonthlyNetProfit: null,
  breakEvenSales: null,
  paybackMonths: null,
};

/** Nothing fires by default; each test opts into exactly the data it needs. */
function makeAssessment(
  over: Partial<AssessmentWithRelations> = {}
): AssessmentWithRelations {
  return {
    asmt_id: "t",
    asmt_created_at: new Date(),
    asmt_updated_at: new Date(),
    asmt_status: "completed",
    asmt_email: "t@t.com",
    asmt_name: null,
    asmt_phone: null,
    asmt_country: null,
    asmt_user_id: null,
    asmt_payment_status: null,
    asmt_payment_provider: null,
    asmt_payment_reference: null,
    asmt_started_at: null,
    asmt_completed_at: null,
    asmt_report_generated_at: null,
    assessment_profile: {
      aprf_current_situation: "empleado",
      aprf_main_goal: "ingreso_extra",
      aprf_entrepreneurship_experience: "ninguna",
      aprf_capital_available_range: null,
      aprf_acceptable_loss_range: null,
      aprf_hours_per_week_range: "menos_5",
      aprf_available_schedule: "noches",
      aprf_expected_income_timeframe: "6_12_meses",
    },
    personal_fit_answers: {
      pfit_enjoyed_activities: [],
      pfit_work_preference: "digital",
      pfit_sales_comfort_score: 2,
      pfit_uncertainty_comfort_score: 2,
      pfit_process_comfort_score: 2,
      pfit_hiring_preference: "solo",
    },
    financial_inputs: {
      finp_id: "f",
      finp_initial_investment: 0,
      finp_estimated_monthly_sales: 0,
    },
    market_risk_inputs: {
      mrsk_id: "m",
      mrsk_has_talked_to_customers: false,
      mrsk_competition_level: "alta",
      mrsk_acquisition_channel: null,
    },
    business_idea: null,
    assessment_score: null,
    assessment_report: null,
    feedback: null,
    payments: [],
    ...over,
  } as AssessmentWithRelations;
}

const titles = (a: AssessmentWithRelations, m = NEUTRAL_METRICS) =>
  detectDeterministicStrengths(a, m).map((s) => s.title);

describe("detectDeterministicStrengths", () => {
  it("returns [] for a genuinely weak profile — never fabricates a strength", () => {
    expect(detectDeterministicStrengths(makeAssessment(), NEUTRAL_METRICS)).toEqual(
      []
    );
  });

  it("cites the real margin number in the copy", () => {
    const [s] = detectDeterministicStrengths(makeAssessment(), {
      ...NEUTRAL_METRICS,
      grossMarginPercentage: 77,
      grossMarginPerSale: 693,
    });
    expect(s.title).toBe("Margen bruto de 77% por venta");
    expect(s.whyItMatters).toContain("$693");
  });

  it("does not fire on a thin margin", () => {
    expect(
      titles(makeAssessment(), {
        ...NEUTRAL_METRICS,
        grossMarginPercentage: 25,
        grossMarginPerSale: 25,
      })
    ).toEqual([]);
  });

  it("treats an unanswered dependency question as unknown, not as 'no dependencies'", () => {
    const unanswered = makeAssessment({
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: false,
        mrsk_competition_level: "alta",
        mrsk_acquisition_channel: null,
        mrsk_business_dependencies: [],
      },
    });
    expect(titles(unanswered)).toEqual([]);

    const answeredNone = makeAssessment({
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: false,
        mrsk_competition_level: "alta",
        mrsk_acquisition_channel: null,
        mrsk_business_dependencies: ["ninguna"],
      },
    });
    expect(titles(answeredNone)).toEqual([
      "No dependes de una plataforma, un permiso ni un cliente único",
    ]);

    const withCritical = makeAssessment({
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: false,
        mrsk_competition_level: "alta",
        mrsk_acquisition_channel: null,
        mrsk_business_dependencies: ["plataforma"],
      },
    });
    expect(titles(withCritical)).toEqual([]);
  });

  it("fires on market evidence the user actually gathered", () => {
    const a = makeAssessment({
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: true,
        mrsk_competition_level: "baja",
        mrsk_acquisition_channel: "referidos",
      },
    });
    expect(titles(a)).toEqual([
      "Ya hablaste con clientes potenciales",
      "Competencia baja en tu mercado",
      "Ya tienes un canal en mente: referidos y boca a boca",
    ]);
  });

  it("ignores the 'otro' channel, which carries no information", () => {
    const a = makeAssessment({
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: false,
        mrsk_competition_level: "alta",
        mrsk_acquisition_channel: "otro",
      },
    });
    expect(titles(a)).toEqual([]);
  });

  it("only counts investment headroom when the range was declared", () => {
    const noRange = makeAssessment({
      financial_inputs: {
        finp_id: "f",
        finp_initial_investment: 5000,
        finp_estimated_monthly_sales: 0,
      },
    });
    expect(titles(noRange)).toEqual([]);

    const withRange = makeAssessment({
      assessment_profile: {
        aprf_current_situation: "empleado",
        aprf_main_goal: "ingreso_extra",
        aprf_entrepreneurship_experience: "ninguna",
        aprf_capital_available_range: null,
        aprf_acceptable_loss_range: "20k_50k",
        aprf_hours_per_week_range: "menos_5",
        aprf_available_schedule: "noches",
        aprf_expected_income_timeframe: "6_12_meses",
      },
      financial_inputs: {
        finp_id: "f",
        finp_initial_investment: 5000,
        finp_estimated_monthly_sales: 0,
      },
    });
    expect(titles(withRange)).toEqual([
      "Tu inversión de $5,000 cabe en lo que puedes perder",
    ]);
  });

  it("caps at 5 and keeps number-backed strengths ahead of self-reported ones", () => {
    const strong = makeAssessment({
      assessment_profile: {
        aprf_current_situation: "empleado",
        aprf_main_goal: "escalar_negocio",
        aprf_entrepreneurship_experience: "negocio_activo",
        aprf_capital_available_range: "150k_500k",
        aprf_acceptable_loss_range: "50k_100k",
        aprf_hours_per_week_range: "20_40",
        aprf_available_schedule: "flexible",
        aprf_expected_income_timeframe: "6_12_meses",
      },
      personal_fit_answers: {
        pfit_enjoyed_activities: [],
        pfit_work_preference: "digital",
        pfit_sales_comfort_score: 5,
        pfit_uncertainty_comfort_score: 5,
        pfit_process_comfort_score: 5,
        pfit_hiring_preference: "equipo",
      },
      financial_inputs: {
        finp_id: "f",
        finp_initial_investment: 40000,
        finp_estimated_monthly_sales: 100,
      },
      market_risk_inputs: {
        mrsk_id: "m",
        mrsk_has_talked_to_customers: true,
        mrsk_competition_level: "baja",
        mrsk_acquisition_channel: "referidos",
        mrsk_business_dependencies: ["ninguna"],
      },
    });

    const result = detectDeterministicStrengths(strong, {
      ...NEUTRAL_METRICS,
      grossMarginPercentage: 70,
      grossMarginPerSale: 700,
      estimatedMonthlyNetProfit: 15000,
      paybackMonths: 2.7,
      breakEvenSales: 20,
    });

    expect(result).toHaveLength(5);
    // All five slots go to Tier 1 (the user's own arithmetic) before any
    // self-reported preference gets a look in.
    expect(result.map((s) => s.title)).toEqual([
      "Margen bruto de 70% por venta",
      "Utilidad neta estimada de $15,000 al mes",
      "Recuperas la inversión en ~2.7 meses",
      "Tu punto de equilibrio son 20 ventas al mes",
      "Tu inversión de $40,000 cabe en lo que puedes perder",
    ]);
  });
});
