import Link from "next/link";
import { PaymentList } from "@/components/cifra/payment-list";
import { TransactionList } from "@/components/cifra/transaction-list";
import { getCifraAccess } from "@/lib/cifra/access";
import { categoryColor } from "@/lib/cifra/colors";
import { categoryLabel } from "@/lib/cifra/constants";
import { todayInMexico } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { getOverview } from "@/lib/cifra/queries";
import type { CategoryShare } from "@/lib/cifra/summary";
import { cn } from "@/lib/utils";

const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });

function Stat({ label, value, tone, testId }: { label: string; value: string; tone?: "positive" | "negative"; testId: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-4" data-testid={testId}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "positive" && "text-secondary",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Breakdown({
  title,
  flow,
  items,
  emptyText,
  testId,
}: {
  title: string;
  flow: "income" | "expense";
  items: CategoryShare[];
  emptyText: string;
  testId: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 p-5" data-testid={testId}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((i) => (
            <li key={i.category} className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", categoryColor(flow, i.category))}>
                  {categoryLabel(flow, i.category)}
                </span>
                <span className="tabular-nums">
                  <span className="font-medium">{formatMxn(i.amountCents)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{i.pct}%</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div
                  className={cn("h-full rounded-full", flow === "income" ? "bg-primary" : "bg-secondary")}
                  style={{ width: `${i.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function CifraResumenPage() {
  const access = await getCifraAccess();
  if (!access.ok) return null; // el layout ya muestra el aviso
  const today = todayInMexico();
  const o = await getOverview(access.userId, today);
  const monthLabel = monthName.format(new Date(Date.UTC(today.year, today.month - 1, 1)));
  const empty = o.upcoming.length === 0;

  return (
    <div className="space-y-8">
      <section aria-labelledby="mes" className="space-y-3">
        <h2 id="mes" className="text-sm font-medium text-muted-foreground first-letter:uppercase">
          {monthLabel}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Ingresos" value={formatMxn(o.incomeCents)} tone={o.incomeCents > 0 ? "positive" : undefined} testId="cifra-income" />
          <Stat label="Egresos" value={formatMxn(o.expenseCents)} testId="cifra-expense" />
          <Stat
            label="Balance del mes"
            value={formatMxn(o.balanceCents)}
            tone={o.balanceCents < 0 ? "negative" : o.balanceCents > 0 ? "positive" : undefined}
            testId="cifra-balance"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Lo que debes" value={formatMxn(o.debtTotalCents)} testId="cifra-debt-total" />
          <Stat label="Saldo en tus cuentas" value={formatMxn(o.accountsTotalCents)} testId="cifra-accounts-total" />
        </div>
      </section>

      <section aria-labelledby="origen" className="space-y-3">
        <h2 id="origen" className="text-lg font-semibold tracking-tight">
          De dónde viene
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Breakdown
            title="Ingresos por categoría"
            flow="income"
            items={o.incomeByCategory}
            emptyText="Aún no registras ingresos este mes."
            testId="cifra-income-breakdown"
          />
          <Breakdown
            title="Egresos por categoría"
            flow="expense"
            items={o.expenseByCategory}
            emptyText="Aún no registras egresos este mes."
            testId="cifra-expense-breakdown"
          />
        </div>
      </section>

      <section aria-labelledby="proximos" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="proximos" className="text-lg font-semibold tracking-tight">
            Próximos pagos (30 días)
          </h2>
          <Link href="/cuenta/cifra/pagos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Ver reporte de pagos
          </Link>
        </div>
        {empty ? (
          <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-pending-empty">
            No tienes pagos en los próximos 30 días. Si aún no registras tus deudas y gastos fijos,{" "}
            <Link href="/cuenta/cifra/cuentas" className="font-medium text-primary underline-offset-4 hover:underline">
              agrégalos en Mis cuentas
            </Link>
            .
          </p>
        ) : (
          <PaymentList payments={o.upcoming} today={today} />
        )}
      </section>

      <section aria-labelledby="recientes" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="recientes" className="text-lg font-semibold tracking-tight">
            Últimos movimientos
          </h2>
          <Link href="/cuenta/cifra/movimientos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {o.transactionCount > o.recentTransactions.length
              ? `Ver los ${o.transactionCount} del mes`
              : "Ver movimientos"}
          </Link>
        </div>
        {o.recentTransactions.length === 0 ? (
          <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-recent-empty">
            Aún no hay movimientos este mes.{" "}
            <Link href="/cuenta/cifra/movimientos" className="font-medium text-primary underline-offset-4 hover:underline">
              Registra tu primer ingreso o egreso
            </Link>
            .
          </p>
        ) : (
          <TransactionList rows={o.recentTransactions} testId="cifra-recent-list" />
        )}
      </section>
    </div>
  );
}
