import { describe, expect, it } from "vitest";
import { hasFullAccess } from "../access";

const now = new Date("2026-09-29T18:00:00.000Z");
const future = new Date("2026-10-29T18:00:00.000Z");
const past = new Date("2026-08-29T18:00:00.000Z");

describe("hasFullAccess", () => {
  it("denies access when there is no user", () => {
    expect(hasFullAccess(null, now)).toBe(false);
    expect(hasFullAccess(undefined, now)).toBe(false);
  });

  it("denies access when the account never subscribed", () => {
    expect(
      hasFullAccess(
        { user_subscription_status: "none", user_subscription_period_end: null },
        now,
      ),
    ).toBe(false);
  });

  it("grants access to an active subscription with no period end", () => {
    expect(
      hasFullAccess(
        { user_subscription_status: "active", user_subscription_period_end: null },
        now,
      ),
    ).toBe(true);
  });

  it("grants access to an active subscription still inside the paid period", () => {
    expect(
      hasFullAccess(
        { user_subscription_status: "active", user_subscription_period_end: future },
        now,
      ),
    ).toBe(true);
  });

  it("denies access to an active subscription after the period ends", () => {
    expect(
      hasFullAccess(
        { user_subscription_status: "active", user_subscription_period_end: past },
        now,
      ),
    ).toBe(false);
  });

  it("keeps access after cancellation until the paid period ends", () => {
    expect(
      hasFullAccess(
        {
          user_subscription_status: "canceled",
          user_subscription_period_end: future,
        },
        now,
      ),
    ).toBe(true);
  });

  it("denies access after a canceled period has ended", () => {
    expect(
      hasFullAccess(
        { user_subscription_status: "canceled", user_subscription_period_end: past },
        now,
      ),
    ).toBe(false);
  });

  it("denies access immediately when the payment is past due", () => {
    expect(
      hasFullAccess(
        {
          user_subscription_status: "past_due",
          user_subscription_period_end: future,
        },
        now,
      ),
    ).toBe(false);
  });
});
