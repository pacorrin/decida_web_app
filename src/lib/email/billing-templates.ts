/** Correos de cobro (suscripción). Los recibos formales los manda Stripe. */

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

export function formatBillingDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(date);
}

function layout(heading: string, body: string, appUrl: string): string {
  return `
      <div style="font-family: Geist, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color:#05422c; font-size: 20px;">${heading}</h1>
        ${body}
        <p style="margin-top: 24px;">
          <a href="${appUrl}/cuenta/suscripcion" style="color:#05422c; font-size:14px;">Ver mi suscripción</a>
        </p>
        <p style="color:#3d5c50; font-size: 13px;">¿Dudas? Responde a este correo y te ayudamos.</p>
      </div>
    `;
}

const P = 'style="color:#3d5c50; font-size:15px;"';

export function subscriptionActivatedEmail(input: {
  name: string | null;
  nextDate: Date | null;
  appUrl: string;
}): { subject: string; html: string } {
  const hello = input.name ? `Hola ${escapeHtml(input.name)}, ` : "";
  const renewal = input.nextDate
    ? `Tu suscripción se renueva el ${formatBillingDate(input.nextDate)}. Puedes cancelarla cuando quieras desde tu cuenta.`
    : "Puedes cancelarla cuando quieras desde tu cuenta.";
  return {
    subject: "Tu suscripción a Decida está activa",
    html: layout(
      "Tu suscripción está activa",
      `<p ${P}>${hello}ya tienes acceso completo a tus reportes y puedes evaluar todas las ideas que quieras. Cobramos $99 MXN al mes.</p>
        <p ${P}>${renewal}</p>
        <p ${P}>Stripe te enviará por separado el recibo de tu pago.</p>`,
      input.appUrl,
    ),
  };
}

export function subscriptionReactivatedEmail(input: {
  name: string | null;
  nextDate: Date | null;
  appUrl: string;
}): { subject: string; html: string } {
  const hello = input.name ? `Hola ${escapeHtml(input.name)}, ` : "";
  const renewal = input.nextDate
    ? `Tu suscripción se renueva el ${formatBillingDate(input.nextDate)} por $99 MXN. Puedes cancelarla cuando quieras desde tu cuenta.`
    : "Puedes cancelarla cuando quieras desde tu cuenta.";
  return {
    subject: "Reactivamos tu suscripción a Decida",
    html: layout(
      "Tu suscripción fue reactivada",
      `<p ${P}>${hello}reactivamos tu suscripción y conservas el acceso completo a tus reportes.</p>
        <p ${P}>No se te cobró ahora: ya habías pagado este periodo.</p>
        <p ${P}>${renewal}</p>`,
      input.appUrl,
    ),
  };
}

export function subscriptionCanceledEmail(input: {
  name: string | null;
  accessUntil: Date | null;
  appUrl: string;
}): { subject: string; html: string } {
  const hello = input.name ? `Hola ${escapeHtml(input.name)}, ` : "";
  const until = input.accessUntil
    ? `Mantienes el acceso completo hasta el ${formatBillingDate(input.accessUntil)}; después tu cuenta vuelve al plan gratuito.`
    : "Mantienes el acceso completo hasta el fin del periodo ya pagado.";
  return {
    subject: "Cancelamos tu suscripción a Decida",
    html: layout(
      "Tu suscripción fue cancelada",
      `<p ${P}>${hello}cancelamos tu suscripción y no se te volverá a cobrar.</p>
        <p ${P}>${until}</p>
        <p ${P}>Si cambias de opinión, puedes reactivarla desde tu cuenta mientras tengas acceso.</p>`,
      input.appUrl,
    ),
  };
}

export function paymentFailedEmail(input: {
  name: string | null;
  appUrl: string;
}): { subject: string; html: string } {
  const hello = input.name ? `Hola ${escapeHtml(input.name)}, ` : "";
  return {
    subject: "No pudimos cobrar tu suscripción a Decida",
    html: layout(
      "No pudimos procesar tu pago",
      `<p ${P}>${hello}el cobro de tu suscripción no se pudo completar.</p>
        <p ${P}>Actualiza tu método de pago desde tu cuenta para no perder el acceso completo a tus reportes. Volveremos a intentar el cobro automáticamente.</p>`,
      input.appUrl,
    ),
  };
}
