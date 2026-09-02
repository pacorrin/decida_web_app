---
type: framework
tags: [decida, scoring, ai]
updated: 2026-08-28
---

# Scoring Engine

Fuentes: [[../../raw/notion/10-scoring-engine]] · `src/lib/scoring/index.ts` · `src/lib/scoring/types.ts` · `src/lib/ai/schemas/scoring-interpret.ts`

> ✅ **Bug del score de riesgo resuelto (commits `43d1112` + trabajo del 2026-08-27)**. Antes, `risk_level` dependía de `aprf_acceptable_loss_range`, que ya nunca se capturaba → `scoreFromRange()` caía en el fallback constante de `50`. El fix llegó en dos partes:
> 1. **`43d1112`** (spec en `.kiro/specs/risk-score-fix/`): las preguntas de capital disponible y pérdida aceptable volvieron al paso `perfil`, `saveSituation` las persiste, y `pfit_uncertainty_comfort_score` / `pfit_process_comfort_score` (antes datos muertos) ahora suman a `personalFitScore`.
> 2. **2026-08-27**: `riskScore` ahora **cruza la inversión declarada contra el capital / pérdida aceptable** (penalización de sobre-exposición: +12 si inversión > pérdida tolerable, +8 si > capital), y se calculan las 2 red flags determinísticas correspondientes. Ver [[#Red flags]] y [[#Sobre-exposición: inversión vs. capital declarado]].

## Regla central (diseño y código coinciden)
> "El score no es el producto. El diagnóstico es el producto."

El score alimenta semáforos, explicaciones, alertas, recomendaciones y prompts de IA — nunca se muestra como un número global crudo al usuario. Ver [[../experiencia/reporte-de-resultado#Viability Snapshot]] ("no empezar con un score numérico global").

## Arquitectura implementada (confirmada en código)
El diseño Notion pedía explícitamente: *"implementar primero reglas simples y explícitas en TypeScript. Evitar modelos opacos al inicio. La IA debe explicar, no decidir."* Esto se implementó tal cual, en `runScoringPipeline()` (`src/lib/scoring/index.ts`):

1. **`calculateDeterministicScores(assessment)`** (`types.ts`) — reglas TypeScript puras sobre los datos del assessment, produce un score numérico por cada una de las [[dimensiones-de-viabilidad|6 dimensiones]] + métricas financieras calculadas (margen, break-even, payback). **Desde 2026-08-28** el precio/costo/volumen que consume vienen del **blend ponderado por unidades** del listado de productos del paso `productos` (`blendProducts()` en `src/lib/onboarding/products.ts`), no de 3 campos únicos. Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]].
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
Catálogo de diseño (Notion): inversión inicial > capital disponible · inversión > lo que puede perder · margen por venta negativo · no sabe quién es el cliente · no sabe cómo conseguirá clientes · no ha hablado con clientes y planea invertir capital alto · quiere reemplazar empleo sin ingresos recurrentes probados · depende de plataforma externa sin plan alterno · requiere permisos/regulación no investigados.

**Cómo se calculan hoy (código):**
- **Determinísticas** (`src/lib/scoring/types.ts`):
  - `detectFinancialRedFlags()` — _Desde 2026-08-27_: "inversión inicial > pérdida aceptable" e "inversión inicial > capital disponible" — cruzando `finp_initial_investment` (número) contra el **techo** del rango declarado (`aprf_acceptable_loss_range` / `aprf_capital_available_range`). Solo se disparan cuando la inversión supera el tope; los rangos abiertos (`mas_100k`, `mas_500k`) nunca disparan; si los rangos no se capturaron (assessments viejos), no se emite nada. _Desde 2026-08-28_: "margen por venta negativo" — una red flag por cada producto del paso `productos` cuyo precio sea ≤ su costo variable (`productsBelowCost()` sobre `finp_products`).
  - `detectDependencyRedFlags()` — _Desde 2026-08-28_: 3 red flags según `mrsk_business_dependencies` (paso `evaluacion`): `plataforma` → "depende de plataforma externa, ten plan alterno"; `permiso` → "requiere permiso/licencia/regulación, investígalo antes de invertir"; `cliente_unico` → "1-2 clientes = mayoría de ingresos, si uno se va el negocio tambalea". Las otras 3 opciones (proveedor, ubicación, inventario) penalizan el score pero no emiten red flag.
  - `runScoringPipeline` mete las determinísticas **primero** en `ascs_red_flags` (financieras, luego dependencias), antes que las de la IA.
- **De la IA**: el resto del catálogo (cliente poco claro, canal poco claro, etc.) las sigue infiriendo `interpretScores` a partir del contexto. El prompt de interpretación recibe inversión, rangos de capital/pérdida y las dependencias declaradas; el de `strengths_risks` también recibe el listado de dependencias.

> Brecha cerrada: las dos red flags financieras habían quedado incalculables cuando se removieron las preguntas de capital/pérdida (commit `5886b4d`). Con esas preguntas de vuelta (`43d1112`) y `detectFinancialRedFlags()` ya vuelven a calcularse. Ver [[../decisiones/evolucion-del-producto#2]].

## Penalizaciones al `riskScore` (alto = más riesgo)

`calculateDeterministicScores` suma al `riskScore`, además del `100 - scoreFromRange(pérdida aceptable) + bono si habló con clientes`:

**Sobre-exposición: inversión vs. capital declarado** (_2026-08-27_):
- `+12` si `finp_initial_investment` supera el techo de `aprf_acceptable_loss_range`
- `+8` si supera el techo de `aprf_capital_available_range`

**Dependencias del negocio** (_2026-08-28_, `mrsk_business_dependencies` — rubric dimensión 4):
- `plataforma` **+6**, `permiso` **+6** (están en el checklist de red flags del rubric)
- `proveedor`, `cliente_unico`, `ubicacion`, `inventario` **+3** c/u
- `ninguna` → 0. Tope total **+16** (`DEPENDENCY_PENALTY_CAP`).

Ejemplos cubiertos por tests en `src/lib/scoring/__tests__/types.test.ts`: base 65 → `["plataforma"]` 71 → `["plataforma","permiso"]` 77 → 5 dependencias → cap +16 → 81. Con assessments de prueba de sobre-exposición extrema el `riskScore` ya está clampeado a 100 y la penalización se absorbe.

## Input estructurado a la IA (forma del JSON, Notion)
```json
{
  "businessIdea": "...", "userGoal": "...", "capitalAvailable": "...", "hoursPerWeek": "...",
  "scores": { "personalFit": "green", "financialViability": "yellow", "...": "..." },
  "redFlags": ["..."],
  "calculatedMetrics": { "grossMargin": 500, "monthlyNetEstimate": 8000, "paybackMonths": 3.5 }
}
```
El código real (`buildAssessmentContext()`) construye un contexto de texto más compacto que el JSON completo de Notion — optimización de costo de tokens consistente con [[prompts-de-ia#AI Cost Control]]. Desde 2026-08-27 incluye idea, objetivo, situación, **inversión inicial estimada, capital disponible declarado, pérdida tolerable**, y preocupación principal.

## Otros datos capturados pero ignorados por el scoring
- `pfit_uncertainty_comfort_score` y `pfit_process_comfort_score` — **ya conectados** al `personalFitScore` (commit `43d1112`, +2 a +10 pts cada uno). Ya no son dato muerto.
- `mrsk_business_dependencies` — **ya capturado y conectado** (2026-08-28): grid de checkboxes en `evaluacion`, penalización ponderada al `riskScore` + 3 red flags. Ver arriba.
- `pfit_avoided_activities` — sigue sin capturarse (movido a Sprint 3, falta definir su uso). Ver mapeo completo en [[../producto/gaps-onboarding-vs-framework]].

## Ver también
[[dimensiones-de-viabilidad]] · [[prompts-de-ia]] · [[criterios-de-evaluacion]] · [[../arquitectura/modelo-de-datos]] · [[../producto/gaps-onboarding-vs-framework]]
