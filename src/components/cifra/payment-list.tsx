import { formatDateInput, formatDayMonth, type CalendarDate } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import type { UpcomingPayment } from "@/lib/cifra/upcoming";
import { categoryLabel, DEBT_KINDS } from "@/lib/cifra/constants";
import { debtKindColor, expenseCategoryColor } from "@/lib/cifra/colors";
import { cn } from "@/lib/utils";
import { AmountDialog, PayDialog } from "./dialogs";

const badge = "rounded-full px-2.5 py-0.5 text-xs font-medium";

/** El tipo de pago (deuda o gasto fijo) resaltado, y el tipo de deuda o la categoría con su color. */
function PaymentBadges({ payment }: { payment: UpcomingPayment }) {
  const isDebt = payment.kind === "debt";
  return (
    <>
      <span
        className={cn(
          badge,
          isDebt ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        {isDebt ? "Deuda" : "Gasto fijo"}
      </span>
      <span className={cn(badge, isDebt ? debtKindColor(payment.subtype) : expenseCategoryColor(payment.subtype))}>
        {isDebt
          ? (DEBT_KINDS.find((k) => k.code === payment.subtype)?.label ?? payment.subtype)
          : categoryLabel("expense", payment.subtype)}
      </span>
    </>
  );
}

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
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <PaymentBadges payment={p} />
            </div>
            <p className={cn("mt-1.5 text-xs", p.overdue ? "text-destructive" : "text-muted-foreground")}>
              {p.overdue ? "Venció el " : "Vence el "}
              {formatDayMonth(p.dueOn)}
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
