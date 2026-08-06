import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ContactForm } from "@/components/onboarding/contact-form";
import { AutoContinueForUser } from "@/components/onboarding/auto-continue-for-user";
import { enforceStepAccess } from "@/lib/onboarding/guard";
import { getCurrentUser } from "@/lib/auth/session-server";

export default async function ContactoPage() {
  const assessment = await enforceStepAccess("contacto");
  const user = assessment ? null : await getCurrentUser();

  return (
    <OnboardingShell currentSlug="contacto">
      {user ? <AutoContinueForUser /> : <ContactForm assessment={assessment} />}
    </OnboardingShell>
  );
}
