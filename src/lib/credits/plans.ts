/**
 * Planes mensuales. Cada renovación RESTABLECE el saldo a los créditos del plan
 * (no se suman a los que sobraron). Precios y créditos en MXN y créditos enteros.
 */
export type PlanId = "explora" | "valida" | "escala";

export type Plan = {
  id: PlanId;
  name: string;
  priceMxn: number;
  /** Créditos que deja cada renovación. */
  credits: number;
  highlighted: boolean;
  tagline: string;
  envPriceId: "STRIPE_PRICE_EXPLORA" | "STRIPE_PRICE_VALIDA" | "STRIPE_PRICE_ESCALA";
};

export const PLANS: readonly Plan[] = [
  {
    id: "explora",
    name: "Explora",
    priceMxn: 59,
    credits: 200,
    highlighted: false,
    tagline: "Para validar una idea a fondo",
    envPriceId: "STRIPE_PRICE_EXPLORA",
  },
  {
    id: "valida",
    name: "Valida",
    priceMxn: 149,
    credits: 600,
    highlighted: true,
    tagline: "Para comparar varias ideas cada mes",
    envPriceId: "STRIPE_PRICE_VALIDA",
  },
  {
    id: "escala",
    name: "Escala",
    priceMxn: 399,
    credits: 2000,
    highlighted: false,
    tagline: "Para asesores, incubadoras y equipos",
    envPriceId: "STRIPE_PRICE_ESCALA",
  },
] as const;

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Price id recurrente de Stripe desde env; undefined si no está configurado. */
export function getStripePriceIdForPlan(
  id: PlanId,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | undefined {
  const plan = getPlan(id);
  if (!plan) return undefined;
  return env[plan.envPriceId]?.trim() || undefined;
}

/** Subconjunto de `Stripe.Subscription` que se usa para resolver el plan. */
export type SubscriptionPlanSource = {
  metadata?: Record<string, string> | null;
  items: { data: Array<{ price?: { id?: string | null } | null }> };
};

/**
 * Plan de una suscripción de Stripe. Primero por price id (lo que cobra de
 * verdad, también tras cambiar de plan en el portal); si no hay price ids
 * configurados, por `metadata.plan_id` del checkout.
 */
export function planFromSubscription(
  sub: SubscriptionPlanSource,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Plan | undefined {
  for (const item of sub.items.data) {
    const priceId = item.price?.id;
    if (!priceId) continue;
    const match = PLANS.find((p) => env[p.envPriceId]?.trim() === priceId);
    if (match) return match;
  }
  return getPlan(sub.metadata?.plan_id);
}

/** Cuántos análisis caben en un plan (para mostrar en la UI). */
export function analysesPerPlan(plan: Plan, cost: number): number {
  return Math.floor(plan.credits / cost);
}
