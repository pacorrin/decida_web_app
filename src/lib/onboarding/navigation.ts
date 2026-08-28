import {
  isIdeaConfirmed,
  isPaid,
  type AssessmentBase,
} from "./assessment-utils";
import {
  ONBOARDING_STEPS,
  type OnboardingStepSlug,
  getStepBySlug,
} from "./steps";

function isSituationComplete(profile: AssessmentBase["assessment_profile"]): boolean {
  return !!(
    profile?.aprf_current_situation &&
    profile.aprf_main_goal &&
    profile.aprf_entrepreneurship_experience &&
    profile.aprf_hours_per_week_range &&
    profile.aprf_available_schedule &&
    profile.aprf_expected_income_timeframe
  );
}

function hasProducts(assessment: AssessmentBase): boolean {
  const products = assessment.financial_inputs?.finp_products;
  return Array.isArray(products) && products.length > 0;
}

function isFitComplete(fit: AssessmentBase["personal_fit_answers"]): boolean {
  return !!(fit?.pfit_work_preference && fit.pfit_hiring_preference);
}

export function getResumeStep(
  assessment: AssessmentBase | null
): OnboardingStepSlug {
  if (!assessment) return "contacto";

  if (!assessment.business_idea?.bide_original_description) {
    return assessment.asmt_email ? "idea" : "contacto";
  }

  if (!assessment.business_idea.bide_ai_summary) {
    return "idea";
  }

  if (!isIdeaConfirmed(assessment)) {
    return "confirmacion";
  }

  if (!isPaid(assessment)) {
    return "pago";
  }

  if (!isSituationComplete(assessment.assessment_profile)) {
    return "perfil";
  }

  if (!isFitComplete(assessment.personal_fit_answers)) {
    return "ajuste";
  }

  if (!hasProducts(assessment)) {
    return "productos";
  }

  if (!assessment.market_risk_inputs) {
    return "evaluacion";
  }

  if (
    assessment.asmt_status === "completed" ||
    assessment.asmt_status === "report_generated" ||
    assessment.assessment_report
  ) {
    return "resultado";
  }

  return "evaluacion";
}

export function canAccessStep(
  assessment: AssessmentBase | null,
  slug: OnboardingStepSlug
): boolean {
  if (slug === "contacto") return true;
  if (!assessment) return false;

  const resumeStep = getResumeStep(assessment);
  const targetOrder = getStepBySlug(slug).order;
  const resumeOrder = getStepBySlug(resumeStep).order;

  if (targetOrder <= resumeOrder) return true;

  if (slug === "pago" && isIdeaConfirmed(assessment)) return true;

  const paidSteps: OnboardingStepSlug[] = [
    "perfil",
    "ajuste",
    "productos",
    "evaluacion",
    "resultado",
  ];
  if (paidSteps.includes(slug) && isPaid(assessment)) {
    const prerequisites: Record<string, boolean> = {
      perfil: isPaid(assessment),
      ajuste: isSituationComplete(assessment.assessment_profile),
      productos: isFitComplete(assessment.personal_fit_answers),
      evaluacion: hasProducts(assessment),
      resultado: hasProducts(assessment) && !!assessment.market_risk_inputs,
    };
    return prerequisites[slug] ?? false;
  }

  return false;
}

export function getPreviousStep(
  slug: OnboardingStepSlug
): OnboardingStepSlug | null {
  const step = getStepBySlug(slug);
  const prev = ONBOARDING_STEPS.find((s) => s.order === step.order - 1);
  return prev?.slug ?? null;
}
