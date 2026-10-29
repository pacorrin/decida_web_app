"use client";

import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  ONBOARDING_STEPS,
  type OnboardingPhase,
  type OnboardingStepSlug,
  getFlowPhases,
  getStepBySlug,
  getStepNumber,
  getStepProgress,
  getStepTotal,
  getRemainingMinutes,
} from "@/lib/onboarding/steps";
import { useOnboardingFlow } from "@/components/onboarding/flow-context";
import { STEP_COPY } from "@/lib/onboarding/copy";

const PHASE_LABELS: Record<OnboardingPhase, string> = {
  gratis: "Gratis",
  pago: "Plan",
  diagnostico: "Diagnóstico",
};

type OnboardingShellProps = {
  currentSlug: OnboardingStepSlug;
  /** Sustituyen el título y subtítulo del paso (p. ej. la pantalla de verificación). */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function OnboardingShell({ currentSlug, title, subtitle, children }: OnboardingShellProps) {
  const { skipPlan } = useOnboardingFlow();
  const flow = { skipPlan };
  const step = getStepBySlug(currentSlug);
  const copy = STEP_COPY[currentSlug];
  const progress = getStepProgress(currentSlug, flow);
  const remaining = getRemainingMinutes(currentSlug, flow);
  const showRemaining = currentSlug !== "resultado" && remaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 via-background to-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Decida, inicio"
          >
            <Image src="/logo.svg" alt="" width={44} height={27} aria-hidden />
            <span className="text-lg font-semibold tracking-tight text-primary">
              Decida
            </span>
          </Link>
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground"
            data-testid="onboarding-step-indicator"
          >
            <span>
              Paso {getStepNumber(currentSlug, flow)} de {getStepTotal(flow)}
            </span>
            {showRemaining && (
              <span data-testid="onboarding-remaining-time">
                · ~{remaining} min
              </span>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3 sm:px-6">
          <div className="mb-2 flex gap-2">
            {getFlowPhases(flow).map((phase) => (
              <span
                key={phase}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  step.phase === phase
                    ? "bg-primary text-primary-foreground"
                    : ONBOARDING_STEPS.find((s) => s.slug === currentSlug)!
                        .order >
                      ONBOARDING_STEPS.find((s) => s.phase === phase)!.order
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            ))}
          </div>
          <Progress
            value={progress}
            className="h-1.5"
            data-testid="onboarding-progress"
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {title ?? copy.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {subtitle ?? copy.subtitle}
          </p>
          {!title && copy.reassurance && (
            <p className="text-sm text-[#6baed6]">{copy.reassurance}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
