import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ContactForm } from "@/components/onboarding/contact-form";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function ContactoPage() {
  const assessment = await enforceStepAccess("contacto");

  return (
    <OnboardingShell currentSlug="contacto">
      <ContactForm assessment={assessment} />
    </OnboardingShell>
  );
}
