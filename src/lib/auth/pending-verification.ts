import "server-only";

import { cookies } from "next/headers";

/**
 * Correo que está confirmando su código en la pantalla de verificación. Se guarda
 * en una cookie httpOnly (no en la URL) para no exponer el correo, y dice de qué
 * flujo viene para saber adónde llevar a la persona al confirmar.
 */
export const PENDING_VERIFICATION_COOKIE = "decida_pending_email";

export type VerificationFlow = "registro" | "onboarding";

export const VERIFICATION_PATHS: Record<VerificationFlow, string> = {
  registro: "/cuenta/registro/verificar",
  onboarding: "/analizar/verificar",
};

export const VERIFICATION_BACK_PATHS: Record<VerificationFlow, string> = {
  registro: "/cuenta/registro",
  onboarding: "/analizar/contacto",
};

export type PendingVerification = { email: string; flow: VerificationFlow };

export async function setPendingVerification(
  pending: PendingVerification
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_VERIFICATION_COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
}

export async function getPendingVerification(): Promise<PendingVerification | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_VERIFICATION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingVerification>;
    if (
      typeof parsed.email === "string" &&
      (parsed.flow === "registro" || parsed.flow === "onboarding")
    ) {
      return { email: parsed.email, flow: parsed.flow };
    }
  } catch {
    // cookie alterada: se trata como si no hubiera verificación pendiente
  }
  return null;
}

export async function clearPendingVerification(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_VERIFICATION_COOKIE);
}

/** Máscara para mostrar el correo sin exponerlo completo: ab***@gmail.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}
