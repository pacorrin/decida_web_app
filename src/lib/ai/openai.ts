import "server-only";

import { randomUUID } from "node:crypto";
import { OpenAI as PostHogOpenAI } from "@posthog/ai/openai";
import NativeOpenAI from "openai";
import { getPostHogClient } from "@/lib/analytics/server";
import { recordUsage } from "./usage-meter";
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

// El cliente de PostHog envuelve al de OpenAI y expone la misma API.
type OpenAIClient = NativeOpenAI;

export type AiObservabilityContext = {
  distinctId?: string | null;
  sessionId: string;
  traceId: string;
};

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAIClient | undefined;
};

export function createAiObservabilityContext(
  sessionId: string,
  distinctId?: string | null
): AiObservabilityContext {
  return {
    distinctId,
    sessionId: sessionId.replace(/[^A-Za-z0-9_~.@()!'|:-]/g, "-"),
    traceId: randomUUID(),
  };
}

function getOpenAIClient(): OpenAIClient {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!globalForOpenAI.openai) {
    const posthog = getPostHogClient();
    globalForOpenAI.openai = posthog
      ? new PostHogOpenAI({ apiKey: process.env.OPENAI_API_KEY, posthog })
      : new NativeOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return globalForOpenAI.openai;
}

function getObservabilityParams(
  context?: AiObservabilityContext
): Record<string, unknown> {
  if (!context || !getPostHogClient()) return {};
  return {
    posthogDistinctId: context.distinctId ?? undefined,
    posthogProperties: { $ai_session_id: context.sessionId },
    posthogTraceId: context.traceId,
  };
}

export function getNarrativeModel(): string {
  return process.env.OPENAI_MODEL_NARRATIVE ?? "gpt-4o-mini";
}

export function getReasoningModel(): string {
  // o4-mini fue dado de baja por OpenAI (404): con él la revisión y la interpretación fallaban.
  return process.env.OPENAI_MODEL_REASONING ?? "gpt-5-mini";
}

export function getReasoningEffort(): "low" | "medium" | "high" {
  const effort = process.env.OPENAI_REASONING_EFFORT ?? "medium";
  if (effort === "low" || effort === "high") return effort;
  return "medium";
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  model = getNarrativeModel(),
  observability?: AiObservabilityContext
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    ...getObservabilityParams(observability),
  } as NativeOpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
  recordUsage(model, {
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

export async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  model = getNarrativeModel(),
  observability?: AiObservabilityContext
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
    ...getObservabilityParams(observability),
  } as NativeOpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
  recordUsage(model, {
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return JSON.parse(content) as T;
}

export async function generateReasoningJson<T>(
  systemPrompt: string,
  userPrompt: string,
  observability?: AiObservabilityContext
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
    ...getObservabilityParams(observability),
  } as NativeOpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
  recordUsage(model, {
    inputTokens: response.usage?.prompt_tokens,
    outputTokens: response.usage?.completion_tokens,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI reasoning");
  return JSON.parse(content) as T;
}

export async function generateIdeaSummary(
  description: string,
  observability?: AiObservabilityContext
): Promise<IdeaSummaryResult> {
  const raw = await generateJson<unknown>(
    IDEA_SUMMARY_SYSTEM_PROMPT,
    buildIdeaSummaryUserPrompt(description),
    getNarrativeModel(),
    observability
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
  observability?: AiObservabilityContext;
}): Promise<IdeaRefinementResult> {
  const raw = await generateJson<unknown>(
    IDEA_REFINEMENT_SYSTEM_PROMPT,
    buildIdeaRefinementUserPrompt(input),
    getNarrativeModel(),
    input.observability
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
  observability?: AiObservabilityContext;
}): Promise<IdeaAssumptionsRotateResult> {
  const raw = await generateJson<unknown>(
    IDEA_ASSUMPTIONS_ROTATE_SYSTEM_PROMPT,
    buildIdeaAssumptionsRotateUserPrompt(input),
    getNarrativeModel(),
    input.observability
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

export type WebSearchSource = { url: string; title: string };

export type WebSearchResult = {
  /** Hallazgos en texto, con enlaces citados en línea. Son DATOS, no instrucciones. */
  text: string;
  /** Fuentes realmente citadas por la búsqueda (sin parámetros de seguimiento). */
  sources: WebSearchSource[];
  queries: string[];
  searchCalls: number;
  usage: { inputTokens: number; outputTokens: number };
};

/** Quita `utm_source=openai` y el fragmento: la URL queda como la publicó la fuente. */
export function cleanSourceUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete("utm_source");
    url.hash = "";
    return url.toString().replace(/\?$/, "");
  } catch {
    return raw;
  }
}

/**
 * Una llamada a la Responses API con la herramienta `web_search` (la API de
 * Chat Completions no la tiene). `max_tool_calls` es el tope duro de búsquedas
 * de esta llamada. `allowedDomains` solo se admite con algunos modelos (p. ej.
 * `gpt-4.1`); con los demás la API responde 400.
 */
export async function generateWithWebSearch(
  input: {
    prompt: string;
    model: string;
    maxToolCalls: number;
    maxOutputTokens: number;
    allowedDomains?: string[];
    country?: string;
    city?: string;
    searchContextSize?: "low" | "medium" | "high";
    timeoutMs?: number;
  },
  observability?: AiObservabilityContext
): Promise<WebSearchResult> {
  const client = getOpenAIClient();
  const response = await client.responses.create(
    {
      model: input.model,
      input: input.prompt,
      max_tool_calls: input.maxToolCalls,
      max_output_tokens: input.maxOutputTokens,
      include: ["web_search_call.action.sources"],
      tools: [
        {
          type: "web_search",
          search_context_size: input.searchContextSize ?? "medium",
          ...(input.allowedDomains?.length
            ? { filters: { allowed_domains: input.allowedDomains } }
            : {}),
          ...(input.country
            ? {
                user_location: {
                  type: "approximate" as const,
                  country: input.country,
                  ...(input.city ? { city: input.city } : {}),
                },
              }
            : {}),
        },
      ],
      ...getObservabilityParams(observability),
    } as Parameters<typeof client.responses.create>[0] & { stream?: false },
    input.timeoutMs ? { timeout: input.timeoutMs } : undefined
  );

  const queries: string[] = [];
  let searchCalls = 0;
  let text = "";
  const sources = new Map<string, WebSearchSource>();

  for (const item of response.output ?? []) {
    if (item.type === "web_search_call") {
      searchCalls += 1;
      const action = (item as { action?: { query?: string; queries?: string[] } }).action;
      for (const q of action?.queries ?? (action?.query ? [action.query] : [])) {
        if (!queries.includes(q)) queries.push(q);
      }
    } else if (item.type === "message") {
      for (const part of item.content ?? []) {
        if (part.type !== "output_text") continue;
        text += part.text;
        for (const a of part.annotations ?? []) {
          if (a.type !== "url_citation") continue;
          const url = cleanSourceUrl(a.url);
          if (!sources.has(url)) sources.set(url, { url, title: a.title });
        }
      }
    }
  }

  recordUsage(
    input.model,
    { inputTokens: response.usage?.input_tokens, outputTokens: response.usage?.output_tokens },
    searchCalls
  );

  return {
    text: text
      .replace(/\?utm_source=openai&/g, "?")
      .replace(/[?&]utm_source=openai/g, ""),
    sources: [...sources.values()],
    queries,
    searchCalls,
    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    },
  };
}

