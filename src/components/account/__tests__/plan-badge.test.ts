import { describe, expect, it } from "vitest";
import { describePlanBadge } from "../plan-badge";

const NOW = new Date("2026-10-28T12:00:00.000Z");
const future = new Date("2026-11-20T00:00:00.000Z");
const past = new Date("2026-10-01T00:00:00.000Z");
const user = (over = {}) => ({
  user_subscription_status: "active",
  user_subscription_plan: "valida",
  user_subscription_period_end: future,
  ...over,
});

describe("describePlanBadge", () => {
  it("sin plan: Gratis, sin énfasis", () => {
    expect(describePlanBadge(user({ user_subscription_status: "none", user_subscription_plan: null }), NOW)).toMatchObject({
      tier: "free",
      label: "Gratis",
      emphasis: 0,
    });
  });

  it("el énfasis sube con el precio del plan", () => {
    const emphasis = (plan: string) =>
      describePlanBadge(user({ user_subscription_plan: plan }), NOW).emphasis;
    expect(emphasis("explora")).toBe(1);
    expect(emphasis("valida")).toBe(2);
    expect(emphasis("escala")).toBe(3);
  });

  it("muestra el nombre del plan", () => {
    expect(describePlanBadge(user({ user_subscription_plan: "escala" }), NOW).label).toBe("Escala");
  });

  it("cancelado dentro del periodo conserva el plan y lo indica", () => {
    expect(describePlanBadge(user({ user_subscription_status: "canceled" }), NOW)).toMatchObject({
      tier: "valida",
      note: "cancelado",
    });
  });

  it("cancelado con el periodo vencido vuelve a Gratis", () => {
    expect(
      describePlanBadge(user({ user_subscription_status: "canceled", user_subscription_period_end: past }), NOW).tier,
    ).toBe("free");
  });

  it("cobro pendiente: conserva el plan y avisa", () => {
    expect(describePlanBadge(user({ user_subscription_status: "past_due" }), NOW)).toMatchObject({
      tier: "valida",
      note: "cobro pendiente",
    });
  });

  it("plan desconocido o «unknown» cuenta como Gratis", () => {
    expect(describePlanBadge(user({ user_subscription_plan: "unknown" }), NOW).tier).toBe("free");
  });
});
