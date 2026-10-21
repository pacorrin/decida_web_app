# Resultados del plan ajustado — Paso B: pasada de revisión

Fecha: **2026-10-20** · `REPORT_PROMPT_VERSION v1.3.0 → v1.4.0` · corrida `evals/after-b/` frente a `evals/after-a/` y `evals/baseline/` (mismos 5 casos).

## Qué hace
Una llamada posterior a las 9 secciones (`src/lib/ai/review-report.ts`, orquestada en `buildReportData`) recibe el reporte completo y los datos con que se generó y devuelve JSON validado con Zod:
- `contradicciones` (dos afirmaciones de secciones distintas que no pueden ser ciertas a la vez),
- `supuestos_sin_fuente` (afirmaciones factuales específicas sin respaldo, presentadas como hecho),
- `conclusiones_no_sustentadas` (no se siguen de las cifras o los datos),
- `correcciones` (qué sección reescribir y con qué instrucción).

Reglas del encargo, tal como quedaron:
- **Una sola iteración.** Solo se reescriben las secciones señaladas, con tope (`REPORT_REVIEW_MAX_REWRITES`, 4). No hay segunda revisión.
- **Más de N problemas (`REPORT_REVIEW_MAX_ISSUES`, 6)** → el reporte se marca `arep_needs_human_review = true`, **no se reescribe** y se registra en Sentry.
- **Nunca tumba el reporte**: si la revisión o una reescritura fallan, esa parte se entrega tal cual y queda anotado (`arep_review.action = "failed"`).
- No toca puntajes, semáforos ni recomendación (son deterministas). Usa el modelo de razonamiento ya configurado (`OPENAI_MODEL_REASONING`).
- Se guarda en `assessment_reports.arep_review` (JSON) y `arep_needs_human_review` (migración `20261020000000_report_review`). Se apaga con `REPORT_REVIEW_ENABLED=false`.

## Resultados (5 casos)

| Caso | Acción | Problemas | Secciones reescritas |
|---|---|---|---|
| 01 Cafetería | reescribe | 2 | entendimiento del negocio, financiero |
| 02 Plantillas | reescribe | 1 | entendimiento, fortalezas y riesgos |
| 03 Curso | nada | 0 | — |
| 04 Vaga | reescribe | 4 | financiero, tiempo, escalabilidad, fortalezas y riesgos |
| 05 Cassettes | reescribe | 3 | entendimiento |

**Lo que atrapó bien:** en 04, la contradicción «la inversión excede la pérdida tolerable» frente a «cabe en lo que puedes perder», y dos errores de lógica del análisis financiero («el punto de equilibrio es un volumen, no un plazo»; «recuperarás la inversión» con utilidad neta cero). Tras la reescritura el financiero dice «con un beneficio neto de 0 no podrás recuperar tu inversión» y se eliminó una fortaleza duplicada.

**Calibración necesaria:** la primera versión del revisor marcaba como «sin fuente» cualquier inferencia razonable («podría saturarte en horas pico») y mandaba un reporte aceptable (01) a revisión humana con 8 problemas. Se acotó el prompt a afirmaciones factuales específicas presentadas como hecho, con ejemplos de lo que NO es un problema; la misma pasada bajó de 8 a 2 problemas en 01.

## Lo que sigue sin resolverse
- **04: la contradicción de fondo sigue ahí.** La fortaleza «tu inversión de $5,000 cabe en lo que puedes perder» es una regla **determinista** (`src/lib/scoring/strengths.ts`) y la reescritura debe respetar los «hechos verificados». El origen es un caso borde: tolerancia «menos de $5,000» con inversión de exactamente $5,000 (la regla usa el techo del rango como inclusivo). **Es lógica de scoring, que el encargo prohíbe tocar**: se deja a decisión del usuario.
- **05**: «Competencia baja» y «canal definido» siguen como fortalezas; para corregirlas hacen falta datos externos (Paso C).
- Los supuestos de mercado sin cifra (categoría A del diagnóstico) siguen sin fuente: es el trabajo de la investigación.

## Costo y latencia
- Latencia por reporte: **11–15 s** (baseline) → 15–18 s (paso A) → **33–40 s** (paso B). La revisión añade una llamada de razonamiento (~15–20 s) más las reescrituras en paralelo.
- Costo estimado de la pasada: unos centavos por reporte (una llamada de razonamiento con ~6 mil tokens de entrada, más 1–4 reescrituras con el modelo narrativo); no se midió en dólares exactos porque `@posthog/ai` corre en modo privado sin cifras en el script (queda para el Paso 4).
- Se observó **un episodio intermitente**: una corrida del caso 03 tardó 145 s y registró un `SyntaxError` (JSON inválido en una de las llamadas de JSON); el pipeline degradó como está diseñado y una nueva corrida tardó 33 s. No es nuevo de este paso; se anota por fiabilidad.

## Verificación
`tsc` limpio; 214 tests de Vitest (nuevos: `review-report.test.ts` con la regla de N y los topes, y `generate-report-review.test.ts` con la orquestación: apagada, sin problemas, reescritura de una sección, reescritura de fortalezas y riesgos, revisión humana, revisión que falla, JSON inválido y reescritura que falla).
