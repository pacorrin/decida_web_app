export type OnboardingPhase = "gratis" | "pago" | "diagnostico";

export type OnboardingStepSlug =
  | "contacto"
  | "idea"
  | "confirmacion"
  | "pago"
  | "perfil"
  | "ajuste"
  | "evaluacion"
  | "resultado";

export type OnboardingStep = {
  slug: OnboardingStepSlug;
  phase: OnboardingPhase;
  order: number;
  label: string;
  phaseLabel: string;
  estimatedMinutes: number;
  path: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    slug: "contacto",
    phase: "gratis",
    order: 1,
    label: "Contacto",
    phaseLabel: "Gratis",
    estimatedMinutes: 1,
    path: "/analizar/contacto",
  },
  {
    slug: "idea",
    phase: "gratis",
    order: 2,
    label: "Tu idea",
    phaseLabel: "Gratis",
    estimatedMinutes: 2,
    path: "/analizar/idea",
  },
  {
    slug: "confirmacion",
    phase: "gratis",
    order: 3,
    label: "Confirmación",
    phaseLabel: "Gratis",
    estimatedMinutes: 1,
    path: "/analizar/confirmacion",
  },
  {
    slug: "pago",
    phase: "pago",
    order: 4,
    label: "Pago",
    phaseLabel: "Compromiso",
    estimatedMinutes: 1,
    path: "/analizar/pago",
  },
  {
    slug: "perfil",
    phase: "diagnostico",
    order: 5,
    label: "Tu situación",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 6,
    path: "/analizar/perfil",
  },
  {
    slug: "ajuste",
    phase: "diagnostico",
    order: 6,
    label: "Ajuste personal",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 3,
    path: "/analizar/ajuste",
  },
  {
    slug: "evaluacion",
    phase: "diagnostico",
    order: 7,
    label: "Evaluación",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 5,
    path: "/analizar/evaluacion",
  },
  {
    slug: "resultado",
    phase: "diagnostico",
    order: 8,
    label: "Resultado",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 0,
    path: "/analizar/resultado",
  },
];

export const PHASE_ORDER: OnboardingPhase[] = ["gratis", "pago", "diagnostico"];

export function getStepBySlug(slug: OnboardingStepSlug): OnboardingStep {
  const step = ONBOARDING_STEPS.find((s) => s.slug === slug);
  if (!step) throw new Error(`Unknown step: ${slug}`);
  return step;
}

export function getStepProgress(slug: OnboardingStepSlug): number {
  const step = getStepBySlug(slug);
  return Math.round((step.order / ONBOARDING_STEPS.length) * 100);
}

export function getRemainingMinutes(fromSlug: OnboardingStepSlug): number {
  const step = getStepBySlug(fromSlug);
  return ONBOARDING_STEPS.filter((s) => s.order >= step.order).reduce(
    (sum, s) => sum + s.estimatedMinutes,
    0
  );
}
