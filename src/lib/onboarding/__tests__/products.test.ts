import { describe, it, expect } from "vitest";
import {
  blendProducts,
  productsBelowCost,
  parseStoredProducts,
  type ProductItem,
} from "../products";

const p = (over: Partial<ProductItem> = {}): ProductItem => ({
  name: "X",
  kind: "producto",
  price: 100,
  variableCost: 40,
  monthlyUnits: 10,
  ...over,
});

describe("blendProducts", () => {
  it("units-weighted blend keeps monthly gross profit exact", () => {
    const products = [
      p({ price: 100, variableCost: 40, monthlyUnits: 10 }), // profit 600
      p({ price: 500, variableCost: 100, monthlyUnits: 2 }), // profit 800
    ];
    const b = blendProducts(products);

    expect(b.estimatedMonthlySales).toBe(12);
    // Σ(price·units) / Σunits = (1000 + 1000) / 12
    expect(b.pricePerSale).toBeCloseTo(2000 / 12);
    expect(b.variableCostPerSale).toBeCloseTo((400 + 200) / 12);

    const blendedMonthlyProfit =
      (b.pricePerSale - b.variableCostPerSale) * b.estimatedMonthlySales;
    expect(blendedMonthlyProfit).toBeCloseTo(600 + 800);
  });

  it("returns zeros when no units are declared", () => {
    const b = blendProducts([p({ monthlyUnits: 0 }), p({ monthlyUnits: 0 })]);
    expect(b).toEqual({
      pricePerSale: 0,
      variableCostPerSale: 0,
      estimatedMonthlySales: 0,
    });
  });
});

describe("productsBelowCost", () => {
  it("flags products priced at or under their variable cost", () => {
    const flagged = productsBelowCost([
      p({ name: "Sano", price: 100, variableCost: 40 }),
      p({ name: "A pérdida", price: 30, variableCost: 50 }),
      p({ name: "Empate", price: 25, variableCost: 25 }),
      p({ name: "Sin precio", price: 0, variableCost: 10 }),
    ]);
    expect(flagged.map((x) => x.name)).toEqual(["A pérdida", "Empate"]);
  });
});

describe("parseStoredProducts", () => {
  it("coerces a stored blob back into typed rows", () => {
    const rows = parseStoredProducts([
      { name: "A", kind: "servicio", price: "150", variableCost: 20, monthlyUnits: "3.9" },
      "garbage",
      { kind: "raro" },
    ]);
    expect(rows).toEqual([
      { name: "A", kind: "servicio", price: 150, variableCost: 20, monthlyUnits: 3 },
      { name: "", kind: "producto", price: 0, variableCost: 0, monthlyUnits: 0 },
    ]);
  });

  it("returns [] for non-arrays", () => {
    expect(parseStoredProducts(null)).toEqual([]);
    expect(parseStoredProducts(undefined)).toEqual([]);
    expect(parseStoredProducts("[]")).toEqual([]);
  });
});
