import "server-only";

import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  AUTH_CODE_TTL_MS,
  AUTH_METHOD,
  MAX_AUTH_CODE_ATTEMPTS,
  MAX_AUTH_CODES_PER_HOUR,
} from "./constants";

export type AuthCodePurpose = "signup_verification" | "password_reset";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateSixDigitCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function requestAuthCode(
  email: string,
  purpose: AuthCodePurpose
): Promise<
  | { success: true; code: string }
  | { success: false; message: string }
> {
  const identifier = normalizeEmail(email);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentCount = await prisma.verification_codes.count({
    where: {
      vc_identifier: identifier,
      vc_method: AUTH_METHOD,
      vc_purpose: purpose,
      vc_created_at: { gte: oneHourAgo },
    },
  });

  if (recentCount >= MAX_AUTH_CODES_PER_HOUR) {
    return {
      success: false,
      message: "Demasiados intentos. Espera un momento antes de solicitar otro código.",
    };
  }

  const now = new Date();

  await prisma.verification_codes.updateMany({
    where: {
      vc_identifier: identifier,
      vc_method: AUTH_METHOD,
      vc_purpose: purpose,
      vc_used_at: null,
      vc_expires_at: { gt: now },
    },
    data: { vc_used_at: now },
  });

  const code = generateSixDigitCode();

  await prisma.verification_codes.create({
    data: {
      vc_identifier: identifier,
      vc_method: AUTH_METHOD,
      vc_purpose: purpose,
      vc_code: code,
      vc_expires_at: new Date(Date.now() + AUTH_CODE_TTL_MS),
    },
  });

  return { success: true, code };
}

const INVALID_CODE = {
  success: false as const,
  message: "Código inválido o expirado. Solicita uno nuevo.",
};

/**
 * Compara el código con el último vigente del correo. Cada fallo cuenta como un
 * intento; al llegar al tope el código se invalida, así que un código de 6 dígitos
 * no se puede adivinar a base de fuerza bruta.
 */
async function matchActiveCode(
  email: string,
  code: string,
  purpose: AuthCodePurpose
): Promise<
  { success: true; id: string } | { success: false; message: string }
> {
  const identifier = normalizeEmail(email);
  const now = new Date();

  const record = await prisma.verification_codes.findFirst({
    where: {
      vc_identifier: identifier,
      vc_method: AUTH_METHOD,
      vc_purpose: purpose,
      vc_used_at: null,
      vc_expires_at: { gt: now },
    },
    orderBy: { vc_created_at: "desc" },
  });

  if (!record || record.vc_attempts >= MAX_AUTH_CODE_ATTEMPTS) {
    return INVALID_CODE;
  }

  if (record.vc_code !== code.trim()) {
    const attempts = record.vc_attempts + 1;
    await prisma.verification_codes.update({
      where: { vc_id: record.vc_id },
      data: {
        vc_attempts: attempts,
        ...(attempts >= MAX_AUTH_CODE_ATTEMPTS ? { vc_used_at: now } : {}),
      },
    });
    return attempts >= MAX_AUTH_CODE_ATTEMPTS
      ? {
          success: false,
          message: "Demasiados intentos. Solicita un código nuevo.",
        }
      : INVALID_CODE;
  }

  return { success: true, id: record.vc_id };
}

/**
 * Checks a code without consuming it. Used when the flow needs to confirm the
 * code on one screen and only spend it on a later screen (e.g. password reset:
 * enter code → choose new password). `verifyAuthCode` still marks it used at the
 * final step.
 */
export async function checkAuthCode(
  email: string,
  code: string,
  purpose: AuthCodePurpose
): Promise<{ success: true } | { success: false; message: string }> {
  const result = await matchActiveCode(email, code, purpose);
  return result.success ? { success: true } : result;
}

export async function verifyAuthCode(
  email: string,
  code: string,
  purpose: AuthCodePurpose
): Promise<{ success: true } | { success: false; message: string }> {
  const result = await matchActiveCode(email, code, purpose);
  if (!result.success) return result;

  await prisma.verification_codes.update({
    where: { vc_id: result.id },
    data: { vc_used_at: new Date() },
  });

  return { success: true };
}
