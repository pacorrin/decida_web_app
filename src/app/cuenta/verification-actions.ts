"use server";

import { redirect } from "next/navigation";
import { verifySignupSchema } from "@/lib/auth/schemas";
import { parseFieldErrors } from "@/lib/onboarding/schemas";
import { findUserByEmail, markEmailVerified } from "@/lib/auth/users";
import { verifyAuthCode } from "@/lib/auth/verification";
import { createUserSession } from "@/lib/auth/session-server";
import {
  clearPendingVerification,
  getPendingVerification,
  VERIFICATION_BACK_PATHS,
} from "@/lib/auth/pending-verification";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { sendSignupCode } from "@/lib/auth/signup-code";
import { getAssessmentIdFromCookie } from "@/lib/onboarding/session-server";
import { getStepBySlug } from "@/lib/onboarding/steps";
import { prisma } from "@/lib/prisma";
import { trackAnonymous, trackServer, trackServerDeferred } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import type { AuthActionState } from "./actions";

/**
 * Confirma el código de la pantalla de verificación. Solo aquí la cuenta queda
 * verificada y se abre la sesión; sin este paso no se avanza a nada más.
 */
export async function verifyEmailCode(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const pending = await getPendingVerification();
  if (!pending) {
    return {
      success: false,
      message: "Tu verificación expiró. Vuelve a empezar.",
    };
  }

  const parsed = verifySignupSchema.safeParse({
    email: pending.email,
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
  }

  const result = await verifyAuthCode(
    pending.email,
    parsed.data.code,
    "signup_verification"
  );
  if (!result.success) {
    await trackAnonymous(ANALYTICS_EVENTS.verificationFailed, {
      source: pending.flow,
      reason: result.message.includes("intentos") ? "attempts_exhausted" : "invalid_or_expired",
    });
    return { success: false, message: result.message };
  }

  const user = await findUserByEmail(pending.email);
  if (!user) {
    return {
      success: false,
      message: "No encontramos la cuenta. Vuelve a empezar.",
    };
  }

  const firstVerification = !user.user_email_verified_at;
  await markEmailVerified(user.user_id);
  await createUserSession(user.user_id);
  await clearPendingVerification();
  await trackServer(user.user_id, ANALYTICS_EVENTS.accountCreated, {
    source: pending.flow,
  });

  // Un solo punto para los dos flujos (registro y contacto del análisis): solo la
  // primera vez que se confirma el correo, no al volver a verificar una cuenta.
  if (firstVerification) await sendWelcomeEmail(user);

  if (pending.flow === "onboarding") {
    trackServerDeferred(user.user_id, ANALYTICS_EVENTS.onboardingStepCompleted, {
      step: "contacto",
    });
  }

  if (pending.flow === "registro") redirect("/cuenta");

  // Onboarding: el análisis se creó sin dueño al guardar el contacto; ahora que el
  // correo está confirmado se liga a la cuenta (solo si es el del mismo correo).
  const asmtId = await getAssessmentIdFromCookie();
  if (asmtId) {
    await prisma.assessments.updateMany({
      where: { asmt_id: asmtId, asmt_email: user.user_email, asmt_user_id: null },
      data: { asmt_user_id: user.user_id },
    });
  }
  redirect(getStepBySlug("idea").path);
}

/** Reenvía el código a quien está en la pantalla de verificación. */
export async function resendVerificationCode(): Promise<AuthActionState> {
  const pending = await getPendingVerification();
  if (!pending) {
    redirect("/cuenta/registro");
  }

  const result = await sendSignupCode(pending.email);
  if (!result.success) return { success: false, message: result.message };
  await trackAnonymous(ANALYTICS_EVENTS.verificationResent, { source: pending.flow });
  return { success: true, message: "Te enviamos un código nuevo." };
}

/** «Usar otro correo»: descarta la verificación pendiente y vuelve al formulario. */
export async function cancelVerification(): Promise<void> {
  const pending = await getPendingVerification();
  await clearPendingVerification();
  redirect(VERIFICATION_BACK_PATHS[pending?.flow ?? "registro"]);
}
