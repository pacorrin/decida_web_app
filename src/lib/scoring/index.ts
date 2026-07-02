import { prisma } from "@/lib/prisma";
import {
  generateReasoningJson,
  getReasoningModel,
} from "@/lib/ai/openai";
import {
  SCORING_INTERPRET_SYSTEM_PROMPT,
  buildScoringInterpretPrompt,
  fallbackScoringInterpret,
  scoringInterpretSchema,
  type ScoringInterpretResult,
} from "@/lib/ai/schemas/scoring-interpret";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { calculateDeterministicScores } from "./types";

export { calculateDeterministicScores, calculateFinancialMetrics } from "./types";
export type { CalculatedMetrics, DeterministicScoreResult } from "./types";

function buildAssessmentContext(assessment: AssessmentWithRelations): string {
  const parts = [
    assessment.business_idea?.bide_ai_summary &&
      `Idea: ${assessment.business_idea.bide_ai_summary}`,
    assessment.assessment_profile?.aprf_main_goal &&
      `Objetivo: ${assessment.assessment_profile.aprf_main_goal}`,
    assessment.assessment_profile?.aprf_current_situation &&
      `Situación: ${assessment.assessment_profile.aprf_current_situation}`,
    assessment.market_risk_inputs?.mrsk_main_concern &&
      `Preocupación principal: ${assessment.market_risk_inputs.mrsk_main_concern}`,
  ].filter(Boolean);
  return parts.join("\n");
}

async function interpretScores(
  scores: Record<string, number>,
  context: string
): Promise<ScoringInterpretResult> {
  try {
    const raw = await generateReasoningJson<unknown>(
      SCORING_INTERPRET_SYSTEM_PROMPT,
      buildScoringInterpretPrompt(scores, context)
    );
    return scoringInterpretSchema.parse(raw);
  } catch {
    return fallbackScoringInterpret(scores);
  }
}

export async function runScoringPipeline(assessment: AssessmentWithRelations) {
  const deterministic = calculateDeterministicScores(assessment);
  const scoresMap = Object.fromEntries(
    deterministic.dimensions.map((d) => [d.key, d.score])
  );

  const interpretation = await interpretScores(
    scoresMap,
    buildAssessmentContext(assessment)
  );

  const scoreData = {
    ascs_personal_fit_score: deterministic.dimensions.find(
      (d) => d.key === "personal_fit"
    )?.score,
    ascs_financial_viability_score: deterministic.dimensions.find(
      (d) => d.key === "financial_viability"
    )?.score,
    ascs_commercial_viability_score: deterministic.dimensions.find(
      (d) => d.key === "commercial_viability"
    )?.score,
    ascs_risk_level_score: deterministic.dimensions.find(
      (d) => d.key === "risk_level"
    )?.score,
    ascs_time_fit_score: deterministic.dimensions.find(
      (d) => d.key === "time_fit"
    )?.score,
    ascs_scalability_score: deterministic.dimensions.find(
      (d) => d.key === "scalability"
    )?.score,
    ascs_personal_fit_signal: interpretation.personal_fit_signal,
    ascs_financial_viability_signal: interpretation.financial_viability_signal,
    ascs_commercial_viability_signal: interpretation.commercial_viability_signal,
    ascs_risk_level_signal: interpretation.risk_level_signal,
    ascs_time_fit_signal: interpretation.time_fit_signal,
    ascs_scalability_signal: interpretation.scalability_signal,
    ascs_final_recommendation: interpretation.final_recommendation,
    ascs_red_flags: interpretation.red_flags,
    ascs_calculated_metrics: deterministic.metrics,
    ascs_scoring_version: `${deterministic.scoringVersion}+${getReasoningModel()}`,
  };

  await prisma.assessment_scores.upsert({
    where: { ascs_asmt_id: assessment.asmt_id },
    create: { ascs_asmt_id: assessment.asmt_id, ...scoreData },
    update: scoreData,
  });

  if (assessment.financial_inputs && deterministic.metrics.grossMarginPerSale != null) {
    await prisma.financial_inputs.update({
      where: { finp_asmt_id: assessment.asmt_id },
      data: {
        finp_gross_margin_per_sale: deterministic.metrics.grossMarginPerSale,
        finp_gross_margin_percentage: deterministic.metrics.grossMarginPercentage,
        finp_estimated_monthly_gross_profit:
          deterministic.metrics.estimatedMonthlyGrossProfit,
        finp_estimated_monthly_net_profit:
          deterministic.metrics.estimatedMonthlyNetProfit,
        finp_break_even_sales: deterministic.metrics.breakEvenSales,
        finp_payback_months: deterministic.metrics.paybackMonths,
      },
    });
  }

  return { deterministic, interpretation };
}
