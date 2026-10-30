import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionButton } from "@/components/cifra/form-kit";
import { TransactionForm } from "@/components/cifra/transaction-form";
import { getCifraAccess } from "@/lib/cifra/access";
import { categoryLabel } from "@/lib/cifra/constants";
import {
  formatDateInput,
  formatDayMonth,
  monthRange,
  periodOf,
  todayInMexico,
} from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { getMonthTransactions } from "@/lib/cifra/queries";
import { summarizeTransactions } from "@/lib/cifra/summary";
import { cn } from "@/lib/utils";
import { deleteTransaction } from "../actions";

const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });

function shiftPeriod(period: string, delta: number): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return periodOf({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
}

export default async function CifraMovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const access = await getCifraAccess();
  if (!access.ok) return null;

  const today = todayInMexico();
  const { mes } = await searchParams;
  const period = mes && monthRange(mes) ? mes : periodOf(today);
  const rows = await getMonthTransactions(access.userId, period);
  const summary = summarizeTransactions(rows.map((r) => ({ flow: r.flow, amountCents: r.amountCents })));
  const [y, m] = period.split("-").map(Number);
  const title = monthName.format(new Date(Date.UTC(y, m - 1, 1)));

  return (
    <div className="space-y-8">
      <TransactionForm today={formatDateInput(today)} />

      <section aria-labelledby="movs" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="movs" className="text-lg font-semibold tracking-tight first-letter:uppercase">
            {title}
          </h2>
          <div className="flex items-center gap-1">
            <Link href={`/cuenta/cifra/movimientos?mes=${shiftPeriod(period, -1)}`} aria-label="Mes anterior" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
              <ChevronLeft className="size-4" aria-hidden />
            </Link>
            <Link href={`/cuenta/cifra/movimientos?mes=${shiftPeriod(period, 1)}`} aria-label="Mes siguiente" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted-foreground" data-testid="cifra-month-summary">
          Ingresos {formatMxn(summary.incomeCents)} · Egresos {formatMxn(summary.expenseCents)} · Balance{" "}
          {formatMxn(summary.balanceCents)}
        </p>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-transactions-empty">
            No hay movimientos en este mes.
          </p>
        ) : (
          <ul className="divide-y divide-border/80 rounded-2xl border border-border/80" data-testid="cifra-transactions-list">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {categoryLabel(t.flow, t.category)}
                    {t.description ? ` · ${t.description}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDayMonth(t.date)}
                    {t.fromPayment ? " · pago marcado" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium tabular-nums", t.flow === "income" && "text-secondary")}>
                    {t.flow === "income" ? "+" : "−"}
                    {formatMxn(t.amountCents)}
                  </span>
                  <ActionButton
                    action={deleteTransaction.bind(null, t.id)}
                    label="Borrar"
                    variant="ghost"
                    confirmText={
                      t.fromPayment
                        ? "Este movimiento vino de un pago marcado. Si lo borras, el saldo de la deuda se restaura. ¿Continuar?"
                        : "¿Borrar este movimiento?"
                    }
                    successMessage="Movimiento borrado"
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
