/** El reporte completo se desbloquea solo cuando la evaluación fue cobrada. */
export function hasReportAccess(assessment: {
  asmt_credits_charged_at: Date | null | undefined;
}): boolean {
  return assessment.asmt_credits_charged_at != null;
}
