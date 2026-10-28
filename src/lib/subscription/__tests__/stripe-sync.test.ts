import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
  paymentsCreate: vi.fn(),
  trackServer: vi.fn(),
  sendBillingEmail: vi.fn(),
  grantCredits: vi.fn(),
  expireCredits: vi.fn(),
  chargeRefunded: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: m.trackServer }));
vi.mock("@/lib/email/billing", () => ({ sendBillingEmail: m.sendBillingEmail }));
vi.mock("@/lib/credits/subscription-credits", () => ({
  grantCreditsForInvoice: m.grantCredits,
  expireCreditsForEndedSubscription: m.expireCredits,
}));
vi.mock("@/lib/credits/refund-stripe", () => ({
  handleStripeChargeRefunded: m.chargeRefunded,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    users: { findUnique: m.findUnique, updateMany: m.updateMany, update: m.update },
    payments: { create: m.paymentsCreate },
  },
}));

import { applyStripeSubscription, recordStripeInvoicePayment } from "../stripe-sync";
import { handleStripeEvent } from "../stripe-webhook";

const FUTURE = Math.floor(Date.now() / 1000) + 20 * 24 * 3600;
const sub = (over = {}) =>
  ({
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    cancel_at_period_end: false,
    canceled_at: null,
    metadata: { user_id: "u1" },
    items: { data: [{ current_period_end: FUTURE }] },
    ...over,
  }) as never;
const freeUser = {
  user_id: "u1",
  user_subscription_status: "none",
  user_subscription_period_end: null,
  user_subscription_provider_id: null,
};
const invoice = {
  id: "in_1",
  amount_paid: 9900,
  currency: "mxn",
  billing_reason: "subscription_create",
  parent: { subscription_details: { subscription: "sub_1", metadata: { user_id: "u1" } } },
} as never;

beforeEach(() => vi.resetAllMocks());

describe("applyStripeSubscription", () => {
  it("activa una cuenta sin acceso y emite subscription_activated una vez", async () => {
    m.findUnique.mockResolvedValue(freeUser);
    m.updateMany.mockResolvedValue({ count: 1 });
    expect(await applyStripeSubscription("u1", sub(), "account")).toBe("activated");
    expect(m.updateMany.mock.calls[0][0].data.user_subscription_status).toBe("active");
    expect(m.trackServer).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail.mock.calls[0][1].kind).toBe("activated");
  });

  it("si el otro camino ya aplicó el estado (count 0) no repite el evento", async () => {
    m.findUnique.mockResolvedValue(freeUser);
    m.updateMany.mockResolvedValue({ count: 0 });
    expect(await applyStripeSubscription("u1", sub())).toBe("updated");
    expect(m.trackServer).not.toHaveBeenCalled();
    expect(m.sendBillingEmail).not.toHaveBeenCalled();
    expect(m.update).toHaveBeenCalledTimes(1);
  });

  it("una renovación (ya tenía acceso) no emite el evento", async () => {
    m.findUnique.mockResolvedValue({
      ...freeUser,
      user_subscription_status: "active",
      user_subscription_period_end: new Date(Date.now() + 1000 * 3600),
      user_subscription_provider_id: "sub_1",
    });
    m.updateMany.mockResolvedValue({ count: 0 });
    await applyStripeSubscription("u1", sub());
    expect(m.trackServer).not.toHaveBeenCalled();
  });

  it("ignora estados incompletos", async () => {
    expect(await applyStripeSubscription("u1", sub({ status: "incomplete" }))).toBe("ignored");
    expect(m.updateMany).not.toHaveBeenCalled();
  });
});

describe("recordStripeInvoicePayment", () => {
  it("guarda el pago con id de invoice, monto y moneda reales", async () => {
    m.paymentsCreate.mockResolvedValue({});
    expect(await recordStripeInvoicePayment("u1", invoice)).toBe(true);
    const data = m.paymentsCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({
      paym_provider: "stripe",
      paym_provider_payment_id: "in_1",
      paym_amount: 99,
      paym_currency: "MXN",
      paym_status: "paid",
    });
  });

  it("es idempotente: el duplicado (P2002) se ignora sin error", async () => {
    m.paymentsCreate.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    expect(await recordStripeInvoicePayment("u1", invoice)).toBe(false);
  });

  it("otros errores sí se propagan", async () => {
    m.paymentsCreate.mockRejectedValue(new Error("db caída"));
    await expect(recordStripeInvoicePayment("u1", invoice)).rejects.toThrow("db caída");
  });
});

describe("handleStripeEvent", () => {
  const stripe = { subscriptions: { retrieve: vi.fn() } } as never;

  it("invoice.paid sincroniza la suscripción y registra el pago", async () => {
    (stripe as { subscriptions: { retrieve: ReturnType<typeof vi.fn> } }).subscriptions.retrieve.mockResolvedValue(sub());
    m.findUnique.mockResolvedValue(freeUser);
    m.updateMany.mockResolvedValue({ count: 1 });
    m.paymentsCreate.mockResolvedValue({});
    await handleStripeEvent(stripe, { type: "invoice.paid", data: { object: invoice } } as never);
    expect(m.paymentsCreate).toHaveBeenCalledTimes(1);
    expect(m.grantCredits).toHaveBeenCalledTimes(1);
    expect(m.grantCredits.mock.calls[0][0]).toMatchObject({
      userId: "u1",
      invoice: { id: "in_1", billing_reason: "subscription_create", amount_paid: 9900 },
    });
  });

  it("invoice.payment_failed pone past_due y no registra pago", async () => {
    (stripe as { subscriptions: { retrieve: ReturnType<typeof vi.fn> } }).subscriptions.retrieve.mockResolvedValue(sub({ status: "past_due" }));
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "active", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 1 });
    await handleStripeEvent(stripe, { type: "invoice.payment_failed", data: { object: invoice } } as never);
    expect(m.updateMany.mock.calls[0][0].data.user_subscription_status).toBe("past_due");
    expect(m.paymentsCreate).not.toHaveBeenCalled();
    expect(m.grantCredits).not.toHaveBeenCalled();
  });

  it("customer.subscription.deleted → canceled", async () => {
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "active", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 1 });
    await handleStripeEvent(stripe, { type: "customer.subscription.deleted", data: { object: sub({ status: "canceled" }) } } as never);
    expect(m.updateMany.mock.calls[0][0].data.user_subscription_status).toBe("canceled");
    // Terminó la suscripción: los créditos que quedaban vencen.
    expect(m.expireCredits).toHaveBeenCalledWith("u1", "sub_1");
  });

  it("customer.subscription.updated (p. ej. cancelación al fin del periodo) no vence créditos", async () => {
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "active", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 1 });
    await handleStripeEvent(stripe, { type: "customer.subscription.updated", data: { object: sub({ cancel_at_period_end: true }) } } as never);
    expect(m.expireCredits).not.toHaveBeenCalled();
  });

  it("ignora eventos desconocidos sin lanzar", async () => {
    await expect(handleStripeEvent(stripe, { type: "charge.updated", data: { object: {} } } as never)).resolves.toBeUndefined();
  });

  it("cancelación hecha en Stripe (portal): manda el correo de cancelación una vez", async () => {
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "active", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 1 });
    await handleStripeEvent(stripe, { type: "customer.subscription.updated", data: { object: sub({ cancel_at_period_end: true }) } } as never);
    expect(m.sendBillingEmail).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail.mock.calls[0][1].kind).toBe("canceled");
    expect(m.sendBillingEmail.mock.calls[0][1].accessUntil).toBeInstanceOf(Date);
  });

  it("si la app ya dejó la cuenta cancelada (cancelación desde /cuenta), el webhook no repite el correo", async () => {
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "canceled", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 0 });
    await handleStripeEvent(stripe, { type: "customer.subscription.updated", data: { object: sub({ cancel_at_period_end: true }) } } as never);
    expect(m.sendBillingEmail).not.toHaveBeenCalled();
  });

  it("cobro fallido: avisa solo en el primer intento", async () => {
    const retrieve = (stripe as { subscriptions: { retrieve: ReturnType<typeof vi.fn> } }).subscriptions.retrieve;
    retrieve.mockResolvedValue(sub({ status: "past_due" }));
    m.findUnique.mockResolvedValue({ ...freeUser, user_subscription_status: "active", user_subscription_provider_id: "sub_1" });
    m.updateMany.mockResolvedValue({ count: 1 });

    await handleStripeEvent(stripe, { type: "invoice.payment_failed", data: { object: { ...(invoice as object), attempt_count: 1 } } } as never);
    expect(m.sendBillingEmail).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail.mock.calls[0][1].kind).toBe("payment_failed");

    m.sendBillingEmail.mockClear();
    await handleStripeEvent(stripe, { type: "invoice.payment_failed", data: { object: { ...(invoice as object), attempt_count: 2 } } } as never);
    expect(m.sendBillingEmail).not.toHaveBeenCalled();
  });

  it("reactivación hecha en el portal (canceled → active dentro del periodo): manda el correo", async () => {
    m.findUnique.mockResolvedValue({
      ...freeUser,
      user_subscription_status: "canceled",
      user_subscription_period_end: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      user_subscription_provider_id: "sub_1",
    });
    m.updateMany.mockResolvedValue({ count: 1 });
    await handleStripeEvent(stripe, { type: "customer.subscription.updated", data: { object: sub() } } as never);
    expect(m.sendBillingEmail).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail.mock.calls[0][1].kind).toBe("reactivated");
    expect(m.trackServer).not.toHaveBeenCalled();
  });

  it("checkout.session.completed en mode payment ya no se procesa (solo hay planes)", async () => {
    const session = { id: "cs_1", mode: "payment", payment_status: "paid" };
    await handleStripeEvent(stripe, { type: "checkout.session.completed", data: { object: session } } as never);
    expect(m.grantCredits).not.toHaveBeenCalled();
    expect(
      (stripe as { subscriptions: { retrieve: ReturnType<typeof vi.fn> } }).subscriptions.retrieve,
    ).not.toHaveBeenCalled();
  });

  it("charge.refunded despacha el ajuste de créditos", async () => {
    const charge = { id: "ch_1", payment_intent: "pi_1" };
    m.chargeRefunded.mockResolvedValue("adjusted");
    await handleStripeEvent(stripe, {
      type: "charge.refunded",
      data: { object: charge },
    } as never);
    expect(m.chargeRefunded).toHaveBeenCalledWith(stripe, charge);
  });
});
