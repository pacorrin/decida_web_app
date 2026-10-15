import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { enforceStepAccess } from "@/lib/onboarding/guard";

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ limite?: string }>;
}) {
  await enforceStepAccess("pago");
  const { limite } = await searchParams;

  return (
    <OnboardingShell currentSlug="pago">
      {limite === "1" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          La cuenta gratuita incluye una evaluación y ya la usaste. Suscríbete
          para evaluar más ideas.
        </div>
      )}
      <PaymentStep />
    </OnboardingShell>
  );
}
