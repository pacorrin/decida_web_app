/**
 * Configuración de Stripe. Si no hay `STRIPE_SECRET_KEY` la app usa el flujo
 * de suscripción simulado (desarrollo local y e2e).
 */
export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim();
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
