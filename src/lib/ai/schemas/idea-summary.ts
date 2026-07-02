import { z } from "zod";
import { assumptionItemSchema } from "./idea-assumptions";
import { structuredUnderstandingSchema } from "./structured-understanding";

export const ideaSummarySchema = z.object({
  summary: z.string(),
  structuredUnderstanding: structuredUnderstandingSchema,
  assumptions: z.array(assumptionItemSchema).min(1).max(5),
});

export type IdeaSummaryResult = z.infer<typeof ideaSummarySchema>;
