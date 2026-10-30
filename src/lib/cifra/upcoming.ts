import {
  type CalendarDate,
  compareDates,
  nextOccurrence,
} from "./dates";

export type DueItem = {
  kind: "debt" | "fixed";
  id: string;
  name: string;
  /** Tipo de deuda o categoría del gasto fijo (código), para mostrarlo con su color. */
  subtype: string;
  /** Próxima fecha de pago; null si no tiene un pago pendiente. */
  nextDueOn: CalendarDate | null;
  /** Monto del próximo pago; null = por confirmar. */
  amountCents: number | null;
  /** Se repite cada mes. */
  recurring: boolean;
  /** El monto cambia cada mes (tarjeta, luz): los pagos futuros quedan por confirmar. */
  variable: boolean;
  dueDay: number;
  dueLastDay: boolean;
  /** Saldo de la deuda cuando es una tarjeta; null en lo demás. Sirve para repartir el pago. */
  cardBalanceCents?: number | null;
};

export type UpcomingPayment = {
  kind: "debt" | "fixed";
  id: string;
  name: string;
  subtype: string;
  dueOn: CalendarDate;
  amountCents: number | null;
  overdue: boolean;
  /** Es el pago que se puede marcar ahora; los siguientes son una proyección. */
  actionable: boolean;
  cardBalanceCents: number | null;
};

const MAX_OCCURRENCES = 60;

/**
 * Pagos entre `from` y `to`. Los vencidos (fecha anterior a hoy y sin pagar) se
 * incluyen siempre que el rango empiece hoy o antes. Los pagos recurrentes se
 * proyectan mes a mes; si el monto cambia cada mes, la proyección queda por confirmar.
 */
export function upcomingPayments(
  items: DueItem[],
  { today, from, to }: { today: CalendarDate; from: CalendarDate; to: CalendarDate },
): UpcomingPayment[] {
  const out: UpcomingPayment[] = [];
  const includeOverdue = compareDates(from, today) <= 0;

  for (const item of items) {
    if (!item.nextDueOn) continue;
    let due = item.nextDueOn;
    for (let i = 0; i < MAX_OCCURRENCES; i++) {
      if (compareDates(due, to) > 0) break;
      const first = i === 0;
      const overdue = compareDates(due, today) < 0;
      const inRange =
        compareDates(due, from) >= 0 || (first && overdue && includeOverdue);
      if (inRange) {
        out.push({
          kind: item.kind,
          id: item.id,
          name: item.name,
          subtype: item.subtype,
          dueOn: due,
          amountCents: first ? item.amountCents : item.variable ? null : item.amountCents,
          overdue,
          actionable: first,
          cardBalanceCents: item.cardBalanceCents ?? null,
        });
      }
      if (!item.recurring) break;
      due = nextOccurrence(due, item.dueDay, item.dueLastDay);
    }
  }

  return out.sort(
    (a, b) => compareDates(a.dueOn, b.dueOn) || a.name.localeCompare(b.name, "es"),
  );
}

export function totalsOf(payments: UpcomingPayment[], accountsCents: number) {
  let known = 0;
  let unknown = 0;
  for (const p of payments) {
    if (p.amountCents == null) unknown += 1;
    else known += p.amountCents;
  }
  return {
    knownCents: known,
    unknownCount: unknown,
    accountsCents,
    /** Positivo = sobra; negativo = falta (solo con lo que ya se conoce). */
    differenceCents: accountsCents - known,
  };
}
