"use server";

import { redirect } from "next/navigation";
import {
  generateFallbackIdeaSummary,
  generateFallbackIdeaRefinement,
  generateIdeaRefinement,
  generateIdeaSummary,
} from "@/lib/ai/openai";
import { parseAssumptions, packIdeaAiPayload } from "@/lib/ai/schemas/idea-assumptions";
import type { StructuredUnderstanding } from "@/lib/ai/schemas/structured-understanding";
import { generateReport } from "@/lib/ai/generate-report";
import { runScoringPipeline } from "@/lib/scoring";
import {
  contactSchema,
  ideaSchema,
  profileSchema,
  resourcesSchema,
  personalFitSchema,
  paymentSchema,
  evaluationFinancialSchema,
  evaluationMarketSchema,
  parseFieldErrors,
  refineIdeaSchema,
  type ActionState,
  type RefineIdeaState,
} from "@/lib/onboarding/schemas";
import { PAYMENT_PLANS } from "@/lib/onboarding/options";
import {
  getCurrentAssessment,
  getAssessmentById,
  setAssessmentCookie,
} from "@/lib/onboarding/session-server";
import { getStepBySlug } from "@/lib/onboarding/steps";
import { prisma } from "@/lib/prisma";
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

export async function saveContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
  }

  const { email, name, phone, country } = parsed.data;

  const existing = await getCurrentAssessment();
  let asmtId: string;

  if (existing) {
    await prisma.assessments.update({
      where: { asmt_id: existing.asmt_id },
      data: {
        asmt_email: email,
        asmt_name: name,
        asmt_phone: phone,
        asmt_country: country,
      },
    });
    asmtId = existing.asmt_id;
  } else {
    const assessment = await prisma.assessments.create({
      data: {
        asmt_email: email,
        asmt_name: name,
        asmt_phone: phone,
        asmt_country: country,
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
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
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
  try {
    refinement = await generateIdeaRefinement({
      originalDescription: idea.bide_original_description ?? "",
      currentSummary: idea.bide_ai_summary,
      selectedAssumptions,
      clarifications: parsed.data.clarifications ?? {},
    });
  } catch {
    refinement = generateFallbackIdeaRefinement({
      currentSummary: idea.bide_ai_summary,
      selectedAssumptions,
      clarifications: parsed.data.clarifications ?? {},
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
    message: "Tu idea quedó más clara. Revisa el resumen actualizado.",
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
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
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

export async function saveProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = profileSchema.safeParse({
    currentSituation: formData.get("currentSituation"),
    mainGoal: formData.get("mainGoal"),
    entrepreneurshipExperience: formData.get("entrepreneurshipExperience"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
  }

  const data = parsed.data;

  await prisma.assessment_profiles.upsert({
    where: { aprf_asmt_id: assessment.asmt_id },
    create: {
      aprf_asmt_id: assessment.asmt_id,
      aprf_current_situation: data.currentSituation,
      aprf_main_goal: data.mainGoal,
      aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
    },
    update: {
      aprf_current_situation: data.currentSituation,
      aprf_main_goal: data.mainGoal,
      aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
    },
  });

  redirectToStep("recursos");
}

export async function saveResources(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const assessment = await requireAssessment();

  const parsed = resourcesSchema.safeParse({
    capitalAvailableRange: formData.get("capitalAvailableRange"),
    acceptableLossRange: formData.get("acceptableLossRange"),
    hoursPerWeekRange: formData.get("hoursPerWeekRange"),
    availableSchedule: formData.get("availableSchedule"),
    expectedIncomeTimeframe: formData.get("expectedIncomeTimeframe"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
  }

  const data = parsed.data;

  await prisma.assessment_profiles.upsert({
    where: { aprf_asmt_id: assessment.asmt_id },
    create: {
      aprf_asmt_id: assessment.asmt_id,
      aprf_capital_available_range: data.capitalAvailableRange,
      aprf_acceptable_loss_range: data.acceptableLossRange,
      aprf_hours_per_week_range: data.hoursPerWeekRange,
      aprf_available_schedule: data.availableSchedule,
      aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
    },
    update: {
      aprf_capital_available_range: data.capitalAvailableRange,
      aprf_acceptable_loss_range: data.acceptableLossRange,
      aprf_hours_per_week_range: data.hoursPerWeekRange,
      aprf_available_schedule: data.availableSchedule,
      aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
    },
  });

  redirectToStep("ajuste");
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
    return { success: false, fieldErrors: parseFieldErrors(parsed.error) };
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
    },
    update: {
      pfit_enjoyed_activities: data.enjoyedActivities,
      pfit_work_preference: data.workPreference,
      pfit_sales_comfort_score: data.salesComfortScore,
      pfit_uncertainty_comfort_score: data.uncertaintyComfortScore,
      pfit_hiring_preference: data.hiringPreference,
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
    return {
      success: false,
      fieldErrors: parseFieldErrors(financialParsed.error),
    };
  }
  if (!marketParsed.success) {
    return {
      success: false,
      fieldErrors: parseFieldErrors(marketParsed.error),
    };
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
