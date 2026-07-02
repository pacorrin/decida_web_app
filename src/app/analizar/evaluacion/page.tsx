import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { EvaluationForm } from "@/components/onboarding/evaluation-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function EvaluacionPage() {
  const assessment = await enforceStepAccess("evaluacion");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="evaluacion">
      <EvaluationForm assessment={assessment} />
    </OnboardingShell>
  );
}
