/** Una transferencia (pago de tarjeta) mueve dinero, no es ingreso ni gasto: no entra a los totales. */
type Countable = { isTransfer?: boolean };

export function summarizeTransactions(
  rows: ({ flow: "income" | "expense"; amountCents: number } & Countable)[],
) {
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.isTransfer) continue;
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

export type CategoryShare = { category: string; amountCents: number; pct: number };

/** Total por categoría de un tipo de movimiento, de mayor a menor, con su porcentaje del total. */
export function breakdownByCategory(
  rows: ({ flow: "income" | "expense"; category: string; amountCents: number } & Countable)[],
  flow: "income" | "expense",
): CategoryShare[] {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.flow !== flow || r.isTransfer) continue;
    totals.set(r.category, (totals.get(r.category) ?? 0) + r.amountCents);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([category, amountCents]) => ({
      category,
      amountCents,
      pct: sum > 0 ? Math.round((amountCents / sum) * 100) : 0,
    }))
    .sort((a, b) => b.amountCents - a.amountCents || a.category.localeCompare(b.category));
}

/**
 * Acomoda los movimientos para mostrarlos: las partes de gasto de un pago de tarjeta (intereses,
 * compras sin detalle) se anidan bajo su pago. Si el pago no está en la lista, la parte va suelta.
 */
export function groupPaymentParts<T extends { id: string; paymentId?: string | null }>(
  rows: T[],
): (T & { parts: T[] })[] {
  const ids = new Set(rows.map((r) => r.id));
  const partsOf = new Map<string, T[]>();
  for (const r of rows) {
    if (r.paymentId && ids.has(r.paymentId)) {
      partsOf.set(r.paymentId, [...(partsOf.get(r.paymentId) ?? []), r]);
    }
  }
  return rows
    .filter((r) => !(r.paymentId && ids.has(r.paymentId)))
    .map((r) => ({ ...r, parts: partsOf.get(r.id) ?? [] }));
}
