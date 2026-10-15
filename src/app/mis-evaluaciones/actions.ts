"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  clearHistorySessionCookie,
  createHistorySession,
} from "@/lib/history/session-server";
import {
  normalizeEmail,
  requestVerificationCode,
  verifyCode,
} from "@/lib/history/verification";

export type HistoryActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  step?: "email" | "code" | "authenticated";
};

const emailSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

const verifySchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  code: z
    .string()
    .min(6, "El código debe tener 6 dígitos")
    .max(6, "El código debe tener 6 dígitos"),
});

export async function requestHistoryCode(
  _prev: HistoryActionState,
  formData: FormData
): Promise<HistoryActionState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "email");
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, fieldErrors, step: "email" };
  }

  const email = normalizeEmail(parsed.data.email);

  const assessmentCount = await prisma.assessments.count({
    where: {
      asmt_email: email,
      asmt_status: { in: ["completed", "report_generated"] },
      assessment_report: { isNot: null },
    },
  });

  if (assessmentCount === 0) {
    return {
      success: false,
      message:
        "No encontramos evaluaciones con ese correo. Completa un diagnóstico primero.",
      step: "email",
    };
  }

  const result = await requestVerificationCode(email);
  if (!result.success) {
    return { success: false, message: result.message, step: "email" };
  }

  return {
    success: true,
    message:
      "Si el correo tiene evaluaciones, generamos un código de verificación. Revisa la base de datos para obtenerlo.",
    step: "code",
  };
}

export async function verifyHistoryCode(
  _prev: HistoryActionState,
  formData: FormData
): Promise<HistoryActionState> {
  const parsed = verifySchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, fieldErrors, step: "code" };
  }

  const result = await verifyCode(parsed.data.email, parsed.data.code);
  if (!result.success) {
    return { success: false, message: result.message, step: "code" };
  }

  await createHistorySession(result.email);

  redirect("/mis-evaluaciones");
}

export async function signOutHistory(): Promise<void> {
  await clearHistorySessionCookie();
  redirect("/mis-evaluaciones");
}

export async function getHistoryAssessments(email: string) {
  return prisma.assessments.findMany({
    where: {
      asmt_email: normalizeEmail(email),
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
