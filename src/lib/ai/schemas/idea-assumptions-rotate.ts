import { z } from "zod";
import { assumptionItemSchema } from "./idea-assumptions";

export const ideaAssumptionsRotateSchema = z.object({
  assumptions: z.array(assumptionItemSchema).min(2).max(5),
});

export type IdeaAssumptionsRotateResult = z.infer<
  typeof ideaAssumptionsRotateSchema
>;
