import "server-only";

import type Stripe from "stripe";
import {
  expireCreditsForEndedSubscription,
  grantCreditsForInvoice,
} from "@/lib/credits/subscription-credits";
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
    case "charge.refunded": {
      await handleStripeChargeRefunded(stripe, event.data.object as Stripe.Charge);
      return;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const user = await syncSubscription(sub, "stripe_webhook");
      // La suscripción terminó (fin del periodo tras cancelar): vencen los créditos.
      if (user && event.type === "customer.subscription.deleted") {
        await expireCreditsForEndedSubscription(user.user_id, sub.id);
      }
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
        await grantCreditsForInvoice({
          userId: user.user_id,
          sub,
          invoice: {
            id: invoice.id,
            billing_reason: invoice.billing_reason,
            amount_paid: invoice.amount_paid,
          },
        });
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
