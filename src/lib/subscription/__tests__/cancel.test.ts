import { describe, expect, it } from "vitest";
import { hasFullAccess } from "../access";
import { describeSubscription, planCancellation } from "../cancel";

const now = new Date("2026-10-01T12:00:00.000Z");
const end = new Date("2026-10-29T12:00:00.000Z");
const after = new Date("2026-10-30T12:00:00.000Z");

describe("planCancellation", () => {
  it("cancela una suscripción activa sin tocar period_end", () => {
    const r = planCancellation({ user_subscription_status: "active" }, now);
    expect(r).toEqual({
      ok: true,
      data: { user_subscription_status: "canceled", user_subscription_canceled_at: now },
    });
    if (r.ok) expect("user_subscription_period_end" in r.data).toBe(false);
  });

  it("es idempotente: una cancelada no vuelve a cancelarse", () => {
    expect(planCancellation({ user_subscription_status: "canceled" }, now)).toEqual({
      ok: false,
      reason: "already_canceled",
    });
  });

  it("rechaza cuentas sin suscripción o past_due", () => {
    expect(planCancellation({ user_subscription_status: "none" }, now)).toEqual({
      ok: false,
      reason: "no_subscription",
    });
    expect(planCancellation({ user_subscription_status: "past_due" }, now)).toEqual({
      ok: false,
      reason: "not_active",
    });
  });

  it("tras cancelar conserva acceso hasta period_end y luego lo pierde", () => {
    const r = planCancellation({ user_subscription_status: "active" }, now);
    if (!r.ok) throw new Error("debía cancelar");
    const after_cancel = { ...r.data, user_subscription_period_end: end };
    expect(hasFullAccess(after_cancel, now)).toBe(true);
    expect(hasFullAccess(after_cancel, new Date("2026-10-29T11:59:59.000Z"))).toBe(true);
    expect(hasFullAccess(after_cancel, after)).toBe(false);
  });
});

describe("describeSubscription", () => {
  const base = { user_subscription_canceled_at: null };
  it("mapea cada estado", () => {
    expect(
      describeSubscription({ ...base, user_subscription_status: "none", user_subscription_period_end: null }, now),
    ).toEqual({ kind: "none" });
    expect(
      describeSubscription({ ...base, user_subscription_status: "active", user_subscription_period_end: end }, now),
    ).toEqual({ kind: "active", renewsAt: end });
    expect(
      describeSubscription({ ...base, user_subscription_status: "canceled", user_subscription_period_end: end }, now),
    ).toEqual({ kind: "canceled", accessUntil: end });
    expect(
      describeSubscription({ ...base, user_subscription_status: "canceled", user_subscription_period_end: end }, after),
    ).toEqual({ kind: "expired" });
    expect(
      describeSubscription({ ...base, user_subscription_status: "past_due", user_subscription_period_end: end }, now),
    ).toEqual({ kind: "expired" });
  });
});
