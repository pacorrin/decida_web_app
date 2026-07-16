"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStepBySlug, type OnboardingStepSlug } from "@/lib/onboarding/steps";
import { getPreviousStep } from "@/lib/onboarding/navigation";

type BackButtonProps = {
  currentSlug: OnboardingStepSlug;
  className?: string;
};

export function BackButton({ currentSlug, className }: BackButtonProps) {
  const prevSlug = getPreviousStep(currentSlug);
  const prevPath = prevSlug ? getStepBySlug(prevSlug).path : null;

  if (!prevPath) return null;

  return (
    <Button
      variant="ghost"
      render={<Link href={prevPath} data-testid="step-back" />}
      nativeButton={false}
      className={className}
    >
      Atrás
    </Button>
  );
}

type StepNavigationProps = {
  currentSlug: OnboardingStepSlug;
  isPending?: boolean;
  submitLabel?: string;
  showBack?: boolean;
};

export function StepNavigation({
  currentSlug,
  isPending = false,
  submitLabel = "Continuar",
  showBack = true,
}: StepNavigationProps) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {showBack ? (
        <BackButton currentSlug={currentSlug} />
      ) : (
        <div />
      )}
      <Button
        type="submit"
        disabled={isPending}
        className="sm:min-w-36"
        data-testid="step-submit"
      >
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </div>
  );
}
