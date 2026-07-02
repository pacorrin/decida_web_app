import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function PerfilPage() {
  const assessment = await enforceStepAccess("perfil");
  if (!assessment) return null;

  return (
    <OnboardingShell currentSlug="perfil">
      <ProfileForm assessment={assessment} />
    </OnboardingShell>
  );
}
