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

/** Día de pago o corte dentro de un mes; si el mes es más corto, cae el último día. */
export function dueDateInMonth(
  year: number,
  month: number,
  dueDay: number,
): CalendarDate {
  return { year, month, day: Math.min(dueDay, daysInMonth(year, month)) };
}

/** Próxima fecha con ese día del mes, contando hoy. */
export function nextDueDate(dueDay: number, today: CalendarDate): CalendarDate {
  const thisMonth = dueDateInMonth(today.year, today.month, dueDay);
  if (thisMonth.day >= today.day) return thisMonth;
  const nextMonth = today.month === 12 ? 1 : today.month + 1;
  const nextYear = today.month === 12 ? today.year + 1 : today.year;
  return dueDateInMonth(nextYear, nextMonth, dueDay);
}

export function periodOf(date: Pick<CalendarDate, "year" | "month">): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}`;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
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

/** «2026-10-30» → fecha, o null si no existe en el calendario. */
export function parseDateInput(value: string): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

export function formatDateInput(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

const display = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatDayMonth(date: CalendarDate): string {
  return display.format(toDateOnly(date));
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
