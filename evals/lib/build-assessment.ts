import type { EvalCase } from "./case-types";

/** Pesos para que el rango de costos fijos tenga un monto estimado, como en el onboarding. */
const FIXED_COST_MIDPOINT: Record<string, number> = {
  menos_5k: 3000,
  "5k_15k": 10000,
  "15k_30k": 22000,
  "30k_50k": 40000,
  mas_50k: 60000,
};

/**
 * Convierte un caso en un `AssessmentWithRelations` mínimo (sin base de datos).
 * `summary` es el resumen de la IA que en producción confirma la persona.
 */
export function buildAssessment(c: EvalCase, summary: string) {
  const products = c.financial.products;
  const units = products.reduce((s, p) => s + p.monthlyUnits, 0);
  const price = units
    ? products.reduce((s, p) => s + p.price * p.monthlyUnits, 0) / units
    : 0;
  const cost = units
    ? products.reduce((s, p) => s + p.variableCost * p.monthlyUnits, 0) / units
    : 0;

  return {
    asmt_id: `eval_${c.id}`,
    asmt_email: "evals@decida.test",
    asmt_status: "in_progress",
    asmt_user_id: null,
    assessment_profile: {
      aprf_current_situation: c.profile.situation,
      aprf_main_goal: c.profile.goal,
      aprf_entrepreneurship_experience: c.profile.experience,
      aprf_capital_available_range: c.profile.capital,
      aprf_acceptable_loss_range: c.profile.acceptableLoss,
      aprf_hours_per_week_range: c.profile.hoursPerWeek,
      aprf_available_schedule: c.profile.schedule,
      aprf_expected_income_timeframe: c.profile.timeframe,
    },
    personal_fit_answers: {
      pfit_enjoyed_activities: c.fit.enjoyed,
      pfit_work_preference: c.fit.workPreference,
      pfit_sales_comfort_score: c.fit.sales,
      pfit_uncertainty_comfort_score: c.fit.uncertainty,
      pfit_process_comfort_score: c.fit.process,
      pfit_hiring_preference: c.fit.hiring,
    },
    business_idea: {
      bide_original_description: c.description,
      bide_ai_summary: summary,
      bide_ai_detected_assumptions: null,
      bide_user_confirmed_summary: true,
    },
    financial_inputs: {
      finp_id: `eval_fin_${c.id}`,
      finp_initial_investment: c.financial.initialInvestment,
      finp_products: products,
      finp_price_per_sale: price,
      finp_variable_cost_per_sale: cost,
      finp_estimated_monthly_sales: units,
      finp_fixed_monthly_costs_range: c.financial.fixedCostsRange,
      finp_fixed_monthly_costs_amount: FIXED_COST_MIDPOINT[c.financial.fixedCostsRange] ?? null,
      finp_currency: "MXN",
    },
    market_risk_inputs: {
      mrsk_id: `eval_mrsk_${c.id}`,
      mrsk_has_talked_to_customers: c.market.customerEvidence !== "ninguno",
      mrsk_customer_evidence_level: c.market.customerEvidence,
      mrsk_competition_level: c.market.competition,
      mrsk_acquisition_channel: c.market.channel,
      mrsk_business_dependencies: c.market.dependencies,
      mrsk_main_concern: c.market.mainConcern,
      mrsk_success_condition: c.market.successCondition,
    },
  } as never;
}
