import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/cuenta/(dashboard)/cifra/actions";
import { categoryColor } from "@/lib/cifra/colors";
import { categoryLabel } from "@/lib/cifra/constants";
import { type CalendarDate, formatDayMonth } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { cn } from "@/lib/utils";
import { ActionButton } from "./form-kit";

export type TransactionRow = {
  id: string;
  flow: "income" | "expense";
  category: string;
  amountCents: number;
  date: CalendarDate;
  description: string | null;
  fromPayment: boolean;
  isTransfer?: boolean;
  cardName?: string | null;
  parts?: TransactionRow[];
};

/** Lista de movimientos con categoría en su color; con `deletable` suma el botón de borrar. */
export function TransactionList({
  rows,
  deletable = false,
  testId,
}: {
  rows: TransactionRow[];
  deletable?: boolean;
  testId?: string;
}) {
  return (
    <ul className="divide-y divide-border/80 rounded-2xl border border-border/80" data-testid={testId}>
      {rows.map((t) => (
        <li key={t.id} className="text-sm">
          <Row t={t} deletable={deletable} />
          {t.parts && t.parts.length > 0 && (
            <ul className="mx-4 mb-3 space-y-1 border-l-2 border-border pl-3" aria-label="Se registró como gasto">
              {t.parts.map((p) => (
                <li key={p.id}>
                  <Row t={p} nested />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function Row({ t, deletable = false, nested = false }: { t: TransactionRow; deletable?: boolean; nested?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", nested ? "py-1" : "px-4 py-3")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", categoryColor(t.flow, t.category))}>
            {categoryLabel(t.flow, t.category)}
          </span>
          {t.isTransfer && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Transferencia</span>
          )}
          {t.fromPayment && !t.isTransfer && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Pago</span>
          )}
          {t.cardName && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{t.cardName}</span>
          )}
        </div>
        {t.description && <p className="mt-1 truncate">{t.description}</p>}
        {!nested && <p className="mt-1 text-xs text-muted-foreground">{formatDayMonth(t.date)}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("font-medium tabular-nums", t.flow === "income" && "text-secondary", t.isTransfer && "text-muted-foreground")}>
          {t.flow === "income" ? "+" : "−"}
          {formatMxn(t.amountCents)}
        </span>
        {deletable && (
          <ActionButton
            action={deleteTransaction.bind(null, t.id)}
            label="Borrar"
            variant="outline"
            icon={<Trash2 aria-hidden />}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            confirmText={
              t.fromPayment
                ? "Este movimiento vino de un pago marcado. Si lo borras, el saldo de la deuda se restaura. ¿Continuar?"
                : "¿Borrar este movimiento?"
            }
            successMessage="Movimiento borrado"
          />
        )}
      </div>
    </div>
  );
}
