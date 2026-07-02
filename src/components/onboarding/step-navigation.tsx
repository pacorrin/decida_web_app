"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStepBySlug, type OnboardingStepSlug } from "@/lib/onboarding/steps";
import { getPreviousStep } from "@/lib/onboarding/navigation";

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
  const prevSlug = getPreviousStep(currentSlug);
  const prevPath = prevSlug ? getStepBySlug(prevSlug).path : null;

  return (
    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {showBack && prevPath ? (
        <Button variant="ghost" render={<Link href={prevPath} />} nativeButton={false}>
          Atrás
        </Button>
      ) : (
        <div />
      )}
      <Button type="submit" disabled={isPending} className="sm:min-w-36">
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </div>
  );
}
