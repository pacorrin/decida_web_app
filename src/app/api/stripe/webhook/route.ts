import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { handleStripeEvent } from "@/lib/subscription/stripe-webhook";

export const runtime = "nodejs";

/**
 * Webhook de Stripe. Sin sesión de usuario: la autenticidad la da la firma
 * sobre el cuerpo CRUDO. Firma inválida → 400; eventos desconocidos → 200.
 */
export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    return new Response("Stripe no está configurado", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Falta la firma", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  try {
    await handleStripeEvent(stripe, event);
  } catch (err) {
    // 500 para que Stripe reintente (el procesamiento es idempotente).
    console.error("[stripe-webhook] error procesando", event.type, err);
    return new Response("Error procesando el evento", { status: 500 });
  }
  return Response.json({ received: true });
}
