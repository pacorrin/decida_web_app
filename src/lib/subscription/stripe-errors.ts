/** Mensaje comprensible (en español) para un error del SDK de Stripe. */
export function describeStripeError(err: unknown): string {
  const type = (err as { type?: string } | null)?.type;
  if (type === "StripeConnectionError") {
    return "No pudimos conectar con el procesador de pagos. Intenta de nuevo en un momento.";
  }
  if (type === "StripeRateLimitError") {
    return "Hay muchas solicitudes ahora mismo. Intenta de nuevo en unos segundos.";
  }
  if (type === "StripeAuthenticationError") {
    return "El pago no está disponible por un problema de configuración. Escríbenos y lo resolvemos.";
  }
  return "No pudimos completar la operación con el procesador de pagos. Intenta de nuevo.";
}
