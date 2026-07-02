import { generateText, getNarrativeModel } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import type { ScoringInterpretResult } from "@/lib/ai/schemas/scoring-interpret";
import type { DeterministicScoreResult } from "@/lib/scoring/types";

const REPORT_PROMPT_VERSION = "v1.0.0";

const BASE_SYSTEM = `Eres un consultor de viabilidad de negocios para Decida.
Escribe en español mexicano, tono claro, directo y accionable.
NO inventes números — usa SOLO los datos proporcionados.
Sé honesto sobre riesgos. Máximo 3 párrafos cortos por sección.`;

type ReportContext = {
  idea: string;
  scores: string;
  metrics: string;
  interpretation: string;
  profile: string;
};

function buildContext(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult
): ReportContext {
  return {
    idea: assessment.business_idea?.bide_ai_summary ?? "",
    scores: JSON.stringify(
      deterministic.dimensions.map((d) => ({
        dimension: d.label,
        score: d.score,
      }))
    ),
    metrics: JSON.stringify(deterministic.metrics),
    interpretation: JSON.stringify({
      recommendation: interpretation.final_recommendation,
      red_flags: interpretation.red_flags,
      summary: interpretation.reasoning_summary,
    }),
    profile: JSON.stringify({
      goal: assessment.assessment_profile?.aprf_main_goal,
      situation: assessment.assessment_profile?.aprf_current_situation,
      capital: assessment.assessment_profile?.aprf_capital_available_range,
      hours: assessment.assessment_profile?.aprf_hours_per_week_range,
    }),
  };
}

const SECTION_PROMPTS: Record<
  string,
  (ctx: ReportContext) => string
> = {
  executive_summary: (ctx) =>
    `Escribe un resumen ejecutivo del diagnóstico.\nIdea: ${ctx.idea}\nScores: ${ctx.scores}\nInterpretación: ${ctx.interpretation}`,
  business_understanding: (ctx) =>
    `Explica cómo entendemos el negocio del usuario y su propuesta de valor.\nIdea: ${ctx.idea}\nPerfil: ${ctx.profile}`,
  financial_analysis: (ctx) =>
    `Analiza la viabilidad financiera usando SOLO estas métricas: ${ctx.metrics}\nScores financieros: ${ctx.scores}`,
  personal_fit_analysis: (ctx) =>
    `Analiza la compatibilidad entre la persona y este tipo de negocio.\nPerfil: ${ctx.profile}\nIdea: ${ctx.idea}`,
  time_operation_analysis: (ctx) =>
    `Analiza si el negocio cabe en el tiempo disponible del usuario.\nPerfil: ${ctx.profile}`,
  scalability_analysis: (ctx) =>
    `Analiza el potencial de escalabilidad.\nIdea: ${ctx.idea}\nScores: ${ctx.scores}`,
  strengths_risks: (ctx) =>
    `Genera JSON con fortalezas y riesgos: {"strengths": ["..."], "risks": ["..."]}\nDatos: ${ctx.interpretation}\nScores: ${ctx.scores}`,
  validation_plan: (ctx) =>
    `Genera JSON con plan de validación de 2 semanas: {"week1": ["..."], "week2": ["..."]}\nRecomendación: ${ctx.interpretation}`,
  final_recommendation: (ctx) =>
    `Escribe la recomendación final en 2 párrafos.\nInterpretación: ${ctx.interpretation}\nIdea: ${ctx.idea}`,
};

async function generateSection(
  key: string,
  ctx: ReportContext
): Promise<string> {
  const promptFn = SECTION_PROMPTS[key];
  if (!promptFn) throw new Error(`Unknown section: ${key}`);
  return generateText(BASE_SYSTEM, promptFn(ctx));
}

export async function generateReport(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult
) {
  const ctx = buildContext(assessment, deterministic, interpretation);
  const model = getNarrativeModel();

  const [
    executiveSummary,
    businessUnderstanding,
    financialAnalysis,
    personalFitAnalysis,
    timeOperationAnalysis,
    scalabilityAnalysis,
    strengthsRisksRaw,
    validationPlanRaw,
    finalRecommendation,
  ] = await Promise.all([
    generateSection("executive_summary", ctx),
    generateSection("business_understanding", ctx),
    generateSection("financial_analysis", ctx),
    generateSection("personal_fit_analysis", ctx),
    generateSection("time_operation_analysis", ctx),
    generateSection("scalability_analysis", ctx),
    generateSection("strengths_risks", ctx),
    generateSection("validation_plan", ctx),
    generateSection("final_recommendation", ctx),
  ]);

  let strengths: string[] = [];
  let risks: string[] = [];
  let validationPlan: { week1: string[]; week2: string[] } = {
    week1: [],
    week2: [],
  };

  try {
    const parsed = JSON.parse(strengthsRisksRaw);
    strengths = parsed.strengths ?? [];
    risks = parsed.risks ?? [];
  } catch {
    strengths = ["Tu idea tiene elementos a favor según tu perfil."];
    risks = interpretation.red_flags;
  }

  try {
    validationPlan = JSON.parse(validationPlanRaw);
  } catch {
    validationPlan = {
      week1: ["Hablar con 10 clientes potenciales", "Investigar precios de competidores"],
      week2: ["Hacer una prueba piloto", "Calcular margen real"],
    };
  }

  const reportData = {
    arep_executive_summary: executiveSummary,
    arep_business_understanding: businessUnderstanding,
    arep_strengths: strengths,
    arep_risks: risks,
    arep_personal_fit_analysis: personalFitAnalysis,
    arep_financial_analysis: financialAnalysis,
    arep_time_operation_analysis: timeOperationAnalysis,
    arep_scalability_analysis: scalabilityAnalysis,
    arep_validation_plan: validationPlan,
    arep_final_recommendation_text: finalRecommendation,
    arep_ai_model_used: model,
    arep_prompt_version: REPORT_PROMPT_VERSION,
  };

  await prisma.assessment_reports.upsert({
    where: { arep_asmt_id: assessment.asmt_id },
    create: { arep_asmt_id: assessment.asmt_id, ...reportData },
    update: reportData,
  });

  await prisma.assessments.update({
    where: { asmt_id: assessment.asmt_id },
    data: {
      asmt_status: "report_generated",
      asmt_report_generated_at: new Date(),
      asmt_completed_at: new Date(),
    },
  });

  return reportData;
}
