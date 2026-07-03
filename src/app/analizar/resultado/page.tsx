import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ResultReport } from "@/components/onboarding/result-report";
import { enforceStepAccess } from "@/lib/onboarding/guard";
import { AutoRefresh } from "@/components/onboarding/auto-refresh";

export default async function ResultadoPage() {
  const assessment = await enforceStepAccess("resultado");
  if (!assessment) return null;

  const shouldAutoRefresh = 
    assessment.asmt_status === "in_progress" && 
    !assessment.assessment_report;

  return (
    <OnboardingShell currentSlug="resultado">
      {shouldAutoRefresh && <AutoRefresh />}
      <ResultReport assessment={assessment} />
    </OnboardingShell>
  );
}
