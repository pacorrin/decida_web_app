import { describe, expect, it } from "vitest";
import {
  CREDIT_PACKAGES,
  getCreditPackage,
  getStripePriceIdForPackage,
  packageCreditAmount,
} from "../packages";

describe("packages", () => {
  it("define los tres paquetes con precios cerrados", () => {
    expect(CREDIT_PACKAGES.map((p) => [p.id, p.credits, p.priceMxn])).toEqual([
      ["credits_1", 1, 59],
      ["credits_3", 3, 149],
      ["credits_10", 10, 399],
    ]);
    expect(getCreditPackage("credits_10")?.highlighted).toBe(true);
  });

  it("convierte a centésimos de crédito", () => {
    expect(packageCreditAmount(getCreditPackage("credits_1")!)).toBe(100);
    expect(packageCreditAmount(getCreditPackage("credits_3")!)).toBe(300);
    expect(packageCreditAmount(getCreditPackage("credits_10")!)).toBe(1000);
  });

  it("lee el price id de Stripe desde env", () => {
    expect(
      getStripePriceIdForPackage("credits_1", {
        STRIPE_PRICE_CREDITS_1: " price_abc ",
      }),
    ).toBe("price_abc");
    expect(getStripePriceIdForPackage("credits_1", {})).toBeUndefined();
  });
});
