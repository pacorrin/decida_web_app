import "server-only";

import { requestAuthCode } from "./verification";
import { sendEmail } from "@/lib/email/resend";
import { verificationCodeEmail } from "@/lib/email/templates";

/**
 * Genera y envía el código de confirmación de correo. Nunca lanza: si el envío
 * falla devuelve un mensaje para mostrar en la pantalla.
 */
export async function sendSignupCode(
  email: string
): Promise<{ success: true } | { success: false; message: string }> {
  const codeResult = await requestAuthCode(email, "signup_verification");
  if (!codeResult.success) return codeResult;

  const { subject, html } = verificationCodeEmail(codeResult.code, "signup");
  try {
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.error("[signup] no se pudo enviar el código:", err);
    return {
      success: false,
      message: "No pudimos enviar el código a tu correo. Inténtalo de nuevo en un momento.",
    };
  }
  return { success: true };
}
