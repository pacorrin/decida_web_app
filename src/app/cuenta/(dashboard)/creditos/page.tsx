import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getCreditsBalance, listCreditLedger } from "@/lib/credits/ledger";
import { formatCredits } from "@/lib/credits/costs";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import { buttonVariants } from "@/components/ui/button";
import { CreditLedgerList } from "@/components/account/credit-ledger-list";

export const metadata = {
  title: "Créditos | Decida",
  description: "Saldo e historial de créditos de Decida.",
};

export default async function CreditosPage({
  searchParams,
}: {
  searchParams: Promise<{ compra?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const { compra } = await searchParams;
  const [balance, entries] = await Promise.all([
    getCreditsBalance(user.user_id),
    listCreditLedger(user.user_id, { take: 50 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Créditos
          </h1>
          <p className="text-sm text-muted-foreground">
            Los créditos no caducan. Se usan al desbloquear o generar un análisis.
          </p>
        </div>
        <Link
          href={CREDITS_PACKAGES_PATH}
          className={buttonVariants({
            className:
              "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          })}
          data-testid="credits-buy-cta"
        >
          Comprar créditos
        </Link>
      </div>

      {compra === "ok" && (
        <p
          role="status"
          className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-foreground"
          data-testid="credits-purchase-ok"
        >
          Compra acreditada. Tu nuevo saldo ya está disponible.
        </p>
      )}

      <div
        className="rounded-2xl border border-border/80 bg-accent/30 px-6 py-5"
        data-testid="credits-balance"
      >
        <p className="text-sm text-muted-foreground">Saldo disponible</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-primary">
          {formatCredits(balance)}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            créditos
          </span>
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Historial</h2>
        <CreditLedgerList entries={entries} />
      </section>
    </div>
  );
}
