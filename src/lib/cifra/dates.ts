export type CalendarDate = { year: number; month: number; day: number };

const TIME_ZONE = "America/Mexico_City";

/** Fecha de hoy en la Ciudad de México (no la del servidor, que puede estar en UTC). */
export function todayInMexico(now: Date = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function periodOf(date: Pick<CalendarDate, "year" | "month">): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}`;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function sameDate(a: CalendarDate, b: CalendarDate): boolean {
  return compareDates(a, b) === 0;
}

/** Fecha para columnas `@db.Date`: medianoche UTC del día. */
export function toDateOnly(date: CalendarDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

export function fromDateOnly(date: Date): CalendarDate {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromDateOnly(new Date(toDateOnly(date).getTime() + days * 86_400_000));
}

/** Último día del mes de una fecha. */
export function lastDayOf(date: Pick<CalendarDate, "year" | "month">): CalendarDate {
  return { ...date, day: daysInMonth(date.year, date.month) };
}

/**
 * Cuándo cae una fecha recurrente en un mes. `anchor` es el día que la persona
 * eligió (1–31); en un mes más corto cae el último día, y al mes siguiente
 * vuelve al ancla (31 → 30 nov → 31 dic → 28 o 29 feb). Con `lastDay` cae
 * siempre el último día, sea cual sea el mes.
 */
export function occurrenceInMonth(
  year: number,
  month: number,
  anchor: number,
  lastDay = false,
): CalendarDate {
  const dim = daysInMonth(year, month);
  return { year, month, day: lastDay ? dim : Math.min(anchor, dim) };
}

function shiftMonth(date: Pick<CalendarDate, "year" | "month">, delta: number) {
  const index = date.year * 12 + (date.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** La repetición del mes siguiente al de `from`. */
export function nextOccurrence(
  from: CalendarDate,
  anchor: number,
  lastDay = false,
): CalendarDate {
  const next = shiftMonth(from, 1);
  return occurrenceInMonth(next.year, next.month, anchor, lastDay);
}

/** Primera repetición estrictamente posterior a `after`. */
export function firstOccurrenceAfter(
  after: CalendarDate,
  anchor: number,
  lastDay = false,
): CalendarDate {
  const sameMonth = occurrenceInMonth(after.year, after.month, anchor, lastDay);
  return compareDates(sameMonth, after) > 0
    ? sameMonth
    : nextOccurrence(after, anchor, lastDay);
}

/** Cuántos meses completos hay de `from` a `to` (por meses calendario). */
export function monthsBetween(from: CalendarDate, to: CalendarDate): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

/** «2026-10-30» → fecha, o null si no existe en el calendario. */
export function parseDateInput(value: string): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

export function formatDateInput(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

const dayMonth = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dayMonthYear = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const monthYear = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDayMonth(date: CalendarDate): string {
  return dayMonth.format(toDateOnly(date));
}

export function formatFullDate(date: CalendarDate): string {
  return dayMonthYear.format(toDateOnly(date));
}

export function formatMonthYear(date: Pick<CalendarDate, "year" | "month">): string {
  return monthYear.format(toDateOnly({ ...date, day: 1 }));
}

/** Primer y último día de un periodo «AAAA-MM» como fechas de calendario. */
export function monthRange(period: string): { from: Date; to: Date } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return {
    from: toDateOnly({ year, month, day: 1 }),
    to: toDateOnly({ year, month, day: daysInMonth(year, month) }),
  };
}

/**
 * De lo que captura la persona (una fecha y si «siempre es el último día del mes»)
 * saca la próxima fecha real y el ancla con la que se repetirá.
 */
export function resolveRecurrence(date: CalendarDate, lastDay: boolean) {
  return {
    nextOn: lastDay ? lastDayOf(date) : date,
    anchor: lastDay ? 31 : date.day,
    lastDay,
  };
}
