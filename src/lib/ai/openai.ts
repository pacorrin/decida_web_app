import OpenAI from "openai";
import {
  IDEA_SUMMARY_SYSTEM_PROMPT,
  buildIdeaSummaryUserPrompt,
} from "./prompts/idea-summary";
import {
  IDEA_REFINEMENT_SYSTEM_PROMPT,
  buildIdeaRefinementUserPrompt,
} from "./prompts/idea-refinement";
import type { AssumptionItem } from "./schemas/idea-assumptions";
import type { StructuredUnderstanding } from "./schemas/structured-understanding";
import {
  ideaRefinementSchema,
  type IdeaRefinementResult,
} from "./schemas/idea-refinement";
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

export async function generateIdeaRefinement(input: {
  originalDescription: string;
  currentSummary: string;
  selectedAssumptions: AssumptionItem[];
  clarifications: Record<string, string>;
}): Promise<IdeaRefinementResult> {
  const raw = await generateJson<unknown>(
    IDEA_REFINEMENT_SYSTEM_PROMPT,
    buildIdeaRefinementUserPrompt(input)
  );
  return ideaRefinementSchema.parse(raw);
}

export function generateFallbackIdeaRefinement(input: {
  currentSummary: string;
  selectedAssumptions: AssumptionItem[];
  clarifications: Record<string, string>;
}): IdeaRefinementResult {
  const clarified = input.selectedAssumptions
    .map((a) => {
      const note = input.clarifications[a.id]?.trim();
      return note ? `${a.text}: ${note}` : a.text;
    })
    .join(". ");

  return {
    summary: input.currentSummary,
    refinedDescription: `${input.currentSummary} ${clarified}`.trim(),
    structuredUnderstanding: {
      que_ofreces: input.currentSummary,
      cliente_objetivo: clarified || "Por confirmar",
      como_operas: "Integrado con tus aclaraciones",
    },
    assumptions: input.selectedAssumptions.filter(
      (a) => !input.clarifications[a.id]?.trim()
    ),
    improvements: ["Registramos tus aclaraciones para afinar el análisis."],
  };
}
