import "dotenv/config";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { getCreditsBalance } from "../ledger";
import {
  expireCreditsForEndedSubscription,
  expireIfSubscriptionEnded,
  grantCreditsForInvoice,
  shouldGrantForInvoice,
} from "../subscription-credits";

const suffix = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const ids: string[] = [];

async function trackUser(balance = 0) {
  const user = await prisma.users.create({
    data: {
      user_email: `sub-credits-${suffix()}@example.com`,
      user_password_hash: "test",
      user_credits_balance: balance,
    },
  });
  ids.push(user.user_id);
  return user;
}

const ENV_KEYS = ["STRIPE_PRICE_EXPLORA", "STRIPE_PRICE_VALIDA", "STRIPE_PRICE_ESCALA"] as const;
const subFor = (planId: string) => ({ metadata: { plan_id: planId }, items: { data: [] } });
const invoice = (reason: string, amount = 5900) => ({
  id: `in_${suffix()}`,
  billing_reason: reason,
  amount_paid: amount,
});

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
  for (const k of ENV_KEYS) delete process.env[k]; // el plan se resuelve por metadata
});
afterEach(async () => {
  const list = [...ids];
  ids.length = 0;
  if (!list.length) return;
  await prisma.credit_ledger.deleteMany({ where: { cled_user_id: { in: list } } });
  await prisma.users.deleteMany({ where: { user_id: { in: list } } });
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("shouldGrantForInvoice", () => {
  const base = { amountPaid: 5900, newPlanCredits: 600, lastGrantCredits: 200 };

  it("alta y renovación mensual siempre restablecen", () => {
    expect(shouldGrantForInvoice({ ...base, billingReason: "subscription_create" })).toBe(true);
    expect(shouldGrantForInvoice({ ...base, billingReason: "subscription_cycle", newPlanCredits: 200 })).toBe(true);
  });

  it("cambio de plan: solo la subida cobrada restablece", () => {
    expect(shouldGrantForInvoice({ ...base, billingReason: "subscription_update" })).toBe(true);
    // bajada: el plan nuevo da menos créditos que la última renovación
    expect(
      shouldGrantForInvoice({ ...base, billingReason: "subscription_update", newPlanCredits: 200, lastGrantCredits: 600 }),
    ).toBe(false);
    // sin cobro (p. ej. prorrateo en 0)
    expect(shouldGrantForInvoice({ ...base, billingReason: "subscription_update", amountPaid: 0 })).toBe(false);
  });

  it("otros motivos no tocan los créditos", () => {
    expect(shouldGrantForInvoice({ ...base, billingReason: "manual" })).toBe(false);
    expect(shouldGrantForInvoice({ ...base, billingReason: null })).toBe(false);
  });
});

describe("créditos de suscripción (integración)", () => {
  it("alta: abona los créditos del plan", async () => {
    const user = await trackUser();
    const ok = await grantCreditsForInvoice({
      userId: user.user_id,
      sub: subFor("explora"),
      invoice: invoice("subscription_create"),
    });
    expect(ok).toBe(true);
    expect(await getCreditsBalance(user.user_id)).toBe(200);
  });

  it("renovación: restablece al plan, no suma a lo que sobraba", async () => {
    const user = await trackUser();
    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("valida"), invoice: invoice("subscription_create") });
    await prisma.users.update({ where: { user_id: user.user_id }, data: { user_credits_balance: 350 } });

    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("valida"), invoice: invoice("subscription_cycle") });

    expect(await getCreditsBalance(user.user_id)).toBe(600);
    const types = (await prisma.credit_ledger.findMany({ where: { cled_user_id: user.user_id }, orderBy: { cled_created_at: "asc" } })).map((r) => r.cled_type);
    expect(types).toEqual(["subscription_grant", "expire", "subscription_grant"]);
  });

  it("la misma factura dos veces (webhook + retorno de Checkout) abona una sola vez", async () => {
    const user = await trackUser();
    const inv = invoice("subscription_create");
    const first = await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("explora"), invoice: inv });
    const second = await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("explora"), invoice: inv });
    expect([first, second]).toEqual([true, false]);
    expect(await getCreditsBalance(user.user_id)).toBe(200);
  });

  it("subida de plan a mitad de mes: pasa al saldo del plan nuevo al instante", async () => {
    const user = await trackUser();
    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("explora"), invoice: invoice("subscription_create") });
    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("escala"), invoice: invoice("subscription_update", 33000) });
    expect(await getCreditsBalance(user.user_id)).toBe(2000);
  });

  it("bajada de plan: conserva el saldo hasta la próxima renovación y entonces baja", async () => {
    const user = await trackUser();
    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("escala"), invoice: invoice("subscription_create") });
    const down = await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("explora"), invoice: invoice("subscription_update", 0) });
    expect(down).toBe(false);
    expect(await getCreditsBalance(user.user_id)).toBe(2000);

    await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("explora"), invoice: invoice("subscription_cycle") });
    expect(await getCreditsBalance(user.user_id)).toBe(200);
  });

  it("plan desconocido: no abona nada", async () => {
    const user = await trackUser();
    const ok = await grantCreditsForInvoice({ userId: user.user_id, sub: subFor("otro"), invoice: invoice("subscription_create") });
    expect(ok).toBe(false);
    expect(await getCreditsBalance(user.user_id)).toBe(0);
  });

  it("suscripción terminada: vencen los créditos, una sola vez", async () => {
    const user = await trackUser(180);
    expect(await expireCreditsForEndedSubscription(user.user_id, "sub_x")).toBe(180);
    expect(await expireCreditsForEndedSubscription(user.user_id, "sub_x")).toBe(0);
    expect(await getCreditsBalance(user.user_id)).toBe(0);
  });

  it("red de seguridad: cancelada con periodo ya vencido pierde los créditos; vigente no", async () => {
    const past = new Date(Date.now() - 86_400_000);
    const future = new Date(Date.now() + 86_400_000);
    const expired = await trackUser(100);
    const active = await trackUser(100);
    const base = { user_credits_balance: 100, user_subscription_provider_id: "sub_y" };

    expect(
      await expireIfSubscriptionEnded({ ...base, user_id: expired.user_id, user_subscription_status: "canceled", user_subscription_period_end: past }),
    ).toBe(true);
    expect(
      await expireIfSubscriptionEnded({ ...base, user_id: active.user_id, user_subscription_status: "canceled", user_subscription_period_end: future }),
    ).toBe(false);
    expect(
      await expireIfSubscriptionEnded({ ...base, user_id: active.user_id, user_subscription_status: "active", user_subscription_period_end: past }),
    ).toBe(false);
    expect(await getCreditsBalance(expired.user_id)).toBe(0);
    expect(await getCreditsBalance(active.user_id)).toBe(100);
  });
});
