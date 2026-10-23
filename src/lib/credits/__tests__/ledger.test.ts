import "dotenv/config";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/prisma";
import {
  InsufficientCreditsError,
  InvalidCreditAmountError,
  adjustCredits,
  getCreditsBalance,
  recordPurchase,
  refundCredits,
  spendCredits,
} from "../ledger";

const suffix = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

async function createUser(balance = 0) {
  return prisma.users.create({
    data: {
      user_email: `credits-ledger-${suffix()}@example.com`,
      user_password_hash: "test",
      user_credits_balance: balance,
    },
  });
}

async function createAssessment(userId: string) {
  return prisma.assessments.create({
    data: {
      asmt_email: `asmt-${suffix()}@example.com`,
      asmt_user_id: userId,
    },
  });
}

async function createPayment(userId: string) {
  return prisma.payments.create({
    data: {
      paym_user_id: userId,
      paym_provider: "stripe",
      paym_provider_payment_id: `pi_test_${suffix()}`,
      paym_amount: 59,
      paym_currency: "MXN",
      paym_status: "paid",
      paym_paid_at: new Date(),
    },
  });
}

const createdUserIds: string[] = [];

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
});

afterEach(async () => {
  if (createdUserIds.length === 0) return;
  const ids = [...createdUserIds];
  createdUserIds.length = 0;
  await prisma.credit_ledger.deleteMany({
    where: { cled_user_id: { in: ids } },
  });
  await prisma.payments.deleteMany({ where: { paym_user_id: { in: ids } } });
  await prisma.assessments.deleteMany({ where: { asmt_user_id: { in: ids } } });
  await prisma.users.deleteMany({ where: { user_id: { in: ids } } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function trackUser(balance = 0) {
  const user = await createUser(balance);
  createdUserIds.push(user.user_id);
  return user;
}

describe("credit ledger (integración)", () => {
  it("compra: abona saldo y escribe fila purchase", async () => {
    const user = await trackUser();
    const payment = await createPayment(user.user_id);

    const result = await recordPurchase({
      userId: user.user_id,
      amount: 100,
      paymentId: payment.paym_id,
      stripeSessionId: `cs_${suffix()}`,
      metadata: { package_id: "credits_1" },
    });

    expect(result.created).toBe(true);
    expect(result.entry.cled_type).toBe("purchase");
    expect(result.entry.cled_amount).toBe(100);
    expect(result.entry.cled_balance_after).toBe(100);
    expect(await getCreditsBalance(user.user_id)).toBe(100);
  });

  it("gasto: descuenta saldo y marca la evaluación cobrada", async () => {
    const user = await trackUser(150);
    const asmt = await createAssessment(user.user_id);

    const result = await spendCredits({
      userId: user.user_id,
      amount: 150,
      assessmentId: asmt.asmt_id,
      idempotencyKey: `spend:${asmt.asmt_id}`,
      markAssessmentCharged: true,
      metadata: { level: "research" },
    });

    expect(result.created).toBe(true);
    expect(result.entry.cled_amount).toBe(-150);
    expect(result.entry.cled_balance_after).toBe(0);
    expect(await getCreditsBalance(user.user_id)).toBe(0);

    const refreshed = await prisma.assessments.findUniqueOrThrow({
      where: { asmt_id: asmt.asmt_id },
    });
    expect(refreshed.asmt_credit_cost).toBe(150);
    expect(refreshed.asmt_credits_charged_at).not.toBeNull();
  });

  it("reembolso: devuelve el monto con clave por motivo", async () => {
    const user = await trackUser(0);
    const asmt = await createAssessment(user.user_id);

    await refundCredits({
      userId: user.user_id,
      amount: 150,
      assessmentId: asmt.asmt_id,
      reason: "failed",
    });

    expect(await getCreditsBalance(user.user_id)).toBe(150);
    const rows = await prisma.credit_ledger.findMany({
      where: { cled_user_id: user.user_id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].cled_idempotency_key).toBe(`refund:${asmt.asmt_id}:failed`);
  });

  it("idempotencia: reintentar compra/gasto no duplica", async () => {
    const user = await trackUser(100);
    const payment = await createPayment(user.user_id);
    const asmt = await createAssessment(user.user_id);
    const sessionId = `cs_${suffix()}`;

    const buy1 = await recordPurchase({
      userId: user.user_id,
      amount: 100,
      paymentId: payment.paym_id,
      stripeSessionId: sessionId,
    });
    const buy2 = await recordPurchase({
      userId: user.user_id,
      amount: 100,
      paymentId: payment.paym_id,
      stripeSessionId: sessionId,
    });
    expect(buy1.created).toBe(true);
    expect(buy2.created).toBe(false);
    expect(buy2.entry.cled_id).toBe(buy1.entry.cled_id);

    const spend1 = await spendCredits({
      userId: user.user_id,
      amount: 50,
      assessmentId: asmt.asmt_id,
      idempotencyKey: `spend:${asmt.asmt_id}`,
    });
    const spend2 = await spendCredits({
      userId: user.user_id,
      amount: 50,
      assessmentId: asmt.asmt_id,
      idempotencyKey: `spend:${asmt.asmt_id}`,
    });
    expect(spend1.created).toBe(true);
    expect(spend2.created).toBe(false);
    // saldo inicial 100 + compra 100 − gasto 50
    expect(await getCreditsBalance(user.user_id)).toBe(150);
  });

  it("saldo insuficiente: no escribe fila ni cambia balance", async () => {
    const user = await trackUser(50);
    const asmt = await createAssessment(user.user_id);

    await expect(
      spendCredits({
        userId: user.user_id,
        amount: 150,
        assessmentId: asmt.asmt_id,
        idempotencyKey: `spend:${asmt.asmt_id}`,
      }),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);

    expect(await getCreditsBalance(user.user_id)).toBe(50);
    expect(
      await prisma.credit_ledger.count({
        where: { cled_user_id: user.user_id },
      }),
    ).toBe(0);
  });

  it("concurrencia: dos gastos del saldo completo; solo uno gana", async () => {
    const user = await trackUser(100);
    const a1 = await createAssessment(user.user_id);
    const a2 = await createAssessment(user.user_id);

    const results = await Promise.allSettled([
      spendCredits({
        userId: user.user_id,
        amount: 100,
        assessmentId: a1.asmt_id,
        idempotencyKey: `spend:${a1.asmt_id}`,
      }),
      spendCredits({
        userId: user.user_id,
        amount: 100,
        assessmentId: a2.asmt_id,
        idempotencyKey: `spend:${a2.asmt_id}`,
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(
      (rejected[0] as PromiseRejectedResult).reason,
    ).toBeInstanceOf(InsufficientCreditsError);

    expect(await getCreditsBalance(user.user_id)).toBe(0);
    expect(
      await prisma.credit_ledger.count({
        where: { cled_user_id: user.user_id, cled_type: "spend" },
      }),
    ).toBe(1);
  });

  it("ajuste negativo no deja saldo por debajo de cero", async () => {
    const user = await trackUser(40);

    const result = await adjustCredits({
      userId: user.user_id,
      amount: -100,
      idempotencyKey: `adjustment:stripe_refund_${suffix()}`,
    });

    expect(result.entry.cled_amount).toBe(-40);
    expect(await getCreditsBalance(user.user_id)).toBe(0);
  });

  it("rechaza montos no enteros o no positivos en compra/gasto", async () => {
    const user = await trackUser();
    const payment = await createPayment(user.user_id);
    const asmt = await createAssessment(user.user_id);

    await expect(
      recordPurchase({
        userId: user.user_id,
        amount: 1.5,
        paymentId: payment.paym_id,
        stripeSessionId: "cs_x",
      }),
    ).rejects.toBeInstanceOf(InvalidCreditAmountError);

    await expect(
      spendCredits({
        userId: user.user_id,
        amount: 0,
        assessmentId: asmt.asmt_id,
        idempotencyKey: "spend:x",
      }),
    ).rejects.toBeInstanceOf(InvalidCreditAmountError);
  });
});
