import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { IdeaForm } from "@/components/onboarding/idea-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function IdeaPage() {
  const assessment = await enforceStepAccess("idea");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="idea">
      <IdeaForm assessment={assessment} />
    </OnboardingShell>
  );
}
