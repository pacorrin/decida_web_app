---
type: framework
tags: [decida, scoring, ai]
updated: 2026-08-05
---

# Scoring Engine

Fuentes: [[../../raw/notion/10-scoring-engine]] · `src/lib/scoring/index.ts` · `src/lib/scoring/types.ts` · `src/lib/ai/schemas/scoring-interpret.ts`

> 🔴 **Bug confirmado en código (2026-08-05)**: el score de `risk_level` está roto, no solo incompleto. `calculateDeterministicScores` (`src/lib/scoring/types.ts:150-160`) lo calcula a partir de `profile?.aprf_acceptable_loss_range`, campo que ya nunca se captura (removido del onboarding, ver nota de brecha abajo). `scoreFromRange()` cae en su fallback de `50` cuando el valor es `null` — **hoy casi todo assessment recibe el mismo score de riesgo** (~50-60) sin importar el capital real en juego. Detalle completo y plan de fix: [[../producto/gaps-onboarding-vs-framework#🔴 Hallazgo crítico]] y [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 2]].

## Regla central (diseño y código coinciden)
> "El score no es el producto. El diagnóstico es el producto."

El score alimenta semáforos, explicaciones, alertas, recomendaciones y prompts de IA — nunca se muestra como un número global crudo al usuario. Ver [[../experiencia/reporte-de-resultado#Viability Snapshot]] ("no empezar con un score numérico global").

## Arquitectura implementada (confirmada en código)
El diseño Notion pedía explícitamente: *"implementar primero reglas simples y explícitas en TypeScript. Evitar modelos opacos al inicio. La IA debe explicar, no decidir."* Esto se implementó tal cual, en `runScoringPipeline()` (`src/lib/scoring/index.ts`):

1. **`calculateDeterministicScores(assessment)`** (`types.ts`) — reglas TypeScript puras sobre los datos del assessment, produce un score numérico por cada una de las [[dimensiones-de-viabilidad|6 dimensiones]] + métricas financieras calculadas (margen, break-even, payback).
2. **`interpretScores(scores, context)`** — llama a `generateReasoningJson()` (OpenAI) con `SCORING_INTERPRET_SYSTEM_PROMPT` para traducir los scores numéricos a: señal por dimensión (verde/amarillo/rojo), red flags, y recomendación final.
3. **Fallback determinístico**: si la llamada a IA falla, `fallbackScoringInterpret(scores)` genera la interpretación sin IA — el pipeline nunca se cae solo porque OpenAI falle. Esto es coherente con [[../arquitectura/manejo-de-errores-y-reembolsos]].
4. El resultado se persiste vía `prisma.assessment_scores.upsert()`, incluyendo `ascs_scoring_version` (versión del scoring + modelo de razonamiento usado) para trazabilidad.

## Pesos (Notion, V1)
Personal Fit 20% · Financial Viability 25% · Commercial Viability 25% · Risk Level 15% · Time Fit 10% · Scalability 5%.

## Recommendation Logic (las 4 salidas)
- **Proceed with Small Test** — financiera no roja, comercial amarilla/verde, riesgo no rojo, tiempo aceptable.
- **Validate First** — financieras poco claras, sin validación de clientes, canal poco claro, riesgo manejable pero no probado.
- **Adjust the Idea** — conflicto de fit personal, desajuste de tiempo, márgenes débiles pero arreglables.
- **Pause for Now** — economía negativa, inversión > pérdida aceptable, sin cliente claro, alta dependencia + poco tiempo.

## Red flags (reglas duras, pueden tumbar un score "aceptable")
Inversión inicial > capital disponible · inversión > lo que puede perder · margen por venta negativo · no sabe quién es el cliente · no sabe cómo conseguirá clientes · no ha hablado con clientes y planea invertir capital alto · quiere reemplazar empleo sin ingresos recurrentes probados · depende de plataforma externa sin plan alterno · requiere permisos/regulación no investigados.

> Nota de brecha: dos de las red flags originales (inversión > capital disponible, inversión > pérdida aceptable) dependían de las preguntas de capital/pérdida tolerable que fueron **removidas del onboarding en producción** (commit `5886b4d`). Verificar en próxima ingesta si estas red flags siguen siendo calculables con los datos que hoy se capturan, o si quedaron huérfanas. Ver [[../decisiones/evolucion-del-producto]].

## Input estructurado a la IA (forma del JSON, Notion)
```json
{
  "businessIdea": "...", "userGoal": "...", "capitalAvailable": "...", "hoursPerWeek": "...",
  "scores": { "personalFit": "green", "financialViability": "yellow", "...": "..." },
  "redFlags": ["..."],
  "calculatedMetrics": { "grossMargin": 500, "monthlyNetEstimate": 8000, "paybackMonths": 3.5 }
}
```
El código real (`buildAssessmentContext()`) construye un contexto de texto más compacto (idea, objetivo, situación, preocupación principal) en vez del JSON completo propuesto en Notion — optimización de costo de tokens consistente con [[prompts-de-ia#AI Cost Control]].

## Otros datos capturados pero ignorados por el scoring
`pfit_uncertainty_comfort_score` y `pfit_process_comfort_score` se recolectan en el onboarding (paso `ajuste`) pero `calculateDeterministicScores` nunca los lee — dato muerto hoy, candidato de bajo costo para el fix de Sprint 2. Igual que `mrsk_business_dependencies`, que ni siquiera se llega a capturar en el formulario. Ver mapeo completo en [[../producto/gaps-onboarding-vs-framework]].

## Ver también
[[dimensiones-de-viabilidad]] · [[prompts-de-ia]] · [[criterios-de-evaluacion]] · [[../arquitectura/modelo-de-datos]] · [[../producto/gaps-onboarding-vs-framework]]
