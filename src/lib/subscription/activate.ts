import { hasFullAccess } from "./access";

export const SUBSCRIPTION_PLAN_ID = "monthly";
export const SUBSCRIPTION_PRICE_MXN = 99;
export const SUBSCRIPTION_CURRENCY = "MXN";
export const SIMULATED_PROVIDER = "simulated";

/** now + 1 mes calendario; si el día no existe en el mes destino, usa el último día. */
export function addOneMonth(from: Date): Date {
  const result = new Date(from.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 1);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export type SimulatedActivation = {
  user_subscription_status: "active";
  user_subscription_plan: string;
  user_subscription_period_end: Date;
  user_subscription_canceled_at: null;
  user_subscription_provider: string;
  user_subscription_provider_id: string;
};

/**
 * Campos de `users` que deja una suscripción simulada recién activada.
 * Pura: sin BD ni reloj implícito. Ver `activateSimulatedSubscription`
 * (server action) para la parte con efectos.
 */
export function buildSimulatedActivation(
  userId: string,
  now: Date = new Date(),
): SimulatedActivation {
  return {
    user_subscription_status: "active",
    user_subscription_plan: SUBSCRIPTION_PLAN_ID,
    user_subscription_period_end: addOneMonth(now),
    user_subscription_canceled_at: null,
    user_subscription_provider: SIMULATED_PROVIDER,
    user_subscription_provider_id: `sim_${userId}_${now.getTime()}`,
  };
}

/**
 * Evita cobrar (simulado) dos veces: si la cuenta ya tiene suscripción
 * vigente y no cancelada, no hay nada que activar.
 */
export function shouldActivate(
  user: Parameters<typeof hasFullAccess>[0],
  now: Date = new Date(),
): boolean {
  if (!user) return true;
  if (user.user_subscription_status === "active") return !hasFullAccess(user, now);
  return true; // none, past_due o canceled (re-suscripción)
}
