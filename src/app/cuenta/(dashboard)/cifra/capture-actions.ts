"use server";

import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import * as Sentry from "@sentry/nextjs";
import { classifyAiError } from "@/lib/logging/report-logger";
import { CIFRA_ACCESS_MESSAGES } from "@/lib/cifra/access";
import { transcribeAudio } from "@/lib/ai/openai";
import { extractCapture } from "@/lib/cifra/capture/extract";
import { validateAudioInput, validateCaptureInput } from "@/lib/cifra/capture/input";
import type { CaptureProposal } from "@/lib/cifra/capture/result";
import { todayInMexico } from "@/lib/cifra/dates";
import { spendableBalance } from "@/lib/credits/access";
import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { InsufficientCreditsError, refundCreditsByKey, spendCredits } from "@/lib/credits/ledger";
import type { users } from "@/generated/prisma/client";
import { hasFullAccess } from "@/lib/subscription/access";

export type TranscribeResult =
  | { success: true; text: string }
  | { success: false; message: string; needsConsent?: boolean; insufficientCredits?: boolean };

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

type Gate =
  | { ok: true; user: users }
  | { ok: false; result: { success: false; message: string; needsConsent?: boolean } };

async function gate(): Promise<Gate> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: { success: false, message: CIFRA_ACCESS_MESSAGES.no_session } };
  if (!hasFullAccess(user)) return { ok: false, result: { success: false, message: CIFRA_ACCESS_MESSAGES.no_plan } };
  if (!user.user_cifra_ai_consent_at) {
    return {
      ok: false,
      result: { success: false, needsConsent: true, message: "Antes de usarla necesitamos tu autorización." },
    };
  }
  return { ok: true, user };
}

const NEEDS_CREDITS = `Necesitas ${CREDIT_COST_CIFRA_CAPTURE} créditos para una captura inteligente.`;

type Charge =
  | { ok: true; balanceAfter: number }
  | { ok: false; result: { success: false; message: string; insufficientCredits?: boolean } };

/**
 * Una captura se cobra UNA vez, con la primera llamada de IA que use (transcribir la voz o leer
 * las fotos y el texto). La clave es la de la captura, así que repetir pasos no cobra de nuevo.
 */
async function chargeCapture(user: users, chargeKey: string, meta: Record<string, string | number | boolean>): Promise<Charge> {
  const already = await prisma.credit_ledger.findUnique({ where: { cled_idempotency_key: chargeKey } });
  if (already) {
    // Si ese cobro ya se devolvió por un fallo, la captura se cerró: hay que empezar otra (otra clave).
    const refunded = await prisma.credit_ledger.findUnique({ where: { cled_idempotency_key: `refund:${chargeKey}` } });
    if (refunded) return { ok: false, result: { success: false, message: "Esa captura ya se cerró. Intenta de nuevo." } };
    return { ok: true, balanceAfter: already.cled_balance_after };
  }

  if (spendableBalance(user) < CREDIT_COST_CIFRA_CAPTURE) {
    await trackServer(user.user_id, ANALYTICS_EVENTS.creditsInsufficient, { feature: "cifra_capture" });
    return { ok: false, result: { success: false, insufficientCredits: true, message: NEEDS_CREDITS } };
  }
  try {
    const { entry } = await spendCredits({
      userId: user.user_id,
      amount: CREDIT_COST_CIFRA_CAPTURE,
      idempotencyKey: chargeKey,
      metadata: { feature: "cifra_capture", ...meta },
    });
    return { ok: true, balanceAfter: entry.cled_balance_after };
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { ok: false, result: { success: false, insufficientCredits: true, message: NEEDS_CREDITS } };
    }
    throw err;
  }
}

async function refundCapture(userId: string, chargeKey: string, feature: string) {
  await refundCreditsByKey({
    userId,
    amount: CREDIT_COST_CIFRA_CAPTURE,
    idempotencyKey: `refund:${chargeKey}`,
    metadata: { feature, reason: "failed" },
  });
}

/**
 * Transcribe una nota de voz para poner el texto en el campo de observaciones. El audio solo
 * viaja en memoria y se descarta. Cuenta como parte de la misma captura: no se cobra aparte.
 */
export async function transcribeCapture(formData: FormData): Promise<TranscribeResult> {
  const g = await gate();
  if (!g.ok) return g.result;
  const input = validateAudioInput(formData);
  if (!input.ok) return { success: false, message: input.message };

  const chargeKey = `cifra-capture:${g.user.user_id}:${input.captureId}`;
  const charge = await chargeCapture(g.user, chargeKey, { voice: true });
  if (!charge.ok) return charge.result;

  try {
    const text = (await transcribeAudio(input.audio)).trim();
    if (!text) {
      await refundCapture(g.user.user_id, chargeKey, "cifra_capture_voice");
      await trackServer(g.user.user_id, ANALYTICS_EVENTS.cifraVoiceTranscribed, { outcome: "empty" });
      return { success: false, message: "No alcanzamos a escuchar nada. Intenta grabar de nuevo, un poco más cerca del micrófono." };
    }
    await trackServer(g.user.user_id, ANALYTICS_EVENTS.cifraVoiceTranscribed, { outcome: "ok" });
    return { success: true, text };
  } catch (err) {
    Sentry.captureException(err, { tags: { feature: "cifra_capture_voice", aiError: classifyAiError(err) } });
    await refundCapture(g.user.user_id, chargeKey, "cifra_capture_voice");
    await trackServer(g.user.user_id, ANALYTICS_EVENTS.cifraVoiceTranscribed, { outcome: "failed" });
    return { success: false, message: "No pudimos transcribir tu voz y te devolvimos los créditos. Puedes escribirlo." };
  }
}

/**
 * Lee las fotos y el texto con IA y devuelve una PROPUESTA de movimiento; no guarda nada.
 * Cobra los créditos antes de llamar a la IA (el costo se genera aunque luego se descarte) y los
 * devuelve si la lectura falla. Las fotos solo viajan en memoria: no se guardan.
 */
export async function smartCapture(formData: FormData): Promise<SmartCaptureResult> {
  const g = await gate();
  if (!g.ok) return g.result;
  const user = g.user;

  const input = await validateCaptureInput(formData);
  if (!input.ok) return { success: false, message: input.message };

  const chargeKey = `cifra-capture:${user.user_id}:${input.captureId}`;
  const charge = await chargeCapture(user, chargeKey, { images: input.images.length, hasText: input.text.length > 0 });
  if (!charge.ok) return charge.result;

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
    return { success: true, proposal, creditsLeft: charge.balanceAfter };
  } catch (err) {
    // Sin montos, textos ni imágenes en los registros: solo el hecho de que falló.
    Sentry.captureException(err, {
      tags: { feature: "cifra_capture", aiError: classifyAiError(err) },
    });
    await refundCapture(user.user_id, chargeKey, "cifra_capture");
    await track("failed");
    return { success: false, message: ERROR_AFTER_REFUND };
  }
}
