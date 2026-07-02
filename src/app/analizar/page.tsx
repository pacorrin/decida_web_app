import { redirect } from "next/navigation";
import { getCurrentAssessment } from "@/lib/onboarding/session-server";
import { getResumeStep } from "@/lib/onboarding/navigation";
import { getStepBySlug } from "@/lib/onboarding/steps";

export default async function AnalizarPage() {
  const assessment = await getCurrentAssessment();
  const step = getResumeStep(assessment);
  redirect(getStepBySlug(step).path);
}
