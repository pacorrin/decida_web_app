import { describe, expect, it } from "vitest";
import { hasFullAccess } from "../access";
import {
  mapStripeSubscription,
  shouldApplyStripeSubscription,
  stripePeriodEnd,
  type StripeSubscriptionLike,
} from "../stripe-mapping";

const NOW = new Date("2026-10-10T12:00:00.000Z");
const END_S = Math.floor(new Date("2026-11-01T00:00:00.000Z").getTime() / 1000);
const END = new Date(END_S * 1000);

const sub = (over: Partial<StripeSubscriptionLike> = {}): StripeSubscriptionLike => ({
  id: "sub_1",
  status: "active",
  cancel_at_period_end: false,
  canceled_at: null,
  items: { data: [{ current_period_end: END_S }] },
  ...over,
});

describe("mapStripeSubscription", () => {
  it("active sin cancelar → active con period_end de Stripe", () => {
    const r = mapStripeSubscription(sub(), NOW)!;
    expect(r.user_subscription_status).toBe("active");
    expect(r.user_subscription_period_end).toEqual(END);
    expect(r.user_subscription_canceled_at).toBeNull();
    expect(r.user_subscription_provider).toBe("stripe");
    expect(r.user_subscription_provider_id).toBe("sub_1");
  });

  it("trialing se trata como active", () => {
    expect(mapStripeSubscription(sub({ status: "trialing" }), NOW)!.user_subscription_status).toBe("active");
  });

  it("cancel_at_period_end → canceled con period_end intacto y acceso hasta esa fecha", () => {
    const r = mapStripeSubscription(
      sub({ cancel_at_period_end: true, canceled_at: Math.floor(NOW.getTime() / 1000) }),
      NOW,
    )!;
    expect(r.user_subscription_status).toBe("canceled");
    expect(r.user_subscription_period_end).toEqual(END);
    expect(hasFullAccess(r, NOW)).toBe(true);
    expect(hasFullAccess(r, new Date(END.getTime() + 1000))).toBe(false);
  });

  it.each(["past_due", "unpaid", "paused"])("%s → past_due sin acceso", (status) => {
    const r = mapStripeSubscription(sub({ status }), NOW)!;
    expect(r.user_subscription_status).toBe("past_due");
    expect(hasFullAccess(r, NOW)).toBe(false);
  });

  it.each(["canceled", "incomplete_expired"])("%s → canceled con el period_end vigente", (status) => {
    const r = mapStripeSubscription(sub({ status }), NOW)!;
    expect(r.user_subscription_status).toBe("canceled");
    expect(r.user_subscription_period_end).toEqual(END);
  });

  it("incomplete no cambia nada", () => {
    expect(mapStripeSubscription(sub({ status: "incomplete" }), NOW)).toBeNull();
  });

  it("reactivar (cancel_at_period_end=false) vuelve a active y limpia canceled_at", () => {
    const r = mapStripeSubscription(sub({ cancel_at_period_end: false, canceled_at: 123 }), NOW)!;
    expect(r.user_subscription_status).toBe("active");
    expect(r.user_subscription_canceled_at).toBeNull();
  });
});

describe("stripePeriodEnd", () => {
  it("usa el menor current_period_end de los items; null sin items", () => {
    expect(
      stripePeriodEnd(sub({ items: { data: [{ current_period_end: END_S + 100 }, { current_period_end: END_S }] } })),
    ).toEqual(END);
    expect(stripePeriodEnd(sub({ items: { data: [] } }))).toBeNull();
  });
});

describe("shouldApplyStripeSubscription", () => {
  const base = { user_subscription_period_end: END, user_subscription_status: "active" };
  it("acepta la suscripción actual, o cualquiera si la cuenta no tiene", () => {
    expect(shouldApplyStripeSubscription({ ...base, user_subscription_provider_id: "sub_1" }, "sub_1", NOW)).toBe(true);
    expect(shouldApplyStripeSubscription({ ...base, user_subscription_provider_id: null }, "sub_9", NOW)).toBe(true);
  });
  it("ignora una suscripción vieja si otra distinta da acceso hoy", () => {
    expect(shouldApplyStripeSubscription({ ...base, user_subscription_provider_id: "sub_new" }, "sub_old", NOW)).toBe(false);
  });
  it("deja que una nueva reemplace a una past_due", () => {
    expect(
      shouldApplyStripeSubscription(
        { user_subscription_status: "past_due", user_subscription_period_end: END, user_subscription_provider_id: "sub_old" },
        "sub_new",
        NOW,
      ),
    ).toBe(true);
  });
});

describe("plan de la suscripción", () => {
  it("lo toma de la metadata del checkout cuando no hay price ids configurados", () => {
    const r = mapStripeSubscription(sub({ metadata: { plan_id: "valida" } }), NOW)!;
    expect(r.user_subscription_plan).toBe("valida");
  });

  it("si no se reconoce el plan, guarda «unknown» en vez de inventar uno", () => {
    expect(mapStripeSubscription(sub(), NOW)!.user_subscription_plan).toBe("unknown");
  });
});
