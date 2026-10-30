import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => {
  const tx = {
    cifra_debts: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    cifra_fixed_expenses: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    cifra_transactions: { create: vi.fn(), findFirst: vi.fn(), delete: vi.fn() },
  };
  return {
    tx,
    getCurrentUser: vi.fn(),
    getCifraAccess: vi.fn(),
    trackServer: vi.fn(),
    prisma: {
      $transaction: vi.fn(),
      cifra_accounts: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
      cifra_debts: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn() },
      cifra_fixed_expenses: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
      cifra_transactions: { create: vi.fn(), deleteMany: vi.fn() },
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session-server", () => ({ getCurrentUser: m.getCurrentUser }));
vi.mock("@/lib/analytics/server", () => ({ trackServer: m.trackServer }));
vi.mock("@/lib/prisma", () => ({ prisma: m.prisma }));
vi.mock("@/lib/cifra/access", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/cifra/access")>()),
  getCifraAccess: m.getCifraAccess,
}));

import {
  addTransaction,
  deleteAccount,
  deleteAllCifraData,
  deleteTransaction,
  markPaid,
  saveDebt,
  setPendingAmount,
} from "../actions";

const ok = { ok: true, userId: "u1" };

function form(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

const debtForm = {
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

const utc = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const payForm = { amount: "$250.00", date: "2026-10-30" };

beforeEach(() => {
  vi.resetAllMocks();
  m.getCifraAccess.mockResolvedValue(ok);
  m.getCurrentUser.mockResolvedValue({ user_id: "u1" });
  m.prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: typeof m.tx) => unknown)(m.tx) : Promise.all(arg as unknown[]),
  );
});

describe("acceso", () => {
  it("sin plan no se puede escribir y no se toca la base", async () => {
    m.getCifraAccess.mockResolvedValue({ ok: false, reason: "no_plan" });
    for (const r of [
      await saveDebt(form(debtForm)),
      await addTransaction(form({ flow: "income", category: "sueldo", amount: "10", date: "2026-10-30", description: "" })),
      await markPaid("debt", "d1", form(payForm)),
    ]) {
      expect(r.success).toBe(false);
      expect(r.message).toMatch(/plan/i);
    }
    expect(m.prisma.cifra_debts.create).not.toHaveBeenCalled();
    expect(m.prisma.cifra_transactions.create).not.toHaveBeenCalled();
  });

  it("sin plan sí puede borrar sus propios datos", async () => {
    m.getCifraAccess.mockResolvedValue({ ok: false, reason: "no_plan" });
    const r = await deleteAllCifraData();
    expect(r.success).toBe(true);
    expect(m.prisma.cifra_transactions.deleteMany).toHaveBeenCalledWith({ where: { ctrx_user_id: "u1" } });
  });

  it("sin sesión no borra nada", async () => {
    m.getCurrentUser.mockResolvedValue(null);
    expect((await deleteAllCifraData()).success).toBe(false);
    expect((await deleteAccount("a1")).success).toBe(false);
    expect(m.prisma.cifra_accounts.deleteMany).not.toHaveBeenCalled();
  });
});

describe("aislamiento por usuario", () => {
  it("editar y borrar siempre filtran por el usuario", async () => {
    m.prisma.cifra_debts.updateMany.mockResolvedValue({ count: 1 });
    await saveDebt(form({ ...debtForm, id: "d1" }));
    expect(m.prisma.cifra_debts.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { cdebt_id: "d1", cdebt_user_id: "u1" } }),
    );
    await deleteAccount("a1");
    expect(m.prisma.cifra_accounts.deleteMany).toHaveBeenCalledWith({
      where: { cacc_id: "a1", cacc_user_id: "u1" },
    });
  });

  it("editar algo ajeno falla sin crear nada", async () => {
    m.prisma.cifra_debts.updateMany.mockResolvedValue({ count: 0 });
    const r = await saveDebt(form({ ...debtForm, id: "ajena" }));
    expect(r.success).toBe(false);
    expect(m.prisma.cifra_debts.create).not.toHaveBeenCalled();
  });
});

describe("validación", () => {
  it("devuelve errores por campo y no guarda", async () => {
    const r = await saveDebt(form({ ...debtForm, nextDue: "2026-02-30", balance: "-3" }));
    expect(r.success).toBe(false);
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["nextDue", "balance"]));
    expect(m.prisma.cifra_debts.create).not.toHaveBeenCalled();
  });

  it("guarda el movimiento en centavos y manda analítica sin importes", async () => {
    await addTransaction(form({ flow: "expense", category: "alimentos", amount: "$1,234.50", date: "2026-10-30", description: "Súper" }));
    expect(m.prisma.cifra_transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ ctrx_user_id: "u1", ctrx_amount_cents: 123450, ctrx_flow: "expense" }),
    });
    const props = m.trackServer.mock.calls[0][2];
    expect(JSON.stringify(props)).not.toMatch(/1234|Súper/);
  });
});

describe("observaciones", () => {
  it("se guardan con la deuda y vacías se guardan como nulo", async () => {
    m.prisma.cifra_debts.create.mockResolvedValue({});
    await saveDebt(form({ ...debtForm, notes: "Solo compras en línea" }));
    expect(m.prisma.cifra_debts.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cdebt_notes: "Solo compras en línea" }),
    });
    m.prisma.cifra_debts.create.mockClear();
    await saveDebt(form({ ...debtForm, notes: "  " }));
    expect(m.prisma.cifra_debts.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cdebt_notes: null }),
    });
  });
});

describe("guardar una deuda", () => {
  it("guarda la fecha real del próximo pago y el ancla; la tarjeta queda con pago por confirmar", async () => {
    await saveDebt(form(debtForm));
    expect(m.prisma.cifra_debts.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cdebt_user_id: "u1",
        cdebt_balance_cents: 500000,
        cdebt_credit_limit_cents: 2000000,
        cdebt_next_due_on: utc(2026, 11, 9),
        cdebt_due_day: 9,
        cdebt_due_last_day: false,
        cdebt_next_cut_on: utc(2026, 10, 20),
        cdebt_cut_day: 20,
        cdebt_next_payment_cents: null,
        cdebt_variable_payment: true,
        cdebt_recurring: true,
      }),
    });
  });

  it("«último día del mes» fija la fecha al fin de ese mes", async () => {
    await saveDebt(form({ ...debtForm, nextDue: "2026-02-10", dueLastDay: "on", nextCut: "" }));
    expect(m.prisma.cifra_debts.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cdebt_next_due_on: utc(2026, 2, 28), cdebt_due_day: 31, cdebt_due_last_day: true, cdebt_next_cut_on: null }),
    });
  });
});

const dueDebt = {
  cdebt_id: "d1",
  cdebt_name: "Tarjeta",
  cdebt_balance_cents: 100000,
  cdebt_next_due_on: utc(2026, 11, 9),
  cdebt_next_cut_on: utc(2026, 10, 20),
  cdebt_next_payment_cents: 30000,
  cdebt_due_day: 9,
  cdebt_due_last_day: false,
  cdebt_cut_day: 20,
  cdebt_cut_last_day: false,
  cdebt_recurring: true,
  cdebt_variable_payment: true,
};

describe("marcar como pagado", () => {
  it("deuda: registra lo que se pagó, baja el saldo y recorre la fecha al mes siguiente", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue(dueDebt);
    const r = await markPaid("debt", "d1", form(payForm));
    expect(r.success).toBe(true);
    expect(m.tx.cifra_transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ctrx_amount_cents: 25000,
        ctrx_category: "deudas",
        ctrx_debt_id: "d1",
        ctrx_occurred_on: utc(2026, 10, 30),
        ctrx_period: "2026-11",
        ctrx_applied_to_debt_cents: 25000,
        ctrx_prev_due_on: utc(2026, 11, 9),
        ctrx_prev_cut_on: utc(2026, 10, 20),
        ctrx_prev_amount_cents: 30000,
      }),
    });
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: {
        cdebt_balance_cents: 75000,
        cdebt_paid_off: false,
        cdebt_next_due_on: utc(2026, 12, 9),
        cdebt_next_payment_cents: null, // el monto cambia cada mes: queda por confirmar
        cdebt_next_cut_on: utc(2026, 11, 20),
      },
    });
    expect(JSON.stringify(m.trackServer.mock.calls[0][2])).not.toMatch(/250/);
  });

  it("pago fijo recurrente: conserva el monto del siguiente", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({ ...dueDebt, cdebt_variable_payment: false, cdebt_cut_day: null, cdebt_next_cut_on: null });
    await markPaid("debt", "d1", form(payForm));
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: expect.objectContaining({ cdebt_next_payment_cents: 30000, cdebt_next_cut_on: null }),
    });
  });

  it("el día 31 vuelve al ancla después de un mes corto", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({
      ...dueDebt, cdebt_next_due_on: utc(2026, 2, 28), cdebt_due_day: 31,
    });
    await markPaid("debt", "d1", form(payForm));
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: expect.objectContaining({ cdebt_next_due_on: utc(2026, 3, 31) }),
    });
  });

  it("último pago: el saldo no queda negativo, se liquida y ya no hay próximo pago", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({ ...dueDebt, cdebt_balance_cents: 10000 });
    await markPaid("debt", "d1", form(payForm));
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: { cdebt_balance_cents: 0, cdebt_paid_off: true, cdebt_next_due_on: null, cdebt_next_payment_cents: null, cdebt_next_cut_on: null },
    });
  });

  it("deuda de pago único: no se recorre", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({ ...dueDebt, cdebt_recurring: false });
    await markPaid("debt", "d1", form(payForm));
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: expect.objectContaining({ cdebt_next_due_on: null }),
    });
  });

  it("gasto fijo variable: el siguiente queda por confirmar", async () => {
    m.tx.cifra_fixed_expenses.findFirst.mockResolvedValue({
      cfix_id: "f1", cfix_name: "Luz", cfix_category: "servicios", cfix_amount_cents: 80000,
      cfix_next_due_on: utc(2026, 11, 15), cfix_due_day: 15, cfix_due_last_day: false,
      cfix_recurring: true, cfix_variable: true,
    });
    await markPaid("fixed", "f1", form({ amount: "912.40", date: "2026-11-14" }));
    expect(m.tx.cifra_transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ ctrx_amount_cents: 91240, ctrx_category: "servicios", ctrx_period: "2026-11", ctrx_fixed_expense_id: "f1" }),
    });
    expect(m.tx.cifra_fixed_expenses.update).toHaveBeenCalledWith({
      where: { cfix_id: "f1" },
      data: { cfix_next_due_on: utc(2026, 12, 15), cfix_amount_cents: null },
    });
  });

  it("segundo intento de la misma fecha: no duplica", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue(dueDebt);
    m.tx.cifra_transactions.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const r = await markPaid("debt", "d1", form(payForm));
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/ya está marcado/i);
    expect(m.tx.cifra_debts.update).not.toHaveBeenCalled();
  });

  it("monto o fecha inválidos no tocan nada", async () => {
    const r = await markPaid("debt", "d1", form({ amount: "", date: "2026-02-30" }));
    expect(r.success).toBe(false);
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["amount", "date"]));
    expect(m.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("deuda o gasto de otra persona no existe para el usuario", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue(null);
    expect((await markPaid("debt", "ajena", form(payForm))).success).toBe(false);
    expect(m.tx.cifra_debts.findFirst).toHaveBeenCalledWith({
      where: { cdebt_id: "ajena", cdebt_user_id: "u1", cdebt_paid_off: false },
    });
  });
});

describe("capturar el monto pendiente", () => {
  it("tarjeta: guarda el pago y, si el corte ya pasó, lo recorre al siguiente", async () => {
    m.prisma.cifra_debts.findFirst.mockResolvedValue({
      ...dueDebt, cdebt_next_cut_on: utc(2020, 1, 20), // ya pasó
    });
    const r = await setPendingAmount("debt", "d1", form({ amount: "1,200", minPayment: "300", balance: "9,000" }));
    expect(r.success).toBe(true);
    expect(m.prisma.cifra_debts.updateMany).toHaveBeenCalledWith({
      where: { cdebt_id: "d1", cdebt_user_id: "u1" },
      data: expect.objectContaining({
        cdebt_next_payment_cents: 120000,
        cdebt_min_payment_cents: 30000,
        cdebt_balance_cents: 900000,
        cdebt_next_cut_on: expect.any(Date),
      }),
    });
  });

  it("gasto fijo: solo el monto, y siempre del usuario", async () => {
    m.prisma.cifra_fixed_expenses.updateMany.mockResolvedValue({ count: 1 });
    await setPendingAmount("fixed", "f1", form({ amount: "950" }));
    expect(m.prisma.cifra_fixed_expenses.updateMany).toHaveBeenCalledWith({
      where: { cfix_id: "f1", cfix_user_id: "u1" },
      data: { cfix_amount_cents: 95000 },
    });
  });
});

describe("borrar un pago", () => {
  const paymentRow = {
    ctrx_id: "t1",
    ctrx_debt_id: "d1",
    ctrx_fixed_expense_id: null,
    ctrx_applied_to_debt_cents: 30000,
    ctrx_prev_due_on: utc(2026, 11, 9),
    ctrx_prev_cut_on: utc(2026, 10, 20),
    ctrx_prev_amount_cents: 30000,
  };

  it("si era el último pago marcado: devuelve el saldo y regresa la fecha y el monto", async () => {
    m.tx.cifra_transactions.findFirst.mockResolvedValue(paymentRow);
    m.tx.cifra_debts.findFirst.mockResolvedValue({ ...dueDebt, cdebt_next_due_on: utc(2026, 12, 9) });
    expect((await deleteTransaction("t1")).success).toBe(true);
    expect(m.tx.cifra_debts.updateMany).toHaveBeenCalledWith({
      where: { cdebt_id: "d1", cdebt_user_id: "u1" },
      data: {
        cdebt_balance_cents: { increment: 30000 },
        cdebt_paid_off: false,
        cdebt_next_due_on: utc(2026, 11, 9),
        cdebt_next_cut_on: utc(2026, 10, 20),
        cdebt_next_payment_cents: 30000,
      },
    });
  });

  it("si ya hubo pagos posteriores: solo devuelve el saldo, no mueve las fechas", async () => {
    m.tx.cifra_transactions.findFirst.mockResolvedValue(paymentRow);
    m.tx.cifra_debts.findFirst.mockResolvedValue({ ...dueDebt, cdebt_next_due_on: utc(2027, 2, 9) });
    await deleteTransaction("t1");
    expect(m.tx.cifra_debts.updateMany).toHaveBeenCalledWith({
      where: { cdebt_id: "d1", cdebt_user_id: "u1" },
      data: { cdebt_balance_cents: { increment: 30000 }, cdebt_paid_off: false },
    });
  });

  it("un movimiento ajeno no se borra", async () => {
    m.tx.cifra_transactions.findFirst.mockResolvedValue(null);
    await deleteTransaction("ajeno");
    expect(m.tx.cifra_transactions.delete).not.toHaveBeenCalled();
  });
});
