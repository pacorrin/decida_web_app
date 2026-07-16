"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  ONBOARDING_STEPS,
  PHASE_ORDER,
  type OnboardingPhase,
  type OnboardingStepSlug,
  getStepBySlug,
  getStepProgress,
  getRemainingMinutes,
} from "@/lib/onboarding/steps";
import { STEP_COPY } from "@/lib/onboarding/copy";

const PHASE_LABELS: Record<OnboardingPhase, string> = {
  gratis: "Gratis",
  pago: "Compromiso",
  diagnostico: "Diagnóstico",
};

type OnboardingShellProps = {
  currentSlug: OnboardingStepSlug;
  children: React.ReactNode;
};

export function OnboardingShell({ currentSlug, children }: OnboardingShellProps) {
  const step = getStepBySlug(currentSlug);
  const copy = STEP_COPY[currentSlug];
  const progress = getStepProgress(currentSlug);
  const remaining = getRemainingMinutes(currentSlug);
  const showRemaining = currentSlug !== "resultado" && remaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 via-background to-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Decida
          </Link>
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground"
            data-testid="onboarding-step-indicator"
          >
            <span>
              Paso {step.order} de {ONBOARDING_STEPS.length}
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
            {PHASE_ORDER.map((phase) => (
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
            {copy.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {copy.subtitle}
          </p>
          {copy.reassurance && (
            <p className="text-sm text-[#6baed6]">{copy.reassurance}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
