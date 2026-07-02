import { z } from "zod";
import { assumptionItemSchema } from "./idea-assumptions";
import { structuredUnderstandingSchema } from "./structured-understanding";

export const ideaRefinementSchema = z.object({
  summary: z.string(),
  refinedDescription: z.string(),
  structuredUnderstanding: structuredUnderstandingSchema,
  assumptions: z.array(assumptionItemSchema).max(5),
  improvements: z.array(z.string()).min(1).max(4),
});

export type IdeaRefinementResult = z.infer<typeof ideaRefinementSchema>;
