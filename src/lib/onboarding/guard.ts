import { redirect } from "next/navigation";
import {
  getCurrentAssessment,
  type AssessmentWithRelations,
} from "@/lib/onboarding/session-server";
import {
  canAccessStep,
  getResumeStep,
} from "@/lib/onboarding/navigation";
import {
  getStepBySlug,
  type OnboardingStepSlug,
} from "@/lib/onboarding/steps";

export async function enforceStepAccess(
  slug: OnboardingStepSlug
): Promise<AssessmentWithRelations | null> {
  const assessment = await getCurrentAssessment();

  if (slug !== "contacto" && !assessment) {
    redirect(getStepBySlug("contacto").path);
  }

  if (assessment && !canAccessStep(assessment, slug)) {
    const resume = getResumeStep(assessment);
    redirect(getStepBySlug(resume).path);
  }

  return assessment;
}
