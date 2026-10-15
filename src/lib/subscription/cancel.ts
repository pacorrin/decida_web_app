import type { users } from "@/generated/prisma/client";

export type SubscriptionState = Pick<
  users,
  | "user_subscription_status"
  | "user_subscription_period_end"
  | "user_subscription_canceled_at"
>;

export type CancelResult =
  | {
      ok: true;
      data: {
        user_subscription_status: "canceled";
        user_subscription_canceled_at: Date;
      };
    }
  | { ok: false; reason: "already_canceled" | "no_subscription" | "not_active" };

/**
 * Decide si una suscripción puede cancelarse y qué campos cambian.
 * Nunca toca `user_subscription_period_end`: el acceso completo se conserva
 * hasta esa fecha (ver `hasFullAccess`). Función pura, sin acceso a BD.
 */
export function planCancellation(
  user: Pick<users, "user_subscription_status">,
  now: Date = new Date(),
): CancelResult {
  switch (user.user_subscription_status) {
    case "active":
      return {
        ok: true,
        data: {
          user_subscription_status: "canceled",
          user_subscription_canceled_at: now,
        },
      };
    case "canceled":
      return { ok: false, reason: "already_canceled" };
    case "none":
      return { ok: false, reason: "no_subscription" };
    default:
      return { ok: false, reason: "not_active" };
  }
}

export const CANCEL_MESSAGES: Record<
  Extract<CancelResult, { ok: false }>["reason"],
  string
> = {
  already_canceled: "Tu suscripción ya estaba cancelada.",
  no_subscription: "Tu cuenta no tiene una suscripción activa.",
  not_active: "Tu suscripción no está activa, no hay nada que cancelar.",
};

export type SubscriptionView =
  | { kind: "none" }
  | { kind: "active"; renewsAt: Date | null }
  | { kind: "canceled"; accessUntil: Date }
  | { kind: "expired" };

/** Estado de presentación para la UI (la regla de acceso sigue en access.ts). */
export function describeSubscription(
  user: SubscriptionState,
  now: Date = new Date(),
): SubscriptionView {
  const end = user.user_subscription_period_end;
  switch (user.user_subscription_status) {
    case "active":
      if (end && end <= now) return { kind: "expired" };
      return { kind: "active", renewsAt: end };
    case "canceled":
      if (end && end > now) return { kind: "canceled", accessUntil: end };
      return { kind: "expired" };
    case "past_due":
      return { kind: "expired" };
    default:
      return { kind: "none" };
  }
}
