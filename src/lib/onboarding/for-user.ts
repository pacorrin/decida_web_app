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

/**
 * If a user is logged in, returns an assessment tied to their account —
 * reusing the in-progress one from the cookie if it already belongs to
 * them, otherwise provisioning a fresh one pre-filled from their profile.
 * Returns null for anonymous visitors (no-op, existing flow applies).
 */
export async function ensureAssessmentForCurrentUser(): Promise<AssessmentWithRelations | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const current = await getCurrentAssessment();
  if (
    current &&
    current.asmt_user_id === user.user_id &&
    !isAssessmentCompleted(current)
  ) {
    return current;
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
  return getAssessmentById(assessment.asmt_id);
}
