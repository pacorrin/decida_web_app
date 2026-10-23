"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  generateFallbackIdeaSummary,
  generateFallbackIdeaRefinement,
  generateFallbackIdeaAssumptionsRotation,
  createAiObservabilityContext,
  generateIdeaRefinement,
  generateIdeaAssumptionsRotation,
  generateIdeaSummary,
} from "@/lib/ai/openai";
import { parseAssumptions, packIdeaAiPayload, unpackIdeaAiPayload } from "@/lib/ai/schemas/idea-assumptions";
import type { StructuredUnderstanding } from "@/lib/ai/schemas/structured-understanding";
import { runScoringPipeline } from "@/lib/scoring";
import { generateReportWithCredits } from "@/lib/credits/generate";
import {
  chargeForResearchUpgrade,
  unlockReportWithoutRegenerate,
} from "@/lib/credits/charge";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import {
  contactSchema,
  ideaSchema,
  situationSchema,
  personalFitSchema,
  paymentSchema,
  evaluationFinancialSchema,
  evaluationMarketSchema,
  productsSchema,
  feedbackSchema,
  parseFieldErrors,
  formDataToValues,
  refineIdeaSchema,
  type ActionState,
  type RefineIdeaState,
} from "@/lib/onboarding/schemas";
import type { z } from "zod";
import { SUBSCRIPTION_PLAN_ID } from "@/lib/subscription/activate";
import { startSubscription } from "@/lib/subscription/start";
import {
  getCurrentAssessment,
  getAssessmentById,
  setAssessmentCookie,
} from "@/lib/onboarding/session-server";
import { isAssessmentCompleted } from "@/lib/onboarding/assessment-utils";
import { getStepBySlug } from "@/lib/onboarding/steps";
import { getResumeStep } from "@/lib/onboarding/navigation";
import { ensureAssessmentForCurrentUser } from "@/lib/onboarding/for-user";
import { PLANS_PATH } from "@/lib/subscription/limits";
import { hasFullAccess } from "@/lib/subscription/access";
import { blendProducts } from "@/lib/onboarding/products";
import { prisma } from "@/lib/prisma";
import {
  formatTargetMarket,
  inferTargetMarket,
  parseTargetMarket,
  parseTargetMarketText,
  type StoredTargetMarket,
} from "@/lib/ai/research/target-market";
import { trackServer } from "@/lib/analytics/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { createUser, findUserByEmail, updateUserPassword, markEmailVerified } from "@/lib/auth/users";
import { normalizeEmail } from "@/lib/auth/verification";
import { createUserSession, getCurrentUser } from "@/lib/auth/session-server";
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
  const result = await ensureAssessmentForCurrentUser();
  if (result.status === "limit_reached") {
    redirect(PLANS_PATH);
  }
  if (result.status === "anonymous") {
    redirectToStep("contacto");
  }
  const path = getStepBySlug(getResumeStep(result.assessment)).path;
  // Retoma un borrador con idea: la pantalla avisa y ofrece empezar con otra idea.
  const resumed = !!result.assessment.business_idea?.bide_original_description;
  redirect(resumed ? `${path}?retomado=1` : path);
}

/**
 * «Empezar con otra idea»: descarta el borrador en curso de la persona (nunca un
 * análisis completado ni uno ajeno) y arranca uno limpio con las mismas reglas
 * de siempre (el límite gratuito sigue aplicando).
 */
export async function discardDraftAndRestart(): Promise<void> {
  const user = await getCurrentUser();
  const current = await getCurrentAssessment();
  if (
    user &&
    current &&
    current.asmt_user_id === user.user_id &&
    !isAssessmentCompleted(current)
  ) {
    await prisma.assessments.delete({ where: { asmt_id: current.asmt_id } });
  }
  await startAssessmentForCurrentUser();
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
  await trackServer(user.user_id, ANALYTICS_EVENTS.accountCreated, {
    source: "onboarding",
  });

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
  const observability = createAiObservabilityContext(
    assessment.asmt_id,
    assessment.asmt_user_id
  );

  // El mercado objetivo se infiere de la idea (no del país del visitante) y se
  // muestra como supuesto editable en el paso de confirmación.
  const [summaryResult, targetMarket] = await Promise.all([
    generateIdeaSummary(description, observability).catch(() =>
      generateFallbackIdeaSummary(description)
    ),
    inferTargetMarket(description, observability),
  ]);

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
      bide_target_market: targetMarket,
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
      bide_target_market: targetMarket,
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

  const observability = createAiObservabilityContext(
    assessment.asmt_id,
    assessment.asmt_user_id
  );
  let refinement;
  let usedFallback = false;
  try {
    refinement = await generateIdeaRefinement({
      originalDescription: idea.bide_original_description ?? "",
      currentSummary: idea.bide_ai_summary,
      selectedAssumptions,
      clarifications: parsed.data.clarifications ?? {},
      currentStructured: payload.structured,
      observability,
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

  const observability = createAiObservabilityContext(
    assessment.asmt_id,
    assessment.asmt_user_id
  );
  let rotation;
  try {
    rotation = await generateIdeaAssumptionsRotation({
      originalDescription: idea.bide_original_description ?? "",
      currentSummary: idea.bide_ai_summary,
      structured: payload.structured,
      previousAssumptions,
      observability,
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

export async function confirmIdea(formData?: FormData): Promise<void> {
  const assessment = await requireAssessment();
  if (!assessment.business_idea) redirectToStep("idea");

  // Mercado objetivo: si la persona lo cambió se guarda como suyo; si lo dejó
  // igual, sigue siendo el supuesto que inferimos.
  const stored = parseTargetMarket(assessment.business_idea.bide_target_market);
  const typed = parseTargetMarketText(
    typeof formData?.get("targetMarket") === "string"
      ? (formData?.get("targetMarket") as string)
      : null
  );
  let targetMarket: StoredTargetMarket | undefined;
  if (typed) {
    const unchanged =
      !!stored &&
      formatTargetMarket(typed).toLowerCase() === formatTargetMarket(stored).toLowerCase();
    targetMarket = unchanged
      ? { ...stored, editado: false }
      : {
          pais: typed.pais,
          ciudad: typed.ciudad,
          criterio: "Indicado por la persona.",
          es_supuesto: false,
          editado: true,
        };
  }

  await prisma.business_ideas.update({
    where: { bide_asmt_id: assessment.asmt_id },
    data: {
      bide_user_confirmed_summary: true,
      ...(targetMarket ? { bide_target_market: targetMarket } : {}),
    },
  });

  // Quien ya tiene suscripción no necesita elegir plan.
  const user = await getCurrentUser();
  redirectToStep(hasFullAccess(user) ? "perfil" : "pago");
}

export async function editIdeaRedirect(): Promise<void> {
  redirectToStep("idea");
}

/**
 * «Suscribirme»: con Stripe habilitado redirige a Checkout; sin él, activa la
 * suscripción simulada de la CUENTA ($99 MXN/mes). El gate de reportes mira la cuenta (`hasFullAccess`), así
 * que desbloquea todas las evaluaciones, también las anteriores.
 */
export async function savePayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = paymentSchema.safeParse({
    planId: formData.get("planId") ?? SUBSCRIPTION_PLAN_ID,
  });

  if (!parsed.success) {
    return validationError(parsed.error, formData);
  }

  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      message: "Inicia sesión para suscribirte.",
    };
  }

  const result = await startSubscription(user, {
    returnTo: "onboarding",
    assessmentId: assessment.asmt_id,
  });
  if (result.kind === "error") return { success: false, message: result.message };
  if (result.kind === "redirect") redirect(result.url);

  redirectToStep("perfil");
}

/** «Continuar gratis»: sigue el onboarding sin suscribirse (freemium). */
export async function continueFree(): Promise<void> {
  await requireAssessment();
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

  redirectToStep("productos");
}

export async function saveProducts(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  let rawProducts: unknown = [];
  try {
    rawProducts = JSON.parse(String(formData.get("productsJson") ?? "[]"));
  } catch {
    rawProducts = [];
  }

  const parsed = productsSchema.safeParse({ products: rawProducts });
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Revisa los datos de tus productos y servicios.",
    };
  }

  const products = parsed.data.products;
  const blend = blendProducts(products);

  const derived = {
    finp_products: products,
    finp_price_per_sale: blend.pricePerSale,
    finp_variable_cost_per_sale: blend.variableCostPerSale,
    finp_estimated_monthly_sales: blend.estimatedMonthlySales,
  };

  await prisma.financial_inputs.upsert({
    where: { finp_asmt_id: assessment.asmt_id },
    create: { finp_asmt_id: assessment.asmt_id, ...derived },
    update: derived,
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
    fixedMonthlyCostsRange: formData.get("fixedMonthlyCostsRange"),
    currency: formData.get("currency") ?? "MXN",
  });

  const marketParsed = evaluationMarketSchema.safeParse({
    customerEvidenceLevel: formData.get("customerEvidenceLevel"),
    competitionLevel: formData.get("competitionLevel"),
    acquisitionChannel: formData.get("acquisitionChannel"),
    businessDependencies: formData.getAll("businessDependencies"),
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
      finp_fixed_monthly_costs_range: fin.fixedMonthlyCostsRange,
      finp_currency: fin.currency,
    },
    update: {
      finp_initial_investment: fin.initialInvestment,
      finp_fixed_monthly_costs_range: fin.fixedMonthlyCostsRange,
      finp_currency: fin.currency,
    },
  });

  await prisma.market_risk_inputs.upsert({
    where: { mrsk_asmt_id: assessment.asmt_id },
    create: {
      mrsk_asmt_id: assessment.asmt_id,
      mrsk_customer_evidence_level: mkt.customerEvidenceLevel,
      mrsk_has_talked_to_customers: mkt.customerEvidenceLevel !== "ninguno",
      mrsk_competition_level: mkt.competitionLevel,
      mrsk_acquisition_channel: mkt.acquisitionChannel,
      mrsk_business_dependencies: mkt.businessDependencies,
      mrsk_main_concern: mkt.mainConcern,
      mrsk_success_condition: mkt.successCondition,
    },
    update: {
      mrsk_customer_evidence_level: mkt.customerEvidenceLevel,
      mrsk_has_talked_to_customers: mkt.customerEvidenceLevel !== "ninguno",
      mrsk_competition_level: mkt.competitionLevel,
      mrsk_acquisition_channel: mkt.acquisitionChannel,
      mrsk_business_dependencies: mkt.businessDependencies,
      mrsk_main_concern: mkt.mainConcern,
      mrsk_success_condition: mkt.successCondition,
    },
  });

  const researchEnabled = formData
    .getAll("researchEnabled")
    .some((v) => v === "true" || v === "on");

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: {
      asmt_status: "in_progress",
      asmt_research_enabled: researchEnabled,
    },
  });

  const refreshed = await getAssessmentById(assessment.asmt_id);
  if (!refreshed) redirectToStep("contacto");

  await trackServer(
    refreshed.asmt_user_id,
    ANALYTICS_EVENTS.onboardingCompleted,
    { assessmentId: assessment.asmt_id }
  );

  const user = await getCurrentUser();
  if (!user || !refreshed.asmt_user_id) {
    return {
      success: false,
      message: "Inicia sesión para generar tu diagnóstico.",
    };
  }

  const observability = createAiObservabilityContext(
    refreshed.asmt_id,
    refreshed.asmt_user_id
  );

  const { deterministic, interpretation } =
    await runScoringPipeline(refreshed, observability);

  const gen = await generateReportWithCredits({
    assessment: refreshed,
    userId: user.user_id,
    creditsBalance: user.user_credits_balance,
    deterministic,
    interpretation,
    observability,
  });

  if (gen.kind === "insufficient") {
    redirect(`${CREDITS_PACKAGES_PATH}?saldo=1`);
  }

  if (gen.kind === "failed") {
    logReportGenerationError("Report generation failed during evaluation", {
      assessmentId: assessment.asmt_id,
      error: gen.error,
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
  } else {
    logReportGenerationSuccess("Report generated successfully", {
      assessmentId: assessment.asmt_id,
      metadata: { email: assessment.asmt_email },
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

  const observability = createAiObservabilityContext(
    refreshed.asmt_id,
    refreshed.asmt_user_id
  );


  const user = await getCurrentUser();
  if (!user || !refreshed.asmt_user_id) {
    return {
      success: false,
      message: "Inicia sesión para reintentar la generación.",
    };
  }

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: { asmt_status: "in_progress" },
  });

  const { deterministic, interpretation } =
    await runScoringPipeline(refreshed, observability);

  const gen = await generateReportWithCredits({
    assessment: refreshed,
    userId: user.user_id,
    creditsBalance: user.user_credits_balance,
    deterministic,
    interpretation,
    observability,
  });

  if (gen.kind === "insufficient") {
    redirect(`${CREDITS_PACKAGES_PATH}?saldo=1`);
  }

  if (gen.kind === "failed") {
    logReportGenerationError("Report generation retry failed", {
      assessmentId: assessment.asmt_id,
      error: gen.error,
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

  logReportGenerationSuccess("Report generated successfully on retry", {
    assessmentId: assessment.asmt_id,
  });

  return {
    success: true,
    message: "Reporte generado exitosamente.",
  };
}

async function resolveOwnedAssessment(assessmentId?: string | null) {
  const user = await getCurrentUser();
  if (!user) return { error: "Inicia sesión para desbloquear." as const };

  const fromCookie = await getCurrentAssessment();
  const id = assessmentId || fromCookie?.asmt_id;
  if (!id) return { error: "No se encontró la evaluación." as const };

  const assessment = await getAssessmentById(id);
  if (!assessment || assessment.asmt_user_id !== user.user_id) {
    return { error: "No se encontró la evaluación." as const };
  }
  return { user, assessment };
}

/** Desbloquear preview: cobra básico y quita el gate UI (sin regenerar). */
export async function unlockReportBasic(
  assessmentId?: string,
): Promise<ActionState> {
  const resolved = await resolveOwnedAssessment(assessmentId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }
  const { user, assessment } = resolved;

  const result = await unlockReportWithoutRegenerate({
    userId: user.user_id,
    assessmentId: assessment.asmt_id,
    alreadyChargedAt: assessment.asmt_credits_charged_at,
    creditsBalance: user.user_credits_balance,
  });

  if (result === "insufficient") {
    redirect(`${CREDITS_PACKAGES_PATH}?saldo=1`);
  }

  revalidatePath("/analizar/resultado");
  revalidatePath(`/cuenta/evaluaciones/${assessment.asmt_id}`);
  return { success: true, message: "Reporte desbloqueado." };
}

/**
 * Desbloquear con investigación: cobra (o la diferencia), regenera el reporte.
 */
export async function unlockReportWithResearch(
  assessmentId?: string,
): Promise<ActionState> {
  const resolved = await resolveOwnedAssessment(assessmentId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }
  const { user, assessment } = resolved;

  const charge = await chargeForResearchUpgrade({
    userId: user.user_id,
    assessmentId: assessment.asmt_id,
    alreadyChargedAt: assessment.asmt_credits_charged_at,
    priorCost: assessment.asmt_credit_cost,
    creditsBalance: user.user_credits_balance,
  });

  if (charge.kind === "insufficient") {
    redirect(`${CREDITS_PACKAGES_PATH}?saldo=1`);
  }

  const refreshed = await getAssessmentById(assessment.asmt_id);
  if (!refreshed) {
    return { success: false, message: "No se encontró la evaluación." };
  }

  const observability = createAiObservabilityContext(
    refreshed.asmt_id,
    refreshed.asmt_user_id,
  );

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: { asmt_status: "in_progress" },
  });

  const { deterministic, interpretation } =
    await runScoringPipeline(refreshed, observability);

  const gen = await generateReportWithCredits({
    assessment: { ...refreshed, asmt_research_enabled: true },
    userId: user.user_id,
    creditsBalance: user.user_credits_balance,
    deterministic,
    interpretation,
    observability,
  });

  if (gen.kind === "failed") {
    await prisma.assessments.update({
      where: { asmt_id: assessment.asmt_id },
      data: { asmt_status: "failed", asmt_completed_at: new Date() },
    });
    return {
      success: false,
      message: "No se pudo regenerar el reporte con investigación.",
    };
  }

  revalidatePath("/analizar/resultado");
  return { success: true, message: "Reporte actualizado con investigación." };
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

  await trackServer(assessment.asmt_user_id, ANALYTICS_EVENTS.feedbackSubmitted, {
    rating: data.rating,
    would_recommend: data.wouldRecommend === "true",
    testimonial_consent: data.testimonialConsent ?? false,
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

  // Same path as any other "start an evaluation" entry point, so the new
  // assessment is owned by the account and the freemium limit applies.
  // Without an account nothing is created here: saveContact creates the
  // account and its assessment.
  await startAssessmentForCurrentUser();
}
