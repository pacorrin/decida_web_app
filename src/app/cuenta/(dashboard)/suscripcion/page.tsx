import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session-server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CancelSubscription } from "@/components/account/cancel-subscription";
import { PortalButton } from "@/components/account/portal-button";
import { SubscribeButton } from "@/components/account/subscribe-button";
import { CheckoutNotice } from "@/components/account/checkout-notice";
import { FreePlanCard } from "@/components/account/free-plan-card";
import { PlanCard } from "@/components/account/plan-card";
import { resolveCheckoutReturn } from "@/lib/subscription/checkout-return";
import { describeSubscription } from "@/lib/subscription/cancel";
import { PLANS, getPlan } from "@/lib/credits/plans";
import { formatCredits } from "@/lib/credits/costs";
import { CREDITS_PATH } from "@/lib/credits/paths";
import { PAYMENT_CANCEL_COPY } from "@/lib/onboarding/copy";

export const metadata = {
  title: "Plan | Decida",
  description: "Tu plan mensual y tus créditos en Decida.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ limite?: string; checkout?: string; session_id?: string }>;
}) {
  const initialUser = await getCurrentUser();
  if (!initialUser) redirect("/cuenta/iniciar-sesion");

  const { limite, checkout, session_id } = await searchParams;
  const resolvedCheckout = await resolveCheckoutReturn(
    initialUser.user_id,
    { checkout, session_id },
    "account",
  );
  // Si la activación acaba de ocurrir, relee la cuenta para mostrar el estado nuevo.
  const user =
    resolvedCheckout === "activated" ? ((await getCurrentUser()) ?? initialUser) : initialUser;
  const sub = describeSubscription(user);
  // El aviso verde solo tiene sentido mientras el plan sigue activo.
  const checkoutState =
    resolvedCheckout === "activated" && sub.kind !== "active" ? "none" : resolvedCheckout;
  const isActive = sub.kind === "active";
  const isCanceled = sub.kind === "canceled";
  const paymentIssue = user.user_subscription_status === "past_due";
  const canSubscribe = sub.kind === "none" || sub.kind === "expired";
  const currentPlan = getPlan(user.user_subscription_plan);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Plan</h1>
        <p className="text-sm text-muted-foreground">
          Cada plan te da créditos cada mes. Al renovar, tu saldo se restablece a los créditos de
          tu plan: los que no uses no se acumulan.
        </p>
      </div>

      <CheckoutNotice state={checkoutState} />

      {limite === "1" && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Tu cuenta gratuita incluye una evaluación y ya la usaste. Elige un plan para seguir
          evaluando ideas.
        </div>
      )}

      {paymentIssue && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          data-testid="payment-issue"
        >
          No pudimos cobrar tu último pago. Mientras no se regularice no podrás usar tus créditos.
          Actualiza tu método de pago desde «Administrar pagos».
        </div>
      )}

      {(isActive || isCanceled || paymentIssue) && (
        <Card data-testid="subscription-status">
          <CardHeader>
            <CardTitle className="text-lg">
              Tu plan{currentPlan ? `: ${currentPlan.name}` : ""}
            </CardTitle>
            <CardDescription>
              Saldo actual:{" "}
              <Link href={CREDITS_PATH} className="font-medium text-foreground underline-offset-4 hover:underline">
                {formatCredits(user.user_credits_balance)} créditos
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              {isActive
                ? sub.renewsAt
                  ? `Activo. Se renueva el ${formatDate(sub.renewsAt)} y tu saldo se restablece a ${
                      currentPlan ? formatCredits(currentPlan.credits) : "los créditos de tu plan"
                    }.`
                  : "Activo"
                : isCanceled
                  ? `Cancelado. Conservas tus créditos hasta el ${formatDate(sub.accessUntil)}; después vencen.`
                  : "Cobro pendiente."}
            </p>
            {user.user_subscription_provider === "stripe" && user.user_stripe_customer_id && (
              <div className="space-y-1">
                <PortalButton />
                {isActive && (
                  <p className="text-xs text-muted-foreground">
                    Para cambiar de plan usa «Administrar pagos». Una subida de plan te da los
                    créditos nuevos al instante; una bajada aplica en tu próxima renovación.
                  </p>
                )}
              </div>
            )}
            {isActive && (
              <CancelSubscription accessUntil={sub.renewsAt ? formatDate(sub.renewsAt) : null} />
            )}
            {isCanceled && (
              <p className="text-sm text-muted-foreground">
                No se te volverá a cobrar. Puedes reactivar tu plan antes de esa fecha.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = (isActive || isCanceled) && currentPlan?.id === plan.id;
          let footer: React.ReactNode;
          if (canSubscribe) {
            footer = (
              <SubscribeButton
                planId={plan.id}
                label={`Elegir ${plan.name} — $${plan.priceMxn}/mes`}
                highlighted={plan.highlighted}
              />
            );
          } else if (isCanceled && isCurrent) {
            footer = <SubscribeButton planId={plan.id} label="Reactivar mi plan" mode="reactivate" />;
          } else if (isCurrent) {
            footer = (
              <Link href="/cuenta" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Ver mis análisis
              </Link>
            );
          } else {
            footer = (
              <p className="text-center text-xs text-muted-foreground">
                Cambia de plan desde «Administrar pagos».
              </p>
            );
          }
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              badge={isCurrent ? (isCanceled ? "Cancelado" : "Tu plan") : undefined}
              footer={footer}
            />
          );
        })}
      </div>

      <FreePlanCard isCurrent={!isActive && !isCanceled} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#6baed6]" aria-hidden />
          {PAYMENT_CANCEL_COPY}
        </p>
        <p className="flex items-center gap-2">
          <CreditCard className="size-4 text-[#6baed6]" aria-hidden />
          Pago seguro con Stripe
        </p>
      </div>
    </div>
  );
}
