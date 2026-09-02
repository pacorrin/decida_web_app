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
| Modelo de ingreso (único/recurrente/suscripción/proyecto/comisión) | ❌ No se pregunta. **Pospuesto a Sprint 3** (decisión 2026-08-28) — sin LTV en el motor, solo desbloquea 1 red flag |
| Productos/servicios a vender, cada uno con su precio | ✅ Paso nuevo `productos` (2026-08-28): lista de 1-10 renglones con nombre, tipo, precio, costo variable y unidades/mes. **Absorbió** los 3 campos únicos de precio/costo/ventas de `evaluacion` — el scoring los deriva del blend ponderado por unidades. Red flag por producto vendido bajo costo. Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]] |

### 3. Viabilidad comercial (25%) — funcional pero con menos granularidad que el diseño original
| Rubric/criterios pide | Estado en código |
|---|---|
| ¿Ya habló con clientes? | ✅ **HECHO (2026-09-02)** — 5 niveles (`ninguno`/`1_3`/`4_10`/`mas_10`/`ya_clientes`) en `mrsk_customer_evidence_level`; gradiente en `commercialScore` (10→38) y en `riskScore` (delta +8 … −8, con el signo corregido: solo `ya_clientes` baja el riesgo). Bool `mrsk_has_talked_to_customers` se mantiene sincronizado. Ver [[../decisiones/alcance-campos-restantes-sprint-2#Granularidad «¿habló con clientes?» — HECHA (2026-09-02)]]. |
| Nivel de competencia | ✅ `competitionLevel` |
| Canal de adquisición | ✅ `acquisitionChannel` |
| Costo de adquisición de clientes (CAC) | ❌ Solo se captura el *canal*, no su *costo*. **Pospuesto a post-beta** (decisión 2026-08-28) — no es input del rubric, necesita el modelo de ingreso primero, estimación pre-lanzamiento poco confiable. Ver [[../decisiones/alcance-campos-restantes-sprint-2#CAC — NO en esta etapa]] |
| Diferenciación vs. alternativas | ❌ No se pregunta explícitamente |
| Ticket y frecuencia de compra | ❌ No se pregunta (relacionado con el gap de "modelo de ingreso" arriba) |

### 4. Nivel de riesgo (15%)
| Rubric/criterios pide | Estado en código |
|---|---|
| Capital en riesgo vs. pérdida aceptable | ✅ `riskScore` usa `aprf_acceptable_loss_range` real + penalización de sobre-exposición cuando `finp_initial_investment` supera el techo del rango de capital/pérdida; 2 red flags determinísticas (2026-08-27) |
| **Dependencias del negocio** (proveedor, 1-2 clientes, plataforma, ubicación, inventario, regulación) | ✅ **HECHO (2026-08-28)** — grid de checkboxes en `evaluacion` (`BUSINESS_DEPENDENCY_OPTIONS`), penalización ponderada al `riskScore` (plataforma/permiso +6, resto +3, tope +16) y 3 red flags determinísticas (`detectDependencyRedFlags()`). Ver [[../framework/scoring-engine#Penalizaciones al riskScore (alto = más riesgo)]]. |
| Reversibilidad de la prueba | ❌ No se pregunta — único gap abierto de la dimensión 4 |
| Concentración (1 cliente/proveedor/plataforma) | ✅ Cubierto por las opciones `cliente_unico` / `proveedor` / `plataforma` de dependencias del negocio (2026-08-28) |
| Barreras legales/regulatorias | ✅ Cubierto por la opción `permiso` de dependencias del negocio + red flag "investígalo antes de invertir" (2026-08-28) |

Capital/pérdida vs. inversión (2026-08-27) y dependencias del negocio (2026-08-28) ya están cubiertos. Lo que sigue faltando en la dimensión 4: **reversibilidad de la prueba** (¿se puede probar barato y salir?) — la única del rubric que aún no tiene ninguna señal.

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
3. ~~Agregar dependencias del negocio (`mrsk_business_dependencies`)~~ — ✅ **HECHO (2026-08-28)**. Ver [[../decisiones/alcance-campos-restantes-sprint-2#Detalle]].

**Vale la pena en el mismo sprint (bajo costo, cierra gaps de señal):**
4. ~~Restaurar granularidad de "¿habló con clientes?" (niveles, no solo sí/no)~~ — ✅ hecho 2026-09-02.
5. ~~Usar `uncertaintyComfortScore` y `processComfortScore` en el cálculo~~ — ✅ commit `43d1112`.

**Pedidos por el usuario el 2026-08-26:**
6. ~~Sección de productos/servicios a vender con su precio cada uno~~ — ✅ paso nuevo `productos` (2026-08-28), absorbe los 3 campos únicos de precio/costo/ventas. Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]].

**Movido fuera del MVP (decisión 2026-08-28, ver [[../decisiones/alcance-campos-restantes-sprint-2]]):**
- **`pfit_avoided_activities`** → Sprint 3. Falta definir qué señal debe dar.
- **Modelo de ingreso** (único/recurrente/suscripción) → Sprint 3. Sin LTV en el motor, solo desbloquea 1 red flag; es enriquecimiento.
- **CAC** → post-beta. No es input del rubric, necesita el modelo de ingreso primero, estimación poco confiable.

**Puede esperar a una iteración posterior:**
7. Pregunta dedicada de escalabilidad real del negocio (hoy es proxy débil pero no está "roto", solo incompleto).
8. Restricciones personales, diferenciación explícita, ticket/frecuencia — enriquecen el diagnóstico pero no bloquean ni rompen el scoring actual.

## Ver también
[[../framework/scoring-engine]] · [[../framework/dimensiones-de-viabilidad]] · [[../experiencia/flujo-de-onboarding]] · [[../decisiones/evolucion-del-producto]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
