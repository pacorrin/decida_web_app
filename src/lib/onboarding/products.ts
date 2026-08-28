import type { ProductItemInput } from "./schemas";

export type ProductItem = ProductItemInput;

export type BlendedProductTotals = {
  /** Units-weighted average price across all products. 0 when no units. */
  pricePerSale: number;
  /** Units-weighted average variable cost across all products. 0 when no units. */
  variableCostPerSale: number;
  /** Total estimated units sold per month across all products. */
  estimatedMonthlySales: number;
};

/**
 * Collapses a product/service list into the three scalar inputs the scoring
 * engine already consumes (`finp_price_per_sale`, `finp_variable_cost_per_sale`,
 * `finp_estimated_monthly_sales`). Weighting by monthly units keeps the derived
 * monthly gross profit exactly equal to `Σ (price_i − cost_i) · units_i`.
 */
export function blendProducts(products: ProductItem[]): BlendedProductTotals {
  const totalUnits = products.reduce((sum, p) => sum + p.monthlyUnits, 0);

  if (totalUnits <= 0) {
    return { pricePerSale: 0, variableCostPerSale: 0, estimatedMonthlySales: 0 };
  }

  const revenue = products.reduce((sum, p) => sum + p.price * p.monthlyUnits, 0);
  const cost = products.reduce(
    (sum, p) => sum + p.variableCost * p.monthlyUnits,
    0
  );

  return {
    pricePerSale: revenue / totalUnits,
    variableCostPerSale: cost / totalUnits,
    estimatedMonthlySales: totalUnits,
  };
}

/** Products sold at or below their own variable cost — a hard red flag. */
export function productsBelowCost(products: ProductItem[]): ProductItem[] {
  return products.filter((p) => p.price > 0 && p.price <= p.variableCost);
}

/** Best-effort coercion of the stored JSON blob back into a typed list. */
export function parseStoredProducts(raw: unknown): ProductItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const kind = r.kind === "servicio" ? "servicio" : "producto";
    out.push({
      name: typeof r.name === "string" ? r.name : "",
      kind,
      price: Number(r.price ?? 0) || 0,
      variableCost: Number(r.variableCost ?? 0) || 0,
      monthlyUnits: Math.trunc(Number(r.monthlyUnits ?? 0)) || 0,
    });
  }
  return out;
}
