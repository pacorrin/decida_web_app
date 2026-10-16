import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  sendBillingEmail: vi.fn(),
  getCurrentUser: vi.fn(),
  updateMany: vi.fn(),
  getStripe: vi.fn(),
  subsUpdate: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));
vi.mock("@/lib/email/billing", () => ({ sendBillingEmail: m.sendBillingEmail }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session-server", () => ({ getCurrentUser: m.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: { users: { updateMany: m.updateMany } } }));
vi.mock("@/lib/stripe/client", () => ({ getStripe: m.getStripe }));

import { cancelSubscription } from "../actions";

const stripeUser = {
  user_id: "u1",
  user_subscription_status: "active",
  user_subscription_period_end: new Date("2026-11-01T00:00:00.000Z"),
  user_subscription_provider: "stripe",
  user_subscription_provider_id: "sub_1",
};

beforeEach(() => {
  vi.resetAllMocks();
  m.getStripe.mockReturnValue({ subscriptions: { update: m.subsUpdate } });
});

describe("cancelSubscription con Stripe", () => {
  it("cancela al fin del periodo en Stripe y luego en local", async () => {
    m.getCurrentUser.mockResolvedValue(stripeUser);
    m.subsUpdate.mockResolvedValue({});
    m.updateMany.mockResolvedValue({ count: 1 });
    const r = await cancelSubscription({ success: false });
    expect(r.success).toBe(true);
    expect(m.subsUpdate).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: true });
    expect(m.updateMany.mock.calls[0][0].data).not.toHaveProperty("user_subscription_period_end");
  });

  it("si Stripe falla, no cambia el estado local y avisa", async () => {
    m.getCurrentUser.mockResolvedValue(stripeUser);
    m.subsUpdate.mockRejectedValue({ type: "StripeConnectionError" });
    const r = await cancelSubscription({ success: false });
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/procesador de pagos/);
    expect(m.updateMany).not.toHaveBeenCalled();
  });

  it("una suscripción simulada no toca Stripe", async () => {
    m.getCurrentUser.mockResolvedValue({ ...stripeUser, user_subscription_provider: "simulated", user_subscription_provider_id: "sim_1" });
    m.updateMany.mockResolvedValue({ count: 1 });
    await cancelSubscription({ success: false });
    expect(m.subsUpdate).not.toHaveBeenCalled();
  });
});
