/**
 * La suscripción mensual queda detrás de este flag (por defecto apagada).
 * El código de suscripción se conserva; no se muestra en UI cuando es false.
 */
export function isSubscriptionsEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  const raw = (env.SUBSCRIPTIONS_ENABLED ?? "false").trim().toLowerCase();
  return raw === "true" || raw === "on" || raw === "1";
}
