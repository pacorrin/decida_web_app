import "server-only";

import { cookies } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
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

/**
 * Convert Prisma Decimals (and nested ones) to plain numbers so the
 * assessment can be passed to Client Components.
 */
function serializeForClient<T>(value: T): T {
  return serializeValue(value) as T;
}

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Prisma.Decimal.isDecimal(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = serializeValue(nested);
    }
    return result;
  }
  return value;
}

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

export async function getAssessmentById(
  asmtId: string
): Promise<AssessmentWithRelations | null> {
  const assessment = await prisma.assessments.findUnique({
    where: { asmt_id: asmtId },
    include: ASSESSMENT_INCLUDE,
  });
  if (!assessment) return null;
  return serializeForClient(assessment);
}

export async function getCurrentAssessment() {
  const asmtId = await getAssessmentIdFromCookie();
  if (!asmtId) return null;
  return getAssessmentById(asmtId);
}
