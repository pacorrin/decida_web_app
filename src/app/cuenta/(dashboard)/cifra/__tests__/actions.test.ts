import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => {
  const tx = {
    cifra_debts: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    cifra_fixed_expenses: { findFirst: vi.fn() },
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
      cifra_debts: { create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
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
  balance: "5000",
  monthlyPayment: "500",
  dueDay: "20",
  cutDay: "",
  annualRate: "",
  creditLimit: "",
};

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
      await markPaid("debt", "d1"),
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
    const r = await saveDebt(form({ ...debtForm, dueDay: "40", balance: "-3" }));
    expect(r.success).toBe(false);
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["dueDay", "balance"]));
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

describe("marcar como pagado", () => {
  it("deuda: crea el egreso, baja el saldo y manda analítica", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({
      cdebt_id: "d1", cdebt_name: "Tarjeta", cdebt_balance_cents: 100000, cdebt_monthly_payment_cents: 30000,
    });
    const r = await markPaid("debt", "d1");
    expect(r.success).toBe(true);
    expect(m.tx.cifra_transactions.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ctrx_amount_cents: 30000,
        ctrx_category: "deudas",
        ctrx_debt_id: "d1",
        ctrx_applied_to_debt_cents: 30000,
        ctrx_period: expect.stringMatching(/^\d{4}-\d{2}$/),
      }),
    });
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: { cdebt_balance_cents: 70000, cdebt_paid_off: false },
    });
  });

  it("último pago: el saldo no queda negativo y la deuda se marca liquidada", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({
      cdebt_id: "d1", cdebt_name: "x", cdebt_balance_cents: 10000, cdebt_monthly_payment_cents: 30000,
    });
    await markPaid("debt", "d1");
    expect(m.tx.cifra_debts.update).toHaveBeenCalledWith({
      where: { cdebt_id: "d1" },
      data: { cdebt_balance_cents: 0, cdebt_paid_off: true },
    });
  });

  it("segundo intento del mismo mes: no duplica", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue({
      cdebt_id: "d1", cdebt_name: "x", cdebt_balance_cents: 1000, cdebt_monthly_payment_cents: 100,
    });
    m.tx.cifra_transactions.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const r = await markPaid("debt", "d1");
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/ya está marcado/i);
    expect(m.tx.cifra_debts.update).not.toHaveBeenCalled();
  });

  it("deuda o gasto de otra persona no existe para el usuario", async () => {
    m.tx.cifra_debts.findFirst.mockResolvedValue(null);
    expect((await markPaid("debt", "ajena")).success).toBe(false);
    expect(m.tx.cifra_debts.findFirst).toHaveBeenCalledWith({
      where: { cdebt_id: "ajena", cdebt_user_id: "u1", cdebt_paid_off: false },
    });
  });
});

describe("borrar un pago", () => {
  it("restaura el saldo de la deuda y la reabre", async () => {
    m.tx.cifra_transactions.findFirst.mockResolvedValue({
      ctrx_id: "t1", ctrx_debt_id: "d1", ctrx_applied_to_debt_cents: 30000,
    });
    expect((await deleteTransaction("t1")).success).toBe(true);
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
