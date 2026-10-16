import "server-only";

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Decida <hello@decida.mx>";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  /** Remitente alterno (p. ej. billing). Por defecto, RESEND_FROM_EMAIL. */
  from?: string;
}): Promise<void> {
  const from = input.from ?? FROM_EMAIL;
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
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    // 403/422 con el remitente de pruebas (resend.dev) o un dominio sin verificar
    // significa que falta verificar el dominio en resend.com/domains (ver S3-09).
    const status = "statusCode" in error ? error.statusCode : null;
    const fromDomain = from.match(/@([^>\s]+)/)?.[1] ?? "desconocido";
    console.error(
      `[email] Resend rechazó el envío (${error.name}, HTTP ${status ?? "?"}) desde el dominio "${fromDomain}": ${error.message}. ` +
        "Si dice que el dominio no está verificado o que solo se puede enviar a tu propio correo, verifica el dominio en https://resend.com/domains y revisa RESEND_FROM_EMAIL."
    );
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
}
