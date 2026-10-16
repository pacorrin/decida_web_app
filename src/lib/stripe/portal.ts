import "server-only";

import { getAppUrl } from "./config";
import { getStripe } from "./client";

/**
 * URL del Customer Portal de Stripe (método de pago, facturas). Devuelve null
 * si Stripe no está habilitado. Requiere activar el portal en el Dashboard
 * (Settings → Billing → Customer portal).
 */
export async function createPortalUrl(
  customerId: string,
  returnPath = "/cuenta/suscripcion",
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}${returnPath}`,
  });
  return session.url;
}
