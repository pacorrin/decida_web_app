import type { assessments } from "@/generated/prisma/client";

export type AssessmentBase = assessments & {
  assessment_profile?: {
    aprf_current_situation: string | null;
    aprf_main_goal: string | null;
    aprf_entrepreneurship_experience: string | null;
    aprf_capital_available_range: string | null;
    aprf_acceptable_loss_range: string | null;
    aprf_hours_per_week_range: string | null;
    aprf_available_schedule: string | null;
    aprf_expected_income_timeframe: string | null;
  } | null;
  personal_fit_answers?: {
    pfit_enjoyed_activities: unknown;
    pfit_work_preference: string | null;
    pfit_sales_comfort_score: number | null;
    pfit_uncertainty_comfort_score: number | null;
    pfit_hiring_preference: string | null;
  } | null;
  business_idea?: {
    bide_original_description: string | null;
    bide_ai_summary: string | null;
    bide_ai_detected_assumptions: unknown;
    bide_user_confirmed_summary: boolean;
  } | null;
  financial_inputs?: {
    finp_id: string;
    finp_initial_investment?: unknown;
    finp_price_per_sale?: unknown;
    finp_variable_cost_per_sale?: unknown;
    finp_estimated_monthly_sales?: number | null;
    finp_fixed_monthly_costs_range?: string | null;
    finp_fixed_monthly_costs_amount?: unknown;
    finp_currency?: string | null;
    finp_gross_margin_per_sale?: unknown;
    finp_gross_margin_percentage?: unknown;
    finp_estimated_monthly_gross_profit?: unknown;
    finp_estimated_monthly_net_profit?: unknown;
    finp_break_even_sales?: number | null;
    finp_payback_months?: unknown;
  } | null;
  market_risk_inputs?: {
    mrsk_id: string;
    mrsk_has_talked_to_customers?: boolean | null;
    mrsk_competition_level?: string | null;
    mrsk_acquisition_channel?: string | null;
    mrsk_main_concern?: string | null;
    mrsk_success_condition?: string | null;
  } | null;
  assessment_score?: {
    ascs_personal_fit_score?: number | null;
    ascs_financial_viability_score?: number | null;
    ascs_commercial_viability_score?: number | null;
    ascs_risk_level_score?: number | null;
    ascs_time_fit_score?: number | null;
    ascs_scalability_score?: number | null;
    ascs_personal_fit_signal?: string | null;
    ascs_financial_viability_signal?: string | null;
    ascs_commercial_viability_signal?: string | null;
    ascs_risk_level_signal?: string | null;
    ascs_time_fit_signal?: string | null;
    ascs_scalability_signal?: string | null;
    ascs_final_recommendation?: string | null;
    ascs_red_flags?: unknown;
  } | null;
  assessment_report?: {
    arep_executive_summary?: string | null;
    arep_business_understanding?: string | null;
    arep_financial_analysis?: string | null;
    arep_personal_fit_analysis?: string | null;
    arep_time_operation_analysis?: string | null;
    arep_scalability_analysis?: string | null;
    arep_final_recommendation_text?: string | null;
    arep_strengths?: unknown;
    arep_risks?: unknown;
    arep_validation_plan?: unknown;
  } | null;
  feedback?: {
    fdbk_rating: number | null;
    fdbk_comment: string | null;
    fdbk_would_recommend: boolean | null;
    fdbk_testimonial_consent: boolean;
    fdbk_created_at: Date;
  } | null;
  payments?: unknown[];
};

export function isPaid(assessment: AssessmentBase): boolean {
  return (
    assessment.asmt_status === "paid" ||
    assessment.asmt_status === "in_progress" ||
    assessment.asmt_status === "completed" ||
    assessment.asmt_status === "report_generated" ||
    assessment.asmt_status === "failed" ||
    assessment.asmt_payment_status === "paid"
  );
}

export function isIdeaConfirmed(assessment: AssessmentBase): boolean {
  return assessment.business_idea?.bide_user_confirmed_summary === true;
}

export type { AssessmentBase as AssessmentWithRelations };
