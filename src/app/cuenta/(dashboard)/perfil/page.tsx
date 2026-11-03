import { redirect } from "next/navigation";
import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { getCurrentUser } from "@/lib/auth/session-server";
import { buttonVariants } from "@/components/ui/button";
import { CancelSubscription } from "@/components/account/cancel-subscription";
import { describeSubscription } from "@/lib/subscription/cancel";
import { CREDITS_PATH } from "@/lib/credits/paths";
import { formatCredits } from "@/lib/credits/costs";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { avatarSrc, initialsOf } from "@/lib/account/avatar";

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

  const memberSince = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(user.user_created_at);
  const fields = [
    { label: "Nombre", value: user.user_name ?? "—" },
    { label: "Correo electrónico", value: user.user_email },
    { label: "Teléfono", value: user.user_phone ?? "—" },
    { label: "En Decida desde", value: memberSince },
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
    <div className="space-y-4 sm:space-y-6">
      <section
        aria-labelledby="perfil-heading"
        className="grid gap-8 rounded-3xl bg-primary p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr_minmax(0,24rem)] lg:items-center lg:gap-12 lg:p-10"
      >
        <AvatarUploader
          src={avatarSrc(user.user_avatar_version)}
          initials={initialsOf(user.user_name, user.user_email)}
        />

        <div className="min-w-0 space-y-3 text-center sm:text-left">
          <h1
            id="perfil-heading"
            className="text-balance text-2xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-3xl xl:text-4xl"
          >
            {user.user_name ?? "Tu perfil"}
          </h1>
          <p className="truncate text-lg text-white/85">{user.user_email}</p>
          <p className="text-base text-white/70">Datos de tu cuenta de Decida.</p>
        </div>

        <div className="space-y-4 rounded-2xl bg-white/10 p-6 text-center sm:text-left">
          <p className="text-base text-white/80">Saldo de créditos</p>
          <p className="text-6xl font-semibold leading-none tracking-[-0.04em] tabular-nums xl:text-7xl">
            {formatCredits(user.user_credits_balance)}
          </p>
          <Link
            href={CREDITS_PATH}
            className={buttonVariants({
              className: "w-full bg-white text-primary! hover:bg-white/90 sm:w-auto",
            })}
          >
            Ver créditos e historial
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="info-heading" className="rounded-3xl bg-muted p-6 sm:p-8">
          <h2 id="info-heading" className="text-2xl font-semibold tracking-tight text-primary">
            Tu información
          </h2>
          <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="min-w-0 space-y-1">
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="truncate text-lg font-medium text-foreground">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="plan-heading" className="flex flex-col gap-5 rounded-3xl bg-accent p-6 sm:p-8">
          <h2 id="plan-heading" className="text-2xl font-semibold tracking-tight text-primary">
            Plan
          </h2>
          <p className="text-lg font-medium text-foreground">{subLabel}</p>
          {sub.kind === "canceled" && (
            <p className="text-base text-muted-foreground">
              No se te volverá a cobrar. Conservas tus créditos hasta esa fecha.
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3">
            {(sub.kind === "active" || sub.kind === "canceled") && (
              <Link
                href="/cuenta/suscripcion"
                className={buttonVariants()}
              >
                Ver planes y créditos
              </Link>
            )}
            {sub.kind === "active" && (
              <CancelSubscription accessUntil={sub.renewsAt ? formatDate(sub.renewsAt) : null} />
            )}
            {(sub.kind === "none" || sub.kind === "expired") && (
              <TrackedLink
                href="/cuenta/suscripcion"
                event={ANALYTICS_EVENTS.subscribeClicked}
                eventProps={{ location: "perfil" }}
                className={buttonVariants()}
              >
                Elegir un plan
              </TrackedLink>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
