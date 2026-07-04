import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AssessmentBase } from "./assessment-utils";

export const ASSESSMENT_COOKIE = "decida_asmt_id";

const ASSESSMENT_INCLUDE = {
  assessment_profile: true,
  personal_fit_answers: true,
  business_idea: true,
  financial_inputs: true,
  market_risk_inputs: true,
  assessment_score: true,
  assessment_report: true,
  feedback: true,
  payments: { orderBy: { paym_created_at: "desc" as const }, take: 1 },
} as const;

export type AssessmentWithRelations = AssessmentBase;

export async function getAssessmentIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ASSESSMENT_COOKIE)?.value ?? null;
}

export async function setAssessmentCookie(asmtId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ASSESSMENT_COOKIE, asmtId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getAssessmentById(asmtId: string) {
  return prisma.assessments.findUnique({
    where: { asmt_id: asmtId },
    include: ASSESSMENT_INCLUDE,
  });
}

export async function getCurrentAssessment() {
  const asmtId = await getAssessmentIdFromCookie();
  if (!asmtId) return null;
  return getAssessmentById(asmtId);
}
