import { describe, expect, it } from "vitest";
import {
  addDays,
  firstOccurrenceAfter,
  formatDateInput,
  monthRange,
  nextOccurrence,
  occurrenceInMonth,
  parseDateInput,
  periodOf,
  resolveRecurrence,
  todayInMexico,
} from "../dates";
import {
  centsToInputValue,
  formatMoneyInput,
  formatMxn,
  formatPercentInput,
  parseMoneyToCents,
} from "../money";
import {
  creditUtilizationPct,
  estimatePayoff,
  nthPaymentDate,
  paymentsToPayOff,
  paymentsUntil,
} from "../payoff";
import { accountSchema, debtSchema, fixedExpenseSchema, transactionSchema } from "../schemas";
import { amountAppliedToDebt, summarizeTransactions } from "../summary";
import { type DueItem, totalsOf, upcomingPayments } from "../upcoming";

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe("importes", () => {
  it("convierte texto a centavos", () => {
    expect(parseMoneyToCents("1500")).toBe(150000);
    expect(parseMoneyToCents("$1,234.50")).toBe(123450);
    expect(parseMoneyToCents("0.5")).toBe(50);
    expect(parseMoneyToCents(" 99.99 ")).toBe(9999);
  });

  it("rechaza lo que no es un importe válido", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1e3", "12,5,5x", "2000000000"]) {
      expect(parseMoneyToCents(bad), bad).toBeNull();
    }
  });

  it("da formato de pesos mexicanos", () => {
    expect(formatMxn(123450)).toMatch(/1,234\.50/);
    expect(centsToInputValue(123450)).toBe("1234.50");
  });

  it("el campo de importe solo deja números, con comas y hasta 2 decimales", () => {
    expect(formatMoneyInput("1234567")).toBe("1,234,567");
    expect(formatMoneyInput("1234.5")).toBe("1,234.5");
    expect(formatMoneyInput("abc12x3")).toBe("123");
    expect(formatMoneyInput("1.239")).toBe("1.23");
    expect(formatMoneyInput("00012")).toBe("12");
    expect(formatMoneyInput(".5")).toBe("0.5");
    expect(formatMoneyInput("1.2.3")).toBe("1.23");
    expect(formatMoneyInput("-5")).toBe("5");
    expect(formatMoneyInput("")).toBe("");
    expect(parseMoneyToCents(formatMoneyInput("1234567.8"))).toBe(123456780);
  });

  it("el campo de porcentaje solo deja números", () => {
    expect(formatPercentInput("45.5%")).toBe("45.5");
    expect(formatPercentInput("1234")).toBe("123");
    expect(formatPercentInput("a")).toBe("");
  });
});

describe("fechas recurrentes", () => {
  it("el ancla 31 cae al último día del mes corto y vuelve a 31 después", () => {
    let date = d(2026, 1, 31);
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      date = nextOccurrence(date, 31);
      seen.push(date.day);
    }
    expect(seen).toEqual([28, 31, 30, 31]); // feb, mar, abr, may
  });

  it("febrero de año bisiesto tiene 29 días", () => {
    expect(occurrenceInMonth(2028, 2, 30)).toEqual(d(2028, 2, 29));
    expect(occurrenceInMonth(2026, 2, 30)).toEqual(d(2026, 2, 28));
  });

  it("«último día del mes» cae siempre en el último día", () => {
    expect(occurrenceInMonth(2026, 4, 15, true)).toEqual(d(2026, 4, 30));
    expect(nextOccurrence(d(2026, 2, 28), 28, true)).toEqual(d(2026, 3, 31));
    expect(resolveRecurrence(d(2026, 2, 10), true)).toEqual({ nextOn: d(2026, 2, 28), anchor: 31, lastDay: true });
    expect(resolveRecurrence(d(2026, 11, 9), false)).toEqual({ nextOn: d(2026, 11, 9), anchor: 9, lastDay: false });
  });

  it("cruza el cambio de año", () => {
    expect(nextOccurrence(d(2026, 12, 15), 15)).toEqual(d(2027, 1, 15));
  });

  it("la primera repetición posterior no repite la misma fecha", () => {
    expect(firstOccurrenceAfter(d(2026, 10, 20), 20)).toEqual(d(2026, 11, 20));
    expect(firstOccurrenceAfter(d(2026, 10, 19), 20)).toEqual(d(2026, 10, 20));
    expect(firstOccurrenceAfter(d(2026, 11, 9), 20)).toEqual(d(2026, 11, 20));
  });

  it("suma días y valida fechas del calendario", () => {
    expect(addDays(d(2026, 10, 30), 30)).toEqual(d(2026, 11, 29));
    expect(addDays(d(2026, 12, 30), 3)).toEqual(d(2027, 1, 2));
    expect(parseDateInput("2026-10-30")).toEqual(d(2026, 10, 30));
    expect(parseDateInput("2026-02-30")).toBeNull();
    expect(parseDateInput("30/10/2026")).toBeNull();
    expect(formatDateInput(d(2026, 3, 4))).toBe("2026-03-04");
  });

  it("hoy en la Ciudad de México no es el día UTC cuando ya pasó la medianoche allá", () => {
    expect(todayInMexico(new Date("2026-10-30T03:30:00Z"))).toEqual(d(2026, 10, 29));
  });

  it("rango y periodo del mes", () => {
    expect(periodOf({ year: 2026, month: 3 })).toBe("2026-03");
    const r = monthRange("2026-02")!;
    expect(r.from.toISOString().slice(0, 10)).toBe("2026-02-01");
    expect(r.to.toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(monthRange("2026-13")).toBeNull();
  });
});

const item = (over: Partial<DueItem>): DueItem => ({
  kind: "debt",
  id: "x",
  name: "x",
  subtype: "credit_card",
  nextDueOn: d(2026, 11, 9),
  amountCents: 1000,
  recurring: true,
  variable: false,
  dueDay: 9,
  dueLastDay: false,
  ...over,
});

describe("pagos próximos", () => {
  const today = d(2026, 10, 30);

  it("un pago del 9 de noviembre, capturado el 30 de octubre, no está vencido", () => {
    const r = upcomingPayments([item({ id: "tarjeta" })], { today, from: today, to: addDays(today, 30) });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: "tarjeta", dueOn: d(2026, 11, 9), overdue: false, actionable: true });
  });

  it("lo que ya venció aparece primero y marcado", () => {
    const r = upcomingPayments(
      [item({ id: "a", nextDueOn: d(2026, 10, 9), recurring: false }), item({ id: "b" })],
      { today, from: today, to: addDays(today, 30) },
    );
    expect(r.map((p) => [p.id, p.overdue])).toEqual([["a", true], ["b", false]]);
  });

  it("proyecta los meses siguientes; los de monto variable quedan por confirmar", () => {
    const r = upcomingPayments(
      [
        item({ id: "renta", dueDay: 28, nextDueOn: d(2026, 11, 28), amountCents: 8000 }),
        item({ id: "tc", variable: true, amountCents: 500 }),
      ],
      { today, from: today, to: d(2027, 1, 31) },
    );
    const renta = r.filter((p) => p.id === "renta");
    expect(renta.map((p) => p.dueOn.month)).toEqual([11, 12, 1]);
    expect(renta.map((p) => p.amountCents)).toEqual([8000, 8000, 8000]);
    const tc = r.filter((p) => p.id === "tc");
    expect(tc.map((p) => p.amountCents)).toEqual([500, null, null]);
    expect(tc.map((p) => p.actionable)).toEqual([true, false, false]);
  });

  it("un pago único no se repite y uno sin fecha se omite", () => {
    const r = upcomingPayments(
      [item({ id: "u", recurring: false }), item({ id: "n", nextDueOn: null })],
      { today, from: today, to: d(2027, 6, 1) },
    );
    expect(r.map((p) => p.id)).toEqual(["u"]);
  });

  it("un periodo que empieza en el futuro no arrastra vencidos", () => {
    const r = upcomingPayments([item({ nextDueOn: d(2026, 10, 9), recurring: false })], {
      today,
      from: d(2026, 12, 1),
      to: d(2026, 12, 31),
    });
    expect(r).toHaveLength(0);
  });

  it("totales: suma lo conocido, cuenta lo por confirmar y compara con las cuentas", () => {
    const r = upcomingPayments(
      [item({ id: "a", amountCents: 3000 }), item({ id: "b", amountCents: null })],
      { today, from: today, to: addDays(today, 30) },
    );
    expect(totalsOf(r, 2000)).toEqual({ knownCents: 3000, unknownCount: 1, accountsCents: 2000, differenceCents: -1000 });
  });
});

describe("pagos restantes (estimado)", () => {
  it("con vigencia cuenta las fechas que quedan, contando el próximo pago", () => {
    expect(paymentsUntil(d(2026, 11, 9), d(2027, 10, 9), 9, false)).toBe(12);
    expect(paymentsUntil(d(2026, 11, 9), d(2026, 11, 8), 9, false)).toBe(0);
    expect(nthPaymentDate(d(2026, 11, 9), 12, 9, false)).toEqual(d(2027, 10, 9));
  });

  it("sin intereses divide el saldo entre el pago; con intereses alarga; sin alcanzar, nunca", () => {
    expect(paymentsToPayOff(100000, 25000, null)).toBe(4);
    expect(paymentsToPayOff(100000, 25000, 36)).toBeGreaterThan(4);
    expect(paymentsToPayOff(100000, 2000, 36)).toBeNull(); // 3% mensual = 3000 > 2000
    expect(paymentsToPayOff(0, 100, null)).toBe(0);
    expect(paymentsToPayOff(100, 0, null)).toBeNull();
  });

  const base = {
    balanceCents: 120000,
    nextDueOn: d(2026, 11, 9),
    dueDay: 9,
    dueLastDay: false,
    endsOn: null,
    nextPaymentCents: 10000,
    minPaymentCents: null,
    recentPaymentsCents: [],
    annualRatePct: null,
  };

  it("usa la vigencia cuando existe", () => {
    expect(estimatePayoff({ ...base, endsOn: d(2027, 10, 9) })).toEqual({
      kind: "estimate", payments: 12, endsOn: d(2027, 10, 9), basis: "vigencia",
    });
  });

  it("sin vigencia usa el promedio de los pagos hechos, y si no hay, el pago capturado", () => {
    expect(estimatePayoff({ ...base, recentPaymentsCents: [20000, 40000] })).toMatchObject({ payments: 4, basis: "promedio" });
    expect(estimatePayoff(base)).toMatchObject({ payments: 12, endsOn: d(2027, 10, 9), basis: "pago" });
  });

  it("no inventa datos: sin pago conocido no estima; sin deuda tampoco", () => {
    expect(estimatePayoff({ ...base, nextPaymentCents: null })).toBeNull();
    expect(estimatePayoff({ ...base, balanceCents: 0 })).toBeNull();
  });

  it("avisa cuando el pago no cubre los intereses", () => {
    expect(estimatePayoff({ ...base, nextPaymentCents: 1000, annualRatePct: 60 })).toEqual({ kind: "never" });
  });

  it("uso del límite de crédito", () => {
    expect(creditUtilizationPct(62000, 100000)).toBe(62);
    expect(creditUtilizationPct(100, null)).toBeNull();
  });
});

describe("resumen", () => {
  it("suma ingresos y egresos del mes", () => {
    expect(
      summarizeTransactions([
        { flow: "income", amountCents: 10000 },
        { flow: "expense", amountCents: 2500 },
        { flow: "expense", amountCents: 500 },
      ]),
    ).toEqual({ incomeCents: 10000, expenseCents: 3000, balanceCents: 7000 });
  });

  it("un pago nunca baja el saldo de la deuda por debajo de cero", () => {
    expect(amountAppliedToDebt(1000, 400)).toBe(400);
    expect(amountAppliedToDebt(300, 400)).toBe(300);
    expect(amountAppliedToDebt(0, 400)).toBe(0);
  });
});

describe("validación de formularios", () => {
  const card = {
    name: "Tarjeta",
    kind: "credit_card",
    balance: "5,000.00",
    creditLimit: "20,000",
    annualRate: "",
    nextDue: "2026-11-09",
    nextCut: "2026-10-20",
    nextPayment: "",
    minPayment: "",
    variablePayment: "on",
    recurring: "on",
  };

  it("una tarjeta con pago variable no necesita capturar el monto todavía", () => {
    const r = debtSchema.safeParse(card);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.balance).toBe(500000);
      expect(r.data.nextPayment).toBeNull();
      expect(r.data.variablePayment).toBe(true);
      expect(r.data.dueLastDay).toBe(false);
      expect(r.data.nextDue).toEqual(d(2026, 11, 9));
    }
  });

  it("un pago fijo sí exige el monto", () => {
    const r = debtSchema.safeParse({ ...card, kind: "loan", variablePayment: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.nextPayment).toBeTruthy();
  });

  it("la vigencia no puede ser anterior al próximo pago ni haber fechas inexistentes", () => {
    expect(debtSchema.safeParse({ ...card, endsOn: "2026-01-01" }).success).toBe(false);
    expect(debtSchema.safeParse({ ...card, nextDue: "2026-02-30" }).success).toBe(false);
    expect(debtSchema.safeParse({ ...card, balance: "-3" }).success).toBe(false);
  });

  it("gasto fijo: monto obligatorio salvo que cambie cada mes", () => {
    const base = { name: "Luz", category: "servicios", nextDue: "2026-11-15", recurring: "on" };
    expect(fixedExpenseSchema.safeParse({ ...base, amount: "" }).success).toBe(false);
    expect(fixedExpenseSchema.safeParse({ ...base, amount: "", variable: "on" }).success).toBe(true);
    expect(fixedExpenseSchema.safeParse({ ...base, amount: "8,000", category: "salarios" }).success).toBe(true);
  });

  it("movimientos: la categoría debe ser del tipo elegido", () => {
    const base = { amount: "10", date: "2026-10-30", description: "" };
    expect(transactionSchema.safeParse({ ...base, flow: "income", category: "vivienda" }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...base, flow: "expense", category: "vivienda" }).success).toBe(true);
  });
});

describe("observaciones", () => {
  it("son opcionales, se recortan y tienen tope de 500 caracteres", () => {
    const base = { name: "Nómina", kind: "bank", balance: "100" };
    expect(accountSchema.parse(base).notes).toBe("");
    expect(accountSchema.parse({ ...base, notes: "  Solo para el súper  " }).notes).toBe("Solo para el súper");
    expect(accountSchema.safeParse({ ...base, notes: "a".repeat(501) }).success).toBe(false);
  });
});
