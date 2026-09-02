import { describe, it, expect } from "vitest";
import {
  calculateDeterministicScores,
  detectFinancialRedFlags,
  detectDependencyRedFlags,
} from "../types";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

/**
 * Base assessment fixture — all fields present, neutral values.
 * Individual tests override specific fields to probe the bug conditions.
 */
function makeAssessment(
  overrides: Partial<AssessmentWithRelations> = {}
): AssessmentWithRelations {
  const base: AssessmentWithRelations = {
    // Base assessments fields (required by the type)
    asmt_id: "test-id",
    asmt_created_at: new Date(),
    asmt_updated_at: new Date(),
    asmt_status: "completed",
    asmt_email: "test@test.com",
    asmt_name: "Test User",
    asmt_phone: null,
    asmt_country: null,
    asmt_user_id: null,
    asmt_payment_status: null,
    asmt_payment_provider: null,
    asmt_payment_reference: null,
    asmt_started_at: null,
    asmt_completed_at: null,
    asmt_report_generated_at: null,

    // Relations
    assessment_profile: {
      aprf_current_situation: "empleado",
      aprf_main_goal: "escalar_negocio",
      aprf_entrepreneurship_experience: "ninguna",
      aprf_capital_available_range: "10k_50k",
      aprf_acceptable_loss_range: "menos_5k",
      aprf_hours_per_week_range: "10_20",
      aprf_available_schedule: "manana",
      aprf_expected_income_timeframe: "6_12_meses",
    },
    personal_fit_answers: {
      pfit_enjoyed_activities: [],
      pfit_work_preference: "digital",
      pfit_sales_comfort_score: 3,
      pfit_uncertainty_comfort_score: 3,
      pfit_process_comfort_score: 3,
      pfit_hiring_preference: "solo",
    },
    financial_inputs: {
      finp_id: "fin-test-id",
      finp_initial_investment: 50000,
      finp_price_per_sale: 100,
      finp_variable_cost_per_sale: 30,
      finp_estimated_monthly_sales: 50,
      finp_fixed_monthly_costs_range: "5k_15k",
      finp_fixed_monthly_costs_amount: 10000,
      finp_currency: "CLP",
      finp_gross_margin_per_sale: null,
      finp_gross_margin_percentage: null,
      finp_estimated_monthly_gross_profit: null,
      finp_estimated_monthly_net_profit: null,
      finp_break_even_sales: null,
      finp_payback_months: null,
    },
    market_risk_inputs: {
      mrsk_id: "mrsk-test-id",
      mrsk_has_talked_to_customers: false,
      mrsk_competition_level: "media",
      mrsk_acquisition_channel: "redes_sociales",
      mrsk_main_concern: null,
      mrsk_success_condition: null,
    },
    business_idea: null,
    assessment_score: null,
    assessment_report: null,
    feedback: null,
    payments: [],
  };

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG CONDITION EXPLORATION TESTS
// These tests encode the EXPECTED (correct) behavior.
// They SHOULD FAIL on unfixed code — failure confirms the bug exists.
// ─────────────────────────────────────────────────────────────────────────────

describe("Bug Condition Exploration Tests", () => {
  /**
   * Test A — Bug Condition riskScore
   *
   * A user with the lowest possible risk tolerance ("menos_5k") investing $50,000
   * is taking extreme risk. The riskScore should be ≥ 80 (high risk taken).
   *
   * Bug: aprf_acceptable_loss_range is null in DB → scoreFromRange returns 50
   * → riskScore = clamp(100 - 50 + 0) = 50, not 90.
   *
   * Expected correct behavior: riskScore = clamp(100 - 10 + 0) = 90.
   *
   * Validates: Requirements 1.2, 1.4
   */
  it("Test A: riskScore should be ≥ 80 when acceptable_loss_range is 'menos_5k' and customer_talks = false", () => {
    const assessment = makeAssessment({
      assessment_profile: {
        aprf_current_situation: "empleado",
        aprf_main_goal: "escalar_negocio",
        aprf_entrepreneurship_experience: "ninguna",
        aprf_capital_available_range: "10k_50k",
        aprf_acceptable_loss_range: "menos_5k", // minimum risk tolerance
        aprf_hours_per_week_range: "10_20",
        aprf_available_schedule: "manana",
        aprf_expected_income_timeframe: "6_12_meses",
      },
      market_risk_inputs: {
        mrsk_id: "mrsk-test-id",
        mrsk_has_talked_to_customers: false, // no bonus
        mrsk_competition_level: "media",
        mrsk_acquisition_channel: "redes_sociales",
        mrsk_main_concern: null,
        mrsk_success_condition: null,
      },
    });

    const result = calculateDeterministicScores(assessment);
    const riskDimension = result.dimensions.find((d) => d.key === "risk_level");

    expect(riskDimension).toBeDefined();
    // Correct formula: 100 - scoreFromRange("menos_5k" → 10) + 0 = 90
    // Bug formula:     100 - scoreFromRange(null → 50) + 0 = 50
    expect(riskDimension!.score).toBeGreaterThanOrEqual(80);
  });

  /**
   * Test B — Bug Condition personalFitScore (uncertainty comfort)
   *
   * Two identical assessments differing only in pfit_uncertainty_comfort_score (1 vs 5)
   * should produce personalFitScores that differ by ≥ 8 points.
   *
   * Bug: pfit_uncertainty_comfort_score is not read in calculateDeterministicScores
   * → both assessments produce the same personalFitScore.
   *
   * Expected correct behavior: score_5 - score_1 = (5*2) - (1*2) = 8 pts difference.
   *
   * Validates: Requirements 1.4
   */
  it("Test B: personalFitScore should differ by ≥ 8 points when pfit_uncertainty_comfort_score is 1 vs 5", () => {
    const basePersonalFit = {
      pfit_enjoyed_activities: [],
      pfit_work_preference: "digital" as const,
      pfit_sales_comfort_score: 3,
      pfit_process_comfort_score: 3,
      pfit_hiring_preference: "solo" as const,
    };

    const assessmentLow = makeAssessment({
      personal_fit_answers: {
        ...basePersonalFit,
        pfit_uncertainty_comfort_score: 1,
      },
    });

    const assessmentHigh = makeAssessment({
      personal_fit_answers: {
        ...basePersonalFit,
        pfit_uncertainty_comfort_score: 5,
      },
    });

    const resultLow = calculateDeterministicScores(assessmentLow);
    const resultHigh = calculateDeterministicScores(assessmentHigh);

    const fitLow = resultLow.dimensions.find((d) => d.key === "personal_fit");
    const fitHigh = resultHigh.dimensions.find((d) => d.key === "personal_fit");

    expect(fitLow).toBeDefined();
    expect(fitHigh).toBeDefined();

    const diff = fitHigh!.score - fitLow!.score;
    // Expected: (5-1) * 2 = 8 pts
    // Bug: diff = 0 because uncertainty_comfort_score is not read
    expect(diff).toBeGreaterThanOrEqual(8);
  });

  /**
   * Test C — Bug Condition personalFitScore (process comfort)
   *
   * Two identical assessments differing only in pfit_process_comfort_score (1 vs 5)
   * should produce personalFitScores that differ by ≥ 8 points.
   *
   * Bug: pfit_process_comfort_score does not exist in AssessmentBase type nor in
   * calculateDeterministicScores → even if a value existed in DB, it would never be read.
   *
   * Expected correct behavior: score_5 - score_1 = (5*2) - (1*2) = 8 pts difference.
   *
   * Validates: Requirements 1.4
   */
  it("Test C: personalFitScore should differ by ≥ 8 points when pfit_process_comfort_score is 1 vs 5", () => {
    const basePersonalFit = {
      pfit_enjoyed_activities: [],
      pfit_work_preference: "digital" as const,
      pfit_sales_comfort_score: 3,
      pfit_uncertainty_comfort_score: 3,
      pfit_process_comfort_score: null as number | null,
      pfit_hiring_preference: "solo" as const,
    };

    const assessmentLow = makeAssessment({
      personal_fit_answers: {
        ...basePersonalFit,
        pfit_process_comfort_score: 1,
      },
    });

    const assessmentHigh = makeAssessment({
      personal_fit_answers: {
        ...basePersonalFit,
        pfit_process_comfort_score: 5,
      },
    });

    const resultLow = calculateDeterministicScores(assessmentLow);
    const resultHigh = calculateDeterministicScores(assessmentHigh);

    const fitLow = resultLow.dimensions.find((d) => d.key === "personal_fit");
    const fitHigh = resultHigh.dimensions.find((d) => d.key === "personal_fit");

    expect(fitLow).toBeDefined();
    expect(fitHigh).toBeDefined();

    const diff = fitHigh!.score - fitLow!.score;
    // Expected: (5-1) * 2 = 8 pts
    // Bug: diff = 0 because process_comfort_score is neither in the type nor read
    expect(diff).toBeGreaterThanOrEqual(8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRESERVATION TESTS
// These tests capture baseline behavior that MUST NOT change after the fix.
// They SHOULD PASS on unfixed code — passing here establishes the contract.
// ─────────────────────────────────────────────────────────────────────────────

describe("Preservation Tests", () => {
  /**
   * Test D — Preservation: null acceptable_loss_range does not crash
   *
   * Assessments created before the fix have aprf_acceptable_loss_range = null.
   * calculateDeterministicScores must handle this gracefully: no exception, and
   * it must return a result with all 6 dimensions.
   *
   * The riskScore fallback of 50 is the correct "no data" behavior and must
   * be preserved for backward compatibility.
   *
   * Validates: Requirements 3.3, 3.5
   */
  it("Test D: null aprf_acceptable_loss_range does not throw and returns 6 dimensions", () => {
    const assessment = makeAssessment({
      assessment_profile: {
        aprf_current_situation: "empleado",
        aprf_main_goal: "escalar_negocio",
        aprf_entrepreneurship_experience: "ninguna",
        aprf_capital_available_range: null,     // pre-fix: null
        aprf_acceptable_loss_range: null,       // pre-fix: null (bug condition active)
        aprf_hours_per_week_range: "10_20",
        aprf_available_schedule: "manana",
        aprf_expected_income_timeframe: "6_12_meses",
      },
    });

    // Must not throw
    let result: ReturnType<typeof calculateDeterministicScores> | undefined;
    expect(() => {
      result = calculateDeterministicScores(assessment);
    }).not.toThrow();

    expect(result).toBeDefined();
    expect(result!.dimensions).toHaveLength(6);

    // riskScore fallback: scoreFromRange(null) = 50 → clamp(100 - 50 + 0) = 50
    const riskDim = result!.dimensions.find((d) => d.key === "risk_level");
    expect(riskDim).toBeDefined();
    expect(riskDim!.score).toBe(50);
  });

  /**
   * Test E — Preservation: other dimension scores are reproducible and stable
   *
   * For a fixed, fully-specified input the four non-risk, non-personalFit
   * dimensions must return exact reproducible values. These values are the
   * baseline captured on unfixed code and must remain unchanged after the fix.
   *
   * Baseline values (computed from the base fixture):
   *   financial_viability : 35
   *     grossMarginPct = (100-30)/100 * 100 = 70%
   *     netProfit = 70*50 - 10000 = -6500 (negative → 0 pts)
   *     payback = null (netProfit ≤ 0) → 0 pts
   *     clamp(70*0.5 + 0 + 0) = clamp(35) = 35
   *
   *   commercial_viability : 43
   *     no talks (10) + media (18) + has channel (15) = clamp(43) = 43
   *
   *   time_fit : 65
   *     "10_20" → 65
   *
   *   scalability : 60
   *     solo (35) + escalar_negocio (25) = clamp(60) = 60
   *
   * Validates: Requirements 3.4, 3.5
   */
  it("Test E: financial_viability, commercial_viability, time_fit, scalability scores are stable and reproducible", () => {
    const assessment = makeAssessment(); // base fixture — no overrides

    const result = calculateDeterministicScores(assessment);

    const get = (key: string) =>
      result.dimensions.find((d) => d.key === key)?.score;

    expect(get("financial_viability")).toBe(35);
    expect(get("commercial_viability")).toBe(43);
    expect(get("time_fit")).toBe(65);
    expect(get("scalability")).toBe(60);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL RED FLAGS — investment vs. declared capital / acceptable loss
// ─────────────────────────────────────────────────────────────────────────────

function makeProfile(
  overrides: Partial<
    NonNullable<AssessmentWithRelations["assessment_profile"]>
  > = {}
) {
  return {
    aprf_current_situation: "empleado",
    aprf_main_goal: "escalar_negocio",
    aprf_entrepreneurship_experience: "ninguna",
    aprf_capital_available_range: "10k_50k",
    aprf_acceptable_loss_range: "20k_50k",
    aprf_hours_per_week_range: "10_20",
    aprf_available_schedule: "manana",
    aprf_expected_income_timeframe: "6_12_meses",
    ...overrides,
  };
}

function withFinancials(
  investment: number,
  profileOverrides: Partial<
    NonNullable<AssessmentWithRelations["assessment_profile"]>
  > = {}
): AssessmentWithRelations {
  const base = makeAssessment({ assessment_profile: makeProfile(profileOverrides) });
  return {
    ...base,
    financial_inputs: {
      ...base.financial_inputs!,
      finp_initial_investment: investment,
    },
  };
}

describe("detectFinancialRedFlags", () => {
  it("flags investment above the acceptable-loss ceiling", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(50_000, {
        aprf_acceptable_loss_range: "menos_5k", // ceiling $5,000
        aprf_capital_available_range: "150k_500k", // ceiling $500,000 — no flag
      })
    );
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/podr[ií]as perder/i);
  });

  it("flags investment above the available-capital ceiling", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(80_000, {
        aprf_capital_available_range: "10k_50k", // ceiling $50,000
        aprf_acceptable_loss_range: "mas_100k", // open-ended — no flag
      })
    );
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/capital m[áa]ximo/i);
  });

  it("emits both flags when investment exceeds both ceilings", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(200_000, {
        aprf_capital_available_range: "10k_50k",
        aprf_acceptable_loss_range: "20k_50k",
      })
    );
    expect(flags).toHaveLength(2);
  });

  it("emits nothing when the investment fits within both ranges", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(30_000, {
        aprf_capital_available_range: "10k_50k",
        aprf_acceptable_loss_range: "20k_50k",
      })
    );
    expect(flags).toEqual([]);
  });

  it("emits nothing for open-ended top ranges", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(1_000_000, {
        aprf_capital_available_range: "mas_500k",
        aprf_acceptable_loss_range: "mas_100k",
      })
    );
    expect(flags).toEqual([]);
  });

  it("emits nothing when the ranges were never captured (older assessments)", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(50_000, {
        aprf_capital_available_range: null,
        aprf_acceptable_loss_range: null,
      })
    );
    expect(flags).toEqual([]);
  });

  it("emits nothing when no initial investment is declared", () => {
    const flags = detectFinancialRedFlags(
      withFinancials(0, {
        aprf_capital_available_range: "menos_10k",
        aprf_acceptable_loss_range: "menos_5k",
      })
    );
    expect(flags).toEqual([]);
  });
});

describe("riskScore — over-exposure adjustment", () => {
  it("raises the risk score when the investment exceeds capital and acceptable loss", () => {
    // "20k_50k" acceptable loss → base risk = 100 - 35 + 0 = 65
    const within = calculateDeterministicScores(
      withFinancials(30_000, {
        aprf_acceptable_loss_range: "20k_50k",
        aprf_capital_available_range: "10k_50k",
      })
    );
    const over = calculateDeterministicScores(
      withFinancials(80_000, {
        aprf_acceptable_loss_range: "20k_50k", // ceiling $50,000 → +12
        aprf_capital_available_range: "10k_50k", // ceiling $50,000 → +8
      })
    );

    const risk = (r: ReturnType<typeof calculateDeterministicScores>) =>
      r.dimensions.find((d) => d.key === "risk_level")!.score;

    expect(risk(within)).toBe(65);
    expect(risk(over)).toBe(85);
  });

  it("does not change the risk score for older assessments without the ranges", () => {
    const result = calculateDeterministicScores(
      withFinancials(500_000, {
        aprf_acceptable_loss_range: null,
        aprf_capital_available_range: null,
      })
    );
    // scoreFromRange(null) → 50 → clamp(100 - 50 + 0 + 0) = 50
    expect(
      result.dimensions.find((d) => d.key === "risk_level")!.score
    ).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS DEPENDENCIES — riskScore penalty + red flags (rubric dimension 4)
// ─────────────────────────────────────────────────────────────────────────────

function withDependencies(deps: string[]): AssessmentWithRelations {
  // makeProfile() → aprf_acceptable_loss_range "20k_50k" and no over-exposure,
  // so base riskScore = clamp(100 - 35 + 0 + 0) = 65 with plenty of headroom.
  const base = makeAssessment({ assessment_profile: makeProfile() });
  return {
    ...base,
    market_risk_inputs: {
      ...base.market_risk_inputs!,
      mrsk_business_dependencies: deps,
    },
  };
}

const riskOf = (a: AssessmentWithRelations) =>
  calculateDeterministicScores(a).dimensions.find((d) => d.key === "risk_level")!
    .score;

describe("riskScore — business-dependency penalty", () => {
  it("adds nothing when there are no dependencies", () => {
    expect(riskOf(withDependencies([]))).toBe(65);
    expect(riskOf(withDependencies(["ninguna"]))).toBe(65);
  });

  it("weights platform and permit higher than the rest", () => {
    expect(riskOf(withDependencies(["plataforma"]))).toBe(71); // +6
    expect(riskOf(withDependencies(["plataforma", "permiso"]))).toBe(77); // +12
    expect(riskOf(withDependencies(["proveedor"]))).toBe(68); // +3
  });

  it("caps the penalty at +16", () => {
    // 6 + 6 + 3 + 3 + 3 = 21 → capped at 16
    expect(
      riskOf(
        withDependencies([
          "plataforma",
          "permiso",
          "proveedor",
          "cliente_unico",
          "ubicacion",
        ])
      )
    ).toBe(81);
  });

  it("leaves other dimensions untouched", () => {
    const scores = calculateDeterministicScores(
      withDependencies(["plataforma", "permiso"])
    );
    const get = (k: string) =>
      scores.dimensions.find((d) => d.key === k)!.score;
    expect(get("financial_viability")).toBe(35);
    expect(get("commercial_viability")).toBe(43);
    expect(get("time_fit")).toBe(65);
    expect(get("scalability")).toBe(60);
  });
});

describe("detectDependencyRedFlags", () => {
  it("flags an external-platform dependency", () => {
    const flags = detectDependencyRedFlags(withDependencies(["plataforma"]));
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/plataforma externa/i);
  });

  it("flags a permit/regulation dependency", () => {
    const flags = detectDependencyRedFlags(withDependencies(["permiso"]));
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/permiso|licencia|regulaci/i);
  });

  it("flags customer concentration", () => {
    const flags = detectDependencyRedFlags(withDependencies(["cliente_unico"]));
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/1 o 2 clientes/i);
  });

  it("emits all three when all three are selected", () => {
    expect(
      detectDependencyRedFlags(
        withDependencies(["plataforma", "permiso", "cliente_unico"])
      )
    ).toHaveLength(3);
  });

  it("emits nothing for non-flagged dependencies or empty selections", () => {
    expect(
      detectDependencyRedFlags(
        withDependencies(["proveedor", "ubicacion", "inventario"])
      )
    ).toEqual([]);
    expect(detectDependencyRedFlags(withDependencies([]))).toEqual([]);
    expect(detectDependencyRedFlags(withDependencies(["ninguna"]))).toEqual([]);
  });
});
