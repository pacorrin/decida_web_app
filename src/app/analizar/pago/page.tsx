import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { CheckoutNotice } from "@/components/account/checkout-notice";
import { enforceStepAccess } from "@/lib/onboarding/guard";
import { getStepBySlug } from "@/lib/onboarding/steps";
import { getResumeStep } from "@/lib/onboarding/navigation";
import { hasFullAccess } from "@/lib/subscription/access";
import { isSubscriptionsEnabled } from "@/lib/subscription/flag";
import { getCurrentUser } from "@/lib/auth/session-server";
import { resolveCheckoutReturn } from "@/lib/subscription/checkout-return";

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const assessment = await enforceStepAccess("pago");

  const { checkout, session_id } = await searchParams;
  const user = await getCurrentUser();
  const checkoutState = user
    ? await resolveCheckoutReturn(user.user_id, { checkout, session_id }, "onboarding")
    : "none";

  // Pago confirmado: el onboarding sigue en el siguiente paso.
  if (checkoutState === "activated") redirect(getStepBySlug("perfil").path);

  // Con suscripciones activas: quien ya tiene acceso salta este paso.
  if (isSubscriptionsEnabled() && hasFullAccess(user)) {
    redirect(getStepBySlug(getResumeStep(assessment)).path);
  }

  return (
    <OnboardingShell currentSlug="pago">
      <CheckoutNotice state={checkoutState} />
      <PaymentStep subscriptionsEnabled={isSubscriptionsEnabled()} />
    </OnboardingShell>
  );
}
