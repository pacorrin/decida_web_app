import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PersonalFitForm } from "@/components/onboarding/personal-fit-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function AjustePage() {
  const assessment = await enforceStepAccess("ajuste");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="ajuste">
      <PersonalFitForm assessment={assessment} />
    </OnboardingShell>
  );
}
