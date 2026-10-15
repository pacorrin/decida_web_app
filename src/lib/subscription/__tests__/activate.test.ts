import { describe, expect, it } from "vitest";
import {
  addOneMonth,
  buildSimulatedActivation,
  shouldActivate,
} from "../activate";

const now = new Date("2026-10-14T12:00:00.000Z");

describe("addOneMonth", () => {
  it("suma un mes calendario", () => {
    expect(addOneMonth(now).toISOString()).toBe("2026-11-14T12:00:00.000Z");
  });
  it("recorta al último día del mes destino", () => {
    expect(addOneMonth(new Date("2026-01-31T10:00:00.000Z")).toISOString()).toBe(
      "2026-02-28T10:00:00.000Z",
    );
  });
  it("cruza el fin de año", () => {
    expect(addOneMonth(new Date("2026-12-15T00:00:00.000Z")).toISOString()).toBe(
      "2027-01-15T00:00:00.000Z",
    );
  });
});

describe("buildSimulatedActivation", () => {
  it("deja la cuenta activa con proveedor simulado y sin cancelación", () => {
    const data = buildSimulatedActivation("u1", now);
    expect(data.user_subscription_status).toBe("active");
    expect(data.user_subscription_plan).toBe("monthly");
    expect(data.user_subscription_provider).toBe("simulated");
    expect(data.user_subscription_canceled_at).toBeNull();
    expect(data.user_subscription_period_end).toEqual(addOneMonth(now));
    expect(data.user_subscription_provider_id).toContain("u1");
  });
});

describe("shouldActivate", () => {
  const future = new Date("2026-11-01T00:00:00.000Z");
  it("activa cuentas none, past_due y canceladas vencidas", () => {
    for (const status of ["none", "past_due", "canceled"] as const) {
      expect(
        shouldActivate(
          { user_subscription_status: status, user_subscription_period_end: null },
          now,
        ),
      ).toBe(true);
    }
  });
  it("no vuelve a activar una suscripción vigente", () => {
    expect(
      shouldActivate(
        { user_subscription_status: "active", user_subscription_period_end: future },
        now,
      ),
    ).toBe(false);
  });
  it("reactiva una activa vencida", () => {
    expect(
      shouldActivate(
        {
          user_subscription_status: "active",
          user_subscription_period_end: new Date("2026-10-01T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });
});
