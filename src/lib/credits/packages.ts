import { CREDIT_CENTESIMOS_PER_UNIT } from "./costs";

export type CreditPackageId = "credits_1" | "credits_3" | "credits_10";

export type CreditPackage = {
  id: CreditPackageId;
  /** Créditos enteros (no centésimos). */
  credits: number;
  /** Precio en MXN (pesos enteros). */
  priceMxn: number;
  /** Destacar en UI (mejor precio por análisis). */
  highlighted: boolean;
  label: string;
  envPriceId: "STRIPE_PRICE_CREDITS_1" | "STRIPE_PRICE_CREDITS_3" | "STRIPE_PRICE_CREDITS_10";
};

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  {
    id: "credits_1",
    credits: 1,
    priceMxn: 59,
    highlighted: false,
    label: "1 crédito",
    envPriceId: "STRIPE_PRICE_CREDITS_1",
  },
  {
    id: "credits_3",
    credits: 3,
    priceMxn: 149,
    highlighted: false,
    label: "3 créditos",
    envPriceId: "STRIPE_PRICE_CREDITS_3",
  },
  {
    id: "credits_10",
    credits: 10,
    priceMxn: 399,
    highlighted: true,
    label: "10 créditos",
    envPriceId: "STRIPE_PRICE_CREDITS_10",
  },
] as const;

export function getCreditPackage(
  id: string,
): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/** Centésimos de crédito que otorga el paquete. */
export function packageCreditAmount(pkg: CreditPackage): number {
  return pkg.credits * CREDIT_CENTESIMOS_PER_UNIT;
}

/** Price id de Stripe desde env; vacío si no está configurado. */
export function getStripePriceIdForPackage(
  id: CreditPackageId,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | undefined {
  const pkg = getCreditPackage(id);
  if (!pkg) return undefined;
  const value = env[pkg.envPriceId]?.trim();
  return value || undefined;
}
