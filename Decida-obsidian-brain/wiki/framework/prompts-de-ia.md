---
type: framework
tags: [decida, ai, prompts]
updated: 2026-08-26
---

# Prompts de IA y lógica de diagnóstico

Fuentes: [[../../raw/notion/06-ai-prompts-diagnosis-logic]] · [[../../raw/notion/15-prompt-engineering]] · `src/lib/ai/`

## Principio rector
La IA **no es el cerebro único del producto**. Actúa como redactor-consultor que explica los resultados del [[scoring-engine|scoring engine]] de forma clara y personalizada — no calcula números, no inventa datos de mercado, no decide la recomendación final desde cero (la calcula el motor determinístico, la IA la interpreta y redacta).

## Dónde vive en el código
- `src/lib/ai/openai.ts` — cliente/modelo de razonamiento (`generateReasoningJson`, `getReasoningModel`).
- `src/lib/ai/generate-report.ts` — orquesta la generación del reporte completo, sección por sección, **con reintentos automáticos** (ver [[../arquitectura/manejo-de-errores-y-reembolsos]]).
- `src/lib/ai/prompts/idea-summary.ts`, `idea-refinement.ts`, `idea-assumptions-rotate.ts` — prompts de comprensión/confirmación de la idea (fase gratis del onboarding). `idea-assumptions-rotate` es nuevo (commit `0259101`, 2026-08-26): solo regenera la lista de supuestos, sin reescribir el resumen. Ver [[../experiencia/flujo-de-onboarding#El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (2026-08-26)]].
- `src/lib/ai/schemas/` — schemas Zod que tipan cada salida de IA: `idea-summary`, `idea-refinement`, `idea-assumptions`, `idea-assumptions-rotate`, `structured-understanding`, `scoring-interpret`.

### Pulido del prompt de refinamiento de idea (commit `0259101`, 2026-08-26)
`IDEA_REFINEMENT_SYSTEM_PROMPT` se reescribió de "integra las aclaraciones del usuario" a "REESCRIBE «Nuestro entendimiento» como análisis sintetizado". Reglas nuevas: prohibido pegar la aclaración literal, prohibidos los verbos de transcripción ("comentaste", "indicaste", "aclaraste", "mencionaste"…), cada campo de `structuredUnderstanding` = 1 frase analítica corta, mapeo semántico del tema al campo, + un ejemplo de referencia de estilo en el propio prompt. El prompt ahora recibe el `structuredUnderstanding` actual como contexto. Además hay una **capa de saneo determinística en `openai.ts`** que corre sobre la salida (real o fallback): detecta volcados de Q&A o de aclaraciones crudas y los reemplaza por el valor previo. Esto es una defensa dedicada contra que la sección "Así entendimos tu idea" se lea como transcripción — antes lo hacía, sobre todo en el fallback sin API key.

Esto confirma que el diseño de "prompts separados por responsabilidad, con output JSON tipado" de Notion 15 se implementó literalmente — cada prompt tiene su propio schema Zod de validación.

## Arquitectura de prompts (Notion, 7 responsabilidades)
1. Idea Understanding — resumir la idea sin agregar supuestos.
2. Executive Diagnosis — diagnóstico de máx. 180 palabras.
3. Strengths — 3 a 5 fortalezas basadas en datos reales.
4. Risks — 3 a 5 riesgos con mitigación.
5. Validation Plan — plan de 2-4 semanas.
6. Final Recommendation — una de las 4 etiquetas permitidas.
7. Report Assembly — unir todo en texto coherente.

## System instructions globales (usadas en todos los prompts)
> "Eres un consultor de viabilidad de negocios para personas que quieren evaluar una idea antes de invertir tiempo o dinero. Tu trabajo es dar claridad, identificar riesgos y sugerir próximos pasos prudentes. No prometas éxito financiero. No inventes datos de mercado. No recomiendes dejar un empleo. No des asesoría legal, fiscal o financiera personalizada."

## Guardrails (nunca decir)
"Este negocio será rentable" · "Esta idea está garantizada" · "Puedes dejar tu empleo" · "Invierte todo tu capital" · "No hay riesgo" · "Es el negocio perfecto para ti".

## Hallucination controls
No inventar datos de mercado ni estadísticas no proporcionadas · no asumir regulaciones específicas · no dar asesoría fiscal/legal · si falta información, marcarla explícitamente como supuesto a validar.

## Tono preferido vs evitar
Preferir: "Esta idea muestra señales favorables, pero…", "Bajo tus condiciones actuales…", "El principal punto a validar es…"
Evitar: "Definitivamente", "Sin duda", "Garantizado", "Negocio perfecto", "Oportunidad única".

## AI Cost Control (por qué se diseñó así)
Usar IA solo después de completar el formulario · enviar JSON/contexto compacto, no historial conversacional completo · cachear diagnóstico por assessment · **evitar interfaz de chat en V1** — no hay evidencia de un chat conversacional en el código; se confirma la decisión de "respuestas estructuradas por secciones, no chat".

## Markdown en respuestas de IA (evolución posterior al diseño original)
Un commit posterior (`Add markdown rendering support for AI responses`, `Update AI prompts to encourage markdown formatting`) agregó soporte de renderizado markdown para las respuestas de IA — extensión no prevista en el diseño original de Notion, probablemente para mejorar la legibilidad del reporte. Ver [[../decisiones/evolucion-del-producto]].

## Versionado
Cada resultado guarda `promptVersion`, `aiModelUsed`, `scoringVersion` — visible en el campo real `ascs_scoring_version` de `assessment_scores` (ver [[../arquitectura/modelo-de-datos]]), que concatena versión de scoring + modelo de razonamiento usado.

## Ver también
[[scoring-engine]] · [[dimensiones-de-viabilidad]] · [[../experiencia/reporte-de-resultado]] · [[../arquitectura/manejo-de-errores-y-reembolsos]]
