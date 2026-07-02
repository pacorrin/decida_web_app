import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { IdeaConfirmation } from "@/components/onboarding/idea-confirmation";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function ConfirmacionPage() {
  const assessment = await enforceStepAccess("confirmacion");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="confirmacion">
      <IdeaConfirmation assessment={assessment} />
    </OnboardingShell>
  );
}
