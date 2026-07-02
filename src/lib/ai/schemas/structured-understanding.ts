import { z } from "zod";

export const structuredUnderstandingSchema = z.object({
  que_ofreces: z.string(),
  cliente_objetivo: z.string(),
  como_operas: z.string(),
  cuando_opera: z.string().optional(),
  propuesta_valor: z.string().optional(),
});

export type StructuredUnderstanding = z.infer<typeof structuredUnderstandingSchema>;

export const STRUCTURED_LABELS: Record<
  keyof StructuredUnderstanding,
  string
> = {
  que_ofreces: "Qué ofreces",
  cliente_objetivo: "A quién va dirigido",
  como_operas: "Cómo operaría",
  cuando_opera: "Cuándo operarías",
  propuesta_valor: "Por qué pagarían",
};

export function getStructuredEntries(
  structured?: StructuredUnderstanding | null
): Array<{ key: keyof StructuredUnderstanding; label: string; value: string }> {
  if (!structured) return [];
  return (
    Object.keys(STRUCTURED_LABELS) as Array<keyof StructuredUnderstanding>
  )
    .filter((key) => structured[key]?.trim())
    .map((key) => ({
      key,
      label: STRUCTURED_LABELS[key],
      value: structured[key]!.trim(),
    }));
}
