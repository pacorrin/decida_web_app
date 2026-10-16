export type OnboardingPhase = "gratis" | "pago" | "diagnostico";

export type OnboardingStepSlug =
  | "contacto"
  | "idea"
  | "confirmacion"
  | "pago"
  | "perfil"
  | "ajuste"
  | "productos"
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
    phaseLabel: "Plan",
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
    slug: "productos",
    phase: "diagnostico",
    order: 7,
    label: "Productos y servicios",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 3,
    path: "/analizar/productos",
  },
  {
    slug: "evaluacion",
    phase: "diagnostico",
    order: 8,
    label: "Evaluación",
    phaseLabel: "Diagnóstico",
    estimatedMinutes: 4,
    path: "/analizar/evaluacion",
  },
  {
    slug: "resultado",
    phase: "diagnostico",
    order: 9,
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

/**
 * Quien ya tiene suscripción no pasa por la pantalla de planes: el conteo de
 * pasos, el avance y los minutos restantes se calculan sin ese paso para que
 * el recorrido sea consistente (1, 2, 3, 4… sin saltos).
 */
export type FlowOptions = { skipPlan?: boolean };

export function getFlowSteps(opts: FlowOptions = {}): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((s) => !(opts.skipPlan && s.slug === "pago"));
}

export function getFlowPhases(opts: FlowOptions = {}): OnboardingPhase[] {
  return PHASE_ORDER.filter((p) => !(opts.skipPlan && p === "pago"));
}

export function getStepTotal(opts: FlowOptions = {}): number {
  return getFlowSteps(opts).length;
}

/** Número de paso visible (1-based) dentro del recorrido de la cuenta. */
export function getStepNumber(
  slug: OnboardingStepSlug,
  opts: FlowOptions = {}
): number {
  const index = getFlowSteps(opts).findIndex((s) => s.slug === slug);
  return index === -1 ? getStepBySlug(slug).order : index + 1;
}

export function getStepProgress(
  slug: OnboardingStepSlug,
  opts: FlowOptions = {}
): number {
  return Math.round((getStepNumber(slug, opts) / getStepTotal(opts)) * 100);
}

export function getRemainingMinutes(
  fromSlug: OnboardingStepSlug,
  opts: FlowOptions = {}
): number {
  const step = getStepBySlug(fromSlug);
  return getFlowSteps(opts)
    .filter((s) => s.order >= step.order)
    .reduce((sum, s) => sum + s.estimatedMinutes, 0);
}
