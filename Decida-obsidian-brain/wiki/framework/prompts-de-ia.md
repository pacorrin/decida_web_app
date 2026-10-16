---
type: framework
tags: [decida, ai, prompts]
updated: 2026-09-02
---

# Prompts de IA y lógica de diagnóstico

Fuentes: [[../../raw/notion/06-ai-prompts-diagnosis-logic]] · [[../../raw/notion/15-prompt-engineering]] · `src/lib/ai/`

## Principio rector
La IA **no es el cerebro único del producto**. Actúa como redactor-consultor que explica los resultados del [[scoring-engine|scoring engine]] de forma clara y personalizada — no calcula números, no inventa datos de mercado, no decide la recomendación final desde cero (la calcula el motor determinístico, la IA la interpreta y redacta).

## Dónde vive en el código
- `src/lib/ai/openai.ts` — cliente/modelo de razonamiento (`generateReasoningJson`, `getReasoningModel`).
- `src/lib/ai/generate-report.ts` — orquesta la generación del reporte completo, sección por sección, **con reintentos automáticos** (ver [[../arquitectura/manejo-de-errores-y-reembolsos]]). Desde 2026-08-28 el contexto de `business_understanding` y `financial_analysis` incluye el listado de productos/servicios (precio, costo, volumen por renglón) y se le pide comentar el margen por producto y si alguno se vende con pérdida.
- `src/lib/ai/prompts/idea-summary.ts`, `idea-refinement.ts`, `idea-assumptions-rotate.ts` — prompts de comprensión/confirmación de la idea (fase gratis del onboarding). `idea-assumptions-rotate` es nuevo (commit `0259101`, 2026-08-26): solo regenera la lista de supuestos, sin reescribir el resumen. Ver [[../experiencia/flujo-de-onboarding#El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (2026-08-26)]].
- `src/lib/ai/schemas/` — schemas Zod que tipan cada salida de IA: `idea-summary`, `idea-refinement`, `idea-assumptions`, `idea-assumptions-rotate`, `structured-understanding`, `scoring-interpret`.

### Pulido del prompt de refinamiento de idea (commit `0259101`, 2026-08-26)
`IDEA_REFINEMENT_SYSTEM_PROMPT` se reescribió de "integra las aclaraciones del usuario" a "REESCRIBE «Nuestro entendimiento» como análisis sintetizado". Reglas nuevas: prohibido pegar la aclaración literal, prohibidos los verbos de transcripción ("comentaste", "indicaste", "aclaraste", "mencionaste"…), cada campo de `structuredUnderstanding` = 1 frase analítica corta, mapeo semántico del tema al campo, + un ejemplo de referencia de estilo en el propio prompt. El prompt ahora recibe el `structuredUnderstanding` actual como contexto. Además hay una **capa de saneo determinística en `openai.ts`** que corre sobre la salida (real o fallback): detecta volcados de Q&A o de aclaraciones crudas y los reemplaza por el valor previo. Esto es una defensa dedicada contra que la sección "Así entendimos tu idea" se lea como transcripción — antes lo hacía, sobre todo en el fallback sin API key.

Esto confirma que el diseño de "prompts separados por responsabilidad, con output JSON tipado" de Notion 15 se implementó literalmente — cada prompt tiene su propio schema Zod de validación.

### Secciones JSON del reporte (arreglo 2026-09-02)
`src/lib/ai/schemas/report-sections.ts` — `strengthsRisksSchema` y `validationPlanSchema` con sus system prompts dedicados. Existen porque esas dos secciones se generaban con `generateText` bajo un `BASE_SYSTEM` que instruye Markdown: el modelo envolvía el JSON en un bloque cercado y `JSON.parse` fallaba en **33 de 33 reportes**. Ahora usan `generateJson` (`response_format: json_object`) + Zod, y sus prompts **nunca mencionan Markdown**. Detalle completo en [[../experiencia/reporte-de-resultado#🔴→✅ Las 3 secciones JSON estaban rotas al 100% (arreglado 2026-09-02)]].

> Regla que se desprende: **cualquier prompt que pida JSON va por `generateJson`/`generateReasoningJson` + schema Zod, nunca por `generateText`.** Las 4 llamadas que sí funcionaban ya seguían ese patrón; las 2 rotas eran las únicas que no.

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

## Calidad del reporte — v1.2.0 (2026-10-16)

Tras la prueba manual del onboarding ([[../tareas/prueba-onboarding-2026-10-16]]) se corrigió el contenido generado por IA. `REPORT_PROMPT_VERSION` pasó a `v1.2.0`.

**Causa raíz del «riesgo 94 Favorable».** El puntaje de `risk_level` se calcula con **alto = más riesgo** (ver [[scoring-engine#Penalizaciones al `riskScore` (alto = más riesgo)]]), pero el prompt que asignaba los semáforos (`SCORING_INTERPRET_SYSTEM_PROMPT`) decía lo contrario («score alto = menos riesgo = green»). El texto del reporte acertaba («riesgo alto») y el semáforo estaba mal. Arreglos:
- El prompt describe bien la dirección (≤30 verde, 31–60 amarillo, >60 rojo en riesgo).
- `enforceSignals` (`src/lib/ai/schemas/scoring-interpret.ts`, aplicado en `runScoringPipeline`): los 6 semáforos salen de los puntajes con umbrales fijos; la IA solo puede **empeorar** el de riesgo (inversión sobre capital o pérdida tolerada), nunca mejorarlo. 
- La tarjeta de riesgo del reporte aclara «más puntos = más riesgo».

**Contexto que recibe la IA** (`src/lib/ai/report-context.ts`):
- Cada puntaje viaja con su `lectura` y su `semaforo`; la IA no debe contradecirlos.
- `buildFounderProfile`: datos de **la persona que emprende** con etiquetas legibles y rotulados «NO describen al cliente» (antes la IA tomaba el capital del emprendedor como perfil del cliente). Ahora incluye las respuestas de «tipo de trabajo» (actividades que disfruta, preferencia de trabajo, comodidad vendiendo/incertidumbre/procesos, contratación).

**Reglas del sistema (`BASE_SYSTEM`)**: hablar siempre de «tú»; hablar de la idea concreta (nada de consejos de e-commerce o freelancing genéricos); no repetir el título de la sección; sin LaTeX; todo en español («alertas», no «red flags»). Los prompts de «Compatibilidad personal», «Tiempo y operación» y «Escalabilidad» piden razonar sobre lo que exige ESTE negocio.

**Red de seguridad** (`sanitizeSectionMarkdown`): quita el encabezado inicial repetido, fórmulas LaTeX en crudo y «Red Flags».

**Redundancias**: el resumen ya no enumera alertas; `ascs_red_flags` guarda solo las alertas **calculadas sobre los números** (las que propone la IA salen como riesgos con su mitigación); se quitó el título «Análisis de escalabilidad» que duplicaba el de la sección.

**Verificado** regenerando el reporte de la prueba con OpenAI real: semáforo de riesgo «Riesgo elevado» coherente con el texto, secciones en segunda persona y específicas del negocio de viandas, sin LaTeX ni encabezados duplicados. Tests: `report-context.test.ts` y `scoring-interpret.test.ts`.

**Pendientes**: «Compatibilidad personal» a veces cita la viabilidad comercial como brecha personal; las evaluaciones ya guardadas conservan su semáforo anterior (no se recalculan); revisar si el puntaje de riesgo 94 es demasiado alto para este caso (el cálculo suma +8 por no tener clientes y penaliza dependencias; eso es de scoring, no de prompts).

