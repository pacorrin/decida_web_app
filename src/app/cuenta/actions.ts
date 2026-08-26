"use server";

import { redirect } from "next/navigation";
import {
  signUpSchema,
  verifySignupSchema,
  logInSchema,
  requestResetSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import { parseFieldErrors, formDataToValues } from "@/lib/onboarding/schemas";
import {
  createUser,
  findUserByEmail,
  markEmailVerified,
  updateUserPassword,
} from "@/lib/auth/users";
import {
  requestAuthCode,
  checkAuthCode,
  verifyAuthCode,
  normalizeEmail,
} from "@/lib/auth/verification";
import { createUserSession, clearUserSessionCookie } from "@/lib/auth/session-server";
import { verifyPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";
import { verificationCodeEmail } from "@/lib/email/templates";

export type AuthActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
  step?: "form" | "verify" | "code" | "password";
};

export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      values: formDataToValues(formData),
      step: "form",
    };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const existing = await findUserByEmail(normalizedEmail);
  if (existing?.user_email_verified_at) {
    return {
      success: false,
      message: "Ya existe una cuenta con este correo. Inicia sesión.",
      values: formDataToValues(formData),
      step: "form",
    };
  }

  if (existing) {
    await updateUserPassword(existing.user_id, password);
  } else {
    await createUser({ email: normalizedEmail, password, name });
  }

  const codeResult = await requestAuthCode(normalizedEmail, "signup_verification");
  if (!codeResult.success) {
    return {
      success: false,
      message: codeResult.message,
      values: formDataToValues(formData),
      step: "form",
    };
  }

  const { subject, html } = verificationCodeEmail(codeResult.code, "signup");
  await sendEmail({ to: normalizedEmail, subject, html });

  return {
    success: true,
    message: "Te enviamos un código de verificación a tu correo.",
    step: "verify",
  };
}

export async function verifySignup(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = verifySignupSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      step: "verify",
    };
  }

  const result = await verifyAuthCode(
    parsed.data.email,
    parsed.data.code,
    "signup_verification"
  );

  if (!result.success) {
    return { success: false, message: result.message, step: "verify" };
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user) {
    return {
      success: false,
      message: "No encontramos la cuenta. Regístrate de nuevo.",
      step: "form",
    };
  }

  await markEmailVerified(user.user_id);
  await createUserSession(user.user_id);

  redirect("/cuenta");
}

export async function logIn(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = logInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      values: formDataToValues(formData),
      step: "form",
    };
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  if (!user || !user.user_email_verified_at) {
    return {
      success: false,
      message: "Correo o contraseña incorrectos.",
      values: formDataToValues(formData),
      step: "form",
    };
  }

  const validPassword = await verifyPassword(password, user.user_password_hash);
  if (!validPassword) {
    return {
      success: false,
      message: "Correo o contraseña incorrectos.",
      values: formDataToValues(formData),
      step: "form",
    };
  }

  await createUserSession(user.user_id);
  redirect(safeNextPath(formData.get("next")));
}

/** Only ever redirect to a same-site path, never to an attacker-supplied absolute URL. */
function safeNextPath(next: FormDataEntryValue | null): string {
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/cuenta";
}

export async function logOut(): Promise<void> {
  await clearUserSessionCookie();
  redirect("/cuenta/iniciar-sesion");
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = requestResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      step: "form",
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await findUserByEmail(email);

  const genericState: AuthActionState = {
    success: true,
    message:
      "Si el correo tiene una cuenta, enviamos un código para restablecer tu contraseña.",
    step: "code",
  };

  if (!user) return genericState;

  const codeResult = await requestAuthCode(email, "password_reset");
  if (codeResult.success) {
    const { subject, html } = verificationCodeEmail(codeResult.code, "reset");
    try {
      await sendEmail({ to: email, subject, html });
    } catch (err) {
      // Don't surface delivery failures here — that would both leak whether the
      // account exists and crash the reset screen. The user can retry / re-request.
      console.error("[reset] no se pudo enviar el código:", err);
    }
  }

  return genericState;
}

/**
 * Middle step of the 3-screen reset flow: confirm the code is valid without
 * spending it. The code is only marked used later, in `resetPassword`.
 */
export async function verifyResetCode(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = verifyResetCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      step: "code",
    };
  }

  const { email, code } = parsed.data;
  const result = await checkAuthCode(email, code, "password_reset");
  if (!result.success) {
    return { success: false, message: result.message, step: "code" };
  }

  return { success: true, step: "password" };
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(parsed.error),
      step: "password",
    };
  }

  const { email, code, password } = parsed.data;
  const result = await verifyAuthCode(email, code, "password_reset");
  if (!result.success) {
    // Code expired or was already spent between screens — send them back to re-request.
    return { success: false, message: result.message, step: "code" };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { success: false, message: "No encontramos la cuenta.", step: "form" };
  }

  await updateUserPassword(user.user_id, password);

  return {
    success: true,
    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    step: "form",
  };
}

export async function getUserAssessments(userId: string) {
  return prisma.assessments.findMany({
    where: {
      asmt_user_id: userId,
      asmt_status: { in: ["completed", "report_generated"] },
      assessment_report: { isNot: null },
    },
    include: {
      business_idea: true,
      assessment_score: true,
      assessment_report: true,
    },
    orderBy: [
      { asmt_report_generated_at: "desc" },
      { asmt_created_at: "desc" },
    ],
  });
}
