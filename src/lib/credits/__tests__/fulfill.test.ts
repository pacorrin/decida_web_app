import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  paymentsCreate: vi.fn(),
  paymentsFindFirst: vi.fn(),
  recordPurchase: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    payments: {
      create: m.paymentsCreate,
      findFirst: m.paymentsFindFirst,
      findUnique: m.paymentsFindFirst,
    },
  },
}));
vi.mock("../ledger", () => ({ recordPurchase: m.recordPurchase }));

import { fulfillCreditCheckoutSession } from "../fulfill";

const session = (over: Record<string, unknown> = {}) =>
  ({
    id: "cs_test_1",
    mode: "payment",
    payment_status: "paid",
    client_reference_id: "u1",
    metadata: { user_id: "u1", package_id: "credits_1" },
    payment_intent: "pi_1",
    amount_total: 5900,
    currency: "mxn",
    ...over,
  }) as never;

beforeEach(() => vi.resetAllMocks());

describe("fulfillCreditCheckoutSession", () => {
  it("crea el pago y acredita el paquete", async () => {
    m.paymentsCreate.mockResolvedValue({ paym_id: "pay_1" });
    m.recordPurchase.mockResolvedValue({
      created: true,
      entry: { cled_id: "led_1" },
    });

    expect(await fulfillCreditCheckoutSession(session())).toBe("credited");
    expect(m.paymentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paym_user_id: "u1",
          paym_provider_session_id: "cs_test_1",
          paym_provider_payment_id: "pi_1",
          paym_status: "paid",
        }),
      }),
    );
    expect(m.recordPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        amount: 100,
        paymentId: "pay_1",
        stripeSessionId: "cs_test_1",
      }),
    );
  });

  it("es idempotente si el pago ya existía y el libro tampoco duplica", async () => {
    m.paymentsCreate.mockRejectedValue({ code: "P2002" });
    m.paymentsFindFirst.mockResolvedValue({ paym_id: "pay_1" });
    m.recordPurchase.mockResolvedValue({
      created: false,
      entry: { cled_id: "led_1" },
    });

    expect(await fulfillCreditCheckoutSession(session())).toBe("already");
    expect(m.recordPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: "pay_1" }),
    );
  });

  it("ignora sesiones que no son payment pagadas", async () => {
    expect(
      await fulfillCreditCheckoutSession(
        session({ mode: "subscription", payment_status: "paid" }),
      ),
    ).toBe("ignored");
    expect(
      await fulfillCreditCheckoutSession(
        session({ payment_status: "unpaid" }),
      ),
    ).toBe("ignored");
    expect(m.paymentsCreate).not.toHaveBeenCalled();
  });

  it("ignora metadata incompleta o paquete desconocido", async () => {
    expect(
      await fulfillCreditCheckoutSession(
        session({ metadata: { user_id: "u1", package_id: "nope" } }),
      ),
    ).toBe("ignored");
    expect(
      await fulfillCreditCheckoutSession(
        session({ metadata: {}, client_reference_id: null }),
      ),
    ).toBe("ignored");
  });
});
