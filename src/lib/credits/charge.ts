import "server-only";

import { prisma } from "@/lib/prisma";
import { isResearchEnabled } from "@/lib/ai/research/flag";
import {
  CREDIT_COST_BASIC,
  CREDIT_COST_RESEARCH,
  CREDIT_RESEARCH_DIFF,
  creditCostForResearch,
} from "./costs";
import {
  InsufficientCreditsError,
  refundCredits,
  spendCredits,
} from "./ledger";

export type ReportChargeMode =
  | "free_preview"
  | "retry"
  | "paid"
  | "insufficient";

export type ReportChargePlan = {
  mode: ReportChargeMode;
  /** Si se debe intentar investigación web en esta generación. */
  research: boolean;
  /** Centésimos cobrados o a cobrar (0 en free/retry). */
  cost: number;
};

/**
 * ¿Esta evaluación es la vista previa gratuita?
 * Primera evaluación de la cuenta que aún no ha sido cobrada.
 */
export async function isFreePreviewAssessment(
  assessmentId: string,
  userId: string,
): Promise<boolean> {
  const current = await prisma.assessments.findUnique({
    where: { asmt_id: assessmentId },
    select: { asmt_credits_charged_at: true },
  });
  if (!current || current.asmt_credits_charged_at) return false;

  const priorUsed = await prisma.assessments.count({
    where: {
      asmt_user_id: userId,
      asmt_id: { not: assessmentId },
      OR: [
        { asmt_credits_charged_at: { not: null } },
        {
          asmt_status: {
            in: ["completed", "report_generated", "failed"],
          },
        },
      ],
    },
  });
  return priorUsed === 0;
}

async function effectiveResearch(
  userId: string | null | undefined,
  researchEnabledOnAssessment: boolean,
): Promise<boolean> {
  if (!researchEnabledOnAssessment) return false;
  return isResearchEnabled(userId);
}

/**
 * Decide cobro e investigación antes de generar. En modo `paid` ya ejecutó el
 * `spend` atómico. `insufficient` no cobra.
 */
export async function planAndChargeForReport(params: {
  assessmentId: string;
  userId: string;
  researchEnabledOnAssessment: boolean;
  alreadyChargedAt: Date | null;
  creditsBalance: number;
}): Promise<ReportChargePlan> {
  if (params.alreadyChargedAt) {
    const research = await effectiveResearch(
      params.userId,
      params.researchEnabledOnAssessment,
    );
    return { mode: "retry", research, cost: 0 };
  }

  if (await isFreePreviewAssessment(params.assessmentId, params.userId)) {
    return { mode: "free_preview", research: false, cost: 0 };
  }

  const research = await effectiveResearch(
    params.userId,
    params.researchEnabledOnAssessment,
  );
  const cost = creditCostForResearch(research);

  if (params.creditsBalance < cost) {
    return { mode: "insufficient", research, cost };
  }

  await spendCredits({
    userId: params.userId,
    amount: cost,
    assessmentId: params.assessmentId,
    idempotencyKey: `spend:${params.assessmentId}`,
    markAssessmentCharged: true,
    metadata: {
      level: research ? "research" : "basic",
      cost,
    },
  });

  return { mode: "paid", research, cost };
}

/** Reembolso total tras fallo del reporte (idempotente). */
export async function refundFailedReport(params: {
  userId: string;
  assessmentId: string;
  amount: number;
}): Promise<void> {
  if (params.amount <= 0) return;
  await refundCredits({
    userId: params.userId,
    amount: params.amount,
    assessmentId: params.assessmentId,
    reason: "failed",
    metadata: { reason: "failed" },
  });
}

/**
 * Si la investigación se degradó (failed/skipped) habiendo cobrado research,
 * reembolsa la diferencia (1.00 crédito).
 */
export async function refundDegradedResearch(params: {
  userId: string;
  assessmentId: string;
  chargedCost: number;
  researchStatus: string | null | undefined;
}): Promise<boolean> {
  if (params.chargedCost < CREDIT_COST_RESEARCH) return false;
  if (
    params.researchStatus !== "failed" &&
    params.researchStatus !== "skipped"
  ) {
    return false;
  }
  await refundCredits({
    userId: params.userId,
    amount: CREDIT_RESEARCH_DIFF,
    assessmentId: params.assessmentId,
    reason: "research",
    metadata: { reason: "research", status: params.researchStatus },
  });
  return true;
}

/** Desbloquear preview sin regenerar (cobra básico si aún no cobrada). */
export async function unlockReportWithoutRegenerate(params: {
  userId: string;
  assessmentId: string;
  alreadyChargedAt: Date | null;
  creditsBalance: number;
}): Promise<"unlocked" | "already" | "insufficient"> {
  if (params.alreadyChargedAt) return "already";
  if (params.creditsBalance < CREDIT_COST_BASIC) return "insufficient";

  try {
    await spendCredits({
      userId: params.userId,
      amount: CREDIT_COST_BASIC,
      assessmentId: params.assessmentId,
      idempotencyKey: `spend:${params.assessmentId}`,
      markAssessmentCharged: true,
      metadata: { level: "basic", unlock: true },
    });
    return "unlocked";
  } catch (err) {
    if (err instanceof InsufficientCreditsError) return "insufficient";
    throw err;
  }
}

/**
 * Activar investigación: cobra 150 (o la diferencia si ya pagó 50), marca el
 * interruptor y deja listo para regenerar.
 */
export async function chargeForResearchUpgrade(params: {
  userId: string;
  assessmentId: string;
  alreadyChargedAt: Date | null;
  priorCost: number | null;
  creditsBalance: number;
}): Promise<
  | { kind: "charged"; amount: number }
  | { kind: "insufficient"; required: number }
> {
  await prisma.assessments.update({
    where: { asmt_id: params.assessmentId },
    data: { asmt_research_enabled: true },
  });

  if (!params.alreadyChargedAt) {
    if (params.creditsBalance < CREDIT_COST_RESEARCH) {
      return { kind: "insufficient", required: CREDIT_COST_RESEARCH };
    }
    await spendCredits({
      userId: params.userId,
      amount: CREDIT_COST_RESEARCH,
      assessmentId: params.assessmentId,
      idempotencyKey: `spend:${params.assessmentId}`,
      markAssessmentCharged: true,
      metadata: { level: "research", unlock: true },
    });
    return { kind: "charged", amount: CREDIT_COST_RESEARCH };
  }

  const prior = params.priorCost ?? CREDIT_COST_BASIC;
  const extra = Math.max(0, CREDIT_COST_RESEARCH - prior);
  if (extra === 0) return { kind: "charged", amount: 0 };
  if (params.creditsBalance < extra) {
    return { kind: "insufficient", required: extra };
  }

  await spendCredits({
    userId: params.userId,
    amount: extra,
    assessmentId: params.assessmentId,
    idempotencyKey: `spend:${params.assessmentId}:research_upgrade`,
    metadata: { level: "research_upgrade", extra },
  });
  await prisma.assessments.update({
    where: { asmt_id: params.assessmentId },
    data: { asmt_credit_cost: CREDIT_COST_RESEARCH },
  });
  return { kind: "charged", amount: extra };
}
