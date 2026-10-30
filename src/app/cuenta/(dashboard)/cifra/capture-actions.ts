"use server";

import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import * as Sentry from "@sentry/nextjs";
import { classifyAiError } from "@/lib/logging/report-logger";
import { CIFRA_ACCESS_MESSAGES } from "@/lib/cifra/access";
import { extractCapture } from "@/lib/cifra/capture/extract";
import { validateCaptureInput } from "@/lib/cifra/capture/input";
import type { CaptureProposal } from "@/lib/cifra/capture/result";
import { todayInMexico } from "@/lib/cifra/dates";
import { spendableBalance } from "@/lib/credits/access";
import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { InsufficientCreditsError, refundCreditsByKey, spendCredits } from "@/lib/credits/ledger";
import { hasFullAccess } from "@/lib/subscription/access";

export type SmartCaptureResult =
  | { success: true; proposal: CaptureProposal; creditsLeft: number }
  | { success: false; message: string; needsConsent?: boolean; insufficientCredits?: boolean };

const ERROR_AFTER_REFUND =
  "No pudimos leer la captura y te devolvimos los créditos. Puedes registrarlo a mano en Movimientos.";

/** Guarda que la persona aceptó que sus fotos y textos se envíen a la IA (solo para leerlos). */
export async function grantCifraAiConsent(): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: CIFRA_ACCESS_MESSAGES.no_session };
  if (!hasFullAccess(user)) return { success: false, message: CIFRA_ACCESS_MESSAGES.no_plan };
  if (!user.user_cifra_ai_consent_at) {
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { user_cifra_ai_consent_at: new Date() },
    });
    await trackServer(user.user_id, ANALYTICS_EVENTS.cifraAiConsentGiven, {});
  }
  return { success: true };
}

/**
 * Lee las fotos y el texto con IA y devuelve una PROPUESTA de movimiento; no guarda nada.
 * Cobra los créditos antes de llamar a la IA (el costo se genera aunque luego se descarte) y los
 * devuelve si la lectura falla. Las fotos solo viajan en memoria: no se guardan.
 */
export async function smartCapture(formData: FormData): Promise<SmartCaptureResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: CIFRA_ACCESS_MESSAGES.no_session };
  if (!hasFullAccess(user)) return { success: false, message: CIFRA_ACCESS_MESSAGES.no_plan };
  if (!user.user_cifra_ai_consent_at) {
    return { success: false, needsConsent: true, message: "Antes de usarla necesitamos tu autorización." };
  }

  const input = await validateCaptureInput(formData);
  if (!input.ok) return { success: false, message: input.message };

  const balance = spendableBalance(user);
  if (balance < CREDIT_COST_CIFRA_CAPTURE) {
    await trackServer(user.user_id, ANALYTICS_EVENTS.creditsInsufficient, { feature: "cifra_capture" });
    return {
      success: false,
      insufficientCredits: true,
      message: `Necesitas ${CREDIT_COST_CIFRA_CAPTURE} créditos para una captura inteligente.`,
    };
  }

  const chargeKey = `cifra-capture:${user.user_id}:${input.captureId}`;
  try {
    await spendCredits({
      userId: user.user_id,
      amount: CREDIT_COST_CIFRA_CAPTURE,
      idempotencyKey: chargeKey,
      metadata: { feature: "cifra_capture", images: input.images.length, hasText: input.text.length > 0 },
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return {
        success: false,
        insufficientCredits: true,
        message: `Necesitas ${CREDIT_COST_CIFRA_CAPTURE} créditos para una captura inteligente.`,
      };
    }
    throw err;
  }

  const track = (outcome: string, extra: Record<string, string | number | boolean> = {}) =>
    trackServer(user.user_id, ANALYTICS_EVENTS.cifraSmartCapture, {
      outcome,
      images: input.images.length,
      has_text: input.text.length > 0,
      ...extra,
    });

  try {
    const proposal = await extractCapture({
      images: input.images,
      text: input.text,
      today: todayInMexico(),
      userId: user.user_id,
    });
    if (!proposal) throw new Error("Respuesta de la IA sin formato válido");

    await track("ok", { flow: proposal.flow, confidence: proposal.confidence });
    const creditsLeft = Math.max(0, balance - CREDIT_COST_CIFRA_CAPTURE);
    return { success: true, proposal, creditsLeft };
  } catch (err) {
    // Sin montos, textos ni imágenes en los registros: solo el hecho de que falló.
    Sentry.captureException(err, {
      tags: { feature: "cifra_capture", aiError: classifyAiError(err) },
    });
    await refundCreditsByKey({
      userId: user.user_id,
      amount: CREDIT_COST_CIFRA_CAPTURE,
      idempotencyKey: `refund:${chargeKey}`,
      metadata: { feature: "cifra_capture", reason: "failed" },
    });
    await track("failed");
    return { success: false, message: ERROR_AFTER_REFUND };
  }
}
