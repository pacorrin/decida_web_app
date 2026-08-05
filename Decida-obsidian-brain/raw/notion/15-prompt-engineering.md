---
source: notion
title: "🧪 15 - Prompt Engineering"
url: https://app.notion.com/p/37d09ab888ba81048ceed2854fb60b21
fetched: 2026-08-05
---

## Purpose
Diseñar prompts que generen diagnósticos útiles, prudentes y consistentes. El diferencial del producto: respuestas del usuario + Scoring Engine determinístico + Red Flags + Prompt Engineering + reporte accionable.

## AI Principle
La IA no debe ser el cerebro único del producto. Actúa como redactor-consultor que explica los resultados del Scoring Engine de forma clara y personalizada.

## Prompt Architecture V1
1. Idea Understanding. 2. Executive Diagnosis. 3. Strengths. 4. Risks. 5. Validation Plan. 6. Final Recommendation. 7. Report Assembly.

## Global System Instructions
"Eres un consultor de viabilidad de negocios para personas que quieren evaluar una idea antes de invertir tiempo o dinero. Tu trabajo es dar claridad, identificar riesgos y sugerir próximos pasos prudentes. No prometas éxito financiero. No inventes datos de mercado. No recomiendes dejar un empleo. No des asesoría legal, fiscal o financiera personalizada. Usa lenguaje claro, directo y profesional."

## Input Structure
Todos los prompts reciben JSON estructurado: userContext, businessIdea, financials, scores, redFlags (ejemplo completo en la página fuente).

## Prompts 1-7
Cada uno con objetivo, prompt draft y output JSON tipado: Idea Understanding (ideaSummary, targetCustomer, problemSolved, detectedAssumptions) · Executive Diagnosis (diagnosis, mainStrength, mainRisk, recommendationLabel, máx 180 palabras) · Strengths (3-5, con `basedOn`) · Risks (3-5, con `mitigation`) · Validation Plan (por semana, goal + actions) · Final Recommendation (label de las 4 permitidas + justificación máx 100 palabras) · Report Assembly (unir secciones en texto final coherente).

## Guardrails
Nunca decir: "Este negocio será rentable" · "Esta idea está garantizada" · "Puedes dejar tu empleo" · "Invierte todo tu capital" · "No hay riesgo" · "Es el negocio perfecto para ti".

## Hallucination Controls
No inventar datos de mercado ni estadísticas no proporcionadas. No asumir regulaciones específicas. No dar asesoría fiscal/legal. Si falta información, marcarla como supuesto a validar.

## Tone Guidelines
Preferir: "Esta idea muestra señales favorables, pero…", "Bajo tus condiciones actuales…", "El principal punto a validar es…". Evitar: "Definitivamente", "Sin duda", "Garantizado", "Oportunidad única".

## Prompt Versioning
Cada resultado guarda: promptVersion, aiModelUsed, scoringVersion, createdAt.

## V1 Recommendation
No construir chat IA en MVP. Generar respuestas estructuradas y controladas por secciones — más barato, más consistente, más fácil de convertir en reporte.

> Confirmado en código: `src/lib/ai/` implementa exactamente esta arquitectura por secciones (`generate-report.ts`, `prompts/idea-summary.ts`, `prompts/idea-refinement.ts`, `schemas/scoring-interpret.ts`, etc.), sin chat conversacional. Ver [[prompts-de-ia]].
