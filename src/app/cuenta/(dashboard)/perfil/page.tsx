import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { getCurrentUser } from "@/lib/auth/session-server";
import { buttonVariants } from "@/components/ui/button";
import { CancelSubscription } from "@/components/account/cancel-subscription";
import { describeSubscription } from "@/lib/subscription/cancel";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const metadata = {
  title: "Perfil | Decida",
  description: "Datos de tu cuenta de Decida.",
};

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const fields = [
    { label: "Nombre", value: user.user_name ?? "—" },
    { label: "Correo electrónico", value: user.user_email },
    { label: "Teléfono", value: user.user_phone ?? "—" },
  ];

  const sub = describeSubscription(user);
  const subLabel =
    sub.kind === "active"
      ? sub.renewsAt
        ? `Activa, se renueva el ${formatDate(sub.renewsAt)}`
        : "Activa"
      : sub.kind === "canceled"
        ? `Cancelada, acceso hasta el ${formatDate(sub.accessUntil)}`
        : sub.kind === "expired"
          ? "Vencida"
          : "Sin suscripción";

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Perfil
        </h1>
        <p className="text-sm text-muted-foreground">Datos de tu cuenta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {field.label}
              </p>
              <p className="text-sm text-foreground">{field.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suscripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Estado</p>
            <p className="text-sm text-foreground">{subLabel}</p>
          </div>
          {sub.kind === "active" && (
            <CancelSubscription
              accessUntil={sub.renewsAt ? formatDate(sub.renewsAt) : null}
            />
          )}
          {sub.kind === "canceled" && (
            <p className="text-sm text-muted-foreground">
              No se te volverá a cobrar. Mantienes el reporte completo hasta
              esa fecha.
            </p>
          )}
          {(sub.kind === "active" || sub.kind === "canceled") && (
            <Link
              href="/cuenta/suscripcion"
              className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Ver planes y detalles
            </Link>
          )}
          {(sub.kind === "none" || sub.kind === "expired") && (
            <TrackedLink
              href="/cuenta/suscripcion"
              event={ANALYTICS_EVENTS.subscribeClicked}
              eventProps={{ location: "perfil" }}
              className={buttonVariants()}
            >
              Suscribirme
            </TrackedLink>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
