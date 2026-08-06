import "server-only";

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Decida <onboarding@decida.app>";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY no está configurado. No se puede enviar correo en producción."
      );
    }
    console.log(
      `[email:dev] Para: ${input.to} | Asunto: ${input.subject}\n${input.html}`
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
}
