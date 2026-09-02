---
type: decision-log
tags: [decida, sprint-2, onboarding, scoring, alcance]
updated: 2026-08-28
---

# Alcance de los campos restantes del onboarding (Sprint 2)

Decisión del 2026-08-28 sobre qué campos del onboarding entran al MVP y cuáles se posponen. Análisis pedido por el usuario tras cerrar el paso `productos`. Fuentes: [[../../raw/notion/17-rubric-6-dimensiones]] · [[../producto/gaps-onboarding-vs-framework]] · `src/lib/scoring/types.ts` (`commercialScore`, `riskScore`) · [[../producto/prd#Riesgo estratégico]] ("el mayor riesgo es construir demasiada funcionalidad antes de confirmar que la gente paga").

## Criterio de decisión

Para cada campo pendiente: **¿vuelve creíble una dimensión del rubric de 6 dimensiones, o es enriquecimiento?** Solo lo primero entra al MVP. La meta declarada del Sprint 2 es "onboarding pulido con las preguntas *críticas* del rubric recuperadas" — no todas.

## Veredicto por campo

| Campo | ¿Arregla una dimensión del rubric? | Costo | Decisión |
|---|---|---|---|
| **Dependencias del negocio** (`mrsk_business_dependencies`) | ✅ Riesgo (15%) — la dimensión con menos sustento; hoy solo refleja capital/pérdida | Medio (sin migración, la columna existe) | ✅ **HECHO (2026-08-28)** |
| **Granularidad "¿habló con clientes?"** | ✅ Comercial (25%) — el sí/no es un acantilado binario de 35 pts | Bajo (~1 h) | **Entra a Sprint 2** |
| **Modelo de ingreso** (único/recurrente/suscripción/…) | Parcial — desbloquea 1 red flag ("reemplazar empleo sin ingreso recurrente"), no arregla nada roto | Bajo | **NO en esta etapa** (Sprint 3) |
| **CAC** (costo de adquisición de clientes) | ❌ No es un input puntuado del rubric | Medio + ambiguo | **NO en esta etapa** (post-beta) |

## Detalle

### Dependencias del negocio — ENTRA
- **Captura**: multi-select — proveedor único · empleados clave · ubicación física específica · plataforma externa (Instagram/Amazon/Uber/App Store) · inventario · licencia/permiso/regulación. Va en el paso `evaluacion` (es un campo de `market_risk_inputs`). La columna JSON `mrsk_business_dependencies` ya existe → sin migración.
- **Uso**: penalización en `riskScore` por dependencia crítica (con tope). Red flags determinísticas del checklist del rubric que hoy son incalculables: "depende de [plataforma] sin plan alterno" y "requiere permisos/regulación que dijiste no haber investigado". Alimenta la narrativa de riesgos del reporte.
- **Por qué entra**: la dimensión 4 (Riesgo) es "la menos cubierta de las 6". Un negocio 100% dependiente de una plataforma externa hoy no recibe ninguna alerta. Es el único punto "imprescindible" que queda del rubric.

#### Diseño decidido con el usuario (2026-08-28)

| Decisión | Elección |
|---|---|
| Dónde va el input | Paso `evaluacion` ("Evaluemos los números y el mercado"), en el `FieldSet` "Mercado y riesgos" — **no un paso nuevo** |
| UI | Grid de checkboxes en 2 columnas (patrón de `enjoyedActivities` en `personal-fit-form.tsx`), no tarjetas apiladas |
| Opciones (6 + "ninguna") | proveedor único · 1-2 clientes = mayoría de ingresos · plataforma externa (Instagram/Amazon/Uber/App Store/marketplace) · permiso/licencia/regulación · ubicación física específica · inventario que caduca o se deprecia rápido · "ninguna de estas". **Se descartó "personas clave"** a pedido del usuario |
| Scoring (`riskScore`) | Ponderado: plataforma **+6**, permiso **+6**, las otras 4 **+3** c/u, tope **+16**. Misma dirección que la penalización de sobre-exposición (alto = más riesgo) |
| Red flags determinísticas (3) | `plataforma` → "depende de plataforma externa, ten plan alterno"; `permiso` → "requiere permiso/licencia/regulación, investígalo antes de invertir"; `cliente_unico` → "1-2 clientes = mayoría de ingresos, si uno se va el negocio tambalea" |
| Sin plan-B follow-up | Deliberado: no se pregunta "¿ya tienes plan alterno?" por dependencia (sería demasiado). La red flag se redacta como recordatorio ("ten plan alterno"), no como acusación ("no tienes plan B") |
| Migración | **Ninguna** — `mrsk_business_dependencies Json?` ya existe en `prisma/schema.prisma` |
| Función de scoring | `detectDependencyRedFlags(assessment)` nueva, hermana de `detectFinancialRedFlags()`; `runScoringPipeline` mergea ambas en `ascs_red_flags` (determinísticas primero) |

**Implementado el 2026-08-28** (sin commitear al cierre de la sesión). Fuentes: `src/lib/onboarding/options.ts` (`BUSINESS_DEPENDENCY_OPTIONS`), `evaluationMarketSchema`, `saveEvaluation`, `src/components/onboarding/evaluation-form.tsx`, `src/lib/scoring/types.ts` (`dependencyRiskPenalty`, `detectDependencyRedFlags`), `src/lib/scoring/index.ts`, `src/lib/ai/generate-report.ts`. +9 tests en `src/lib/scoring/__tests__/types.test.ts` (28 total). Verificado end-to-end: el grid renderiza, `mrsk_business_dependencies` se guarda como array JSON, y las 3 red flags de dependencia aparecen en `ascs_red_flags` (después de las financieras) y en la sección "Riesgos" del reporte.

### Granularidad "¿habló con clientes?" — ENTRA
- **Captura**: reemplazar el sí/no por 5 niveles del Question Bank original (0 · 1–3 · 4–10 · >10 · "ya tengo clientes"). En `evaluacion`.
- **Uso**: hoy el booleano vale **35 de ~75 puntos** del `commercialScore` (dimensión de 25%) + 10 del `riskScore`. "Tomé un café con un amigo" y "tengo 15 clientes pagando" puntúan idéntico. Se cambia por un gradiente en ambas fórmulas; "ya tengo clientes" pasa a fortaleza en el reporte.
- **Por qué entra**: mejor valor/costo de todos. El acantilado binario es un bug de precisión real en un tool cuya credibilidad depende de que el score discrimine. Puede necesitar una columna nueva chica (`mrsk_customer_evidence_level`) o sobrecargar el campo bool.

### Modelo de ingreso — NO en esta etapa
- El motor determinístico **no calcula LTV**, así que el impacto directo es chico: desbloquea la red flag "quiere reemplazar empleo sin ingresos recurrentes probados" y mejora la narrativa de la IA. No arregla nada roto.
- **Decisión del usuario (2026-08-28)**: no se trabaja en esta etapa. Movido a Sprint 3, junto a `pfit_avoided_activities`.

### CAC — NO en esta etapa
- Es el punto **menos anclado al rubric** (el rubric habla de "canal definido", no de CAC puntuado).
- Para hacerlo bien en negocios recurrentes necesitas LTV → necesitas el modelo de ingreso primero. Sin eso, la regla `CAC > margen por venta` da **falsas alarmas** en cualquier suscripción.
- Es la estimación **menos confiable** de todo el assessment (un número inventado pre-lanzamiento sobre otro inventado).
- **Decisión del usuario (2026-08-28)**: no se trabaja en esta etapa. Revisar post-beta, cuando haya feedback real de si la gente puede responderlo.

## Resultado

**Sprint 2 cierra con**: ✅ dependencias del negocio (hecho 2026-08-28) + granularidad "¿habló con clientes?" (pendiente).
**Movido a Sprint 3**: modelo de ingreso, `pfit_avoided_activities`.
**Post-beta**: CAC.

## Ver también
[[plan-lanzamiento-60-90-dias]] · [[../producto/gaps-onboarding-vs-framework]] · [[../framework/scoring-engine]] · [[../framework/dimensiones-de-viabilidad]] · [[evolucion-del-producto]]
