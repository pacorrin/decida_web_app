import "server-only";

import { sendEmail } from "./resend";
import { appBaseUrl } from "./brand";
import { welcomeEmail } from "./templates";

/**
 * Manda el correo de bienvenida. Nunca lanza: un fallo de correo no debe romper
 * la confirmación de la cuenta.
 */
export async function sendWelcomeEmail(user: {
  user_email: string;
  user_name: string | null;
}): Promise<void> {
  try {
    const { subject, html } = welcomeEmail({ name: user.user_name, appUrl: appBaseUrl() });
    await sendEmail({ to: user.user_email, subject, html });
  } catch (err) {
    console.error("[welcome-email] No se pudo enviar el correo de bienvenida:", err);
  }
}
