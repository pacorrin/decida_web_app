import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  updateMany: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/session-server", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: { users: { updateMany: mocks.updateMany } } }));

import { cancelSubscription } from "../actions";

const end = new Date("2026-11-01T00:00:00.000Z");

beforeEach(() => vi.resetAllMocks());

describe("acción cancelSubscription", () => {
  it("rechaza si no hay sesión", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const r = await cancelSubscription({ success: false });
    expect(r.success).toBe(false);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("cancela una suscripción activa sin tocar period_end", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      user_id: "u1",
      user_subscription_status: "active",
      user_subscription_period_end: end,
    });
    mocks.updateMany.mockResolvedValue({ count: 1 });
    const r = await cancelSubscription({ success: false });
    expect(r.success).toBe(true);
    const arg = mocks.updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ user_id: "u1", user_subscription_status: "active" });
    expect(arg.data.user_subscription_status).toBe("canceled");
    expect(arg.data).not.toHaveProperty("user_subscription_period_end");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/cuenta/perfil");
  });

  it("no hace nada en una cuenta sin suscripción", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      user_id: "u1",
      user_subscription_status: "none",
      user_subscription_period_end: null,
    });
    const r = await cancelSubscription({ success: false });
    expect(r.success).toBe(false);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("si otra petición ya canceló (count 0) responde que ya estaba cancelada", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      user_id: "u1",
      user_subscription_status: "active",
      user_subscription_period_end: end,
    });
    mocks.updateMany.mockResolvedValue({ count: 0 });
    const r = await cancelSubscription({ success: false });
    expect(r).toEqual({ success: false, message: "Tu suscripción ya estaba cancelada." });
  });
});
