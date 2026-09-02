import { prisma } from "@/lib/prisma";
import {
  generateReasoningJson,
  getReasoningModel,
} from "@/lib/ai/openai";
import {
  SCORING_INTERPRET_SYSTEM_PROMPT,
  buildScoringInterpretPrompt,
  fallbackScoringInterpret,
  scoringInterpretSchema,
  type ScoringInterpretResult,
} from "@/lib/ai/schemas/scoring-interpret";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import {
  calculateDeterministicScores,
  detectFinancialRedFlags,
  detectDependencyRedFlags,
} from "./types";
import {
  CAPITAL_RANGE_LABELS,
  LOSS_RANGE_LABELS,
  resolveCustomerEvidenceLevel,
} from "./ranges";

const CUSTOMER_EVIDENCE_CONTEXT_LABELS: Record<string, string> = {
  ninguno: "no ha hablado con ningún cliente potencial",
  "1_3": "ha hablado con 1 a 3 clientes potenciales",
  "4_10": "ha hablado con 4 a 10 clientes potenciales",
  mas_10: "ha hablado con más de 10 clientes potenciales",
  ya_clientes: "ya tiene clientes que compraron o apartaron",
};

export {
  calculateDeterministicScores,
  calculateFinancialMetrics,
  detectFinancialRedFlags,
  detectDependencyRedFlags,
} from "./types";
export type { CalculatedMetrics, DeterministicScoreResult } from "./types";

const DEPENDENCY_CONTEXT_LABELS: Record<string, string> = {
  proveedor: "un solo proveedor clave",
  cliente_unico: "1 o 2 clientes que serían la mayoría de sus ingresos",
  plataforma: "una plataforma externa",
  permiso: "un permiso, licencia o regulación",
  ubicacion: "una ubicación física específica",
  inventario: "inventario que caduca o se deprecia rápido",
};


function buildAssessmentContext(assessment: AssessmentWithRelations): string {
  const profile = assessment.assessment_profile;
  const investment = Number(
    assessment.financial_inputs?.finp_initial_investment ?? 0
  );
  const lossLabel = LOSS_RANGE_LABELS[profile?.aprf_acceptable_loss_range ?? ""];
  const capitalLabel =
    CAPITAL_RANGE_LABELS[profile?.aprf_capital_available_range ?? ""];

  const parts = [
    assessment.business_idea?.bide_ai_summary &&
      `Idea: ${assessment.business_idea.bide_ai_summary}`,
    profile?.aprf_main_goal && `Objetivo: ${profile.aprf_main_goal}`,
    profile?.aprf_current_situation &&
      `Situación: ${profile.aprf_current_situation}`,
    investment > 0 && `Inversión inicial estimada: $${Math.round(investment).toLocaleString("es-MX")} MXN`,
    capitalLabel && `Capital disponible declarado: ${capitalLabel} MXN`,
    lossLabel && `Pérdida que toleraría sin afectar su estabilidad: ${lossLabel} MXN`,
    assessment.market_risk_inputs &&
      `Evidencia de clientes: ${
        CUSTOMER_EVIDENCE_CONTEXT_LABELS[
          resolveCustomerEvidenceLevel(assessment.market_risk_inputs)
        ]
      }`,
    dependencyContextLine(assessment),
    assessment.market_risk_inputs?.mrsk_main_concern &&
      `Preocupación principal: ${assessment.market_risk_inputs.mrsk_main_concern}`,
  ].filter(Boolean);
  return parts.join("\n");
}

function dependencyContextLine(
  assessment: AssessmentWithRelations
): string | null {
  const raw = assessment.market_risk_inputs?.mrsk_business_dependencies;
  const deps = Array.isArray(raw)
    ? raw.filter(
        (d): d is string => typeof d === "string" && d in DEPENDENCY_CONTEXT_LABELS
      )
    : [];
  if (deps.length === 0) return null;
  return `Dependencias críticas declaradas del negocio: ${deps
    .map((d) => DEPENDENCY_CONTEXT_LABELS[d])
    .join(", ")}`;
}

async function interpretScores(
  scores: Record<string, number>,
  context: string
): Promise<ScoringInterpretResult> {
  try {
    const raw = await generateReasoningJson<unknown>(
      SCORING_INTERPRET_SYSTEM_PROMPT,
      buildScoringInterpretPrompt(scores, context)
    );
    return scoringInterpretSchema.parse(raw);
  } catch {
    return fallbackScoringInterpret(scores);
  }
}

export async function runScoringPipeline(assessment: AssessmentWithRelations) {
  const deterministic = calculateDeterministicScores(assessment);
  const scoresMap = Object.fromEntries(
    deterministic.dimensions.map((d) => [d.key, d.score])
  );

  const interpretation = await interpretScores(
    scoresMap,
    buildAssessmentContext(assessment)
  );

  // Deterministic flags (investment vs. declared capital / acceptable loss,
  // products below cost, business dependencies) go first, then the AI-generated
  // ones. Fold them back into `interpretation` so both the persisted score and
  // the report generation see the same list.
  const deterministicRedFlags = [
    ...detectFinancialRedFlags(assessment),
    ...detectDependencyRedFlags(assessment),
  ];
  interpretation.red_flags = [
    ...deterministicRedFlags,
    ...interpretation.red_flags.filter(
      (flag) => !deterministicRedFlags.includes(flag)
    ),
  ];

  const scoreData = {
    ascs_personal_fit_score: deterministic.dimensions.find(
      (d) => d.key === "personal_fit"
    )?.score,
    ascs_financial_viability_score: deterministic.dimensions.find(
      (d) => d.key === "financial_viability"
    )?.score,
    ascs_commercial_viability_score: deterministic.dimensions.find(
      (d) => d.key === "commercial_viability"
    )?.score,
    ascs_risk_level_score: deterministic.dimensions.find(
      (d) => d.key === "risk_level"
    )?.score,
    ascs_time_fit_score: deterministic.dimensions.find(
      (d) => d.key === "time_fit"
    )?.score,
    ascs_scalability_score: deterministic.dimensions.find(
      (d) => d.key === "scalability"
    )?.score,
    ascs_personal_fit_signal: interpretation.personal_fit_signal,
    ascs_financial_viability_signal: interpretation.financial_viability_signal,
    ascs_commercial_viability_signal: interpretation.commercial_viability_signal,
    ascs_risk_level_signal: interpretation.risk_level_signal,
    ascs_time_fit_signal: interpretation.time_fit_signal,
    ascs_scalability_signal: interpretation.scalability_signal,
    ascs_final_recommendation: interpretation.final_recommendation,
    ascs_red_flags: interpretation.red_flags,
    ascs_calculated_metrics: deterministic.metrics,
    ascs_scoring_version: `${deterministic.scoringVersion}+${getReasoningModel()}`,
  };

  await prisma.assessment_scores.upsert({
    where: { ascs_asmt_id: assessment.asmt_id },
    create: { ascs_asmt_id: assessment.asmt_id, ...scoreData },
    update: scoreData,
  });

  if (assessment.financial_inputs && deterministic.metrics.grossMarginPerSale != null) {
    await prisma.financial_inputs.update({
      where: { finp_asmt_id: assessment.asmt_id },
      data: {
        finp_gross_margin_per_sale: deterministic.metrics.grossMarginPerSale,
        finp_gross_margin_percentage: deterministic.metrics.grossMarginPercentage,
        finp_estimated_monthly_gross_profit:
          deterministic.metrics.estimatedMonthlyGrossProfit,
        finp_estimated_monthly_net_profit:
          deterministic.metrics.estimatedMonthlyNetProfit,
        finp_break_even_sales: deterministic.metrics.breakEvenSales,
        finp_payback_months: deterministic.metrics.paybackMonths,
      },
    });
  }

  return { deterministic, interpretation };
}
