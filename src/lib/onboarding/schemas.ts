import { z } from "zod";
import type { StructuredUnderstanding } from "@/lib/ai/schemas/structured-understanding";

export const contactSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  name: z.string().min(2, "Ingresa tu nombre"),
  phone: z.string().min(8, "Ingresa un teléfono válido"),
  country: z.string().min(1, "Selecciona tu país"),
  acceptedTerms: z.enum(["on"], {
    message:
      "Debes aceptar los términos de servicio y la política de privacidad",
  }),
});

export const ideaSchema = z.object({
  description: z
    .string()
    .min(30, "Describe tu idea con al menos 30 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
});

export const profileSchema = z.object({
  currentSituation: z.string().min(1, "Selecciona tu situación actual"),
  mainGoal: z.string().min(1, "Selecciona tu objetivo principal"),
  entrepreneurshipExperience: z.string().min(1, "Selecciona tu experiencia"),
});

export const resourcesSchema = z.object({
  capitalAvailableRange: z.string().min(1, "Selecciona un rango de capital"),
  acceptableLossRange: z.string().min(1, "Selecciona cuánto podrías perder"),
  hoursPerWeekRange: z.string().min(1, "Selecciona tus horas disponibles"),
  availableSchedule: z.string().min(1, "Selecciona tu disponibilidad"),
  expectedIncomeTimeframe: z.string().min(1, "Selecciona tu plazo esperado"),
});

export const personalFitSchema = z.object({
  enjoyedActivities: z
    .array(z.string())
    .min(1, "Selecciona al menos una actividad"),
  workPreference: z.string().min(1, "Selecciona tu preferencia de trabajo"),
  salesComfortScore: z.coerce.number().min(1).max(5),
  uncertaintyComfortScore: z.coerce.number().min(1).max(5),
  hiringPreference: z.string().min(1, "Selecciona tu preferencia"),
  processComfortScore: z.coerce.number().min(1).max(5),
});

export const paymentSchema = z.object({
  planId: z.enum(["starter", "pro", "expert"]),
});

export const evaluationFinancialSchema = z.object({
  initialInvestment: z.coerce.number().min(0),
  pricePerSale: z.coerce.number().min(0),
  variableCostPerSale: z.coerce.number().min(0),
  estimatedMonthlySales: z.coerce.number().int().min(0),
  fixedMonthlyCostsRange: z.string().min(1),
  currency: z.string().default("MXN"),
});

export const evaluationMarketSchema = z.object({
  hasTalkedToCustomers: z.enum(["true", "false"]),
  competitionLevel: z.string().min(1),
  acquisitionChannel: z.string().min(1),
  mainConcern: z.string().min(10),
  successCondition: z.string().min(10),
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().min(1, "Selecciona una calificación").max(5),
  wouldRecommend: z.enum(["true", "false"], {
    message: "Indica si recomendarías Decida",
  }),
  comment: z
    .string()
    .max(2000, "Máximo 2000 caracteres")
    .optional()
    .transform((value) => value?.trim() || undefined),
  testimonialConsent: z
    .enum(["on"])
    .optional()
    .transform((value) => value === "on"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type IdeaInput = z.infer<typeof ideaSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ResourcesInput = z.infer<typeof resourcesSchema>;
export type PersonalFitInput = z.infer<typeof personalFitSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type EvaluationFinancialInput = z.infer<typeof evaluationFinancialSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export const refineIdeaSchema = z.object({
  selectedIds: z.array(z.string()).min(1, "Selecciona al menos un supuesto"),
  clarifications: z.record(z.string(), z.string()).optional(),
});

export type RefineIdeaInput = z.infer<typeof refineIdeaSchema>;

export type RefineIdeaState = ActionState & {
  summary?: string;
  structuredUnderstanding?: StructuredUnderstanding;
  assumptions?: Array<{
    id: string;
    text: string;
    refinementHint: string;
    category?: string;
  }>;
  improvements?: string[];
  refined?: boolean;
};

export type ActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") obj[key] = value;
  }
  return obj;
}

export function parseFieldErrors(
  error: z.ZodError
): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
