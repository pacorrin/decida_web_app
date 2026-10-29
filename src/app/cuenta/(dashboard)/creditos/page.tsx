import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getCreditsBalance, listCreditLedger } from "@/lib/credits/ledger";
import { expireIfSubscriptionEnded } from "@/lib/credits/subscription-credits";
import { formatCredits } from "@/lib/credits/costs";
import { getPlan } from "@/lib/credits/plans";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { describeSubscription } from "@/lib/subscription/cancel";
import { buttonVariants } from "@/components/ui/button";
import { CreditLedgerList } from "@/components/account/credit-ledger-list";

export const metadata = {
  title: "Créditos | Decida",
  description: "Saldo e historial de créditos de Decida.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long" }).format(date);
}

export default async function CreditosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  // Red de seguridad: si el plan ya terminó y el aviso de Stripe se retrasó, vence ahora.
  await expireIfSubscriptionEnded(user);

  const [balance, entries] = await Promise.all([
    getCreditsBalance(user.user_id),
    listCreditLedger(user.user_id, { take: 50 }),
  ]);
  const sub = describeSubscription(user);
  const plan = getPlan(user.user_subscription_plan);
  const paymentIssue = user.user_subscription_status === "past_due";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Créditos</h1>
          <p className="text-sm text-muted-foreground">
            Tu plan te da créditos cada mes. Se usan al desbloquear o generar un análisis.
          </p>
        </div>
        <Link
          href={CREDITS_PLANS_PATH}
          className={buttonVariants({
            className: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          })}
          data-testid="credits-plan-cta"
        >
          {sub.kind === "active" ? "Cambiar de plan" : "Ver planes"}
        </Link>
      </div>

      {paymentIssue && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          No pudimos cobrar tu último pago. No podrás usar tus créditos hasta regularizarlo.
        </p>
      )}

      <div
        className="rounded-2xl border border-border/80 bg-accent/30 px-6 py-5"
        data-testid="credits-balance"
      >
        <p className="text-sm text-muted-foreground">Saldo disponible</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-primary">
          {formatCredits(balance)}
          <span className="ml-2 text-base font-normal text-muted-foreground">créditos</span>
        </p>
        {sub.kind === "active" && sub.renewsAt && (
          <p className="mt-2 text-sm text-muted-foreground" data-testid="credits-renewal">
            Plan {plan ? plan.name : "activo"}: el {formatDate(sub.renewsAt)} tu saldo se
            restablece a {plan ? formatCredits(plan.credits) : "los créditos de tu plan"}.
          </p>
        )}
        {sub.kind === "canceled" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Plan cancelado: conservas tus créditos hasta el {formatDate(sub.accessUntil)}.
          </p>
        )}
        {(sub.kind === "none" || sub.kind === "expired") && (
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no tienes un plan mensual. Elige uno para recibir créditos cada mes.
          </p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Historial</h2>
        <CreditLedgerList entries={entries} />
      </section>
    </div>
  );
}
