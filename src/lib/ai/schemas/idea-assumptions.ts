import { z } from "zod";
import type { StructuredUnderstanding } from "./structured-understanding";
import { structuredUnderstandingSchema } from "./structured-understanding";

export const assumptionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  refinementHint: z.string(),
  category: z
    .enum(["cliente", "operacion", "precio", "mercado", "tiempo", "otro"])
    .optional(),
});

export type AssumptionItem = z.infer<typeof assumptionItemSchema>;

export const assumptionsArraySchema = z.array(assumptionItemSchema).min(1).max(5);

export type IdeaAiPayload = {
  assumptions: AssumptionItem[];
  structured?: StructuredUnderstanding;
};

function parseAssumptionItems(raw: unknown): AssumptionItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  if (typeof raw[0] === "string") {
    return (raw as string[]).map((text, index) => ({
      id: `legacy-${index}`,
      text,
      refinementHint: "¿Puedes confirmar o aclarar este punto?",
      category: "otro" as const,
    }));
  }

  const parsed = assumptionsArraySchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function packIdeaAiPayload(
  assumptions: AssumptionItem[],
  structured?: StructuredUnderstanding
): IdeaAiPayload | AssumptionItem[] {
  if (structured) {
    return { assumptions, structured };
  }
  return assumptions;
}

export function unpackIdeaAiPayload(raw: unknown): IdeaAiPayload {
  if (Array.isArray(raw)) {
    return { assumptions: parseAssumptionItems(raw) };
  }

  if (raw && typeof raw === "object" && "assumptions" in raw) {
    const record = raw as {
      assumptions: unknown;
      structured?: unknown;
    };
    const structured = structuredUnderstandingSchema.safeParse(record.structured);
    return {
      assumptions: parseAssumptionItems(record.assumptions),
      structured: structured.success ? structured.data : undefined,
    };
  }

  return { assumptions: [] };
}

export function parseAssumptions(raw: unknown): AssumptionItem[] {
  return unpackIdeaAiPayload(raw).assumptions;
}
