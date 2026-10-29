# Pipeline actual de generación del reporte

Estado al **2026-10-20** (`REPORT_PROMPT_VERSION = v1.2.0`). Describe lo que hace el código hoy, sin cambios. Es el punto de partida de la tarea «etapa de investigación + revisión de consistencia».

## 1. Dónde se dispara

| Disparador | Archivo | Qué hace |
|---|---|---|
| Último paso del onboarding (`saveEvaluation`) | `src/app/analizar/actions.ts` | Guarda `financial_inputs` y `market_risk_inputs`, marca la evaluación `in_progress`, crea el contexto de observabilidad y llama a `runScoringPipeline` → `generateReport`. |
| «Reintentar generación» (`retryReportGeneration`) | mismo archivo | Solo si la evaluación está `failed` o `completed`; repite exactamente lo anterior. |

Si cualquiera de las dos llamadas lanza, `saveEvaluation` registra el error (`logReportGenerationError` → Sentry, con etiqueta `area:report-generation`), marca `asmt_status = "failed"` y redirige a `/analizar/resultado`, que muestra el estado de error con el botón de reintento. **No hay reporte parcial**: o salen las 9 secciones o ninguna.

## 2. Entradas

`AssessmentWithRelations` (Prisma, serializado):

| Tabla | Campos que el pipeline lee |
|---|---|
| `assessment_profiles` | situación actual, objetivo principal, experiencia, capital disponible (rango), pérdida aceptable (rango), horas por semana (rango), horario, expectativa de resultados |
| `personal_fit_answers` | actividades que disfruta, preferencia de trabajo, comodidad vendiendo / incertidumbre / procesos (1–5), preferencia de contratación |
| `business_ideas` | `bide_ai_summary` (resumen de la IA ya confirmado por la persona). Existen además `bide_ai_detected_assumptions` (supuestos + «entendimiento estructurado»), `bide_target_customer`, `bide_problem_solved`, `bide_why_would_pay`, pero **el reporte solo usa el resumen**. |
| `financial_inputs` | inversión inicial, productos (`finp_products`: nombre, tipo, precio, costo variable, unidades/mes), rango de costos fijos y su monto, métricas calculadas |
| `market_risk_inputs` | nivel de evidencia de clientes, nivel de competencia, canal de adquisición, dependencias críticas, mayor preocupación, condición de éxito |

**No existe ningún campo de mercado objetivo ni de ubicación del negocio.** `assessments.asmt_country` es el país **de la persona** (formulario de contacto), no el del mercado. La ciudad aparece solo si la persona la escribió en la descripción de la idea.

## 3. Etapa A — Scoring (`src/lib/scoring`)

`runScoringPipeline(assessment)`:

1. `calculateDeterministicScores` (puro, sin IA): 6 dimensiones 0–100 — compatibilidad personal, viabilidad financiera, viabilidad comercial, **nivel de riesgo (alto = más riesgo)**, tiempo y escalabilidad — más métricas (margen bruto por venta y %, utilidad neta mensual, punto de equilibrio, recuperación en meses).
2. `interpretScores` → **IA** (`generateReasoningJson`, modelo `OPENAI_MODEL_REASONING`, por defecto `gpt-5-mini` (antes `o4-mini`, dado de baja por OpenAI el 2026-10), esfuerzo `medium`) con `SCORING_INTERPRET_SYSTEM_PROMPT`. Devuelve JSON validado con `scoringInterpretSchema` (6 semáforos, recomendación final, `red_flags`, resumen). Si falla o no valida → `fallbackScoringInterpret` (reglas fijas).
3. `enforceSignals`: los semáforos se **recalculan desde los puntajes** (umbral fijo); la IA solo puede empeorar el de riesgo.
4. Alertas deterministas (`detectFinancialRedFlags`, `detectDependencyRedFlags`) + las de la IA se mezclan en `interpretation.red_flags`; a la BD (`assessment_scores.ascs_red_flags`) solo se guardan las deterministas.
5. Se persiste `assessment_scores` (puntajes, semáforos, recomendación, alertas, versión de scoring).

Salida hacia el reporte: `deterministic` (dimensiones + métricas) e `interpretation` (semáforos, recomendación, alertas, resumen).

## 4. Etapa B — Reporte (`src/lib/ai/generate-report.ts`)

### 4.1 Contexto (`buildContext`)

Cadenas JSON que se inyectan en los prompts:

| Campo | Contenido |
|---|---|
| `idea` | `bide_ai_summary` |
| `scores` | por dimensión: puntaje, **lectura** (en riesgo, alto = más riesgo) y semáforo |
| `metrics` | las métricas calculadas |
| `interpretation` | recomendación, alertas, resumen del scoring |
| `profile` | datos **de la persona que emprende** con etiquetas legibles, rotulados «no es el cliente» (`buildFounderProfile` en `report-context.ts`) |
| `products` | nombre, tipo, precio, costo variable, unidades/mes |
| `dependencies` | dependencias críticas en texto |

### 4.2 Las 9 llamadas (en paralelo, `Promise.all`)

`BASE_SYSTEM` (español mexicano, hablar de «tú», sin LaTeX, sin título de sección, semáforos intocables) + un prompt por sección. Modelo `OPENAI_MODEL_NARRATIVE` (por defecto `gpt-4o-mini`).

| # | Sección (columna `arep_*`) | Tipo | Recibe | Validación |
|---|---|---|---|---|
| 1 | `executive_summary` | Markdown, `temperature 0.4` | idea, scores, interpretation | texto no vacío; `sanitizeSectionMarkdown` |
| 2 | `business_understanding` | Markdown | idea, products, profile | ídem |
| 3 | `financial_analysis` | Markdown | metrics, scores, products | ídem |
| 4 | `personal_fit_analysis` | Markdown | idea, profile, scores | ídem |
| 5 | `time_operation_analysis` | Markdown | idea, products, profile, scores | ídem |
| 6 | `scalability_analysis` | Markdown | idea, products, dependencies, profile, scores | ídem |
| 7 | `final_recommendation` | Markdown | interpretation, scores, idea | ídem |
| 8 | `strengths` + `risks` | **JSON** (`generateJson`, `temperature 0.3`, `response_format: json_object`), prompt propio | idea, scores, metrics, profile, products, dependencies, interpretation + hechos verificados (fortalezas deterministas) | Zod `strengthsRisksSchema` (≤5 fortalezas, 1–5 riesgos, cada riesgo con `howToReduce`) |
| 9 | `validation_plan` | **JSON**, prompt propio | idea, interpretation, products, profile | Zod `validationPlanSchema` (1–4 semanas, 2–4 tareas) |

Las secciones **no se ven entre sí**: ninguna recibe el texto de otra. La coherencia depende solo de que todas reciban los mismos puntajes e interpretación.

### 4.3 Fallos y degradación

- **Secciones Markdown (1–7)**: `generateSection` reintenta 2 veces (1 s y 2 s). Si agota, lanza → `Promise.all` falla → **todo el reporte falla**.
- **JSON (8 y 9)**: si el modelo devuelve JSON inválido, `.catch` registra el error y devuelve `null`: las fortalezas caen al fallback determinista (`detectDeterministicStrengths`), los riesgos quedan `[]` y el plan de validación `[]`. El reporte se guarda igual.
- Además, el SDK de OpenAI reintenta por su cuenta (2 reintentos por defecto) antes de que actúen los reintentos propios. No hay *timeout* configurado por llamada.
- **No hay proveedor de respaldo**: todo pasa por OpenAI con una sola API key.

### 4.4 Postproceso y persistencia

- `sanitizeSectionMarkdown`: quita encabezado inicial repetido, fórmulas LaTeX y «Red Flags».
- Fortalezas: IA primero, completadas con deterministas si salen menos de 3.
- Se guarda en `assessment_reports` con `arep_ai_model_used` y `arep_prompt_version`, y la evaluación pasa a `report_generated`.

## 5. Observabilidad

- `@posthog/ai` envuelve el cliente de OpenAI (`getOpenAIClient`); **`privacyMode: true`**: solo modelo, tokens, latencia y costo; no se guarda el contenido de los prompts.
- Cada llamada lleva `posthogDistinctId` (cuenta), `$ai_session_id` y un `posthogTraceId` compartido por evaluación.
- Errores de generación → `logReportGenerationError` → `console` + `Sentry.captureException` (sin correo).

## 6. Qué datos recibe cada sección y qué le falta

| Sección | Recibe hoy | Le falta para ser útil |
|---|---|---|
| Resumen ejecutivo | idea, puntajes, interpretación | contexto de mercado; las conclusiones de las demás secciones (se escribe «a ciegas») |
| Entendimiento del negocio | idea, productos, perfil | **cliente objetivo y problema** (existen en `bide_ai_detected_assumptions`/campos `bide_*` y no se pasan); tamaño y comportamiento del mercado |
| Análisis financiero | métricas, productos | **costos fijos** (monto y rango), inversión, moneda; **referencias de precios y de costos del sector** para contrastar los supuestos de la persona |
| Compatibilidad personal | idea, perfil del emprendedor (con respuestas de «tipo de trabajo») | qué exige el sector (permisos, ventas, operación) |
| Tiempo y operación | idea, productos, perfil | carga operativa típica del giro |
| Escalabilidad | idea, productos, dependencias, perfil | **nivel de competencia, canal de adquisición**, tamaño del mercado, casos comparables |
| Recomendación final | interpretación, puntajes, idea | conexión con lo que dijeron las otras secciones |
| Fortalezas y riesgos | idea, puntajes, métricas, perfil, productos, dependencias, interpretación | **evidencia de clientes, competencia, canal, preocupación principal, condición de éxito** (se capturan en `market_risk_inputs` pero no se pasan), riesgos regulatorios y de mercado externos |
| Plan de validación | idea, interpretación, productos, perfil | canal real y dónde encontrar clientes, competidores a investigar |

**Datos que se capturan y nunca llegan al reporte** (más allá del resumen de la IA): nivel de competencia, canal de adquisición, evidencia de clientes (solo indirecta, vía la interpretación), preocupación principal, condición de éxito, costos fijos, entendimiento estructurado de la idea.

**Datos que no existen en ningún lado**: mercado objetivo (país/ciudad), tamaño de mercado, competidores, precios de referencia, costos típicos, canales del sector, regulación aplicable.

## 7. Observaciones colaterales

- La moneda se guarda como `MXN` (el esquema Zod del onboarding la fija por defecto); el `USD` de la columna en Prisma solo aplicaría si se omitiera, y hoy no ocurre. El reporte, aun así, no declara la moneda en los textos de la IA.
- La temperatura es fija por tipo de llamada; no hay semilla ni forma de reproducir una generación.
- No existe ningún conjunto de evaluación: la calidad del reporte hoy solo se juzga leyendo.
