export function verificationCodeEmail(
  code: string,
  purpose: "signup" | "reset"
): { subject: string; html: string } {
  const heading =
    purpose === "signup"
      ? "Confirma tu cuenta en Decida"
      : "Restablece tu contraseña en Decida";
  const intro =
    purpose === "signup"
      ? "Usa este código para confirmar tu correo y activar tu cuenta."
      : "Usa este código para restablecer tu contraseña.";

  return {
    subject:
      purpose === "signup"
        ? "Tu código de verificación — Decida"
        : "Restablece tu contraseña — Decida",
    html: `
      <div style="font-family: Geist, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color:#05422c; font-size: 20px;">${heading}</h1>
        <p style="color:#3d5c50; font-size:15px;">${intro}</p>
        <p style="font-size: 32px; font-weight: 600; letter-spacing: 6px; color:#05422c; text-align:center; padding: 16px; background:#f0f5f3; border-radius:10px;">${code}</p>
        <p style="color:#3d5c50; font-size: 13px;">Este código expira en 15 minutos. Si no lo solicitaste, ignora este correo.</p>
      </div>
    `,
  };
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

/** Correo de bienvenida: se manda una sola vez, al confirmar el correo de la cuenta. */
export function welcomeEmail(input: {
  name: string | null;
  appUrl: string;
}): { subject: string; html: string } {
  const hello = input.name ? `Hola ${escapeHtml(input.name)}, tu` : "Tu";
  const p = 'style="color:#3d5c50; font-size:15px; line-height:1.5;"';
  return {
    subject: "Te damos la bienvenida a Decida",
    html: `
      <div style="font-family: Geist, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color:#05422c; font-size: 20px;">Te damos la bienvenida a Decida</h1>
        <p ${p}>${hello} cuenta está lista.</p>
        <p ${p}>Decida evalúa tu idea de negocio contra tus condiciones reales (tiempo, presupuesto, perfil, mercado y riesgo) y te dice si conviene probarla a pequeña escala, validarla primero, ajustarla o pausarla.</p>
        <p ${p}>Tu primera evaluación es gratis y tarda unos 15 a 20 minutos.</p>
        <p style="margin: 24px 0;">
          <a href="${input.appUrl}/analizar" style="background:#05422c; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-size:15px; display:inline-block;">Analizar mi idea</a>
        </p>
        <p ${p}>Decida está en beta: si algo no te cuadra o tienes una sugerencia, cuéntanos desde tu cuenta o responde a este correo.</p>
        <p style="color:#3d5c50; font-size: 13px;">¿Dudas? Responde a este correo y te ayudamos.</p>
      </div>
    `,
  };
}
