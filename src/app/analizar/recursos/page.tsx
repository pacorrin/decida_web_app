import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ResourcesForm } from "@/components/onboarding/resources-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function RecursosPage() {
  const assessment = await enforceStepAccess("recursos");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="recursos">
      <ResourcesForm assessment={assessment} />
    </OnboardingShell>
  );
}
