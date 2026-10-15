import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function PagoPage() {
  await enforceStepAccess("pago");

  return (
    <OnboardingShell currentSlug="pago">
      <PaymentStep />
    </OnboardingShell>
  );
}
