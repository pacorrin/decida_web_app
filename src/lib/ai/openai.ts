import OpenAI from "openai";
import {
  IDEA_SUMMARY_SYSTEM_PROMPT,
  buildIdeaSummaryUserPrompt,
} from "./prompts/idea-summary";
import {
  IDEA_REFINEMENT_SYSTEM_PROMPT,
  buildIdeaRefinementUserPrompt,
} from "./prompts/idea-refinement";
import {
  IDEA_ASSUMPTIONS_ROTATE_SYSTEM_PROMPT,
  buildIdeaAssumptionsRotateUserPrompt,
} from "./prompts/idea-assumptions-rotate";
import type { AssumptionItem } from "./schemas/idea-assumptions";
import type { StructuredUnderstanding } from "./schemas/structured-understanding";
import {
  ideaRefinementSchema,
  type IdeaRefinementResult,
} from "./schemas/idea-refinement";
import {
  ideaAssumptionsRotateSchema,
  type IdeaAssumptionsRotateResult,
} from "./schemas/idea-assumptions-rotate";
import {
  ideaSummarySchema,
  type IdeaSummaryResult,
} from "./schemas/idea-summary";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return globalForOpenAI.openai;
}

export function getNarrativeModel(): string {
  return process.env.OPENAI_MODEL_NARRATIVE ?? "gpt-4o-mini";
}

export function getReasoningModel(): string {
  return process.env.OPENAI_MODEL_REASONING ?? "o4-mini";
}

export function getReasoningEffort(): "low" | "medium" | "high" {
  const effort = process.env.OPENAI_REASONING_EFFORT ?? "medium";
  if (effort === "low" || effort === "high") return effort;
  return "medium";
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  model = getNarrativeModel()
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

export async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  model = getNarrativeModel()
): Promise<T> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return JSON.parse(content) as T;
}

export async function generateReasoningJson<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const client = getOpenAIClient();
  const model = getReasoningModel();
  const effort = getReasoningEffort();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    reasoning_effort: effort,
  } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI reasoning");
  return JSON.parse(content) as T;
}

export async function generateIdeaSummary(
  description: string
): Promise<IdeaSummaryResult> {
  const raw = await generateJson<unknown>(
    IDEA_SUMMARY_SYSTEM_PROMPT,
    buildIdeaSummaryUserPrompt(description)
  );
  return ideaSummarySchema.parse(raw);
}

export function generateFallbackIdeaSummary(
  description: string
): IdeaSummaryResult {
  const trimmed = description.trim();
  const firstSentence = trimmed.split(/[.!?]/)[0] ?? trimmed;
  return {
    summary: `Entendemos que ${firstSentence.charAt(0).toLowerCase()}${firstSentence.slice(1)}.`,
    structuredUnderstanding: {
      que_ofreces: firstSentence,
      cliente_objetivo: "Por definir con más detalle",
      como_operas: "Por definir con más detalle",
    },
    assumptions: [
      {
        id: "fallback-clarify",
        text: "Algunos detalles de tu idea podrían estar más definidos",
        refinementHint:
          "¿Puedes especificar a quién va dirigido y cómo operarías?",
        category: "otro",
      },
    ],
  };
}

function looksLikeQaDump(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const questionMarks = (trimmed.match(/\?/g) ?? []).length;
  return questionMarks >= 2 || /¿[^?]{8,}\?:\s/.test(trimmed);
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeRawClarificationDump(
  value: string,
  clarifications: Record<string, string>
): boolean {
  const normalizedValue = normalizeForCompare(value);
  if (!normalizedValue) return false;

  for (const note of Object.values(clarifications)) {
    const normalizedNote = normalizeForCompare(note);
    if (!normalizedNote || normalizedNote.length < 12) continue;
    if (
      normalizedValue === normalizedNote ||
      normalizedValue.includes(normalizedNote) ||
      normalizedNote.includes(normalizedValue)
    ) {
      return true;
    }
  }
  return false;
}

function sanitizeStructuredUnderstanding(
  next: StructuredUnderstanding,
  previous?: StructuredUnderstanding | null,
  clarifications: Record<string, string> = {}
): StructuredUnderstanding {
  const keys: Array<keyof StructuredUnderstanding> = [
    "que_ofreces",
    "cliente_objetivo",
    "como_operas",
    "cuando_opera",
    "propuesta_valor",
  ];

  const cleaned: StructuredUnderstanding = { ...next };
  for (const key of keys) {
    const value = cleaned[key];
    if (!value) continue;

    const isBad =
      looksLikeQaDump(value) ||
      looksLikeRawClarificationDump(value, clarifications);
    if (!isBad) continue;

    const fallback = previous?.[key]?.trim();
    if (fallback && !looksLikeQaDump(fallback)) {
      cleaned[key] = fallback;
      continue;
    }

    const firstChunk = value.split(/(?=\s*¿)/)[0]?.trim();
    cleaned[key] =
      firstChunk && firstChunk.length > 0 && !looksLikeRawClarificationDump(firstChunk, clarifications)
        ? firstChunk.replace(/:\s*$/, "").trim()
        : previous?.[key] || value;
  }
  return cleaned;
}

function sanitizeSummaryNarrative(summary: string): string {
  let s = summary;
  const replacements: [RegExp, string][] = [
    [
      /Sobre llegada al mercado, comentaste:\s*/gi,
      "Ves una oportunidad de entrada al mercado porque ",
    ],
    [
      /Sobre precio\/valor, indicaste:\s*/gi,
      "El precio o modelo de valor todavía está en evaluación, ",
    ],
    [/Aclaraste cómo operarías:\s*/gi, "Operativamente, "],
    [
      /También precisaste a quién va dirigido:\s*/gi,
      "Tu cliente objetivo se perfila como ",
    ],
    [/Definiste disponibilidad:\s*/gi, "En cuanto a disponibilidad, "],
    [/También aclaraste:\s*/gi, ""],
    [/,\s*comentaste:\s*/gi, ", "],
    [/,\s*indicaste:\s*/gi, ", "],
  ];
  for (const [pattern, replacement] of replacements) {
    s = s.replace(pattern, replacement);
  }
  return s.replace(/\s{2,}/g, " ").trim();
}

export async function generateIdeaRefinement(input: {
  originalDescription: string;
  currentSummary: string;
  selectedAssumptions: AssumptionItem[];
  clarifications: Record<string, string>;
  currentStructured?: StructuredUnderstanding | null;
}): Promise<IdeaRefinementResult> {
  const raw = await generateJson<unknown>(
    IDEA_REFINEMENT_SYSTEM_PROMPT,
    buildIdeaRefinementUserPrompt(input)
  );
  const parsed = ideaRefinementSchema.parse(raw);
  return {
    ...parsed,
    summary: sanitizeSummaryNarrative(parsed.summary),
    structuredUnderstanding: sanitizeStructuredUnderstanding(
      parsed.structuredUnderstanding,
      input.currentStructured,
      input.clarifications
    ),
  };
}

function collectClarificationNotes(
  selectedAssumptions: AssumptionItem[],
  clarifications: Record<string, string>
): string[] {
  return selectedAssumptions
    .map((a) => clarifications[a.id]?.trim())
    .filter((note): note is string => Boolean(note));
}

function trimToSentence(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}…`;
}

/** Strip conversational fillers so notes read as idea facts, not chat replies. */
function polishClause(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  s = s.replace(/^(s[ií]\s*(pero\s*)?(ya que\s*)?)/i, "");
  s = s.replace(/^(a[uú]n no lo\s*|justamente\s*)/i, "");
  s = s.replace(/^que\s+/i, "");
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");
}

function weaveClarificationSentence(
  category: NonNullable<AssumptionItem["category"]>,
  rawNote: string
): string {
  const note = rawNote.replace(/\s+/g, " ").trim();
  const lower = note.toLowerCase();

  switch (category) {
    case "mercado": {
      const body = polishClause(note);
      if (/competencia|mercado|alternativ|diferenc|recolecci|entrega/i.test(note)) {
        return `Ves una oportunidad de entrada al mercado porque ${body}.`;
      }
      return `Identificas una ventaja competitiva en que ${body}.`;
    }
    case "precio": {
      if (/evalu|defin|todav|a[uú]n no|apenas|no lo/i.test(lower)) {
        return "El precio o modelo de valor todavía está en evaluación, es uno de los puntos que aún no has definido.";
      }
      return `Tu modelo de precio contempla ${polishClause(note)}.`;
    }
    case "operacion": {
      let body = polishClause(note);
      if (/hora pico|tr[aá]fico|ruta|horario/i.test(note)) {
        if (!/planeas|programar|tomar|agendar/i.test(body)) {
          body = `planeas ${body}`;
        }
        if (!/log[ií]stica|eficiente/i.test(body)) {
          body = `${body} para hacer la logística más eficiente`;
        }
      }
      return `Operativamente, ${body}.`;
    }
    case "cliente": {
      const body = polishClause(note);
      return `Tu cliente objetivo se perfila como ${body}.`;
    }
    case "tiempo": {
      const body = polishClause(note);
      return `En cuanto a disponibilidad, ${body}.`;
    }
    default: {
      const body = polishClause(note);
      const sentence = body.charAt(0).toUpperCase() + body.slice(1);
      return sentence.endsWith(".") ? sentence : `${sentence}.`;
    }
  }
}

function synthesizeFallbackSummary(
  currentSummary: string,
  selectedAssumptions: AssumptionItem[],
  clarifications: Record<string, string>
): string {
  const additions: string[] = [];

  for (const assumption of selectedAssumptions) {
    const note = clarifications[assumption.id]?.trim();
    if (!note) continue;
    additions.push(
      weaveClarificationSentence(assumption.category ?? "otro", note)
    );
  }

  if (additions.length === 0) return currentSummary;

  const base = currentSummary.replace(/\s+$/, "").replace(/\.$/, "");
  return `${base}. ${additions.join(" ")}`.trim();
}

/**
 * Offline/fallback path: never paste raw clarifications into structured cards.
 * Keep previous structured understanding and weave notes into the narrative summary.
 */
export function generateFallbackIdeaRefinement(input: {
  currentSummary: string;
  selectedAssumptions: AssumptionItem[];
  clarifications: Record<string, string>;
  currentStructured?: StructuredUnderstanding | null;
  originalDescription?: string;
}): IdeaRefinementResult {
  const structured: StructuredUnderstanding = {
    que_ofreces:
      input.currentStructured?.que_ofreces?.trim() ||
      "Servicio por definir con más detalle",
    cliente_objetivo:
      input.currentStructured?.cliente_objetivo?.trim() || "Por confirmar",
    como_operas:
      input.currentStructured?.como_operas?.trim() || "Por confirmar",
    cuando_opera: input.currentStructured?.cuando_opera?.trim() || undefined,
    propuesta_valor:
      input.currentStructured?.propuesta_valor?.trim() || undefined,
  };

  const summary = synthesizeFallbackSummary(
    input.currentSummary,
    input.selectedAssumptions,
    input.clarifications
  );

  const clarifiedNotes = collectClarificationNotes(
    input.selectedAssumptions,
    input.clarifications
  );

  const refinedDescription = [
    input.originalDescription?.trim() || input.currentSummary,
    ...clarifiedNotes.map((n) => trimToSentence(n, 200)),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const usedCategories = new Set(
    input.selectedAssumptions.map((a) => a.category).filter(Boolean)
  );

  const rotationPool: AssumptionItem[] = [
    {
      id: "rot-cliente",
      text: "El cliente objetivo podría segmentarse con más precisión",
      refinementHint: "¿Quién pagaría primero y por qué ahora?",
      category: "cliente",
    },
    {
      id: "rot-precio",
      text: "El precio o modelo de cobro aún no está del todo definido",
      refinementHint: "¿Cobrarías por servicio, suscripción o paquete?",
      category: "precio",
    },
    {
      id: "rot-operacion",
      text: "La operación diaria podría depender de recursos que aún no están claros",
      refinementHint: "¿Qué harías tú vs. qué externalizarías al inicio?",
      category: "operacion",
    },
    {
      id: "rot-mercado",
      text: "La diferencia frente a alternativas del mercado no está explícita",
      refinementHint: "¿Qué te haría ganar frente a una opción ya conocida?",
      category: "mercado",
    },
    {
      id: "rot-tiempo",
      text: "El ritmo de arranque puede chocar con tu disponibilidad real",
      refinementHint:
        "¿Cuántas horas a la semana podrías dedicarle de forma realista?",
      category: "tiempo",
    },
  ];

  const nextAssumptions = rotationPool
    .filter((a) => !usedCategories.has(a.category))
    .slice(0, 3);

  return {
    summary,
    refinedDescription,
    structuredUnderstanding: structured,
    assumptions:
      nextAssumptions.length >= 2 ? nextAssumptions : rotationPool.slice(0, 3),
    improvements:
      clarifiedNotes.length > 0
        ? [
            "Integraste más detalle sobre mercado, operación o precio en tu idea.",
            "El resumen refleja mejor los puntos clave de tu propuesta.",
            "Quedaron nuevos supuestos para seguir afinando.",
          ]
        : ["Registramos la selección de supuestos para afinar el análisis."],
  };
}

export async function generateIdeaAssumptionsRotation(input: {
  originalDescription: string;
  currentSummary: string;
  structured?: StructuredUnderstanding | null;
  previousAssumptions: AssumptionItem[];
}): Promise<IdeaAssumptionsRotateResult> {
  const raw = await generateJson<unknown>(
    IDEA_ASSUMPTIONS_ROTATE_SYSTEM_PROMPT,
    buildIdeaAssumptionsRotateUserPrompt(input)
  );
  return ideaAssumptionsRotateSchema.parse(raw);
}

export function generateFallbackIdeaAssumptionsRotation(
  previousAssumptions: AssumptionItem[]
): IdeaAssumptionsRotateResult {
  const previousIds = new Set(previousAssumptions.map((a) => a.id));
  const previousTexts = new Set(
    previousAssumptions.map((a) => a.text.toLowerCase())
  );

  const pool: AssumptionItem[] = [
    {
      id: "more-canal",
      text: "El canal principal para conseguir los primeros clientes no está cerrado",
      refinementHint: "¿Llegarías por referidos, redes, partnerships o puerta a puerta?",
      category: "mercado",
    },
    {
      id: "more-ticket",
      text: "El ticket promedio podría no alcanzar para cubrir costos fijos al inicio",
      refinementHint: "¿Cuál sería tu precio mínimo viable en los primeros 3 meses?",
      category: "precio",
    },
    {
      id: "more-entrega",
      text: "La promesa de entrega o tiempo de respuesta aún es ambigua",
      refinementHint: "¿En cuánto tiempo entregarías el servicio de punta a punta?",
      category: "operacion",
    },
    {
      id: "more-nicho",
      text: "El nicho geográfico o demográfico podría ser más estrecho de lo pensado",
      refinementHint: "¿En qué zona o perfil arrancarías aunque sea más chico?",
      category: "cliente",
    },
    {
      id: "more-ritmo",
      text: "El crecimiento esperado puede chocar con tu capacidad semanal",
      refinementHint: "¿Cuántos clientes podrías atender bien en tu primer mes?",
      category: "tiempo",
    },
    {
      id: "more-riesgo",
      text: "Hay un riesgo operativo o de reputación que conviene nombrar ya",
      refinementHint: "¿Qué es lo peor que podría salir mal en una primera entrega?",
      category: "otro",
    },
  ];

  const fresh = pool.filter(
    (a) => !previousIds.has(a.id) && !previousTexts.has(a.text.toLowerCase())
  );

  return {
    assumptions: (fresh.length >= 2 ? fresh : pool).slice(0, 4),
  };
}
