import "server-only";

import type { users } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  REACTIVATION,
  SIMULATED_PROVIDER,
  SUBSCRIPTION_CURRENCY,
  SUBSCRIPTION_PRICE_MXN,
  buildSimulatedActivation,
  canReactivate,
  shouldActivate,
} from "./activate";

/**
 * Activa la suscripción simulada de la CUENTA y registra el pago. Lo comparten
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
  assessmentId?: string | null,
): Promise<boolean> {
  const now = new Date();

  if (canReactivate(user, now)) {
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: REACTIVATION,
    });
    return true;
  }

  if (!shouldActivate(user, now)) return false;

  await prisma.users.update({
    where: { user_id: user.user_id },
    data: buildSimulatedActivation(user.user_id, now),
  });
  await prisma.payments.create({
    data: {
      paym_user_id: user.user_id,
      paym_asmt_id: assessmentId ?? null,
      paym_provider: SIMULATED_PROVIDER,
      paym_amount: SUBSCRIPTION_PRICE_MXN,
      paym_currency: SUBSCRIPTION_CURRENCY,
      paym_status: "paid",
      paym_paid_at: now,
    },
  });
  return true;
}
