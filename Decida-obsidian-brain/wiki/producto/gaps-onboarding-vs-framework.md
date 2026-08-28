---
type: product
tags: [decida, onboarding, gaps, scoring, critico]
updated: 2026-08-28
---

# Gaps del onboarding actual vs. el framework de 6 dimensiones

Mapeo campo por campo entre lo que el rubric operativo y los criterios de evaluación de Notion exigen, y lo que el formulario en producción realmente captura hoy. Fuentes verificadas en código: `src/lib/onboarding/schemas.ts`, `src/lib/onboarding/options.ts`, `src/lib/scoring/types.ts`, `prisma/schema.prisma`. Fuentes de diseño: [[../../raw/notion/17-rubric-6-dimensiones]] · [[../../raw/notion/16-criterios-evaluacion-ideas]].

Generado para [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 2]] — "pulir el onboarding" en Sprint 2.

## ✅ Hallazgo crítico (resuelto): el score de Riesgo estaba roto

Antes, `calculateDeterministicScores` calculaba `riskScore` a partir de `profile?.aprf_acceptable_loss_range`, pregunta removida del onboarding (commit `5886b4d`) → siempre `null` → `scoreFromRange()` caía en su fallback `50` → **todo assessment recibía casi el mismo score de riesgo**.

**Resuelto en dos partes:**
1. **Commit `43d1112`** (spec `.kiro/specs/risk-score-fix/`): capital disponible + pérdida aceptable de vuelta en el paso `perfil`, `saveSituation` las persiste, `pfit_uncertainty_comfort_score` / `pfit_process_comfort_score` conectados al `personalFitScore`. Cubierto por tests en `src/lib/scoring/__tests__/types.test.ts`.
2. **2026-08-27**: `riskScore` ahora cruza `finp_initial_investment` contra el techo del rango de capital / pérdida (penalización de sobre-exposición +12 / +8), y `detectFinancialRedFlags()` emite las 2 red flags financieras del catálogo. Ver [[../framework/scoring-engine#Red flags]].

## Mapeo por dimensión

### 1. Compatibilidad personal (20%) — parcialmente cubierta
| Rubric/criterios pide | Estado en código |
|---|---|
| Actividades que disfruta | ✅ `enjoyedActivities` |
| **Actividades que evita** | ❌ No se pregunta. El campo `pfit_avoided_activities` existe en la BD pero `personalFitSchema` no lo captura. Sin esto, la regla "evita ventas + canal de venta directa → bajar Personal Fit y Comercial" es inaplicable. **Movido a Sprint 3 (2026-08-28)** — falta definir su uso antes de capturarlo. |
| Preferencia físico/digital/mixto | ✅ `workPreference` |
| Comodidad vendiendo | ✅ `salesComfortScore` — capturado y usado en el score |
| Comodidad con incertidumbre | ✅ `uncertaintyComfortScore` — capturado y **ya conectado** al `personalFitScore` (commit `43d1112`) |
| Preferencia solo/equipo | ✅ `hiringPreference` |
| Gusto por seguir procesos | ✅ `processComfortScore` — capturado y **ya conectado** al scoring (commit `43d1112`; requirió columna nueva `pfit_process_comfort_score`) |
| Negocio nuevo vs. crecimiento de uno existente (para *esta* idea) | ❌ No se pregunta — `currentSituation` solo dice si la persona tiene *algún* negocio, no si esta idea específica es nueva o una extensión |

### 2. Viabilidad financiera (25%)
| Rubric/criterios pide | Estado en código |
|---|---|
| Inversión, precio, costo variable, ventas estimadas, costos fijos | ✅ Capturado (`evaluationFinancialSchema`) |
| **Capital disponible** | ✅ De vuelta en el paso `perfil` (`capitalRange` → `aprf_capital_available_range`), commit `43d1112` |
| **Pérdida aceptable** | ✅ De vuelta (`acceptableLossRange` → `aprf_acceptable_loss_range`), commit `43d1112` |
| Red flag "inversión > capital disponible" | ✅ `detectFinancialRedFlags()` (2026-08-27) — cruza `finp_initial_investment` contra el techo del rango de capital |
| Red flag "inversión > pérdida aceptable" | ✅ Ídem, contra el techo del rango de pérdida; además suma penalización de sobre-exposición al `riskScore` |
| Escenarios pesimista/base/optimista | ❌ Solo un punto de estimación (`estimatedMonthlySales` único) |
| Modelo de ingreso (único/recurrente/suscripción/proyecto/comisión) | ❌ No se pregunta — afecta directamente la lectura de margen y LTV |
| Productos/servicios a vender, cada uno con su precio | ✅ Paso nuevo `productos` (2026-08-28): lista de 1-10 renglones con nombre, tipo, precio, costo variable y unidades/mes. **Absorbió** los 3 campos únicos de precio/costo/ventas de `evaluacion` — el scoring los deriva del blend ponderado por unidades. Red flag por producto vendido bajo costo. Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]] |

### 3. Viabilidad comercial (25%) — funcional pero con menos granularidad que el diseño original
| Rubric/criterios pide | Estado en código |
|---|---|
| ¿Ya habló con clientes? | ⚠️ Capturado pero degradado a `true/false`. El Question Bank original (05) tenía niveles: 0, 1-3, 4-10, >10, ya tengo clientes — esa granularidad es señal fuerte para el semáforo y se perdió |
| Nivel de competencia | ✅ `competitionLevel` |
| Canal de adquisición | ✅ `acquisitionChannel` |
| Costo de adquisición de clientes (CAC) | ❌ Solo se captura el *canal*, no su *costo*. Falta capturar CAC estimado (o gasto de marketing esperado ÷ clientes esperados) para cruzarlo con ticket/margen y leer CAC vs. LTV (pedido del usuario, 2026-08-26) |
| Diferenciación vs. alternativas | ❌ No se pregunta explícitamente |
| Ticket y frecuencia de compra | ❌ No se pregunta (relacionado con el gap de "modelo de ingreso" arriba) |

### 4. Nivel de riesgo (15%)
| Rubric/criterios pide | Estado en código |
|---|---|
| Capital en riesgo vs. pérdida aceptable | ✅ `riskScore` usa `aprf_acceptable_loss_range` real + penalización de sobre-exposición cuando `finp_initial_investment` supera el techo del rango de capital/pérdida; 2 red flags determinísticas (2026-08-27) |
| **Dependencias del negocio** (proveedor, empleados, ubicación, plataforma, inventario, regulación) | ❌ El campo `mrsk_business_dependencies` (JSON) existe en la BD pero `evaluationMarketSchema` nunca lo captura — siempre queda `null`, y `calculateDeterministicScores` no lo usa en ningún lado |
| Reversibilidad de la prueba | ❌ No se pregunta |
| Concentración (1 cliente/proveedor/plataforma) | ❌ No se pregunta (se solaparía con dependencias, mismo gap) |
| Barreras legales/regulatorias | ❌ No se pregunta |

El input principal de riesgo (capital/pérdida vs. inversión) ya está cubierto. Lo que sigue faltando: dependencias del negocio, reversibilidad, concentración y barreras regulatorias — todo eso depende de agregar el input de `mrsk_business_dependencies` al formulario (ya listado abajo).

### 5. Tiempo y operación (10%) — sólido, sin gaps relevantes
Horas/semana, horario, horizonte de ingreso esperado: todos capturados y usados en el score. No requiere trabajo en Sprint 2.

### 6. Escalabilidad (5%) — score es una proxy débil, no una medición real
| Rubric/criterios pide | Estado en código |
|---|---|
| Autoempleo vs. negocio delegable vs. sistema escalable | ❌ Ninguna pregunta evalúa esto directamente sobre *la idea*. El `scalabilityScore` se deriva de `hiringPreference` (preferencia personal del usuario, no capacidad real del negocio) + `mainGoal` |
| Posibilidad de sistematizar/delegar el negocio específico | ❌ No se pregunta |

### Transversal (marco de "16 - Criterios de evaluación")
| Pide | Estado |
|---|---|
| Restricciones personales (familia, deudas, salud) — "a veces más limitantes que el capital" | ❌ No se captura en ningún punto del flujo |
| Separar hecho / supuesto / deseo | ⚠️ Vive solo como instrucción a nivel de prompt de IA ([[../framework/prompts-de-ia]]), no como estructura de captura en el formulario |

## Resumen priorizado para Sprint 2

**~~Debe entrar sí o sí (arregla el bug activo)~~ — HECHO:**
1. ~~Recuperar capital disponible + pérdida aceptable~~ — ✅ commit `43d1112` (dos `CardSelectField` en el paso `perfil`).
2. ~~Reconectar `riskScore` para que use datos reales~~ — ✅ commit `43d1112` (dato) + 2026-08-27 (cruce inversión vs. capital/pérdida + 2 red flags determinísticas).
3. Agregar dependencias del negocio (`mrsk_business_dependencies`) — el campo en BD ya existe, falta el input.

**Movido al Sprint 3 (2026-08-28):**
- "Actividades que evita" (`pfit_avoided_activities`) — el campo en BD existe pero **aún no está definido qué señal debe dar**. Se decide su uso en Sprint 3 antes de capturarlo. Ver [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — «actividades que evita» (pfit_avoided_activities)]].

**Vale la pena en el mismo sprint (bajo costo, cierra gaps de señal):**
4. Restaurar granularidad de "¿habló con clientes?" (niveles, no solo sí/no).
5. Pregunta de modelo de ingreso (único/recurrente/suscripción) — mejora la interpretación financiera y comercial a la vez.
6. ~~Usar `uncertaintyComfortScore` y `processComfortScore` en el cálculo~~ — ✅ commit `43d1112`.

**Pedidos por el usuario el 2026-08-26 (además del rubric):**
10. Capturar costo de adquisición de clientes (CAC) — hoy solo se pregunta el canal, no su costo.
11. ~~Sección de productos/servicios a vender con su precio cada uno~~ — ✅ paso nuevo `productos` (2026-08-28), absorbe los 3 campos únicos de precio/costo/ventas. Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]].

**Puede esperar a una iteración posterior:**
8. Pregunta dedicada de escalabilidad real del negocio (hoy es proxy débil pero no está "roto", solo incompleto).
9. Restricciones personales, diferenciación explícita, ticket/frecuencia — enriquecen el diagnóstico pero no bloquean ni rompen el scoring actual.

## Ver también
[[../framework/scoring-engine]] · [[../framework/dimensiones-de-viabilidad]] · [[../experiencia/flujo-de-onboarding]] · [[../decisiones/evolucion-del-producto]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
