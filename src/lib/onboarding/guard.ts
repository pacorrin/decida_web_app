import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import {
  getPendingVerification,
  VERIFICATION_PATHS,
} from "@/lib/auth/pending-verification";
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

/**
 * Pasado el contacto, solo avanza quien tiene sesión (es decir, ya confirmó el
 * código de su correo) y es dueño del análisis. Si dejó la verificación a medias
 * vuelve a esa pantalla; si no, al contacto.
 */
export async function redirectToVerificationOrContact(): Promise<never> {
  const pending = await getPendingVerification();
  redirect(
    pending?.flow === "onboarding"
      ? VERIFICATION_PATHS.onboarding
      : getStepBySlug("contacto").path
  );
}

export async function requireVerifiedOwner(
  assessment: AssessmentWithRelations | null
): Promise<AssessmentWithRelations> {
  const user = await getCurrentUser();
  if (!assessment || !user || assessment.asmt_user_id !== user.user_id) {
    return redirectToVerificationOrContact();
  }
  return assessment;
}

export async function enforceStepAccess(
  slug: OnboardingStepSlug
): Promise<AssessmentWithRelations | null> {
  const assessment = await getCurrentAssessment();

  if (slug !== "contacto") {
    await requireVerifiedOwner(assessment);
  }

  if (assessment && !canAccessStep(assessment, slug)) {
    const resume = getResumeStep(assessment);
    redirect(getStepBySlug(resume).path);
  }

  return assessment;
}
