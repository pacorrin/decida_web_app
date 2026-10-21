import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import {
  CHANNEL_OPTIONS,
  COMPETITION_OPTIONS,
  CUSTOMER_EVIDENCE_LEVEL_OPTIONS,
  FIXED_COST_OPTIONS,
  CURRENT_SITUATION_OPTIONS,
  ENJOYED_ACTIVITIES_OPTIONS,
  EXPERIENCE_OPTIONS,
  HIRING_PREFERENCE_OPTIONS,
  INCOME_TIMEFRAME_OPTIONS,
  MAIN_GOAL_OPTIONS,
  SCHEDULE_OPTIONS,
  WORK_PREFERENCE_OPTIONS,
} from "@/lib/onboarding/options";
import {
  CAPITAL_RANGE_LABELS,
  HOURS_RANGE_LABELS,
  LOSS_RANGE_LABELS,
} from "@/lib/scoring/ranges";
import type { DeterministicScoreResult } from "@/lib/scoring/types";
import type { ScoringInterpretResult } from "@/lib/ai/schemas/scoring-interpret";
import { unpackIdeaAiPayload } from "@/lib/ai/schemas/idea-assumptions";
import { getStructuredEntries } from "@/lib/ai/schemas/structured-understanding";
import { assessIdeaClarity } from "@/lib/ai/idea-clarity";

const labelMap = (options: { value: string; label: string }[]) =>
  new Map(options.map((o) => [o.value, o.label]));

const SITUATION = labelMap(CURRENT_SITUATION_OPTIONS);
const GOAL = labelMap(MAIN_GOAL_OPTIONS);
const EXPERIENCE = labelMap(EXPERIENCE_OPTIONS);
const SCHEDULE = labelMap(SCHEDULE_OPTIONS);
const TIMEFRAME = labelMap(INCOME_TIMEFRAME_OPTIONS);
const ACTIVITY = labelMap(ENJOYED_ACTIVITIES_OPTIONS);
const WORK_PREF = labelMap(WORK_PREFERENCE_OPTIONS);
const HIRING = labelMap(HIRING_PREFERENCE_OPTIONS);
const COMPETITION = labelMap(COMPETITION_OPTIONS);
const CHANNEL = labelMap(CHANNEL_OPTIONS);
const EVIDENCE = labelMap(CUSTOMER_EVIDENCE_LEVEL_OPTIONS);
const FIXED_COSTS = labelMap(FIXED_COST_OPTIONS);

const label = (map: Map<string, string>, value: string | null | undefined) =>
  value ? (map.get(value) ?? value) : null;

const scale = (value: number | null | undefined) =>
  value == null ? null : `${value} de 5 (1 = muy incómodo, 5 = muy cómodo)`;

/**
 * Datos de LA PERSONA que emprende, con etiquetas legibles y rotulados como
 * tales: antes iban como `profile` sin más y la IA los confundía con el
 * perfil del cliente. Incluye las respuestas de «tipo de trabajo».
 */
export function buildFounderProfile(
  assessment: AssessmentWithRelations,
): Record<string, unknown> {
  const p = assessment.assessment_profile;
  const fit = assessment.personal_fit_answers;
  const investment =
    Number(assessment.financial_inputs?.finp_initial_investment ?? 0) || null;
  const enjoyed = Array.isArray(fit?.pfit_enjoyed_activities)
    ? (fit.pfit_enjoyed_activities as unknown[])
        .filter((a): a is string => typeof a === "string")
        .map((a) => label(ACTIVITY, a))
    : [];

  return {
    _nota:
      "Estos datos describen a LA PERSONA QUE EMPRENDE (a quien le escribes). NO describen al cliente del negocio.",
    objetivo: label(GOAL, p?.aprf_main_goal),
    situacion_actual: label(SITUATION, p?.aprf_current_situation),
    experiencia_emprendiendo: label(EXPERIENCE, p?.aprf_entrepreneurship_experience),
    capital_disponible_mxn: p?.aprf_capital_available_range
      ? (CAPITAL_RANGE_LABELS[p.aprf_capital_available_range] ?? p.aprf_capital_available_range)
      : null,
    perdida_tolerable_mxn: p?.aprf_acceptable_loss_range
      ? (LOSS_RANGE_LABELS[p.aprf_acceptable_loss_range] ?? p.aprf_acceptable_loss_range)
      : null,
    inversion_inicial_estimada_mxn: investment,
    horas_por_semana: p?.aprf_hours_per_week_range
      ? (HOURS_RANGE_LABELS[p.aprf_hours_per_week_range] ?? p.aprf_hours_per_week_range)
      : null,
    disponibilidad_horaria: label(SCHEDULE, p?.aprf_available_schedule),
    expectativa_de_resultados: label(TIMEFRAME, p?.aprf_expected_income_timeframe),
    actividades_que_disfruta: enjoyed.length > 0 ? enjoyed : null,
    preferencia_de_trabajo: label(WORK_PREF, fit?.pfit_work_preference),
    comodidad_vendiendo: scale(fit?.pfit_sales_comfort_score),
    comodidad_con_incertidumbre: scale(fit?.pfit_uncertainty_comfort_score),
    comodidad_siguiendo_procesos: scale(fit?.pfit_process_comfort_score),
    contratacion: label(HIRING, fit?.pfit_hiring_preference),
  };
}

/**
 * Lo que la persona declaró del mercado y del riesgo. Antes se capturaba en el
 * onboarding y no llegaba a las secciones: la competencia alta, el canal, la
 * evidencia de clientes, su mayor preocupación y su condición de éxito.
 */
export function buildMarketInputs(
  assessment: AssessmentWithRelations,
): Record<string, unknown> {
  const m = assessment.market_risk_inputs;
  return {
    _nota: "Lo que la persona declaró; no son datos verificados del mercado.",
    nivel_de_competencia_declarado: label(COMPETITION, m?.mrsk_competition_level),
    canal_para_conseguir_clientes: label(CHANNEL, m?.mrsk_acquisition_channel),
    evidencia_de_clientes: label(EVIDENCE, m?.mrsk_customer_evidence_level),
    mayor_preocupacion: m?.mrsk_main_concern?.trim() || null,
    condicion_de_exito: m?.mrsk_success_condition?.trim() || null,
  };
}

export function buildFinancialInputs(
  assessment: AssessmentWithRelations,
): Record<string, unknown> {
  const f = assessment.financial_inputs;
  return {
    moneda: f?.finp_currency ?? "MXN",
    inversion_inicial: Number(f?.finp_initial_investment ?? 0) || null,
    costos_fijos_mensuales_rango: label(FIXED_COSTS, f?.finp_fixed_monthly_costs_range),
  };
}

/**
 * La idea en las palabras de la persona (fuente), la interpretación de la IA
 * que ella confirmó (útil pero no es un dato) y qué tan evaluable es.
 */
export function buildIdeaContext(assessment: AssessmentWithRelations) {
  const idea = assessment.business_idea;
  const original = idea?.bide_original_description?.trim() ?? "";
  const structured = getStructuredEntries(
    unpackIdeaAiPayload(idea?.bide_ai_detected_assumptions).structured,
  );
  return {
    original,
    interpretation: structured.map((e) => ({ campo: e.label, valor: e.value })),
    clarity: assessIdeaClarity(original),
  };
}

const SIGNAL_ES = { green: "verde", yellow: "amarillo", red: "rojo" } as const;

/**
 * Puntajes con su LECTURA y su semáforo. Sin esto la IA no sabía que en
 * «Nivel de riesgo» un puntaje alto es MÁS riesgo (el motor lo calcula así) y
 * lo contaba como bueno o malo al azar.
 */
export function buildScoresForAi(
  deterministic: DeterministicScoreResult,
  interpretation: ScoringInterpretResult,
) {
  const signalByKey: Record<string, keyof typeof SIGNAL_ES> = {
    personal_fit: interpretation.personal_fit_signal,
    financial_viability: interpretation.financial_viability_signal,
    commercial_viability: interpretation.commercial_viability_signal,
    risk_level: interpretation.risk_level_signal,
    time_fit: interpretation.time_fit_signal,
    scalability: interpretation.scalability_signal,
  };
  return deterministic.dimensions.map((d) => ({
    dimension: d.label,
    puntaje: d.score,
    lectura:
      d.key === "risk_level"
        ? "puntaje ALTO = MÁS riesgo (peor); puntaje bajo = menos riesgo"
        : "puntaje alto = más favorable",
    semaforo: SIGNAL_ES[signalByKey[d.key] ?? "yellow"],
  }));
}

/**
 * Red de seguridad sobre el texto de la IA (los prompts ya lo prohíben):
 * quita el encabezado inicial (la sección ya trae su título), fórmulas LaTeX
 * en crudo y el anglicismo «Red Flags».
 */
export function sanitizeSectionMarkdown(text: string): string {
  let out = text.trim();

  // Encabezado repetido al inicio: «# Resumen Ejecutivo del Diagnóstico».
  out = out.replace(/^\s*#{1,6}[^\n]*\n+/, "");

  // Fórmulas: [ \text{...} = ... ], \( ... \), $$ ... $$
  out = out
    .replace(/\[\s*\\[a-zA-Z]+[\s\S]*?\]/g, "")
    .replace(/\\\([\s\S]*?\\\)/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "");

  out = out.replace(/\bred flags\b/gi, (m) =>
    m[0] === "R" ? "Alertas" : "alertas",
  );

  // Líneas que quedaron con solo una etiqueta huérfana («Margen: »).
  out = out.replace(/^[^\n:]{2,60}:\s*$/gm, (line, offset, whole) => {
    const next = whole.slice(offset + line.length).trimStart();
    return next.length === 0 ? "" : line;
  });

  return out.replace(/\n{3,}/g, "\n\n").trim();
}
