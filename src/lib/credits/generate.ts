import "server-only";

import { generateReport } from "@/lib/ai/generate-report";
import type { AiObservabilityContext } from "@/lib/ai/openai";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import type { ScoringInterpretResult } from "@/lib/ai/schemas/scoring-interpret";
import type { DeterministicScoreResult } from "@/lib/scoring/types";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  planAndChargeForReport,
  refundDegradedResearch,
  refundFailedReport,
  type ReportChargePlan,
} from "./charge";

export type GenerateWithCreditsResult =
  | { kind: "ok"; plan: ReportChargePlan }
  | { kind: "insufficient"; plan: ReportChargePlan }
  | { kind: "failed"; plan: ReportChargePlan; error: unknown };

/**
 * Cobra (si aplica), genera el reporte y reembolsa en fallo o investigación
 * degradada. No marca el assessment como failed — eso lo hace el llamador.
 */
export async function generateReportWithCredits(params: {
  assessment: AssessmentWithRelations;
  userId: string;
  creditsBalance: number;
  deterministic: DeterministicScoreResult;
  interpretation: ScoringInterpretResult;
  observability?: AiObservabilityContext;
}): Promise<GenerateWithCreditsResult> {
  const { assessment } = params;
  const plan = await planAndChargeForReport({
    assessmentId: assessment.asmt_id,
    userId: params.userId,
    researchEnabledOnAssessment: assessment.asmt_research_enabled !== false,
    alreadyChargedAt: assessment.asmt_credits_charged_at,
    creditsBalance: params.creditsBalance,
  });

  if (plan.mode === "insufficient") {
    await trackServer(params.userId, ANALYTICS_EVENTS.creditsInsufficient, {
      required: plan.cost,
      research: plan.research,
      assessment_id: assessment.asmt_id,
    });
    return { kind: "insufficient", plan };
  }

  if (plan.mode === "paid" && plan.cost > 0) {
    await trackServer(params.userId, ANALYTICS_EVENTS.creditsSpent, {
      amount: plan.cost,
      research: plan.research,
      assessment_id: assessment.asmt_id,
    });
  }

  try {
    const reportData = await generateReport(
      assessment,
      params.deterministic,
      params.interpretation,
      params.observability,
      { forceNoResearch: !plan.research },
    );

    if (plan.mode === "paid" && plan.research) {
      const research = reportData.arep_research as
        | { status?: string }
        | null
        | undefined;
      await refundDegradedResearch({
        userId: params.userId,
        assessmentId: assessment.asmt_id,
        chargedCost: plan.cost,
        researchStatus: research?.status,
      });
    }

    return { kind: "ok", plan };
  } catch (error) {
    if (plan.mode === "paid" && plan.cost > 0) {
      await refundFailedReport({
        userId: params.userId,
        assessmentId: assessment.asmt_id,
        amount: plan.cost,
      });
    }
    return { kind: "failed", plan, error };
  }
}
