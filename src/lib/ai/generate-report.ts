import {
  generateJson,
  generateText,
  getNarrativeModel,
  type AiObservabilityContext,
} from "@/lib/ai/openai";
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
import {
  buildFinancialInputs,
  buildFounderProfile,
  buildIdeaContext,
  buildMarketInputs,
  buildScoresForAi,
  sanitizeSectionMarkdown,
} from "@/lib/ai/report-context";
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
export const REPORT_PROMPT_VERSION = "v1.3.0";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const BASE_SYSTEM = `Eres un consultor de viabilidad de negocios para Decida.
Escribe en español mexicano, tono claro, directo y accionable. TODO el texto va en español (di "alertas", no "red flags").
NO inventes números — usa SOLO los datos proporcionados.
Sé honesto sobre riesgos. Máximo 3 párrafos cortos por sección.

Cómo hablar:
- Háblale SIEMPRE de "tú" a la persona que emprende. Nunca digas "el usuario" ni "el emprendedor".
- Habla de LA IDEA CONCRETA de la persona (su giro, su cliente, sus productos). Nunca des consejos genéricos de otros negocios (comercio electrónico, consultoría, freelancing) ni propongas cambiar de modelo.
- Los datos de "emprendedor" describen a la persona que emprende; NO son el perfil de su cliente.

Qué hacer con lo que falta:
- NO inventes lo que la persona no dijo (a quién le vende, dónde, a qué precio, con qué competencia). Si falta, dilo como algo por aclarar o como supuesto.
- Recibes "claridad_de_la_idea" (nivel "clara", "parcial" o "vaga" y qué falta saber). Si no es "clara", reconócelo explícitamente y no saques conclusiones firmes sobre lo que falta.
- La "idea_original" son las palabras de la persona (es la fuente). La "interpretacion_de_la_ia" es una lectura que ella confirmó: úsala como apoyo, no como dato verificado.
- Lo que la persona declaró del mercado ("mercado_declarado") es su percepción, no un dato externo: dilo así cuando lo cites.

Cómo leer los puntajes (0 a 100):
- En todas las dimensiones, puntaje alto = más favorable, EXCEPTO "Nivel de riesgo", donde puntaje alto = MÁS riesgo.
- Cada dimensión trae su "semaforo" (verde, amarillo o rojo). No contradigas el semáforo ni la recomendación que se te da.
- Cita un puntaje solo si ayuda, siempre con su significado correcto.

Formato (Markdown):
- NO escribas el título de la sección: el reporte ya lo muestra. Empieza directo con el contenido.
- Si necesitas subtítulos usa "###" y solo si aportan. Puedes usar **negritas** y listas con "-".
- NO uses fórmulas LaTeX ni símbolos de fórmula ni corchetes de fórmula. Escribe los cálculos en texto plano, por ejemplo: "695 − 385 = 310".`;

type ReportContext = {
  idea: string;
  ideaOriginal: string;
  ideaInterpretation: string;
  clarity: string;
  clarityLevel: "clara" | "parcial" | "vaga";
  scores: string;
  metrics: string;
  interpretation: string;
  profile: string;
  products: string;
  dependencies: string;
  market: string;
  financialInputs: string;
};

function buildContext(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult
): ReportContext {
  const ideaCtx = buildIdeaContext(assessment);
  return {
    idea: assessment.business_idea?.bide_ai_summary ?? "",
    ideaOriginal: ideaCtx.original,
    ideaInterpretation: JSON.stringify(ideaCtx.interpretation),
    clarity: JSON.stringify({
      nivel: ideaCtx.clarity.level,
      palabras: ideaCtx.clarity.words,
      falta_saber: ideaCtx.clarity.missing,
    }),
    clarityLevel: ideaCtx.clarity.level,
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
    scores: JSON.stringify(buildScoresForAi(deterministic, interpretation)),
    metrics: JSON.stringify(deterministic.metrics),
    interpretation: JSON.stringify({
      recomendacion: interpretation.final_recommendation,
      alertas: interpretation.red_flags,
      resumen: interpretation.reasoning_summary,
    }),
    profile: JSON.stringify(buildFounderProfile(assessment)),
    dependencies: JSON.stringify(
      dependencyLabels(assessment.market_risk_inputs?.mrsk_business_dependencies)
    ),
    market: JSON.stringify(buildMarketInputs(assessment)),
    financialInputs: JSON.stringify(buildFinancialInputs(assessment)),
  };
}

/** Bloque común de contexto de la idea para las secciones. */
const ideaBlock = (ctx: ReportContext) =>
  `Idea (en palabras de la persona): ${ctx.ideaOriginal || ctx.idea}
Interpretación de la IA que la persona confirmó (apoyo, no dato verificado): ${ctx.ideaInterpretation}
Claridad de la idea: ${ctx.clarity}`;

const SECTION_PROMPTS: Record<
  string,
  (ctx: ReportContext) => string
> = {
  executive_summary: (ctx) =>
    `Escribe el resumen ejecutivo del diagnóstico: un párrafo de 4 a 5 oraciones que diga qué es la idea, cómo salió (apóyate en los semáforos) y cuál es la recomendación y por qué.
${ctx.clarityLevel === "clara" ? "" : "La idea NO está clara: empieza diciendo, sin dramatizar, que está poco definida para concluir con firmeza y qué falta saber.\n"}No enumeres las alertas ni los riesgos uno por uno (van en otras secciones): menciónalos en una sola frase si hace falta. Si la persona declaró competencia alta o poca evidencia de clientes, tenlo en cuenta en la lectura.
${ideaBlock(ctx)}
Puntajes y semáforos: ${ctx.scores}
Mercado declarado por la persona: ${ctx.market}
Interpretación: ${ctx.interpretation}`,
  business_understanding: (ctx) =>
    `Explica cómo entendemos el negocio y su propuesta de valor, en dos partes breves: (1) qué ofreces y por qué te compraría tu cliente; (2) quién es ese cliente.
El cliente se describe SOLO con lo que dice la idea. Si la idea no precisa algo del cliente (edad, ingreso, hábitos), dilo como un supuesto por validar. Los datos del emprendedor NO son el perfil del cliente: no los uses para describirlo.
${ideaBlock(ctx)}
Productos/servicios que planeas vender: ${ctx.products}
Emprendedor (solo como contexto de arranque): ${ctx.profile}`,
  financial_analysis: (ctx) =>
    `Analiza la viabilidad financiera usando SOLO estas métricas: ${ctx.metrics}
Datos financieros declarados (inversión y costos fijos): ${ctx.financialInputs}
Puntajes y semáforos: ${ctx.scores}
Productos/servicios y sus precios/costos/volúmenes: ${ctx.products}
Comenta el margen por producto, si alguno se vende con pérdida, el punto de equilibrio y la recuperación de la inversión. Si un producto se vende con pérdida, di con claridad que ningún volumen lo vuelve rentable. Escribe los cálculos en texto plano (sin fórmulas). Los precios y costos son estimaciones de la persona: no los presentes como datos de mercado.`,
  personal_fit_analysis: (ctx) =>
    `Analiza qué tan bien encajas tú con ESTE negocio en particular. Primero piensa qué exige concretamente esta idea (tipo de trabajo, ventas, operación diaria, contratar o no) y compáralo con lo que sabemos de ti: actividades que disfrutas, preferencia de trabajo, comodidad vendiendo, tolerancia a la incertidumbre, comodidad con procesos y si contratarías.
Da 2 puntos donde encajas y 2 brechas PERSONALES (de tus habilidades, tiempo o preferencias; no uses la viabilidad comercial ni el nivel de riesgo como brecha personal), cada brecha con una acción concreta. No presentes como encaje algo que tus propias respuestas contradicen.
${ideaBlock(ctx)}
Emprendedor (tú): ${ctx.profile}
Puntajes y semáforos: ${ctx.scores}`,
  time_operation_analysis: (ctx) =>
    `Analiza si ESTE negocio cabe en tu tiempo. Con la idea y las unidades mensuales, describe qué trabajo concreto implica (por ejemplo: producción, entregas, atención a clientes, compras) y compáralo con tus horas por semana y tu disponibilidad horaria. Di qué parte podría saturarte y cómo organizarla.
Distingue lo que se hace una vez (crear el producto) de lo que se repite con cada venta; no multipliques una por la otra. No propongas otros modelos de negocio: trabaja con el que describió la persona. No inventes tiempos que no se desprendan de los datos; si estimas, di que es una estimación.
${ideaBlock(ctx)}
Productos/servicios y volumen mensual: ${ctx.products}
Canal para conseguir clientes: ${ctx.market}
Emprendedor (tú): ${ctx.profile}
Puntajes y semáforos: ${ctx.scores}`,
  scalability_analysis: (ctx) =>
    `Analiza el potencial de crecimiento de ESTE negocio: qué lo haría crecer sin que crezca igual tu carga de trabajo, y qué lo frenaría (capacidad, dependencias, competencia, contratación). Usa tu preferencia de contratación, las dependencias declaradas, el nivel de competencia que declaraste y el canal con el que piensas conseguir clientes; propón crecimiento coherente con ese canal.
${ideaBlock(ctx)}
Productos/servicios: ${ctx.products}
Dependencias críticas: ${ctx.dependencies}
Mercado declarado por la persona: ${ctx.market}
Emprendedor (tú): ${ctx.profile}
Puntajes y semáforos: ${ctx.scores}`,
  final_recommendation: (ctx) =>
    `Escribe la recomendación final en 2 párrafos: primero el veredicto, que debe coincidir con la recomendación de la interpretación, y luego los 2 o 3 siguientes pasos más importantes para tu caso, en orden.
${ctx.clarityLevel === "clara" ? "" : "La idea NO está clara: el primer paso debe ser aclarar lo que falta (ver «falta_saber» en la claridad).\n"}Si la persona declaró una mayor preocupación y una condición de éxito, el siguiente paso debe ayudarle a responder a esa preocupación.
Interpretación: ${ctx.interpretation}
Puntajes y semáforos: ${ctx.scores}
${ideaBlock(ctx)}
Mercado declarado por la persona: ${ctx.market}`,
};

async function generateSection(
  key: string,
  ctx: ReportContext,
  observability?: AiObservabilityContext,
  retryCount = 0
): Promise<string> {
  const promptFn = SECTION_PROMPTS[key];
  if (!promptFn) throw new Error(`Unknown section: ${key}`);
  
  try {
    return sanitizeSectionMarkdown(
      await generateText(
        BASE_SYSTEM,
        promptFn(ctx),
        getNarrativeModel(),
        observability
      )
    );
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Retrying section ${key} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
      return generateSection(key, ctx, observability, retryCount + 1);
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
  verifiedFacts: string[],
  observability?: AiObservabilityContext
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
      market: ctx.market,
      clarity: ctx.clarity,
      ideaOriginal: ctx.ideaOriginal,
      verifiedFacts,
    }),
    getNarrativeModel(),
    observability
  );
  return strengthsRisksSchema.parse(raw);
}

async function generateValidationPlan(
  ctx: ReportContext,
  observability?: AiObservabilityContext
) {
  const raw = await generateJson<unknown>(
    VALIDATION_PLAN_SYSTEM_PROMPT,
    buildValidationPlanPrompt({
      idea: ctx.idea,
      interpretation: ctx.interpretation,
      products: ctx.products,
      profile: ctx.profile,
      market: ctx.market,
      clarity: ctx.clarity,
      ideaOriginal: ctx.ideaOriginal,
    }),
    getNarrativeModel(),
    observability
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

/**
 * Genera las 9 secciones y devuelve los datos del reporte, sin tocar la base
 * de datos. Lo usan `generateReport` (que además persiste) y los evals.
 */
export async function buildReportData(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult,
  observability?: AiObservabilityContext
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
    generateSection("executive_summary", ctx, observability),
    generateSection("business_understanding", ctx, observability),
    generateSection("financial_analysis", ctx, observability),
    generateSection("personal_fit_analysis", ctx, observability),
    generateSection("time_operation_analysis", ctx, observability),
    generateSection("scalability_analysis", ctx, observability),
    generateSection("final_recommendation", ctx, observability),

    generateStrengthsRisks(ctx, verifiedFacts, observability).catch((error) => {
      logReportGenerationError(
        "strengths_risks: respuesta de IA inválida, usando fortalezas determinísticas",
        { assessmentId: assessment.asmt_id, error }
      );
      return null;
    }),
    generateValidationPlan(ctx, observability).catch((error) => {
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

  return reportData;
}

export async function generateReport(
  assessment: AssessmentWithRelations,
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult,
  observability?: AiObservabilityContext
) {
  const reportData = await buildReportData(
    assessment,
    deterministic,
    interpretation,
    observability
  );

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
