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
import { SubscribeButton } from "@/components/account/subscribe-button";
import { describeSubscription } from "@/lib/subscription/cancel";
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
  searchParams: Promise<{ limite?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const { limite } = await searchParams;
  const sub = describeSubscription(user);
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

      <div className="rounded-xl border border-[#6baed6]/30 bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-primary">Modo beta</span> — pago
        simulado, no se hace ningún cargo.
      </div>

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
                <Badge variant="secondary">Tu plan</Badge>
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
              Mercado Pago y tarjeta (próximamente)
            </p>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            {canSubscribe && (
              <SubscribeButton label="Suscribirme — $99 MXN/mes" />
            )}
            {isCanceled && (
              <SubscribeButton label="Reactivar suscripción" />
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
