import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session-server";
import {
  getAssessmentById,
  getCurrentAssessment,
  setAssessmentCookie,
  type AssessmentWithRelations,
} from "./session-server";
import { isAssessmentCompleted } from "./assessment-utils";
import { decideAssessmentStart } from "@/lib/subscription/limits";

export type EnsureAssessmentResult =
  | { status: "anonymous" }
  | { status: "limit_reached" }
  | { status: "ready"; assessment: AssessmentWithRelations };

/**
 * If a user is logged in, returns an assessment tied to their account —
 * reusing the in-progress one from the cookie if it already belongs to
 * them, otherwise provisioning a fresh one pre-filled from their profile.
 * Returns null for anonymous visitors (no-op, existing flow applies).
 */
export async function ensureAssessmentForCurrentUser(): Promise<EnsureAssessmentResult> {
  const user = await getCurrentUser();
  if (!user) return { status: "anonymous" };

  const current = await getCurrentAssessment();
  if (
    current &&
    current.asmt_user_id === user.user_id &&
    !isAssessmentCompleted(current)
  ) {
    return { status: "ready", assessment: current };
  }

  const latestRow = await prisma.assessments.findFirst({
    where: { asmt_user_id: user.user_id },
    orderBy: { asmt_created_at: "desc" },
    select: { asmt_id: true },
  });
  const latest = latestRow ? await getAssessmentById(latestRow.asmt_id) : null;

  const decision = decideAssessmentStart({
    latest: latest ? { completed: isAssessmentCompleted(latest) } : null,
    creditsBalance: user.user_credits_balance,
  });

  if (decision === "limit") {
    // Leave the cookie on their existing evaluation, not on a new one.
    if (latest) await setAssessmentCookie(latest.asmt_id);
    return { status: "limit_reached" };
  }

  if (decision === "resume" && latest) {
    await setAssessmentCookie(latest.asmt_id);
    return { status: "ready", assessment: latest };
  }

  const assessment = await prisma.assessments.create({
    data: {
      asmt_email: user.user_email,
      asmt_name: user.user_name,
      asmt_phone: user.user_phone,
      asmt_user_id: user.user_id,
      asmt_started_at: new Date(),
    },
  });

  await setAssessmentCookie(assessment.asmt_id);
  const created = await getAssessmentById(assessment.asmt_id);
  return created
    ? { status: "ready", assessment: created }
    : { status: "anonymous" };
}
