-- CreateEnum
CREATE TYPE "assessment_status" AS ENUM ('started', 'paid', 'in_progress', 'completed', 'report_generated', 'failed');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "signal_level" AS ENUM ('green', 'yellow', 'red');

-- CreateEnum
CREATE TYPE "final_recommendation" AS ENUM ('proceed_small_test', 'validate_first', 'adjust_idea', 'pause_for_now');

-- CreateTable
CREATE TABLE "assessments" (
    "asmt_id" TEXT NOT NULL,
    "asmt_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asmt_updated_at" TIMESTAMP(3) NOT NULL,
    "asmt_status" "assessment_status" NOT NULL DEFAULT 'started',
    "asmt_email" TEXT NOT NULL,
    "asmt_country" TEXT,
    "asmt_payment_status" "payment_status",
    "asmt_payment_provider" TEXT,
    "asmt_payment_reference" TEXT,
    "asmt_started_at" TIMESTAMP(3),
    "asmt_completed_at" TIMESTAMP(3),
    "asmt_report_generated_at" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("asmt_id")
);

-- CreateTable
CREATE TABLE "assessment_profiles" (
    "aprf_id" TEXT NOT NULL,
    "aprf_asmt_id" TEXT NOT NULL,
    "aprf_current_situation" TEXT,
    "aprf_main_goal" TEXT,
    "aprf_expected_income_timeframe" TEXT,
    "aprf_entrepreneurship_experience" TEXT,
    "aprf_capital_available_range" TEXT,
    "aprf_acceptable_loss_range" TEXT,
    "aprf_hours_per_week_range" TEXT,
    "aprf_available_schedule" TEXT,

    CONSTRAINT "assessment_profiles_pkey" PRIMARY KEY ("aprf_id")
);

-- CreateTable
CREATE TABLE "personal_fit_answers" (
    "pfit_id" TEXT NOT NULL,
    "pfit_asmt_id" TEXT NOT NULL,
    "pfit_enjoyed_activities" JSONB,
    "pfit_avoided_activities" JSONB,
    "pfit_work_preference" TEXT,
    "pfit_sales_comfort_score" INTEGER,
    "pfit_uncertainty_comfort_score" INTEGER,
    "pfit_hiring_preference" TEXT,

    CONSTRAINT "personal_fit_answers_pkey" PRIMARY KEY ("pfit_id")
);

-- CreateTable
CREATE TABLE "business_ideas" (
    "bide_id" TEXT NOT NULL,
    "bide_asmt_id" TEXT NOT NULL,
    "bide_original_description" TEXT,
    "bide_target_customer" TEXT,
    "bide_problem_solved" TEXT,
    "bide_why_would_pay" TEXT,
    "bide_ai_summary" TEXT,
    "bide_ai_detected_assumptions" JSONB,
    "bide_user_confirmed_summary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "business_ideas_pkey" PRIMARY KEY ("bide_id")
);

-- CreateTable
CREATE TABLE "financial_inputs" (
    "finp_id" TEXT NOT NULL,
    "finp_asmt_id" TEXT NOT NULL,
    "finp_initial_investment" DECIMAL(12,2),
    "finp_price_per_sale" DECIMAL(12,2),
    "finp_variable_cost_per_sale" DECIMAL(12,2),
    "finp_estimated_monthly_sales" INTEGER,
    "finp_fixed_monthly_costs_range" TEXT,
    "finp_fixed_monthly_costs_amount" DECIMAL(12,2),
    "finp_currency" TEXT DEFAULT 'USD',
    "finp_gross_margin_per_sale" DECIMAL(12,2),
    "finp_gross_margin_percentage" DECIMAL(5,2),
    "finp_estimated_monthly_gross_profit" DECIMAL(12,2),
    "finp_estimated_monthly_net_profit" DECIMAL(12,2),
    "finp_break_even_sales" INTEGER,
    "finp_payback_months" DECIMAL(6,2),

    CONSTRAINT "financial_inputs_pkey" PRIMARY KEY ("finp_id")
);

-- CreateTable
CREATE TABLE "market_risk_inputs" (
    "mrsk_id" TEXT NOT NULL,
    "mrsk_asmt_id" TEXT NOT NULL,
    "mrsk_has_talked_to_customers" BOOLEAN,
    "mrsk_competition_level" TEXT,
    "mrsk_acquisition_channel" TEXT,
    "mrsk_business_dependencies" JSONB,
    "mrsk_main_concern" TEXT,
    "mrsk_success_condition" TEXT,

    CONSTRAINT "market_risk_inputs_pkey" PRIMARY KEY ("mrsk_id")
);

-- CreateTable
CREATE TABLE "assessment_scores" (
    "ascs_id" TEXT NOT NULL,
    "ascs_asmt_id" TEXT NOT NULL,
    "ascs_personal_fit_score" INTEGER,
    "ascs_financial_viability_score" INTEGER,
    "ascs_commercial_viability_score" INTEGER,
    "ascs_risk_level_score" INTEGER,
    "ascs_time_fit_score" INTEGER,
    "ascs_scalability_score" INTEGER,
    "ascs_personal_fit_signal" "signal_level",
    "ascs_financial_viability_signal" "signal_level",
    "ascs_commercial_viability_signal" "signal_level",
    "ascs_risk_level_signal" "signal_level",
    "ascs_time_fit_signal" "signal_level",
    "ascs_scalability_signal" "signal_level",
    "ascs_final_recommendation" "final_recommendation",
    "ascs_red_flags" JSONB,
    "ascs_calculated_metrics" JSONB,
    "ascs_scoring_version" TEXT,

    CONSTRAINT "assessment_scores_pkey" PRIMARY KEY ("ascs_id")
);

-- CreateTable
CREATE TABLE "assessment_reports" (
    "arep_id" TEXT NOT NULL,
    "arep_asmt_id" TEXT NOT NULL,
    "arep_executive_summary" TEXT,
    "arep_business_understanding" TEXT,
    "arep_strengths" JSONB,
    "arep_risks" JSONB,
    "arep_personal_fit_analysis" TEXT,
    "arep_financial_analysis" TEXT,
    "arep_time_operation_analysis" TEXT,
    "arep_scalability_analysis" TEXT,
    "arep_validation_plan" JSONB,
    "arep_final_recommendation_text" TEXT,
    "arep_pdf_url" TEXT,
    "arep_ai_model_used" TEXT,
    "arep_prompt_version" TEXT,
    "arep_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_reports_pkey" PRIMARY KEY ("arep_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "paym_id" TEXT NOT NULL,
    "paym_asmt_id" TEXT NOT NULL,
    "paym_provider" TEXT NOT NULL,
    "paym_provider_session_id" TEXT,
    "paym_provider_payment_id" TEXT,
    "paym_amount" DECIMAL(12,2) NOT NULL,
    "paym_currency" TEXT NOT NULL DEFAULT 'USD',
    "paym_status" "payment_status" NOT NULL DEFAULT 'pending',
    "paym_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paym_paid_at" TIMESTAMP(3),
    "paym_raw_payload" JSONB,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paym_id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "fdbk_id" TEXT NOT NULL,
    "fdbk_asmt_id" TEXT NOT NULL,
    "fdbk_rating" INTEGER,
    "fdbk_clarity_score" INTEGER,
    "fdbk_usefulness_score" INTEGER,
    "fdbk_comment" TEXT,
    "fdbk_would_recommend" BOOLEAN,
    "fdbk_testimonial_consent" BOOLEAN NOT NULL DEFAULT false,
    "fdbk_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("fdbk_id")
);

-- CreateIndex
CREATE INDEX "assessments_asmt_email_idx" ON "assessments"("asmt_email");

-- CreateIndex
CREATE INDEX "assessments_asmt_status_idx" ON "assessments"("asmt_status");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_profiles_aprf_asmt_id_key" ON "assessment_profiles"("aprf_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_fit_answers_pfit_asmt_id_key" ON "personal_fit_answers"("pfit_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_ideas_bide_asmt_id_key" ON "business_ideas"("bide_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_inputs_finp_asmt_id_key" ON "financial_inputs"("finp_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "market_risk_inputs_mrsk_asmt_id_key" ON "market_risk_inputs"("mrsk_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_scores_ascs_asmt_id_key" ON "assessment_scores"("ascs_asmt_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_reports_arep_asmt_id_key" ON "assessment_reports"("arep_asmt_id");

-- CreateIndex
CREATE INDEX "payments_paym_asmt_id_idx" ON "payments"("paym_asmt_id");

-- CreateIndex
CREATE INDEX "payments_paym_status_idx" ON "payments"("paym_status");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_fdbk_asmt_id_key" ON "feedback"("fdbk_asmt_id");

-- AddForeignKey
ALTER TABLE "assessment_profiles" ADD CONSTRAINT "assessment_profiles_aprf_asmt_id_fkey" FOREIGN KEY ("aprf_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_fit_answers" ADD CONSTRAINT "personal_fit_answers_pfit_asmt_id_fkey" FOREIGN KEY ("pfit_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ideas" ADD CONSTRAINT "business_ideas_bide_asmt_id_fkey" FOREIGN KEY ("bide_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_inputs" ADD CONSTRAINT "financial_inputs_finp_asmt_id_fkey" FOREIGN KEY ("finp_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_risk_inputs" ADD CONSTRAINT "market_risk_inputs_mrsk_asmt_id_fkey" FOREIGN KEY ("mrsk_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_ascs_asmt_id_fkey" FOREIGN KEY ("ascs_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_arep_asmt_id_fkey" FOREIGN KEY ("arep_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paym_asmt_id_fkey" FOREIGN KEY ("paym_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_fdbk_asmt_id_fkey" FOREIGN KEY ("fdbk_asmt_id") REFERENCES "assessments"("asmt_id") ON DELETE CASCADE ON UPDATE CASCADE;
