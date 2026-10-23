import { describe, expect, it } from "vitest";
import { isSubscriptionsEnabled } from "../flag";

describe("isSubscriptionsEnabled", () => {
  it("está apagada por defecto", () => {
    expect(isSubscriptionsEnabled({})).toBe(false);
    expect(isSubscriptionsEnabled({ SUBSCRIPTIONS_ENABLED: "" })).toBe(false);
  });

  it("se enciende con true/on/1", () => {
    expect(isSubscriptionsEnabled({ SUBSCRIPTIONS_ENABLED: "true" })).toBe(true);
    expect(isSubscriptionsEnabled({ SUBSCRIPTIONS_ENABLED: "ON" })).toBe(true);
    expect(isSubscriptionsEnabled({ SUBSCRIPTIONS_ENABLED: "1" })).toBe(true);
  });
});
