import {
  type CalendarDate,
  compareDates,
  dueDateInMonth,
} from "./dates";

export function summarizeTransactions(
  rows: { flow: "income" | "expense"; amountCents: number }[],
) {
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.flow === "income") income += r.amountCents;
    else expense += r.amountCents;
  }
  return { incomeCents: income, expenseCents: expense, balanceCents: income - expense };
}

export type PendingPayment = {
  kind: "debt" | "fixed";
  id: string;
  name: string;
  amountCents: number;
  dueOn: CalendarDate;
  overdue: boolean;
};

/**
 * Pagos de este mes que todavía no se marcan como pagados, del más próximo al más
 * lejano. Los vencidos (día ya pasado) se marcan y van primero.
 */
export function pendingPayments({
  debts,
  fixedExpenses,
  paidDebtIds,
  paidFixedIds,
  today,
}: {
  debts: { id: string; name: string; monthlyPaymentCents: number; dueDay: number }[];
  fixedExpenses: { id: string; name: string; amountCents: number; dueDay: number }[];
  paidDebtIds: ReadonlySet<string>;
  paidFixedIds: ReadonlySet<string>;
  today: CalendarDate;
}): PendingPayment[] {
  const items: PendingPayment[] = [];
  for (const d of debts) {
    if (paidDebtIds.has(d.id)) continue;
    const dueOn = dueDateInMonth(today.year, today.month, d.dueDay);
    items.push({
      kind: "debt",
      id: d.id,
      name: d.name,
      amountCents: d.monthlyPaymentCents,
      dueOn,
      overdue: compareDates(dueOn, today) < 0,
    });
  }
  for (const f of fixedExpenses) {
    if (paidFixedIds.has(f.id)) continue;
    const dueOn = dueDateInMonth(today.year, today.month, f.dueDay);
    items.push({
      kind: "fixed",
      id: f.id,
      name: f.name,
      amountCents: f.amountCents,
      dueOn,
      overdue: compareDates(dueOn, today) < 0,
    });
  }
  return items.sort((a, b) => compareDates(a.dueOn, b.dueOn));
}

/** Cuánto baja el saldo de una deuda con un pago: nunca más de lo que se debe. */
export function amountAppliedToDebt(
  balanceCents: number,
  paymentCents: number,
): number {
  return Math.max(0, Math.min(balanceCents, paymentCents));
}

