import { z } from "zod";

/**
 * Schemas + dedicated system prompts for the report sections that must come
 * back as JSON.
 *
 * These exist because the sections used to be generated with `generateText`
 * under a shared system prompt that instructs Markdown — so the model wrapped
 * its JSON in a ```json fence, `JSON.parse` threw, and every report fell back
 * to a hardcoded generic string. They now go through `generateJson`
 * (`response_format: json_object`) plus these prompts, which never mention
 * Markdown, and are validated with Zod like every other AI call in the app.
 *
 * The shapes mirror what `/ejemplo` already renders
 * (`src/lib/example-report-data.ts`) and what the Notion report template asks
 * for: "Strengths — fortaleza + por qué importa", "Risks — riesgo + por qué
 * importa + cómo validar/reducir", "Validation Plan — 4 semanas".
 */

export const strengthItemSchema = z.object({
  title: z.string().min(3),
  whyItMatters: z.string().min(10),
});

export const riskItemSchema = z.object({
  title: z.string().min(3),
  whyItMatters: z.string().min(10),
  howToReduce: z.string().min(10),
});

export const strengthsRisksSchema = z.object({
  strengths: z.array(strengthItemSchema).max(5),
  risks: z.array(riskItemSchema).min(1).max(5),
});

export const validationWeekSchema = z.object({
  week: z.number().int().min(1).max(4),
  title: z.string().min(3),
  tasks: z.array(z.string().min(3)).min(2).max(4),
});

export const validationPlanSchema = z.object({
  weeks: z.array(validationWeekSchema).min(1).max(4),
});

export type StrengthsRisksResult = z.infer<typeof strengthsRisksSchema>;
export type ValidationPlanResult = z.infer<typeof validationPlanSchema>;

export const STRENGTHS_RISKS_SYSTEM_PROMPT = `Eres un consultor de viabilidad de negocios para Decida. Escribes en español mexicano, tono claro, directo y honesto.

Tu tarea: extraer las fortalezas y los riesgos REALES de este diagnóstico.

Reglas duras:
- Cada fortaleza y cada riesgo debe apoyarse en un dato concreto que te dieron (un número, un rango, una respuesta del usuario). Cita el dato dentro del texto.
- NO inventes datos de mercado, cifras ni benchmarks. Si algo no está en los datos, no existe.
- NO uses elogio genérico ("tienes buena actitud", "tu idea tiene potencial"). Si una fortaleza no se sostiene con un dato, NO la incluyas: es válido devolver pocas o ninguna.
- Cada riesgo DEBE traer una acción concreta para reducirlo o validarlo (howToReduce).
- "title" es una frase corta (máx. ~60 caracteres). "whyItMatters" son 1-2 oraciones explicando la consecuencia práctica.
- No prometas rentabilidad. No sugieras dejar el empleo. Sin lenguaje de gurú.
- Texto plano en cada campo: sin markdown, sin viñetas, sin comillas triples.

Devuelve entre 0 y 5 fortalezas, y entre 1 y 5 riesgos.

Responde SOLO JSON con esta forma exacta:
{
  "strengths": [
    { "title": "...", "whyItMatters": "..." }
  ],
  "risks": [
    { "title": "...", "whyItMatters": "...", "howToReduce": "..." }
  ]
}`;

export function buildStrengthsRisksPrompt(input: {
  idea: string;
  scores: string;
  metrics: string;
  profile: string;
  products: string;
  dependencies: string;
  interpretation: string;
  verifiedFacts: string[];
}): string {
  const facts =
    input.verifiedFacts.length > 0
      ? `\n\nHechos ya verificados por el motor determinístico (úsalos como base y no los contradigas):\n${input.verifiedFacts
          .map((f) => `- ${f}`)
          .join("\n")}`
      : "";

  return `Idea: ${input.idea}
Scores por dimensión: ${input.scores}
Métricas financieras calculadas: ${input.metrics}
Perfil del usuario: ${input.profile}
Productos/servicios: ${input.products}
Dependencias críticas declaradas: ${input.dependencies}
Interpretación del scoring: ${input.interpretation}${facts}`;
}

export const VALIDATION_PLAN_SYSTEM_PROMPT = `Eres un consultor de viabilidad de negocios para Decida. Escribes en español mexicano, tono claro y accionable.

Tu tarea: armar un plan de validación de 4 semanas con acciones concretas y baratas, en el orden en que conviene hacerlas.

Reglas duras:
- 4 semanas, cada una con un objetivo distinto. Progresión sugerida: validar demanda → confirmar números → probar adquisición → decidir el siguiente paso.
- Cada tarea debe ser algo que la persona pueda ejecutar esa semana, con verbo de acción y una cantidad cuando aplique ("Hablar con 10 clientes de tu zona", no "investigar el mercado").
- Ancla las tareas a los datos del diagnóstico: su canal, su precio, sus productos, sus riesgos.
- NO inventes datos ni supongas recursos que no declaró.
- "title" es el objetivo de la semana en 2-4 palabras.
- Texto plano: sin markdown ni viñetas dentro de los campos.

Responde SOLO JSON con esta forma exacta:
{
  "weeks": [
    { "week": 1, "title": "...", "tasks": ["...", "...", "..."] },
    { "week": 2, "title": "...", "tasks": ["...", "..."] },
    { "week": 3, "title": "...", "tasks": ["...", "..."] },
    { "week": 4, "title": "...", "tasks": ["...", "..."] }
  ]
}`;

export function buildValidationPlanPrompt(input: {
  idea: string;
  interpretation: string;
  products: string;
  profile: string;
}): string {
  return `Idea: ${input.idea}
Interpretación del scoring (recomendación y red flags): ${input.interpretation}
Productos/servicios y precios: ${input.products}
Perfil del usuario (tiempo, capital, objetivo): ${input.profile}`;
}
