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

/** Cuánto baja el saldo de una deuda con un pago: nunca más de lo que se debe. */
export function amountAppliedToDebt(
  balanceCents: number,
  paymentCents: number,
): number {
  return Math.max(0, Math.min(balanceCents, paymentCents));
}
