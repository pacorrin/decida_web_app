import { hasFullAccess } from "./access";
import { planFromSubscription } from "@/lib/credits/plans";

/** Subconjunto de `Stripe.Subscription` que usamos (facilita probar sin SDK). */
export type StripeSubscriptionLike = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  canceled_at?: number | null;
  metadata?: Record<string, string> | null;
  items: {
    data: Array<{
      current_period_end: number;
      price?: { id?: string | null } | null;
    }>;
  };
};

export type StripeSubscriptionUpdate = {
  user_subscription_status: "active" | "canceled" | "past_due";
  user_subscription_plan: string;
  user_subscription_period_end: Date | null;
  user_subscription_canceled_at: Date | null;
  user_subscription_provider: "stripe";
  user_subscription_provider_id: string;
};

/**
 * Fin del periodo actual. En las versiones recientes de la API vive en los
 * items de la suscripción (no en la suscripción). Con varios items toma el
 * menor, que es el que cobra primero.
 */
export function stripePeriodEnd(sub: StripeSubscriptionLike): Date | null {
  const ends = sub.items.data
    .map((i) => i.current_period_end)
    .filter((n): n is number => typeof n === "number");
  if (ends.length === 0) return null;
  return new Date(Math.min(...ends) * 1000);
}

/**
 * Estado de Stripe → campos de `users`. Pura.
 * - active/trialing sin cancelar → active
 * - active/trialing con cancel_at_period_end → canceled (period_end intacto:
 *   el acceso sigue hasta esa fecha, ver `hasFullAccess`)
 * - past_due / unpaid / paused → past_due
 * - canceled / incomplete_expired → canceled con el period_end vigente
 * - incomplete (primer pago aún sin confirmar) → null: no cambia nada
 */
export function mapStripeSubscription(
  sub: StripeSubscriptionLike,
  now: Date = new Date(),
): StripeSubscriptionUpdate | null {
  const periodEnd = stripePeriodEnd(sub);
  const base = {
    // Plan por lo que cobra Stripe; si no se reconoce, se conserva el id genérico.
    user_subscription_plan: planFromSubscription(sub)?.id ?? "unknown",
    user_subscription_period_end: periodEnd,
    user_subscription_provider: "stripe" as const,
    user_subscription_provider_id: sub.id,
  };
  const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : now;

  switch (sub.status) {
    case "active":
    case "trialing":
      return sub.cancel_at_period_end
        ? {
            ...base,
            user_subscription_status: "canceled",
            user_subscription_canceled_at: canceledAt,
          }
        : {
            ...base,
            user_subscription_status: "active",
            user_subscription_canceled_at: null,
          };
    case "past_due":
    case "unpaid":
    case "paused":
      return {
        ...base,
        user_subscription_status: "past_due",
        user_subscription_canceled_at: null,
      };
    case "canceled":
    case "incomplete_expired":
      return {
        ...base,
        user_subscription_status: "canceled",
        user_subscription_canceled_at: canceledAt,
      };
    default:
      return null;
  }
}

/**
 * Evita que un evento de una suscripción vieja (p. ej. la past_due que se
 * reemplazó por una nueva) pise a la que hoy da acceso a la cuenta.
 */
export function shouldApplyStripeSubscription(
  user: {
    user_subscription_status: string;
    user_subscription_period_end: Date | null;
    user_subscription_provider_id: string | null;
  },
  subscriptionId: string,
  now: Date = new Date(),
): boolean {
  const current = user.user_subscription_provider_id;
  if (!current || current === subscriptionId) return true;
  return !hasFullAccess(
    {
      user_subscription_status: user.user_subscription_status as never,
      user_subscription_period_end: user.user_subscription_period_end,
    },
    now,
  );
}
