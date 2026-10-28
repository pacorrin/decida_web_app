/** El reporte completo se desbloquea solo cuando la evaluación fue cobrada. */
export function hasReportAccess(assessment: {
  asmt_credits_charged_at: Date | null | undefined;
}): boolean {
  return assessment.asmt_credits_charged_at != null;
}

/**
 * Saldo que se puede gastar ahora. Con el cobro fallido (`past_due`) el gasto
 * se bloquea hasta regularizar el pago: se trata como saldo 0.
 */
export function spendableBalance(user: {
  user_credits_balance: number;
  user_subscription_status: string;
}): number {
  return user.user_subscription_status === "past_due" ? 0 : user.user_credits_balance;
}
