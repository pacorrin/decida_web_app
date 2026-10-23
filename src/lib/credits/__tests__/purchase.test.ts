import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getStripe: vi.fn(),
  createCreditsCheckoutSession: vi.fn(),
  paymentsCreate: vi.fn(),
  recordPurchase: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe/client", () => ({ getStripe: m.getStripe }));
vi.mock("../checkout", () => ({
  createCreditsCheckoutSession: m.createCreditsCheckoutSession,
}));
vi.mock("../ledger", () => ({ recordPurchase: m.recordPurchase }));
vi.mock("@/lib/prisma", () => ({
  prisma: { payments: { create: m.paymentsCreate } },
}));

import { startCreditPurchase } from "../purchase";

const user = {
  user_id: "u1",
  user_email: "a@b.com",
  user_stripe_customer_id: null,
};

beforeEach(() => vi.resetAllMocks());

describe("startCreditPurchase", () => {
  it("sin Stripe acredita en modo simulado", async () => {
    m.getStripe.mockReturnValue(null);
    m.paymentsCreate.mockResolvedValue({ paym_id: "pay_sim" });
    m.recordPurchase.mockResolvedValue({ created: true, entry: {} });

    const result = await startCreditPurchase(user, "credits_3");
    expect(result).toEqual({ kind: "credited" });
    expect(m.recordPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        amount: 300,
        paymentId: "pay_sim",
      }),
    );
  });

  it("con Stripe redirige a Checkout", async () => {
    m.getStripe.mockReturnValue({});
    m.createCreditsCheckoutSession.mockResolvedValue("https://checkout.stripe/test");

    const result = await startCreditPurchase(user, "credits_10");
    expect(result).toEqual({
      kind: "redirect",
      url: "https://checkout.stripe/test",
    });
    expect(m.createCreditsCheckoutSession).toHaveBeenCalledWith(
      {},
      user,
      "credits_10",
      "/cuenta/creditos/paquetes",
    );
  });

  it("rechaza un package id inválido", async () => {
    const result = await startCreditPurchase(user, "credits_99" as never);
    expect(result.kind).toBe("error");
  });
});
