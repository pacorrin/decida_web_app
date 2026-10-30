import {
  type CalendarDate,
  compareDates,
  nextOccurrence,
} from "./dates";

export type PayoffEstimate =
  | {
      kind: "estimate";
      payments: number;
      /** Fecha aproximada del último pago; null si no hay próxima fecha. */
      endsOn: CalendarDate | null;
      basis: "vigencia" | "promedio" | "pago";
    }
  | { kind: "never" }
  | null;

const MAX_PAYMENTS = 1200;

/** Pagos que faltan con intereses: cuántas mensualidades de `payment` liquidan `balance`. */
export function paymentsToPayOff(
  balanceCents: number,
  paymentCents: number,
  annualRatePct: number | null,
): number | null {
  if (balanceCents <= 0) return 0;
  if (paymentCents <= 0) return null;
  const r = (annualRatePct ?? 0) / 100 / 12;
  if (r <= 0) return Math.min(MAX_PAYMENTS, Math.ceil(balanceCents / paymentCents));
  if (paymentCents <= balanceCents * r) return null; // no alcanza ni para los intereses
  const n = Math.ceil(-Math.log(1 - (r * balanceCents) / paymentCents) / Math.log(1 + r));
  return Number.isFinite(n) ? Math.min(MAX_PAYMENTS, Math.max(1, n)) : null;
}

/** Fecha del pago número `n` (1 = el próximo). */
export function nthPaymentDate(
  nextDueOn: CalendarDate,
  n: number,
  anchor: number,
  lastDay: boolean,
): CalendarDate {
  let date = nextDueOn;
  for (let i = 1; i < n; i++) date = nextOccurrence(date, anchor, lastDay);
  return date;
}

/** Pagos entre el próximo y la fecha de vigencia, contando ambos. */
export function paymentsUntil(
  nextDueOn: CalendarDate,
  endsOn: CalendarDate,
  anchor: number,
  lastDay: boolean,
): number {
  let date = nextDueOn;
  let count = 0;
  while (compareDates(date, endsOn) <= 0 && count < MAX_PAYMENTS) {
    count += 1;
    date = nextOccurrence(date, anchor, lastDay);
  }
  return count;
}

/**
 * Estimación de cuántos pagos faltan, sin pedirle cuentas a la persona:
 * con vigencia se cuentan las fechas que quedan; sin ella se usa el promedio
 * de sus pagos recientes (o el pago capturado) y la tasa si la dio.
 */
export function estimatePayoff({
  balanceCents,
  nextDueOn,
  dueDay,
  dueLastDay,
  endsOn,
  nextPaymentCents,
  minPaymentCents,
  recentPaymentsCents,
  annualRatePct,
}: {
  balanceCents: number;
  nextDueOn: CalendarDate | null;
  dueDay: number;
  dueLastDay: boolean;
  endsOn: CalendarDate | null;
  nextPaymentCents: number | null;
  minPaymentCents: number | null;
  recentPaymentsCents: number[];
  annualRatePct: number | null;
}): PayoffEstimate {
  if (balanceCents <= 0) return null;

  if (endsOn && nextDueOn) {
    const payments = paymentsUntil(nextDueOn, endsOn, dueDay, dueLastDay);
    if (payments > 0) {
      return {
        kind: "estimate",
        payments,
        endsOn: nthPaymentDate(nextDueOn, payments, dueDay, dueLastDay),
        basis: "vigencia",
      };
    }
  }

  const recent = recentPaymentsCents.slice(0, 6);
  const average = recent.length
    ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
    : null;
  const payment = average ?? nextPaymentCents ?? minPaymentCents;
  if (payment == null) return null;

  const payments = paymentsToPayOff(balanceCents, payment, annualRatePct);
  if (payments == null) return { kind: "never" };
  return {
    kind: "estimate",
    payments,
    endsOn: nextDueOn ? nthPaymentDate(nextDueOn, payments, dueDay, dueLastDay) : null,
    basis: average != null ? "promedio" : "pago",
  };
}

/** Qué parte del límite de crédito se está usando (0–100+), o null sin límite. */
export function creditUtilizationPct(
  balanceCents: number,
  limitCents: number | null,
): number | null {
  if (!limitCents || limitCents <= 0) return null;
  return Math.round((balanceCents / limitCents) * 100);
}
