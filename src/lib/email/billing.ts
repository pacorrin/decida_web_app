import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "./resend";
import {
  paymentFailedEmail,
  subscriptionActivatedEmail,
  subscriptionCanceledEmail,
  subscriptionReactivatedEmail,
} from "./billing-templates";

const BILLING_FROM =
  process.env.RESEND_BILLING_FROM_EMAIL ?? "Decida <billing@decida.mx>";

export type BillingEmail =
  | { kind: "activated"; nextDate: Date | null }
  | { kind: "canceled"; accessUntil: Date | null }
  | { kind: "reactivated"; nextDate: Date | null }
  | { kind: "payment_failed" };

/**
 * Manda un correo de cobro a la cuenta. Nunca lanza: un fallo de correo no
 * debe hacer que Stripe reintente el webhook ni romper la cancelación.
 */
export async function sendBillingEmail(
  userId: string,
  email: BillingEmail,
): Promise<void> {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_email: true, user_name: true },
    });
    if (!user) return;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    const content =
      email.kind === "activated"
        ? subscriptionActivatedEmail({ name: user.user_name, nextDate: email.nextDate, appUrl })
        : email.kind === "reactivated"
          ? subscriptionReactivatedEmail({ name: user.user_name, nextDate: email.nextDate, appUrl })
          : email.kind === "canceled"
            ? subscriptionCanceledEmail({ name: user.user_name, accessUntil: email.accessUntil, appUrl })
            : paymentFailedEmail({ name: user.user_name, appUrl });

    await sendEmail({ to: user.user_email, from: BILLING_FROM, ...content });
  } catch (err) {
    console.error(`[billing-email] No se pudo enviar el correo "${email.kind}":`, err);
  }
}
