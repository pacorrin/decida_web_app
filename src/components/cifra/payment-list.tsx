import { formatDateInput, formatDayMonth, type CalendarDate } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import type { UpcomingPayment } from "@/lib/cifra/upcoming";
import { cn } from "@/lib/utils";
import { AmountDialog, PayDialog } from "./dialogs";

/** Lista de pagos por fecha, con las acciones de capturar monto y marcar como pagado. */
export function PaymentList({
  payments,
  today,
}: {
  payments: UpcomingPayment[];
  today: CalendarDate;
}) {
  const todayValue = formatDateInput(today);
  return (
    <ul className="divide-y divide-border/80 rounded-2xl border border-border/80" data-testid="cifra-pending-list">
      {payments.map((p) => (
        <li
          key={`${p.kind}-${p.id}-${formatDateInput(p.dueOn)}`}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className={cn("text-xs", p.overdue ? "text-destructive" : "text-muted-foreground")}>
              {p.overdue ? "Venció el " : "Vence el "}
              {formatDayMonth(p.dueOn)}
              {p.kind === "debt" ? " · deuda" : " · gasto fijo"}
              {p.actionable ? "" : " · proyectado"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {p.amountCents == null ? (
              <span className="text-xs font-medium text-muted-foreground">Por confirmar</span>
            ) : (
              <span className="font-medium tabular-nums">{formatMxn(p.amountCents)}</span>
            )}
            {p.actionable && (
              <>
                {p.amountCents == null && <AmountDialog kind={p.kind} id={p.id} name={p.name} />}
                <PayDialog
                  kind={p.kind}
                  id={p.id}
                  name={p.name}
                  suggestedCents={p.amountCents}
                  editable={p.variable}
                  today={todayValue}
                />
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
