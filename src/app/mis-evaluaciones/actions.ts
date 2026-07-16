"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAssessmentCookie } from "@/lib/onboarding/session-server";
import { getStepBySlug } from "@/lib/onboarding/steps";
import {
  clearHistorySessionCookie,
  createHistorySession,
  getHistorySession,
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

export async function startNewAssessmentFromHistory(): Promise<void> {
  const session = await getHistorySession();
  if (!session) {
    redirect("/mis-evaluaciones");
  }

  const latest = await prisma.assessments.findFirst({
    where: { asmt_email: session.hses_email },
    orderBy: { asmt_created_at: "desc" },
  });

  const newAssessment = await prisma.assessments.create({
    data: {
      asmt_email: session.hses_email,
      asmt_name: latest?.asmt_name ?? null,
      asmt_phone: latest?.asmt_phone ?? null,
      asmt_country: latest?.asmt_country ?? null,
      asmt_started_at: new Date(),
    },
  });

  await setAssessmentCookie(newAssessment.asmt_id);
  redirect(getStepBySlug("contacto").path);
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
