import { z } from "zod";

/**
 * Pasada de revisión del reporte (una sola iteración, sin bucle abierto).
 *
 * Una llamada posterior a las 9 secciones recibe el reporte completo y los
 * datos con que se generó, y devuelve contradicciones entre secciones,
 * afirmaciones sin respaldo, conclusiones que no se siguen de las cifras y qué
 * sección reescribir. Solo se reescriben las secciones señaladas. Si hay más
 * problemas que `maxIssues`, el reporte se marca «requiere revisión humana» y
 * NO se intenta corregir todo.
 */

export const REPORT_SECTION_KEYS = [
  "executive_summary",
  "business_understanding",
  "financial_analysis",
  "personal_fit_analysis",
  "time_operation_analysis",
  "scalability_analysis",
  "final_recommendation",
  "strengths_risks",
  "validation_plan",
] as const;

export type ReportSectionKey = (typeof REPORT_SECTION_KEYS)[number];

const sectionKey = z.enum(REPORT_SECTION_KEYS);

export const reviewSchema = z.object({
  contradicciones: z
    .array(
      z.object({
        secciones: z.array(sectionKey).length(2),
        afirmacion_a: z.string(),
        afirmacion_b: z.string(),
      }),
    )
    .max(8),
  supuestos_sin_fuente: z
    .array(z.object({ seccion: sectionKey, afirmacion: z.string() }))
    .max(8),
  conclusiones_no_sustentadas: z
    .array(
      z.object({ seccion: sectionKey, afirmacion: z.string(), motivo: z.string() }),
    )
    .max(8),
  correcciones: z
    .array(z.object({ seccion: sectionKey, instruccion: z.string().min(5) }))
    .max(8),
});

export type ReportReview = z.infer<typeof reviewSchema>;

/** Valores por defecto configurables por entorno (ver `reviewConfig`). */
export const DEFAULT_REVIEW_MAX_ISSUES = 6;
export const DEFAULT_REVIEW_MAX_REWRITES = 4;

export type ReviewConfig = {
  enabled: boolean;
  /** Más problemas que esto → «requiere revisión humana», sin reescribir. */
  maxIssues: number;
  /** Tope de secciones que se reescriben en la única iteración. */
  maxRewrites: number;
};

const toInt = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function reviewConfig(env: NodeJS.ProcessEnv = process.env): ReviewConfig {
  return {
    enabled: (env.REPORT_REVIEW_ENABLED ?? "true").toLowerCase() !== "false",
    maxIssues: toInt(env.REPORT_REVIEW_MAX_ISSUES, DEFAULT_REVIEW_MAX_ISSUES),
    maxRewrites: toInt(env.REPORT_REVIEW_MAX_REWRITES, DEFAULT_REVIEW_MAX_REWRITES),
  };
}

export function countIssues(review: ReportReview): number {
  return (
    review.contradicciones.length +
    review.supuestos_sin_fuente.length +
    review.conclusiones_no_sustentadas.length
  );
}

export type ReviewDecision =
  | { action: "none"; sections: [] }
  | { action: "rewrite"; sections: ReportSectionKey[] }
  | { action: "human_review"; sections: [] };

/**
 * Qué hacer con una revisión: nada, reescribir las secciones señaladas (una
 * vez) o pasarla a una persona cuando hay demasiados problemas.
 */
export function decideReviewAction(
  review: ReportReview,
  cfg: Pick<ReviewConfig, "maxIssues" | "maxRewrites">,
): ReviewDecision {
  const issues = countIssues(review);
  if (issues > cfg.maxIssues) return { action: "human_review", sections: [] };

  // Secciones a reescribir: las de las correcciones, en orden y sin repetir.
  const sections: ReportSectionKey[] = [];
  for (const c of review.correcciones) {
    if (!sections.includes(c.seccion)) sections.push(c.seccion);
  }
  if (sections.length === 0) return { action: "none", sections: [] };
  return { action: "rewrite", sections: sections.slice(0, cfg.maxRewrites) };
}

/** Instrucciones de corrección de una sección, juntas, para el prompt de reescritura. */
export function correctionsFor(review: ReportReview, key: ReportSectionKey): string[] {
  return review.correcciones.filter((c) => c.seccion === key).map((c) => c.instruccion);
}

export const REVIEW_SYSTEM_PROMPT = `Eres el revisor de calidad de los reportes de viabilidad de Decida. Recibes un reporte ya escrito (9 secciones) y los datos con los que se generó. Tu trabajo es encontrar problemas REALES, no opinar sobre el estilo.

Busca solo estas tres cosas:
1. CONTRADICCIONES: dos afirmaciones de secciones DISTINTAS que no pueden ser ciertas a la vez (por ejemplo, una fortaleza que dice que la inversión cabe en lo que la persona puede perder y una alerta que dice que la supera). Cita las dos.
2. SUPUESTOS SIN FUENTE: afirmaciones FACTUALES y específicas sobre el mundo (cifras, tendencias de mercado, competidores o precios concretos, regulación, «el mercado está saturado», «tuvo un resurgimiento») que NO están en los datos recibidos ni son lo que la persona declaró, y que se presentan como hechos en lugar de supuestos por validar.
   NO son supuestos sin fuente: describir la idea o su propuesta de valor a partir de lo que la persona escribió; inferencias razonables y prudentes con verbos como «puede», «podría», «suele»; consejos operativos generales (organizar turnos, estandarizar procesos); recomendaciones de qué validar.
3. CONCLUSIONES NO SUSTENTADAS: conclusiones que los datos contradicen o que no se siguen lógicamente de las cifras (por ejemplo, listar como fortaleza algo que los datos contradicen o que no aplica a este negocio; duplicar una misma fortaleza con otras palabras; confundir un punto de equilibrio con un plazo; decir que se recupera la inversión cuando la utilidad neta es cero; llamar «encaje» a algo que las respuestas de la persona contradicen).
   NO es una conclusión no sustentada que un riesgo plausible no traiga cifras que lo respalden.

Reglas:
- Sé conservador. Reporta únicamente lo que puedas señalar con una cita concreta. Si el reporte está bien, devuelve listas vacías.
- Si hay ficha de mercado, una cifra o dato externo que cite una fuente [F#] existente en la ficha tiene respaldo; es un problema una cifra externa que NO está en la ficha, o una que cite una fuente que no existe o que dice otra cosa.
- Compara lo que la persona declaró del mercado (competencia, canal, evidencia) con la ficha de mercado: si se contradicen (por ejemplo, declaró «competencia baja» y la ficha lista varios competidores reales en su zona, o la ficha no encuentra demanda para su producto), señálalo como contradicción y pide que la sección (normalmente fortalezas) deje de presentarlo como una ventaja.
- Lo que la persona declaró (competencia, canal, evidencia de clientes, preocupación, condición de éxito) cuenta como dato recibido: úsalo como respaldo, pero una afirmación basada solo en eso debe presentarse como lo que ella declaró, no como un hecho del mercado.
- Los puntajes, semáforos, métricas y la recomendación son DETERMINÍSTICOS: no los discutas ni propongas cambiarlos.
- No marques como problema que falten datos externos si el reporte lo reconoce como algo por validar.
- Reporta como máximo 6 problemas en total, solo los más importantes. Un reporte razonable puede no tener ninguno.
- "correcciones": por cada sección que haya que reescribir, UNA instrucción concreta y breve de qué corregir. Usa solo estos identificadores de sección: ${REPORT_SECTION_KEYS.join(", ")}.

Responde SOLO JSON con esta forma exacta:
{
  "contradicciones": [ { "secciones": ["...", "..."], "afirmacion_a": "...", "afirmacion_b": "..." } ],
  "supuestos_sin_fuente": [ { "seccion": "...", "afirmacion": "..." } ],
  "conclusiones_no_sustentadas": [ { "seccion": "...", "afirmacion": "...", "motivo": "..." } ],
  "correcciones": [ { "seccion": "...", "instruccion": "..." } ]
}`;

export type ReviewInput = {
  /** Texto de cada sección, en el orden del reporte. */
  sections: Record<ReportSectionKey, string>;
  scores: string;
  metrics: string;
  interpretation: string;
  market: string;
  clarity: string;
  ideaOriginal: string;
  products: string;
  financialInputs: string;
  profile: string;
  /** Ficha de mercado en JSON (vacía si no hubo investigación). */
  research?: string;
};

export function buildReviewPrompt(input: ReviewInput): string {
  const report = REPORT_SECTION_KEYS.map(
    (key) => `### [${key}]\n${input.sections[key] || "(vacía)"}`,
  ).join("\n\n");

  return `DATOS CON LOS QUE SE GENERÓ EL REPORTE
Idea (palabras de la persona): ${input.ideaOriginal}
Claridad de la idea: ${input.clarity}
Puntajes y semáforos (determinísticos): ${input.scores}
Métricas calculadas: ${input.metrics}
Datos financieros declarados: ${input.financialInputs}
Productos/servicios: ${input.products}
Interpretación del scoring: ${input.interpretation}
Mercado declarado por la persona: ${input.market}
Emprendedor: ${input.profile}
${input.research ? `Ficha de mercado (datos externos con fuente; lo que cite una fuente [F#] de la ficha SÍ tiene respaldo):\n${input.research}` : "Ficha de mercado: no disponible (no hubo investigación externa)."}

REPORTE A REVISAR
${report}`;
}
