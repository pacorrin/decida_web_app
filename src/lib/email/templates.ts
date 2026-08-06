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
