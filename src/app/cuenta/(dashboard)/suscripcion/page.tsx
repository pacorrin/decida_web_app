import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session-server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CancelSubscription } from "@/components/account/cancel-subscription";
import { PortalButton } from "@/components/account/portal-button";
import { SubscribeButton } from "@/components/account/subscribe-button";
import { CheckoutNotice } from "@/components/account/checkout-notice";
import { resolveCheckoutReturn } from "@/lib/subscription/checkout-return";
import { describeSubscription } from "@/lib/subscription/cancel";
import { isSubscriptionsEnabled } from "@/lib/subscription/flag";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import {
  PAYMENT_CANCEL_COPY,
  PAYMENT_FREE_FEATURES,
  PAYMENT_PAID_FEATURES,
} from "@/lib/onboarding/copy";

export const metadata = {
  title: "Suscripción | Decida",
  description: "Tu plan y suscripción de Decida.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-secondary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ limite?: string; checkout?: string; session_id?: string }>;
}) {
  const initialUser = await getCurrentUser();
  if (!initialUser) redirect("/cuenta/iniciar-sesion");

  if (!isSubscriptionsEnabled()) {
    redirect(CREDITS_PACKAGES_PATH);
  }

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
  // El aviso verde solo tiene sentido mientras la suscripción sigue activa: si
  // la persona cancela con `?checkout=success` todavía en la URL, no se muestra.
  const checkoutState =
    resolvedCheckout === "activated" && sub.kind !== "active"
      ? "none"
      : resolvedCheckout;
  const isActive = sub.kind === "active";
  const isCanceled = sub.kind === "canceled";
  const canSubscribe = sub.kind === "none" || sub.kind === "expired";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Suscripción
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu plan actual y lo que desbloquea la suscripción.
        </p>
      </div>

      <CheckoutNotice state={checkoutState} />

      {limite === "1" && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          La cuenta gratuita incluye una evaluación y ya la usaste. Suscríbete
          para evaluar más ideas.
        </div>
      )}

      {(isActive || isCanceled) && (
        <Card data-testid="subscription-status">
          <CardHeader>
            <CardTitle className="text-lg">Tu suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              {isActive
                ? sub.renewsAt
                  ? `Activa, se renueva el ${formatDate(sub.renewsAt)}`
                  : "Activa"
                : `Cancelada, acceso hasta el ${formatDate(sub.accessUntil)}`}
            </p>
            {user.user_subscription_provider === "stripe" &&
              user.user_stripe_customer_id && <PortalButton />}
            {isActive && (
              <CancelSubscription
                accessUntil={sub.renewsAt ? formatDate(sub.renewsAt) : null}
              />
            )}
            {isCanceled && (
              <p className="text-sm text-muted-foreground">
                No se te volverá a cobrar. Mantienes el reporte completo hasta
                esa fecha.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Gratis</CardTitle>
              {!isActive && !isCanceled && <Badge variant="outline">Tu plan</Badge>}
            </div>
            <CardDescription>Para probar con tu primera idea</CardDescription>
            <p className="pt-2 text-4xl font-semibold text-primary">$0</p>
          </CardHeader>
          <CardContent>
            <FeatureList items={PAYMENT_FREE_FEATURES} />
          </CardContent>
        </Card>

        <Card className="border-primary/30 shadow-lg shadow-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Suscripción</CardTitle>
              {isActive || isCanceled ? (
                <Badge variant="secondary">
                  {isCanceled ? "Cancelada" : "Tu plan"}
                </Badge>
              ) : (
                <Badge variant="secondary">Recomendado</Badge>
              )}
            </div>
            <CardDescription>Reporte completo, sin límite de ideas</CardDescription>
            <p className="pt-2 text-4xl font-semibold text-primary">
              $99{" "}
              <span className="text-lg font-medium text-muted-foreground">
                MXN / mes
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <FeatureList items={PAYMENT_PAID_FEATURES} />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-[#6baed6]" aria-hidden />
              {PAYMENT_CANCEL_COPY}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-4 text-[#6baed6]" aria-hidden />
              Pago seguro con Stripe
            </p>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            {canSubscribe && (
              <SubscribeButton label="Suscribirme — $99 MXN/mes" />
            )}
            {isCanceled && (
              <SubscribeButton label="Reactivar suscripción" mode="reactivate" />
            )}
            {isActive && (
              <Link href="/cuenta" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Ver mis análisis
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
