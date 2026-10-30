import Link from "next/link";
import { ActionButton } from "@/components/cifra/form-kit";
import { getCifraAccess } from "@/lib/cifra/access";
import { formatDayMonth, todayInMexico } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { getOverview } from "@/lib/cifra/queries";
import { cn } from "@/lib/utils";
import { markPaid } from "./actions";

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

export default async function CifraResumenPage() {
  const access = await getCifraAccess();
  if (!access.ok) return null; // el layout ya muestra el aviso
  const today = todayInMexico();
  const o = await getOverview(access.userId, today);
  const monthLabel = monthName.format(new Date(Date.UTC(today.year, today.month - 1, 1)));
  const empty = o.pending.length === 0;

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

      <section aria-labelledby="proximos" className="space-y-3">
        <h2 id="proximos" className="text-lg font-semibold tracking-tight">
          Pagos de este mes
        </h2>
        {empty ? (
          <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-pending-empty">
            No tienes pagos pendientes este mes. Si aún no registras tus deudas y gastos fijos,{" "}
            <Link href="/cuenta/cifra/cuentas" className="font-medium text-primary underline-offset-4 hover:underline">
              agrégalos en Mis cuentas
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-border/80 rounded-2xl border border-border/80" data-testid="cifra-pending-list">
            {o.pending.map((p) => (
              <li key={`${p.kind}-${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className={cn("text-xs", p.overdue ? "text-destructive" : "text-muted-foreground")}>
                    {p.overdue ? "Venció el " : "Vence el "}
                    {formatDayMonth(p.dueOn)}
                    {p.kind === "debt" ? " · deuda" : " · gasto fijo"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">{formatMxn(p.amountCents)}</span>
                  <ActionButton
                    action={markPaid.bind(null, p.kind, p.id)}
                    label="Marcar como pagado"
                    successMessage="Pago registrado"
                    testId={`cifra-pay-${p.id}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
