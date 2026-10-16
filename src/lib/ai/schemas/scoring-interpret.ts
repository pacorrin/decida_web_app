import { z } from "zod";

export const scoringInterpretSchema = z.object({
  personal_fit_signal: z.enum(["green", "yellow", "red"]),
  financial_viability_signal: z.enum(["green", "yellow", "red"]),
  commercial_viability_signal: z.enum(["green", "yellow", "red"]),
  risk_level_signal: z.enum(["green", "yellow", "red"]),
  time_fit_signal: z.enum(["green", "yellow", "red"]),
  scalability_signal: z.enum(["green", "yellow", "red"]),
  final_recommendation: z.enum([
    "proceed_small_test",
    "validate_first",
    "adjust_idea",
    "pause_for_now",
  ]),
  red_flags: z.array(z.string()),
  reasoning_summary: z.string(),
});

export type ScoringInterpretResult = z.infer<typeof scoringInterpretSchema>;

export const SCORING_INTERPRET_SYSTEM_PROMPT = `Eres un analista de viabilidad de negocios para Decida.

Recibirás scores numéricos YA CALCULADOS (0-100) y contexto cualitativo del usuario.
NO recalcules ni inventes números financieros. Solo interpreta los scores dados.

Asigna semáforos:
- green: score >= 70
- yellow: score 40-69
- red: score < 40

Para risk_level, la lógica es INVERTIDA: el score mide el RIESGO (alto = MÁS riesgo), así que un score alto es malo.
Para risk_level: score <= 30 = green, 31-60 = yellow, score > 60 = red. Ejemplo: risk_level 94 = riesgo muy alto = red.

Si el contexto muestra que la inversión inicial estimada supera el capital disponible declarado o la pérdida que la persona toleraría, refléjalo en risk_level_signal (peor semáforo) y agrega una red flag concreta al respecto.

Recomendación final (elige una):
- proceed_small_test: viable con prueba pequeña
- validate_first: necesita validar antes de invertir
- adjust_idea: ajustar la idea
- pause_for_now: no es el momento

Responde SOLO JSON:
{
  "personal_fit_signal": "green|yellow|red",
  "financial_viability_signal": "green|yellow|red",
  "commercial_viability_signal": "green|yellow|red",
  "risk_level_signal": "green|yellow|red",
  "time_fit_signal": "green|yellow|red",
  "scalability_signal": "green|yellow|red",
  "final_recommendation": "proceed_small_test|validate_first|adjust_idea|pause_for_now",
  "red_flags": ["..."],
  "reasoning_summary": "2-3 oraciones explicando la recomendación"
}`;

export function buildScoringInterpretPrompt(
  scores: Record<string, number>,
  context: string
): string {
  return `Scores calculados (NO modificar):\n${JSON.stringify(scores, null, 2)}\n\nContexto del usuario:\n${context}`;
}

export function scoreToSignal(score: number, invert = false): "green" | "yellow" | "red" {
  const effective = invert ? 100 - score : score;
  if (effective >= 70) return "green";
  if (effective >= 40) return "yellow";
  return "red";
}

export function fallbackScoringInterpret(
  scores: Record<string, number>
): ScoringInterpretResult {
  const avg =
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  return {
    personal_fit_signal: scoreToSignal(scores.personal_fit ?? 50),
    financial_viability_signal: scoreToSignal(scores.financial_viability ?? 50),
    commercial_viability_signal: scoreToSignal(
      scores.commercial_viability ?? 50
    ),
    risk_level_signal: scoreToSignal(scores.risk_level ?? 50, true),
    time_fit_signal: scoreToSignal(scores.time_fit ?? 50),
    scalability_signal: scoreToSignal(scores.scalability ?? 50),
    final_recommendation:
      avg >= 65
        ? "proceed_small_test"
        : avg >= 45
          ? "validate_first"
          : avg >= 30
            ? "adjust_idea"
            : "pause_for_now",
    red_flags: ["Análisis generado con reglas básicas — revisa los detalles."],
    reasoning_summary:
      "El diagnóstico se basó en tus respuestas y métricas calculadas. Te recomendamos validar los supuestos clave antes de invertir.",
  };
}

type Signal = ScoringInterpretResult["risk_level_signal"];
const SIGNAL_RANK: Record<Signal, number> = { green: 0, yellow: 1, red: 2 };
const worse = (a: Signal, b: Signal): Signal =>
  SIGNAL_RANK[a] >= SIGNAL_RANK[b] ? a : b;

/**
 * Los semáforos salen de los puntajes, no del criterio del modelo: el umbral
 * es fijo (>= 70 verde, 40-69 amarillo, < 40 rojo; `risk_level` invertido
 * porque ahí un puntaje alto es MÁS riesgo). Antes el prompt describía el
 * riesgo al revés y un 94 de riesgo salía «Favorable». La IA solo puede
 * EMPEORAR el semáforo de riesgo (inversión por encima del capital o de la
 * pérdida tolerada); nunca mejorarlo.
 */
export function enforceSignals(
  scores: Record<string, number>,
  interpretation: ScoringInterpretResult,
): ScoringInterpretResult {
  const fromScore = (key: string, invert = false): Signal =>
    scoreToSignal(scores[key] ?? 50, invert);
  return {
    ...interpretation,
    personal_fit_signal: fromScore("personal_fit"),
    financial_viability_signal: fromScore("financial_viability"),
    commercial_viability_signal: fromScore("commercial_viability"),
    risk_level_signal: worse(
      fromScore("risk_level", true),
      interpretation.risk_level_signal,
    ),
    time_fit_signal: fromScore("time_fit"),
    scalability_signal: fromScore("scalability"),
  };
}
