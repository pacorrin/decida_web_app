import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import {
  getPendingVerification,
  maskEmail,
} from "@/lib/auth/pending-verification";
import { getCurrentUser } from "@/lib/auth/session-server";

export default async function VerificarOnboardingPage() {
  if (await getCurrentUser()) redirect("/analizar/idea");
  const pending = await getPendingVerification();
  if (!pending || pending.flow !== "onboarding") redirect("/analizar/contacto");

  return (
    <OnboardingShell
      currentSlug="contacto"
      title="Revisa tu correo"
      subtitle="Para crear tu cuenta, ingresa el código que te enviamos."
    >
      <VerifyEmailForm maskedEmail={maskEmail(pending.email)} />
    </OnboardingShell>
  );
}
