import "server-only";

import type Stripe from "stripe";
import { fulfillCreditCheckoutSession } from "@/lib/credits/fulfill";
import { handleStripeChargeRefunded } from "@/lib/credits/refund-stripe";
import { sendBillingEmail } from "@/lib/email/billing";
import {
  applyStripeSubscription,
  findUserForStripe,
  recordStripeInvoicePayment,
} from "./stripe-sync";

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === "string" ? v : v.id;

async function syncSubscription(
  sub: Stripe.Subscription,
  entryPoint: string,
  hintUserId?: string | null,
) {
  const user = await findUserForStripe({
    customerId: idOf(sub.customer),
    userId: sub.metadata?.user_id ?? hintUserId,
  });
  if (!user) return null;
  await applyStripeSubscription(user.user_id, sub, entryPoint);
  return user;
}

/** Despacha un evento ya verificado. Los tipos desconocidos se ignoran. */
export async function handleStripeEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment") {
        await fulfillCreditCheckoutSession(session);
        return;
      }
      if (session.mode !== "subscription") return;
      const subId = idOf(session.subscription);
      if (!subId) return;
      const sub = await stripe.subscriptions.retrieve(subId);
      await syncSubscription(
        sub,
        "stripe_webhook",
        session.metadata?.user_id ?? session.client_reference_id,
      );
      return;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillCreditCheckoutSession(session);
      return;
    }
    case "charge.refunded": {
      await handleStripeChargeRefunded(event.data.object as Stripe.Charge);
      return;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(
        event.data.object as Stripe.Subscription,
        "stripe_webhook",
      );
      return;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = idOf(invoice.parent?.subscription_details?.subscription);
      if (!subId) return; // factura que no es de una suscripción
      const sub = await stripe.subscriptions.retrieve(subId);
      const user = await syncSubscription(
        sub,
        "stripe_webhook",
        invoice.parent?.subscription_details?.metadata?.user_id,
      );
      if (user && event.type === "invoice.paid") {
        await recordStripeInvoicePayment(user.user_id, invoice);
      }
      // Stripe reintenta el cobro varias veces y emite este evento en cada
      // intento: se avisa solo en el primero.
      if (
        user &&
        event.type === "invoice.payment_failed" &&
        invoice.attempt_count === 1
      ) {
        await sendBillingEmail(user.user_id, { kind: "payment_failed" });
      }
      return;
    }
    default:
      return;
  }
}
