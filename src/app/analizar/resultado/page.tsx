import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ResultReport } from "@/components/onboarding/result-report";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function ResultadoPage() {
  const assessment = await enforceStepAccess("resultado");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="resultado">
      <ResultReport assessment={assessment} />
    </OnboardingShell>
  );
}
