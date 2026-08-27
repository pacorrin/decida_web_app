"use server";

import { redirect } from "next/navigation";
import {
  generateFallbackIdeaSummary,
  generateFallbackIdeaRefinement,
  generateFallbackIdeaAssumptionsRotation,
  generateIdeaRefinement,
  generateIdeaAssumptionsRotation,
  generateIdeaSummary,
} from "@/lib/ai/openai";
import { parseAssumptions, packIdeaAiPayload, unpackIdeaAiPayload } from "@/lib/ai/schemas/idea-assumptions";
import type { StructuredUnderstanding } from "@/lib/ai/schemas/structured-understanding";
import { generateReport } from "@/lib/ai/generate-report";
import { runScoringPipeline } from "@/lib/scoring";
import {
  contactSchema,
  ideaSchema,
  situationSchema,
  personalFitSchema,
  paymentSchema,
  evaluationFinancialSchema,
  evaluationMarketSchema,
  feedbackSchema,
  parseFieldErrors,
  formDataToValues,
  refineIdeaSchema,
  type ActionState,
  type RefineIdeaState,
} from "@/lib/onboarding/schemas";
import type { z } from "zod";
import { PAYMENT_PLANS } from "@/lib/onboarding/options";
import {
  getCurrentAssessment,
  getAssessmentById,
  setAssessmentCookie,
} from "@/lib/onboarding/session-server";
import { isAssessmentCompleted } from "@/lib/onboarding/assessment-utils";
import { getStepBySlug } from "@/lib/onboarding/steps";
import { getResumeStep } from "@/lib/onboarding/navigation";
import { ensureAssessmentForCurrentUser } from "@/lib/onboarding/for-user";
import { prisma } from "@/lib/prisma";
import { createUser, findUserByEmail, updateUserPassword, markEmailVerified } from "@/lib/auth/users";
import { normalizeEmail } from "@/lib/auth/verification";
import { createUserSession } from "@/lib/auth/session-server";
import {
  logReportGenerationError,
  logReportGenerationRetry,
  logReportGenerationSuccess,
} from "@/lib/logging/report-logger";

function redirectToStep(slug: Parameters<typeof getStepBySlug>[0]): never {
  redirect(getStepBySlug(slug).path);
}

function requireAssessment() {
  const assessmentPromise = getCurrentAssessment();
  return assessmentPromise.then((assessment) => {
    if (!assessment) redirectToStep("contacto");
    return assessment;
  });
}

function validationError(
  error: z.ZodError,
  formData: FormData
): ActionState {
  return {
    success: false,
    fieldErrors: parseFieldErrors(error),
    values: formDataToValues(formData),
  };
}

/**
 * Entry point for logged-in users starting (or resuming) an assessment
 * without re-entering contact data. Must be a Server Action, not a GET
 * route — it writes a cookie, and unlike a page render, a Server Action is
 * only ever invoked by a real click, never by Next.js's automatic <Link>
 * prefetching (which previously caused a fresh assessment to be silently
 * created every time a "Analizar mi idea" link merely scrolled into view).
 */
export async function startAssessmentForCurrentUser(): Promise<void> {
  const assessment = await ensureAssessmentForCurrentUser();
  if (!assessment) {
    redirectToStep("contacto");
  }
  redirect(getStepBySlug(getResumeStep(assessment)).path);
}

export async function saveContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    password: formData.get("password"),
    acceptedTerms: formData.get("acceptedTerms"),
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const { email, name, phone, country, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  // Never round-trip the password back to the client, even on error.
  const redisplayValues = formDataToValues(formData);
  delete redisplayValues.password;

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser?.user_email_verified_at) {
    return {
      success: false,
      message: "Ya tienes una cuenta con este correo. Inicia sesión para continuar.",
      values: redisplayValues,
    };
  }

  // No verified account yet for this email: create (or claim an abandoned,
  // never-verified) account and sign them in immediately — same trust level
  // the anonymous flow already granted this email, now backed by a real
  // account instead of a throwaway assessment.
  const user = existingUser
    ? await updateUserPassword(existingUser.user_id, password)
    : await createUser({ email: normalizedEmail, password, name, phone });
  await markEmailVerified(user.user_id);
  await createUserSession(user.user_id);

  const existing = await getCurrentAssessment();
  let asmtId: string;

  if (existing && !isAssessmentCompleted(existing)) {
    await prisma.assessments.update({
      where: { asmt_id: existing.asmt_id },
      data: {
        asmt_email: normalizedEmail,
        asmt_name: name,
        asmt_phone: phone,
        asmt_country: country,
        asmt_user_id: user.user_id,
      },
    });
    asmtId = existing.asmt_id;
  } else {
    const assessment = await prisma.assessments.create({
      data: {
        asmt_email: normalizedEmail,
        asmt_name: name,
        asmt_phone: phone,
        asmt_country: country,
        asmt_user_id: user.user_id,
        asmt_started_at: new Date(),
      },
    });
    asmtId = assessment.asmt_id;
    await setAssessmentCookie(asmtId);
  }

  redirectToStep("idea");
}

export async function saveIdea(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = ideaSchema.safeParse({
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const { description } = parsed.data;

  let summaryResult;
  try {
    summaryResult = await generateIdeaSummary(description);
  } catch {
    summaryResult = generateFallbackIdeaSummary(description);
  }

  await prisma.business_ideas.upsert({
    where: { bide_asmt_id: assessment.asmt_id },
    create: {
      bide_asmt_id: assessment.asmt_id,
      bide_original_description: description,
      bide_ai_summary: summaryResult.summary,
      bide_ai_detected_assumptions: packIdeaAiPayload(
        summaryResult.assumptions,
        summaryResult.structuredUnderstanding
      ),
      bide_target_customer: summaryResult.structuredUnderstanding.cliente_objetivo,
      bide_problem_solved: summaryResult.structuredUnderstanding.que_ofreces,
      bide_why_would_pay:
        summaryResult.structuredUnderstanding.propuesta_valor ?? null,
      bide_user_confirmed_summary: false,
    },
    update: {
      bide_original_description: description,
      bide_ai_summary: summaryResult.summary,
      bide_ai_detected_assumptions: packIdeaAiPayload(
        summaryResult.assumptions,
        summaryResult.structuredUnderstanding
      ),
      bide_target_customer: summaryResult.structuredUnderstanding.cliente_objetivo,
      bide_problem_solved: summaryResult.structuredUnderstanding.que_ofreces,
      bide_why_would_pay:
        summaryResult.structuredUnderstanding.propuesta_valor ?? null,
      bide_user_confirmed_summary: false,
    },
  });

  redirectToStep("confirmacion");
}

export async function refineIdea(
  _prev: RefineIdeaState,
  formData: FormData
): Promise<RefineIdeaState> {
  const assessment = await requireAssessment();
  const idea = assessment.business_idea;
  if (!idea?.bide_ai_summary) redirectToStep("idea");

  const selectedIds = formData.getAll("selectedIds") as string[];
  let clarifications: Record<string, string> = {};
  const clarificationsRaw = formData.get("clarifications");
  if (typeof clarificationsRaw === "string" && clarificationsRaw) {
    try {
      clarifications = JSON.parse(clarificationsRaw) as Record<string, string>;
    } catch {
      clarifications = {};
    }
  }

  const parsed = refineIdeaSchema.safeParse({ selectedIds, clarifications });
  if (!parsed.success) {
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
  }

  const allAssumptions = parseAssumptions(idea.bide_ai_detected_assumptions);
  const payload = unpackIdeaAiPayload(idea.bide_ai_detected_assumptions);
  const selectedAssumptions = allAssumptions.filter((a) =>
    parsed.data.selectedIds.includes(a.id)
  );

  if (selectedAssumptions.length === 0) {
    return {
      success: false,
      message: "Selecciona al menos un supuesto para pulir tu idea.",
    };
  }

  let refinement;
  let usedFallback = false;
  try {
    refinement = await generateIdeaRefinement({
      originalDescription: idea.bide_original_description ?? "",
      currentSummary: idea.bide_ai_summary,
      selectedAssumptions,
      clarifications: parsed.data.clarifications ?? {},
      currentStructured: payload.structured,
    });
  } catch (error) {
    usedFallback = true;
    console.error("[refineIdea] AI refinement failed, using fallback", error);
    refinement = generateFallbackIdeaRefinement({
      currentSummary: idea.bide_ai_summary,
      selectedAssumptions,
      clarifications: parsed.data.clarifications ?? {},
      currentStructured: payload.structured,
      originalDescription: idea.bide_original_description ?? "",
    });
  }

  await prisma.business_ideas.update({
    where: { bide_asmt_id: assessment.asmt_id },
    data: {
      bide_ai_summary: refinement.summary,
      bide_original_description: refinement.refinedDescription,
      bide_ai_detected_assumptions: packIdeaAiPayload(
        refinement.assumptions,
        refinement.structuredUnderstanding
      ),
      bide_target_customer: refinement.structuredUnderstanding.cliente_objetivo,
      bide_problem_solved: refinement.structuredUnderstanding.que_ofreces,
      bide_why_would_pay:
        refinement.structuredUnderstanding.propuesta_valor ?? null,
    },
  });

  return {
    success: true,
    refined: true,
    summary: refinement.summary,
    structuredUnderstanding: refinement.structuredUnderstanding,
    assumptions: refinement.assumptions,
    improvements: refinement.improvements,
    message: usedFallback
      ? "Integramos tus aclaraciones en el resumen. Revisa Nuestro entendimiento."
      : "Actualizamos Nuestro entendimiento con tus aclaraciones. Revisa el resumen.",
  };
}

/**
 * Regenerates only the "Supuestos detectados" list with new angles,
 * without rewriting the understanding card above.
 */
export async function rotateIdeaAssumptions(
  _prev: RefineIdeaState,
  _formData: FormData
): Promise<RefineIdeaState> {
  const assessment = await requireAssessment();
  const idea = assessment.business_idea;
  if (!idea?.bide_ai_summary) redirectToStep("idea");

  const payload = unpackIdeaAiPayload(idea.bide_ai_detected_assumptions);
  const previousAssumptions = payload.assumptions;

  let rotation;
  try {
    rotation = await generateIdeaAssumptionsRotation({
      originalDescription: idea.bide_original_description ?? "",
      currentSummary: idea.bide_ai_summary,
      structured: payload.structured,
      previousAssumptions,
    });
  } catch {
    rotation = generateFallbackIdeaAssumptionsRotation(previousAssumptions);
  }

  await prisma.business_ideas.update({
    where: { bide_asmt_id: assessment.asmt_id },
    data: {
      bide_ai_detected_assumptions: packIdeaAiPayload(
        rotation.assumptions,
        payload.structured
      ),
    },
  });

  return {
    success: true,
    assumptionsOnly: true,
    assumptions: rotation.assumptions,
    message: "Nuevos supuestos listos. Elige los que quieras aclarar.",
  };
}

export async function confirmIdea(): Promise<void> {
  const assessment = await requireAssessment();
  if (!assessment.business_idea) redirectToStep("idea");

  await prisma.business_ideas.update({
    where: { bide_asmt_id: assessment.asmt_id },
    data: { bide_user_confirmed_summary: true },
  });

  redirectToStep("pago");
}

export async function editIdeaRedirect(): Promise<void> {
  redirectToStep("idea");
}

export async function savePayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = paymentSchema.safeParse({
    planId: formData.get("planId") ?? "starter",
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const plan = PAYMENT_PLANS.find((p) => p.id === parsed.data.planId);
  if (!plan?.available) {
    return {
      success: false,
      message: "Este plan no está disponible aún.",
    };
  }

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: {
      asmt_status: "paid",
      asmt_payment_status: "paid",
      asmt_payment_provider: "placeholder",
    },
  });

  await prisma.payments.create({
    data: {
      paym_asmt_id: assessment.asmt_id,
      paym_provider: "placeholder",
      paym_amount: plan.price,
      paym_currency: plan.currency,
      paym_status: "paid",
      paym_paid_at: new Date(),
    },
  });

  redirectToStep("perfil");
}

export async function saveSituation(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = situationSchema.safeParse({
    currentSituation: formData.get("currentSituation"),
    mainGoal: formData.get("mainGoal"),
    entrepreneurshipExperience: formData.get("entrepreneurshipExperience"),
    hoursPerWeekRange: formData.get("hoursPerWeekRange"),
    availableSchedule: formData.get("availableSchedule"),
    expectedIncomeTimeframe: formData.get("expectedIncomeTimeframe"),
    capitalRange: formData.get("capitalRange") ?? undefined,
    acceptableLossRange: formData.get("acceptableLossRange") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const data = parsed.data;

  await prisma.assessment_profiles.upsert({
    where: { aprf_asmt_id: assessment.asmt_id },
    create: {
      aprf_asmt_id: assessment.asmt_id,
      aprf_current_situation: data.currentSituation,
      aprf_main_goal: data.mainGoal,
      aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
      aprf_capital_available_range: data.capitalRange ?? null,
      aprf_acceptable_loss_range: data.acceptableLossRange ?? null,
      aprf_hours_per_week_range: data.hoursPerWeekRange,
      aprf_available_schedule: data.availableSchedule,
      aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
    },
    update: {
      aprf_current_situation: data.currentSituation,
      aprf_main_goal: data.mainGoal,
      aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
      aprf_capital_available_range: data.capitalRange ?? null,
      aprf_acceptable_loss_range: data.acceptableLossRange ?? null,
      aprf_hours_per_week_range: data.hoursPerWeekRange,
      aprf_available_schedule: data.availableSchedule,
      aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
    },
  });

  redirectToStep("ajuste");
}

/** @deprecated Use saveSituation */
export async function saveProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  return saveSituation(_prev, formData);
}

export async function savePersonalFit(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const enjoyedActivities = formData.getAll("enjoyedActivities") as string[];

  const parsed = personalFitSchema.safeParse({
    enjoyedActivities,
    workPreference: formData.get("workPreference"),
    salesComfortScore: formData.get("salesComfortScore"),
    uncertaintyComfortScore: formData.get("uncertaintyComfortScore"),
    hiringPreference: formData.get("hiringPreference"),
    processComfortScore: formData.get("processComfortScore"),
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const data = parsed.data;

  await prisma.personal_fit_answers.upsert({
    where: { pfit_asmt_id: assessment.asmt_id },
    create: {
      pfit_asmt_id: assessment.asmt_id,
      pfit_enjoyed_activities: data.enjoyedActivities,
      pfit_work_preference: data.workPreference,
      pfit_sales_comfort_score: data.salesComfortScore,
      pfit_uncertainty_comfort_score: data.uncertaintyComfortScore,
      pfit_hiring_preference: data.hiringPreference,
      pfit_process_comfort_score: data.processComfortScore,
    },
    update: {
      pfit_enjoyed_activities: data.enjoyedActivities,
      pfit_work_preference: data.workPreference,
      pfit_sales_comfort_score: data.salesComfortScore,
      pfit_uncertainty_comfort_score: data.uncertaintyComfortScore,
      pfit_hiring_preference: data.hiringPreference,
      pfit_process_comfort_score: data.processComfortScore,
    },
  });

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: { asmt_status: "in_progress" },
  });

  redirectToStep("evaluacion");
}

export async function saveEvaluation(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const financialParsed = evaluationFinancialSchema.safeParse({
    initialInvestment: formData.get("initialInvestment"),
    pricePerSale: formData.get("pricePerSale"),
    variableCostPerSale: formData.get("variableCostPerSale"),
    estimatedMonthlySales: formData.get("estimatedMonthlySales"),
    fixedMonthlyCostsRange: formData.get("fixedMonthlyCostsRange"),
    currency: formData.get("currency") ?? "MXN",
  });

  const marketParsed = evaluationMarketSchema.safeParse({
    hasTalkedToCustomers: formData.get("hasTalkedToCustomers"),
    competitionLevel: formData.get("competitionLevel"),
    acquisitionChannel: formData.get("acquisitionChannel"),
    mainConcern: formData.get("mainConcern"),
    successCondition: formData.get("successCondition"),
  });

  if (!financialParsed.success) {
    return validationError(financialParsed.error, formData);
  }
  if (!marketParsed.success) {
    return validationError(marketParsed.error, formData);
  }

  const fin = financialParsed.data;
  const mkt = marketParsed.data;

  await prisma.financial_inputs.upsert({
    where: { finp_asmt_id: assessment.asmt_id },
    create: {
      finp_asmt_id: assessment.asmt_id,
      finp_initial_investment: fin.initialInvestment,
      finp_price_per_sale: fin.pricePerSale,
      finp_variable_cost_per_sale: fin.variableCostPerSale,
      finp_estimated_monthly_sales: fin.estimatedMonthlySales,
      finp_fixed_monthly_costs_range: fin.fixedMonthlyCostsRange,
      finp_currency: fin.currency,
    },
    update: {
      finp_initial_investment: fin.initialInvestment,
      finp_price_per_sale: fin.pricePerSale,
      finp_variable_cost_per_sale: fin.variableCostPerSale,
      finp_estimated_monthly_sales: fin.estimatedMonthlySales,
      finp_fixed_monthly_costs_range: fin.fixedMonthlyCostsRange,
      finp_currency: fin.currency,
    },
  });

  await prisma.market_risk_inputs.upsert({
    where: { mrsk_asmt_id: assessment.asmt_id },
    create: {
      mrsk_asmt_id: assessment.asmt_id,
      mrsk_has_talked_to_customers: mkt.hasTalkedToCustomers === "true",
      mrsk_competition_level: mkt.competitionLevel,
      mrsk_acquisition_channel: mkt.acquisitionChannel,
      mrsk_main_concern: mkt.mainConcern,
      mrsk_success_condition: mkt.successCondition,
    },
    update: {
      mrsk_has_talked_to_customers: mkt.hasTalkedToCustomers === "true",
      mrsk_competition_level: mkt.competitionLevel,
      mrsk_acquisition_channel: mkt.acquisitionChannel,
      mrsk_main_concern: mkt.mainConcern,
      mrsk_success_condition: mkt.successCondition,
    },
  });

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: { asmt_status: "in_progress" },
  });

  const refreshed = await getAssessmentById(assessment.asmt_id);
  if (!refreshed) redirectToStep("contacto");

  try {
    const { deterministic, interpretation } =
      await runScoringPipeline(refreshed);
    await generateReport(refreshed, deterministic, interpretation);
    
    logReportGenerationSuccess("Report generated successfully", {
      assessmentId: assessment.asmt_id,
      metadata: { email: assessment.asmt_email },
    });
  } catch (error) {
    logReportGenerationError("Report generation failed during evaluation", {
      assessmentId: assessment.asmt_id,
      error,
      metadata: {
        email: assessment.asmt_email,
        status: assessment.asmt_status,
      },
    });
    
    await prisma.assessments.update({
      where: { asmt_id: assessment.asmt_id },
      data: { 
        asmt_status: "failed",
        asmt_completed_at: new Date(),
      },
    });
  }

  redirectToStep("resultado");
}

export async function retryReportGeneration(): Promise<ActionState> {
  const assessment = await requireAssessment();
  
  if (assessment.asmt_status !== "failed" && assessment.asmt_status !== "completed") {
    return {
      success: false,
      message: "Solo puedes reintentar la generación de reportes fallidos.",
    };
  }

  const refreshed = await getAssessmentById(assessment.asmt_id);
  if (!refreshed) {
    return {
      success: false,
      message: "No se pudo encontrar tu evaluación.",
    };
  }

  logReportGenerationRetry("Manual retry attempt initiated", {
    assessmentId: assessment.asmt_id,
    metadata: { previousStatus: assessment.asmt_status },
  });

  try {
    await prisma.assessments.update({
      where: { asmt_id: assessment.asmt_id },
      data: { asmt_status: "in_progress" },
    });

    const { deterministic, interpretation } =
      await runScoringPipeline(refreshed);
    await generateReport(refreshed, deterministic, interpretation);

    logReportGenerationSuccess("Report generated successfully on retry", {
      assessmentId: assessment.asmt_id,
    });

    return {
      success: true,
      message: "Reporte generado exitosamente.",
    };
  } catch (error) {
    logReportGenerationError("Report generation retry failed", {
      assessmentId: assessment.asmt_id,
      error,
      metadata: { retryAttempt: true },
    });
    
    await prisma.assessments.update({
      where: { asmt_id: assessment.asmt_id },
      data: { 
        asmt_status: "failed",
        asmt_completed_at: new Date(),
      },
    });

    return {
      success: false,
      message: "No se pudo generar el reporte. Por favor, contacta a soporte.",
    };
  }
}

export async function saveAndContinueLater(): Promise<void> {
  redirect("/");
}

export async function saveFeedback(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  if (!assessment.assessment_report) {
    return {
      success: false,
      message: "El diagnóstico aún no está listo para recibir feedback.",
    };
  }

  const existingFeedback = await prisma.feedback.findUnique({
    where: { fdbk_asmt_id: assessment.asmt_id },
  });

  if (existingFeedback) {
    return {
      success: false,
      message: "Ya enviaste tu opinión sobre este diagnóstico.",
    };
  }

  const parsed = feedbackSchema.safeParse({
    rating: formData.get("rating"),
    wouldRecommend: formData.get("wouldRecommend"),
    comment: formData.get("comment") ?? undefined,
    testimonialConsent: formData.get("testimonialConsent") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const data = parsed.data;

  await prisma.feedback.create({
    data: {
      fdbk_asmt_id: assessment.asmt_id,
      fdbk_rating: data.rating,
      fdbk_would_recommend: data.wouldRecommend === "true",
      fdbk_comment: data.comment ?? null,
      fdbk_testimonial_consent: data.testimonialConsent ?? false,
    },
  });

  return {
    success: true,
    message: "¡Gracias por tu opinión! Nos ayuda a mejorar Decida.",
  };
}

export async function startNewAssessment(): Promise<void> {
  const assessment = await requireAssessment();

  if (
    !assessment.assessment_report &&
    assessment.asmt_status !== "report_generated" &&
    assessment.asmt_status !== "completed"
  ) {
    redirectToStep("resultado");
  }

  const newAssessment = await prisma.assessments.create({
    data: {
      asmt_email: assessment.asmt_email,
      asmt_name: assessment.asmt_name,
      asmt_phone: assessment.asmt_phone,
      asmt_country: assessment.asmt_country,
      asmt_started_at: new Date(),
    },
  });

  await setAssessmentCookie(newAssessment.asmt_id);
  redirectToStep("contacto");
}
