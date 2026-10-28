import "server-only";

import type { users } from "@/generated/prisma/client";
import { grantPlanCredits } from "@/lib/credits/subscription-credits";
import { getPlan, type PlanId } from "@/lib/credits/plans";
import { prisma } from "@/lib/prisma";
import {
  REACTIVATION,
  SIMULATED_PROVIDER,
  SUBSCRIPTION_CURRENCY,
  buildSimulatedActivation,
  canReactivate,
  shouldActivate,
} from "./activate";

/**
 * Activa la suscripción simulada de la CUENTA, registra el pago y abona los
 * créditos del plan (como lo haría la factura pagada de Stripe). Lo comparten
 * la pantalla de planes de la cuenta y el paso de plan del onboarding.
 * Una cancelada dentro de su periodo se reactiva sin cobrar. Devuelve false si
 * la cuenta ya tenía una suscripción vigente (no cobra dos veces). `assessmentId` solo documenta desde dónde se suscribió.
 */
export async function activateSimulatedSubscription(
  user: Pick<
    users,
    | "user_id"
    | "user_subscription_status"
    | "user_subscription_period_end"
  >,
  planId: PlanId,
  assessmentId?: string | null,
): Promise<boolean> {
  const now = new Date();
  const plan = getPlan(planId);
  if (!plan) throw new Error(`Plan desconocido: ${planId}`);

  if (canReactivate(user, now)) {
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: REACTIVATION,
    });
    return true;
  }

  if (!shouldActivate(user, now)) return false;

  const activation = buildSimulatedActivation(user.user_id, plan.id, now);
  await prisma.users.update({
    where: { user_id: user.user_id },
    data: activation,
  });
  const payment = await prisma.payments.create({
    data: {
      paym_user_id: user.user_id,
      paym_asmt_id: assessmentId ?? null,
      paym_provider: SIMULATED_PROVIDER,
      paym_amount: plan.priceMxn,
      paym_currency: SUBSCRIPTION_CURRENCY,
      paym_status: "paid",
      paym_paid_at: now,
    },
  });
  await grantPlanCredits({
    userId: user.user_id,
    plan,
    idempotencyKey: `grant:${activation.user_subscription_provider_id}`,
    paymentId: payment.paym_id,
    source: "simulated",
    billingReason: "subscription_create",
  });
  return true;
}
