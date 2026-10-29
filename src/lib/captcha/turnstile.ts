import "server-only";

import { headers } from "next/headers";

import { TURNSTILE_FIELD } from "./constants";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5_000;

/** Solo se puede apagar fuera de producción (desarrollo y e2e). */
function disabledForDev(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.TURNSTILE_DISABLED === "true";
}

/**
 * Clave pública del widget, o `null` si no se debe mostrar (apagado en desarrollo
 * o sin configurar). En producción sin claves el servidor rechaza el envío, así
 * que un olvido se nota de inmediato en lugar de dejar el formulario abierto.
 */
export function turnstileSiteKey(): string | null {
  if (disabledForDev()) return null;
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export type CaptchaFailureReason = "missing_token" | "rejected" | "unavailable" | "not_configured";

type VerifyResult =
  | { success: true }
  | { success: false; message: string; reason: CaptchaFailureReason };

const MISSING_TOKEN: VerifyResult = {
  success: false,
  reason: "missing_token",
  message: "Espera a que termine la verificación de seguridad e inténtalo de nuevo.",
};

async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

/**
 * Valida con Cloudflare el token del widget. Falla cerrado: sin secreto en
 * producción, sin token, con respuesta negativa o si Cloudflare no responde,
 * el formulario no se procesa.
 */
export async function verifyTurnstile(formData: FormData): Promise<VerifyResult> {
  if (disabledForDev()) return { success: true };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] Falta TURNSTILE_SECRET_KEY: se rechaza el formulario.");
      return {
        success: false,
        reason: "not_configured",
        message: "No pudimos verificar tu solicitud. Inténtalo más tarde.",
      };
    }
    return { success: true };
  }

  const token = formData.get(TURNSTILE_FIELD);
  if (typeof token !== "string" || !token) return MISSING_TOKEN;

  const body = new URLSearchParams({ secret, response: token });
  const ip = await clientIp();
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success) return { success: true };
    console.warn("[turnstile] token rechazado:", data["error-codes"]?.join(",") ?? "sin código");
    return {
      success: false,
      reason: "rejected",
      message: "No pudimos verificar que eres una persona. Inténtalo de nuevo.",
    };
  } catch (err) {
    console.error("[turnstile] no se pudo validar el token:", err);
    return {
      success: false,
      reason: "unavailable",
      message: "No pudimos completar la verificación de seguridad. Inténtalo de nuevo.",
    };
  }
}
