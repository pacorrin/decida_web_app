import { generateJson, generateText, getNarrativeModel } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { parseStoredProducts } from "@/lib/onboarding/products";
import { BUSINESS_DEPENDENCY_OPTIONS } from "@/lib/onboarding/options";

const DEPENDENCY_LABEL = new Map(
  BUSINESS_DEPENDENCY_OPTIONS.map((o) => [o.value, o.label])
);

function dependencyLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d): d is string => typeof d === "string" && d !== "ninguna")
    .map((d) => DEPENDENCY_LABEL.get(d) ?? d);
}
import type { ScoringInterpretResult } from "@/lib/ai/schemas/scoring-interpret";
import type { DeterministicScoreResult } from "@/lib/scoring/types";
import { detectDeterministicStrengths } from "@/lib/scoring/strengths";
import type {
  ReportRisk,
  ReportStrength,
  ValidationWeek,
} from "@/lib/report/sections";
import {
  STRENGTHS_RISKS_SYSTEM_PROMPT,
  VALIDATION_PLAN_SYSTEM_PROMPT,
  buildStrengthsRisksPrompt,
  buildValidationPlanPrompt,
  strengthsRisksSchema,
  validationPlanSchema,
} from "@/lib/ai/schemas/report-sections";
import { logReportGenerationError } from "@/lib/logging/report-logger";

/**
 * Bumped to v1.1.0 when the JSON sections moved to `generateJson` + Zod and
 * `arep_strengths` / `arep_risks` / `arep_validation_plan` changed shape.
 * Rows written before that carry v1.0.0 and are read through the legacy branch
 * of `parseStored*` in `src/lib/report/sections.ts`.
 */
export const REPORT_PROMPT_VERSION = "v1.1.0";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const BASE_SYSTEM = `Eres un consultor de viabilidad de negocios para Decida.
Escribe en español mexicano, tono claro, directo y accionable.
NO inventes números — usa SOLO los datos proporcionados.
Sé honesto sobre riesgos. Máximo 3 párrafos cortos por sección.

Puedes usar formato Markdown para mejorar la presentación:
- **Negritas** para destacar puntos clave
- *Cursivas* para énfasis
- Listas con - o números para organizar información
- Tablas cuando sea apropiado para presentar datos
- > para citas o notas importantes

Usa markdown de forma moderada y profesional.`;

type ReportContext = {
  idea: string;
  scores: string;
  metrics: string;
  interpretation: string;
  profile: string;
  products: string;
  dependencies: string;
};

function buildContext(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult
): ReportContext {
  return {
    idea: assessment.business_idea?.bide_ai_summary ?? "",
    products: JSON.stringify(
      parseStoredProducts(assessment.financial_inputs?.finp_products).map(
        (p) => ({
          nombre: p.name,
          tipo: p.kind,
          precio: p.price,
          costo_variable: p.variableCost,
          unidades_mes: p.monthlyUnits,
        })
      )
    ),
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
      acceptableLoss: assessment.assessment_profile?.aprf_acceptable_loss_range,
      initialInvestment: Number(
        assessment.financial_inputs?.finp_initial_investment ?? 0
      ) || null,
      hours: assessment.assessment_profile?.aprf_hours_per_week_range,
    }),
    dependencies: JSON.stringify(
      dependencyLabels(assessment.market_risk_inputs?.mrsk_business_dependencies)
    ),
  };
}

const SECTION_PROMPTS: Record<
  string,
  (ctx: ReportContext) => string
> = {
  executive_summary: (ctx) =>
    `Escribe un resumen ejecutivo del diagnóstico.\nIdea: ${ctx.idea}\nScores: ${ctx.scores}\nInterpretación: ${ctx.interpretation}`,
  business_understanding: (ctx) =>
    `Explica cómo entendemos el negocio del usuario y su propuesta de valor.\nIdea: ${ctx.idea}\nPerfil: ${ctx.profile}\nProductos/servicios que planea vender: ${ctx.products}`,
  financial_analysis: (ctx) =>
    `Analiza la viabilidad financiera usando SOLO estas métricas: ${ctx.metrics}\nScores financieros: ${ctx.scores}\nProductos/servicios y sus precios/costos/volúmenes: ${ctx.products}\nComenta el margen por producto y si alguno se vende con pérdida.`,
  personal_fit_analysis: (ctx) =>
    `Analiza la compatibilidad entre la persona y este tipo de negocio.\nPerfil: ${ctx.profile}\nIdea: ${ctx.idea}`,
  time_operation_analysis: (ctx) =>
    `Analiza si el negocio cabe en el tiempo disponible del usuario.\nPerfil: ${ctx.profile}`,
  scalability_analysis: (ctx) =>
    `Analiza el potencial de escalabilidad.\nIdea: ${ctx.idea}\nScores: ${ctx.scores}`,
  final_recommendation: (ctx) =>
    `Escribe la recomendación final en 2 párrafos.\nInterpretación: ${ctx.interpretation}\nIdea: ${ctx.idea}`,
};

async function generateSection(
  key: string,
  ctx: ReportContext,
  retryCount = 0
): Promise<string> {
  const promptFn = SECTION_PROMPTS[key];
  if (!promptFn) throw new Error(`Unknown section: ${key}`);
  
  try {
    return await generateText(BASE_SYSTEM, promptFn(ctx));
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Retrying section ${key} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
      return generateSection(key, ctx, retryCount + 1);
    }
    throw new Error(`Failed to generate section ${key} after ${MAX_RETRIES} retries: ${error}`);
  }
}

/**
 * The two sections that must come back as JSON go through `generateJson`
 * (`response_format: json_object`) with their own system prompts, never through
 * BASE_SYSTEM — that prompt instructs Markdown, which made the model fence its
 * JSON and broke `JSON.parse` on every single report.
 */
async function generateStrengthsRisks(
  ctx: ReportContext,
  verifiedFacts: string[]
) {
  const raw = await generateJson<unknown>(
    STRENGTHS_RISKS_SYSTEM_PROMPT,
    buildStrengthsRisksPrompt({
      idea: ctx.idea,
      scores: ctx.scores,
      metrics: ctx.metrics,
      profile: ctx.profile,
      products: ctx.products,
      dependencies: ctx.dependencies,
      interpretation: ctx.interpretation,
      verifiedFacts,
    })
  );
  return strengthsRisksSchema.parse(raw);
}

async function generateValidationPlan(ctx: ReportContext) {
  const raw = await generateJson<unknown>(
    VALIDATION_PLAN_SYSTEM_PROMPT,
    buildValidationPlanPrompt({
      idea: ctx.idea,
      interpretation: ctx.interpretation,
      products: ctx.products,
      profile: ctx.profile,
    })
  );
  return validationPlanSchema.parse(raw);
}

/**
 * Deterministic strengths are a safety net, not a supplement: the AI already
 * receives them as verified facts, so topping up a healthy response just
 * produces near-duplicates ("Margen bruto del 60%" next to "Margen bruto de
 * 60%"). Only fill in when the AI came back thin.
 */
const MIN_AI_STRENGTHS = 3;

function mergeStrengths(
  fromAi: ReportStrength[],
  deterministic: ReportStrength[]
): ReportStrength[] {
  if (fromAi.length >= MIN_AI_STRENGTHS) return fromAi;

  const seen = new Set(fromAi.map((s) => s.title.toLowerCase()));
  const merged = [...fromAi];
  for (const s of deterministic) {
    if (merged.length >= MIN_AI_STRENGTHS) break;
    if (seen.has(s.title.toLowerCase())) continue;
    seen.add(s.title.toLowerCase());
    merged.push(s);
  }
  return merged;
}

export async function generateReport(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult
) {
  const ctx = buildContext(assessment, deterministic, interpretation);
  const model = getNarrativeModel();

  // Computed up front: fed to the AI as verified facts so its strengths stay
  // anchored to real numbers, and reused as the fallback if the call fails.
  const deterministicStrengths = detectDeterministicStrengths(
    assessment,
    deterministic.metrics
  );
  const verifiedFacts = deterministicStrengths.map(
    (s) => `${s.title}: ${s.whyItMatters}`
  );

  const [
    executiveSummary,
    businessUnderstanding,
    financialAnalysis,
    personalFitAnalysis,
    timeOperationAnalysis,
    scalabilityAnalysis,
    finalRecommendation,
    strengthsRisks,
    validationWeeks,
  ] = await Promise.all([
    generateSection("executive_summary", ctx),
    generateSection("business_understanding", ctx),
    generateSection("financial_analysis", ctx),
    generateSection("personal_fit_analysis", ctx),
    generateSection("time_operation_analysis", ctx),
    generateSection("scalability_analysis", ctx),
    generateSection("final_recommendation", ctx),

    generateStrengthsRisks(ctx, verifiedFacts).catch((error) => {
      logReportGenerationError(
        "strengths_risks: respuesta de IA inválida, usando fortalezas determinísticas",
        { assessmentId: assessment.asmt_id, error }
      );
      return null;
    }),
    generateValidationPlan(ctx).catch((error) => {
      logReportGenerationError("validation_plan: respuesta de IA inválida", {
        assessmentId: assessment.asmt_id,
        error,
      });
      return null;
    }),
  ]);

  // Strengths: AI first, topped up with deterministic ones so the section is
  // never a single empty platitude. When nothing fires at all we store [] and
  // the report renders an honest empty state — we never fabricate a strength.
  const strengths: ReportStrength[] = mergeStrengths(
    strengthsRisks?.strengths ?? [],
    deterministicStrengths
  );

  // Risks come only from the AI now. The deterministic red flags live in
  // `ascs_red_flags` and are rendered separately — merging them here is what
  // made every risk show up twice.
  const risks: ReportRisk[] = strengthsRisks?.risks ?? [];

  const validationPlan: ValidationWeek[] = validationWeeks?.weeks ?? [];

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
