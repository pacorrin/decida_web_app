import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getStripe: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  sendBillingEmail: vi.fn(),
  simulated: vi.fn(),
  checkout: vi.fn(),
  trackServer: vi.fn(),
  subsUpdate: vi.fn(),
  subsCancel: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe/client", () => ({ getStripe: m.getStripe }));
vi.mock("@/lib/analytics/server", () => ({ trackServer: m.trackServer }));
vi.mock("@/lib/prisma", () => ({ prisma: { users: { update: m.update, updateMany: m.updateMany } } }));
vi.mock("@/lib/email/billing", () => ({ sendBillingEmail: m.sendBillingEmail }));
vi.mock("../subscribe", () => ({ activateSimulatedSubscription: m.simulated }));
vi.mock("../stripe-checkout", () => ({ createCheckoutSession: m.checkout }));

import { startSubscription } from "../start";

const free = {
  user_id: "u1",
  user_email: "a@b.c",
  user_subscription_status: "none" as const,
  user_subscription_period_end: null,
  user_subscription_provider: null,
  user_subscription_provider_id: null,
  user_stripe_customer_id: null,
};
const future = new Date(Date.now() + 10 * 24 * 3600 * 1000);
const stripe = { subscriptions: { update: m.subsUpdate, cancel: m.subsCancel } };

beforeEach(() => {
  vi.resetAllMocks();
  m.subsCancel.mockResolvedValue({});
});

describe("startSubscription", () => {
  it("sin Stripe usa el flujo simulado", async () => {
    m.getStripe.mockReturnValue(null);
    m.simulated.mockResolvedValue(true);
    const r = await startSubscription(free, { returnTo: "account", planId: "explora" });
    expect(r).toEqual({ kind: "activated" });
    expect(m.simulated).toHaveBeenCalledTimes(1);
    expect(m.checkout).not.toHaveBeenCalled();
    expect(m.trackServer).toHaveBeenCalledTimes(1);
  });

  it("sin Stripe y con suscripción vigente responde already", async () => {
    m.getStripe.mockReturnValue(null);
    m.simulated.mockResolvedValue(false);
    expect(await startSubscription(free, { returnTo: "account", planId: "explora" })).toEqual({ kind: "already" });
  });

  it("con Stripe devuelve la URL de Checkout y no activa nada localmente", async () => {
    m.getStripe.mockReturnValue(stripe);
    m.checkout.mockResolvedValue("https://checkout.stripe.com/c/pay/cs_test_1");
    const r = await startSubscription(free, { returnTo: "onboarding", planId: "explora" });
    expect(r).toEqual({ kind: "redirect", url: "https://checkout.stripe.com/c/pay/cs_test_1" });
    expect(m.checkout.mock.calls[0][2]).toBe("/analizar/pago");
    expect(m.simulated).not.toHaveBeenCalled();
    expect(m.trackServer).not.toHaveBeenCalled(); // lo emite el webhook / retorno
  });

  it("con Stripe, un error se traduce a mensaje comprensible", async () => {
    m.getStripe.mockReturnValue(stripe);
    m.checkout.mockRejectedValue({ type: "StripeConnectionError" });
    const r = await startSubscription(free, { returnTo: "account", planId: "explora" });
    expect(r.kind).toBe("error");
  });

  it("reactivar una suscripción de Stripe llama a cancel_at_period_end=false", async () => {
    m.getStripe.mockReturnValue(stripe);
    m.subsUpdate.mockResolvedValue({});
    m.updateMany.mockResolvedValue({ count: 1 });
    const r = await startSubscription(
      {
        ...free,
        user_subscription_status: "canceled",
        user_subscription_period_end: future,
        user_subscription_provider: "stripe",
        user_subscription_provider_id: "sub_1",
      },
      { returnTo: "account", planId: "explora" },
    );
    expect(r).toEqual({ kind: "activated" });
    expect(m.subsUpdate).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: false });
    expect(m.updateMany.mock.calls[0][0].data.user_subscription_status).toBe("active");
    expect(m.sendBillingEmail).toHaveBeenCalledTimes(1);
    expect(m.sendBillingEmail.mock.calls[0][1].kind).toBe("reactivated");
    expect(m.checkout).not.toHaveBeenCalled();
  });

  it("si el webhook ya reactivó la cuenta (count 0) no se duplica el correo", async () => {
    m.getStripe.mockReturnValue(stripe);
    m.subsUpdate.mockResolvedValue({});
    m.updateMany.mockResolvedValue({ count: 0 });
    await startSubscription(
      {
        ...free,
        user_subscription_status: "canceled",
        user_subscription_period_end: future,
        user_subscription_provider: "stripe",
        user_subscription_provider_id: "sub_1",
      },
      { returnTo: "account", planId: "explora" },
    );
    expect(m.sendBillingEmail).not.toHaveBeenCalled();
  });

  it("si Stripe falla al reactivar no toca el estado local", async () => {
    m.getStripe.mockReturnValue(stripe);
    m.subsUpdate.mockRejectedValue({ type: "StripeAPIError" });
    const r = await startSubscription(
      {
        ...free,
        user_subscription_status: "canceled",
        user_subscription_period_end: future,
        user_subscription_provider: "stripe",
        user_subscription_provider_id: "sub_1",
      },
      { returnTo: "account", planId: "explora" },
    );
    expect(r.kind).toBe("error");
    expect(m.updateMany).not.toHaveBeenCalled();
    expect(m.sendBillingEmail).not.toHaveBeenCalled();
  });

  it("no cobra de nuevo a quien ya tiene suscripción vigente", async () => {
    m.getStripe.mockReturnValue(stripe);
    const r = await startSubscription(
      { ...free, user_subscription_status: "active", user_subscription_period_end: future },
      { returnTo: "account", planId: "explora" },
    );
    expect(r).toEqual({ kind: "already" });
    expect(m.checkout).not.toHaveBeenCalled();
  });
});
