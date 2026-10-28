import "server-only";

import type { users } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PlanId } from "@/lib/credits/plans";
import { getStripe } from "@/lib/stripe/client";
import { trackServer } from "@/lib/analytics/server";
import { sendBillingEmail } from "@/lib/email/billing";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { REACTIVATION, canReactivate, shouldActivate } from "./activate";
import { activateSimulatedSubscription } from "./subscribe";
import { createCheckoutSession } from "./stripe-checkout";
import { describeStripeError } from "./stripe-errors";

export type SubscriptionEntryPoint = "account" | "onboarding";

export const RETURN_PATHS: Record<SubscriptionEntryPoint, string> = {
  account: "/cuenta/suscripcion",
  onboarding: "/analizar/pago",
};

export type StartSubscriptionResult =
  | { kind: "activated" } // simulado, o reactivación
  | { kind: "already" } // la cuenta ya tiene suscripción vigente
  | { kind: "redirect"; url: string } // ir a Stripe Checkout
  | { kind: "error"; message: string };

type StartUser = Pick<
  users,
  | "user_id"
  | "user_email"
  | "user_subscription_status"
  | "user_subscription_period_end"
  | "user_subscription_provider"
  | "user_subscription_provider_id"
  | "user_stripe_customer_id"
>;

/**
 * Punto único de «Suscribirme a un plan» (cuenta y onboarding). Con Stripe habilitado
 * crea una Checkout Session y devuelve su URL (el llamador redirige, fuera de
 * try/catch); sin él ejecuta el flujo simulado. Una cancelada dentro de su
 * periodo se reactiva sin cobrar (en Stripe: cancel_at_period_end=false).
 * `subscription_activated` solo se emite aquí para el flujo simulado y las
 * reactivaciones; el cobro real lo emite `applyStripeSubscription`.
 */
export async function startSubscription(
  user: StartUser,
  opts: {
    returnTo: SubscriptionEntryPoint;
    planId: PlanId;
    assessmentId?: string | null;
  },
): Promise<StartSubscriptionResult> {
  const now = new Date();
  const stripe = getStripe();
  const track = () =>
    trackServer(user.user_id, ANALYTICS_EVENTS.subscriptionActivated, {
      entry_point: opts.returnTo,
    });

  // Reactivar dentro del periodo pagado: sin cobro ni cambio de period_end.
  if (canReactivate(user, now)) {
    if (
      stripe &&
      user.user_subscription_provider === "stripe" &&
      user.user_subscription_provider_id
    ) {
      try {
        await stripe.subscriptions.update(user.user_subscription_provider_id, {
          cancel_at_period_end: false,
        });
      } catch (err) {
        return { kind: "error", message: describeStripeError(err) };
      }
      // Condicionado al estado: si el webhook ya lo reactivó, no se duplica el correo.
      const { count } = await prisma.users.updateMany({
        where: { user_id: user.user_id, user_subscription_status: "canceled" },
        data: REACTIVATION,
      });
      if (count > 0) {
        await sendBillingEmail(user.user_id, {
          kind: "reactivated",
          nextDate: user.user_subscription_period_end,
        });
      }
      await track();
      return { kind: "activated" };
    }
    await activateSimulatedSubscription(user, opts.planId, opts.assessmentId);
    await track();
    return { kind: "activated" };
  }

  if (!shouldActivate(user, now)) return { kind: "already" };

  if (!stripe) {
    const activated = await activateSimulatedSubscription(user, opts.planId, opts.assessmentId);
    if (!activated) return { kind: "already" };
    await track();
    return { kind: "activated" };
  }

  try {
    // Una suscripción past_due anterior se cierra para no cobrar dos veces.
    if (
      user.user_subscription_provider === "stripe" &&
      user.user_subscription_status === "past_due" &&
      user.user_subscription_provider_id
    ) {
      await stripe.subscriptions
        .cancel(user.user_subscription_provider_id)
        .catch(() => undefined);
    }
    const url = await createCheckoutSession(
      stripe,
      user,
      RETURN_PATHS[opts.returnTo],
      opts.planId,
    );
    return { kind: "redirect", url };
  } catch (err) {
    return { kind: "error", message: describeStripeError(err) };
  }
}
