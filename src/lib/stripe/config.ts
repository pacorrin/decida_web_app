/**
 * Configuración de Stripe. Si no hay `STRIPE_SECRET_KEY` la app usa el flujo
 * de suscripción simulado (desarrollo local y e2e).
 */
export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim();
}

/**
 * Claves de prueba (`sk_test_…`): Stripe no hace cargos reales. Sirve para
 * decirlo en la landing durante la beta y dejar de decirlo con claves live.
 */
export function isStripeTestMode(): boolean {
  return process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_test_") ?? false;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

/** Precio recurrente preconfigurado en Stripe (opcional; si no, se usa `price_data`). */
export function getStripePriceId(): string | null {
  return process.env.STRIPE_PRICE_ID?.trim() || null;
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
