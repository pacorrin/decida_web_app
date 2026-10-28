import { describe, expect, it } from "vitest";
import {
  PLANS,
  analysesPerPlan,
  getPlan,
  getStripePriceIdForPlan,
  planFromSubscription,
} from "../plans";
import { CREDIT_COST_BASIC, CREDIT_COST_RESEARCH } from "../costs";
import { spendableBalance } from "../access";

describe("plans", () => {
  it("define los tres planes con precios y créditos cerrados", () => {
    expect(PLANS.map((p) => [p.id, p.name, p.priceMxn, p.credits])).toEqual([
      ["explora", "Explora", 59, 200],
      ["valida", "Valida", 149, 600],
      ["escala", "Escala", 399, 2000],
    ]);
    expect(getPlan("valida")?.highlighted).toBe(true);
    expect(getPlan("otro")).toBeUndefined();
  });

  it("el plan más barato alcanza para un análisis con investigación", () => {
    expect(PLANS[0].credits).toBeGreaterThanOrEqual(CREDIT_COST_RESEARCH);
    expect(analysesPerPlan(PLANS[0], CREDIT_COST_RESEARCH)).toBe(1);
    expect(analysesPerPlan(PLANS[0], CREDIT_COST_BASIC)).toBe(4);
    expect(analysesPerPlan(PLANS[2], CREDIT_COST_RESEARCH)).toBe(13);
  });

  it("lee el price id de Stripe desde env", () => {
    expect(getStripePriceIdForPlan("explora", { STRIPE_PRICE_EXPLORA: " price_a " })).toBe(
      "price_a",
    );
    expect(getStripePriceIdForPlan("escala", {})).toBeUndefined();
  });

  it("resuelve el plan de una suscripción por price id, y si no por metadata", () => {
    const env = { STRIPE_PRICE_VALIDA: "price_v" };
    expect(
      planFromSubscription(
        { metadata: { plan_id: "explora" }, items: { data: [{ price: { id: "price_v" } }] } },
        env,
      )?.id,
    ).toBe("valida");
    expect(
      planFromSubscription(
        { metadata: { plan_id: "escala" }, items: { data: [{ price: { id: "price_x" } }] } },
        env,
      )?.id,
    ).toBe("escala");
    expect(planFromSubscription({ metadata: {}, items: { data: [] } }, env)).toBeUndefined();
  });

  it("con cobro fallido el saldo gastable es 0", () => {
    expect(spendableBalance({ user_credits_balance: 200, user_subscription_status: "active" })).toBe(200);
    expect(spendableBalance({ user_credits_balance: 200, user_subscription_status: "canceled" })).toBe(200);
    expect(spendableBalance({ user_credits_balance: 200, user_subscription_status: "past_due" })).toBe(0);
  });
});
