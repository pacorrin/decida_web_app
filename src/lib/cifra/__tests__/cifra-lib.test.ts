import { describe, expect, it } from "vitest";
import {
  compareDates,
  dueDateInMonth,
  formatDateInput,
  monthRange,
  nextDueDate,
  parseDateInput,
  periodOf,
  todayInMexico,
} from "../dates";
import { formatMxn, parseMoneyToCents } from "../money";
import {
  amountAppliedToDebt,
  pendingPayments,
  summarizeTransactions,
} from "../summary";
import { debtSchema, transactionSchema } from "../schemas";

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
  });
});

describe("fechas", () => {
  it("el día 31 cae al último día de un mes corto", () => {
    expect(dueDateInMonth(2026, 2, 31)).toEqual({ year: 2026, month: 2, day: 28 });
    expect(dueDateInMonth(2028, 2, 30)).toEqual({ year: 2028, month: 2, day: 29 });
    expect(dueDateInMonth(2026, 4, 31)).toEqual({ year: 2026, month: 4, day: 30 });
  });

  it("la próxima fecha cuenta hoy y salta de mes y de año", () => {
    expect(nextDueDate(15, { year: 2026, month: 10, day: 15 })).toEqual({ year: 2026, month: 10, day: 15 });
    expect(nextDueDate(10, { year: 2026, month: 10, day: 15 })).toEqual({ year: 2026, month: 11, day: 10 });
    expect(nextDueDate(5, { year: 2026, month: 12, day: 20 })).toEqual({ year: 2027, month: 1, day: 5 });
    expect(nextDueDate(31, { year: 2026, month: 1, day: 31 })).toEqual({ year: 2026, month: 1, day: 31 });
  });

  it("valida fechas del calendario", () => {
    expect(parseDateInput("2026-10-30")).toEqual({ year: 2026, month: 10, day: 30 });
    expect(parseDateInput("2026-02-30")).toBeNull();
    expect(parseDateInput("30/10/2026")).toBeNull();
    expect(formatDateInput({ year: 2026, month: 3, day: 4 })).toBe("2026-03-04");
  });

  it("hoy en la Ciudad de México no es el día UTC cuando ya pasó la medianoche allá", () => {
    // 2026-10-30 03:30 UTC es 2026-10-29 21:30 en la Ciudad de México (UTC-6).
    expect(todayInMexico(new Date("2026-10-30T03:30:00Z"))).toEqual({ year: 2026, month: 10, day: 29 });
  });

  it("rango y periodo del mes", () => {
    expect(periodOf({ year: 2026, month: 3 })).toBe("2026-03");
    const r = monthRange("2026-02")!;
    expect(r.from.toISOString().slice(0, 10)).toBe("2026-02-01");
    expect(r.to.toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(monthRange("2026-13")).toBeNull();
    expect(compareDates({ year: 2026, month: 1, day: 2 }, { year: 2026, month: 1, day: 1 })).toBeGreaterThan(0);
  });
});

describe("resumen y próximos pagos", () => {
  it("suma ingresos y egresos del mes", () => {
    expect(
      summarizeTransactions([
        { flow: "income", amountCents: 10000 },
        { flow: "expense", amountCents: 2500 },
        { flow: "expense", amountCents: 500 },
      ]),
    ).toEqual({ incomeCents: 10000, expenseCents: 3000, balanceCents: 7000 });
  });

  it("ordena por fecha, marca vencidos y omite lo ya pagado", () => {
    const today = { year: 2026, month: 10, day: 15 };
    const result = pendingPayments({
      debts: [
        { id: "d1", name: "Tarjeta", monthlyPaymentCents: 100, dueDay: 20 },
        { id: "d2", name: "Préstamo", monthlyPaymentCents: 200, dueDay: 5 },
      ],
      fixedExpenses: [
        { id: "f1", name: "Renta", amountCents: 300, dueDay: 1 },
        { id: "f2", name: "Internet", amountCents: 400, dueDay: 10 },
      ],
      paidDebtIds: new Set(["d2"]),
      paidFixedIds: new Set(["f2"]),
      today,
    });
    expect(result.map((p) => p.id)).toEqual(["f1", "d1"]);
    expect(result[0].overdue).toBe(true);
    expect(result[1].overdue).toBe(false);
  });

  it("un pago nunca baja el saldo de la deuda por debajo de cero", () => {
    expect(amountAppliedToDebt(1000, 400)).toBe(400);
    expect(amountAppliedToDebt(300, 400)).toBe(300);
    expect(amountAppliedToDebt(0, 400)).toBe(0);
  });
});

describe("validación de formularios", () => {
  it("acepta una deuda con campos opcionales vacíos", () => {
    const r = debtSchema.safeParse({
      name: "Tarjeta",
      kind: "credit_card",
      balance: "5000",
      monthlyPayment: "500",
      dueDay: "20",
      cutDay: "",
      annualRate: "",
      creditLimit: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.balance).toBe(500000);
      expect(r.data.cutDay).toBeNull();
      expect(r.data.creditLimit).toBeNull();
    }
  });

  it("rechaza día 32, importe negativo y categoría de otro tipo", () => {
    expect(
      debtSchema.safeParse({
        name: "x", kind: "loan", balance: "-1", monthlyPayment: "1", dueDay: "32",
        cutDay: "", annualRate: "", creditLimit: "",
      }).success,
    ).toBe(false);
    expect(
      transactionSchema.safeParse({
        flow: "income", category: "vivienda", amount: "10", date: "2026-10-30", description: "",
      }).success,
    ).toBe(false);
    expect(
      transactionSchema.safeParse({
        flow: "expense", category: "vivienda", amount: "10", date: "2026-10-30", description: "",
      }).success,
    ).toBe(true);
  });
});
