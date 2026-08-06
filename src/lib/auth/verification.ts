import "server-only";

import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  AUTH_CODE_TTL_MS,
  AUTH_METHOD,
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

export async function verifyAuthCode(
  email: string,
  code: string,
  purpose: AuthCodePurpose
): Promise<{ success: true } | { success: false; message: string }> {
  const identifier = normalizeEmail(email);
  const normalizedCode = code.trim();
  const now = new Date();

  const record = await prisma.verification_codes.findFirst({
    where: {
      vc_identifier: identifier,
      vc_method: AUTH_METHOD,
      vc_purpose: purpose,
      vc_code: normalizedCode,
      vc_used_at: null,
      vc_expires_at: { gt: now },
    },
    orderBy: { vc_created_at: "desc" },
  });

  if (!record) {
    return {
      success: false,
      message: "Código inválido o expirado. Solicita uno nuevo.",
    };
  }

  await prisma.verification_codes.update({
    where: { vc_id: record.vc_id },
    data: { vc_used_at: now },
  });

  return { success: true };
}
