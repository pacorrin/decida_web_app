---
type: product
tags: [decida, onboarding, gaps, scoring, critico]
updated: 2026-08-26
---

# Gaps del onboarding actual vs. el framework de 6 dimensiones

Mapeo campo por campo entre lo que el rubric operativo y los criterios de evaluación de Notion exigen, y lo que el formulario en producción realmente captura hoy. Fuentes verificadas en código: `src/lib/onboarding/schemas.ts`, `src/lib/onboarding/options.ts`, `src/lib/scoring/types.ts`, `prisma/schema.prisma`. Fuentes de diseño: [[../../raw/notion/17-rubric-6-dimensiones]] · [[../../raw/notion/16-criterios-evaluacion-ideas]].

Generado para [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 2]] — "pulir el onboarding" en Sprint 2.

## 🔴 Hallazgo crítico: el score de Riesgo está roto, no solo incompleto

`calculateDeterministicScores` (`src/lib/scoring/types.ts:150-160`) calcula `riskScore` a partir de `profile?.aprf_acceptable_loss_range`. Esa pregunta fue removida del onboarding (commit `5886b4d`, ver [[../decisiones/evolucion-del-producto#2]]), así que el campo **siempre es `null`**. `scoreFromRange()` cae en su fallback (`50`) cuando el valor es `null` — es decir, hoy **todo assessment recibe prácticamente el mismo score de riesgo** (`clampScore(100 - 50 + [0 o 10])` = 50 o 60), sin importar cuánto capital arriesgue el usuario ni qué tan reversible sea la prueba. No es un dato faltante que se pueda rellenar después: **el motor está devolviendo una señal falsa activamente**, en producción, ahora mismo. Esto es lo más urgente de todo lo listado abajo.

## Mapeo por dimensión

### 1. Compatibilidad personal (20%) — parcialmente cubierta
| Rubric/criterios pide | Estado en código |
|---|---|
| Actividades que disfruta | ✅ `enjoyedActivities` |
| **Actividades que evita** | ❌ No se pregunta. El campo `pfit_avoided_activities` existe en la BD pero `personalFitSchema` no lo captura. Sin esto, la regla "evita ventas + canal de venta directa → bajar Personal Fit y Comercial" es inaplicable. |
| Preferencia físico/digital/mixto | ✅ `workPreference` |
| Comodidad vendiendo | ✅ `salesComfortScore` — capturado y usado en el score |
| Comodidad con incertidumbre | ⚠️ `uncertaintyComfortScore` se captura pero **no se usa** en `calculateDeterministicScores` — dato muerto |
| Preferencia solo/equipo | ✅ `hiringPreference` |
| Gusto por seguir procesos | ⚠️ `processComfortScore` se captura pero **no se usa** en el scoring — dato muerto |
| Negocio nuevo vs. crecimiento de uno existente (para *esta* idea) | ❌ No se pregunta — `currentSituation` solo dice si la persona tiene *algún* negocio, no si esta idea específica es nueva o una extensión |

### 2. Viabilidad financiera (25%) — el más dañado
| Rubric/criterios pide | Estado en código |
|---|---|
| Inversión, precio, costo variable, ventas estimadas, costos fijos | ✅ Capturado (`evaluationFinancialSchema`) |
| **Capital disponible** | ❌ Removido del onboarding (`CAPITAL_RANGE_OPTIONS` existe en `options.ts` pero no está en ningún schema activo) |
| **Pérdida aceptable** | ❌ Removido — causa el bug de riesgo de arriba |
| Red flag "inversión > capital disponible" | ❌ Imposible de calcular hoy, en ninguna capa (ni determinística ni IA) |
| Red flag "inversión > pérdida aceptable" | ❌ Ídem |
| Escenarios pesimista/base/optimista | ❌ Solo un punto de estimación (`estimatedMonthlySales` único) |
| Modelo de ingreso (único/recurrente/suscripción/proyecto/comisión) | ❌ No se pregunta — afecta directamente la lectura de margen y LTV |
| Productos/servicios a vender, cada uno con su precio | ❌ `evaluationFinancialSchema` captura un único `price`. Falta una sección que liste varios productos/servicios con su precio (pedido del usuario, 2026-08-26). Al implementar, decidir si absorbe o complementa "modelo de ingreso" y "ticket/frecuencia" |

### 3. Viabilidad comercial (25%) — funcional pero con menos granularidad que el diseño original
| Rubric/criterios pide | Estado en código |
|---|---|
| ¿Ya habló con clientes? | ⚠️ Capturado pero degradado a `true/false`. El Question Bank original (05) tenía niveles: 0, 1-3, 4-10, >10, ya tengo clientes — esa granularidad es señal fuerte para el semáforo y se perdió |
| Nivel de competencia | ✅ `competitionLevel` |
| Canal de adquisición | ✅ `acquisitionChannel` |
| Costo de adquisición de clientes (CAC) | ❌ Solo se captura el *canal*, no su *costo*. Falta capturar CAC estimado (o gasto de marketing esperado ÷ clientes esperados) para cruzarlo con ticket/margen y leer CAC vs. LTV (pedido del usuario, 2026-08-26) |
| Diferenciación vs. alternativas | ❌ No se pregunta explícitamente |
| Ticket y frecuencia de compra | ❌ No se pregunta (relacionado con el gap de "modelo de ingreso" arriba) |

### 4. Nivel de riesgo (15%) — el menos cubierto de las 6
| Rubric/criterios pide | Estado en código |
|---|---|
| Capital en riesgo vs. pérdida aceptable | ❌ Ver hallazgo crítico arriba |
| **Dependencias del negocio** (proveedor, empleados, ubicación, plataforma, inventario, regulación) | ❌ El campo `mrsk_business_dependencies` (JSON) existe en la BD pero `evaluationMarketSchema` nunca lo captura — siempre queda `null`, y `calculateDeterministicScores` no lo usa en ningún lado |
| Reversibilidad de la prueba | ❌ No se pregunta |
| Concentración (1 cliente/proveedor/plataforma) | ❌ No se pregunta (se solaparía con dependencias, mismo gap) |
| Barreras legales/regulatorias | ❌ No se pregunta |

Consecuencia: hoy el "Nivel de riesgo" es, en la práctica, la dimensión con menos sustento real de las 6 — ni sus inputs principales se capturan, ni el único dato que sí llegaba a usarse (pérdida aceptable) sigue existiendo.

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

**Debe entrar sí o sí (arregla el bug activo):**
1. Recuperar capital disponible + pérdida aceptable (aunque sea con el copy/UX que se decidió quitar antes por fricción — evaluar una versión más ligera, ej. un solo campo combinado en vez de dos, si la razón original de quitarlas fue fricción de UX).
2. Reconectar `riskScore` para que use datos reales una vez recuperados.
3. Agregar la pregunta de "actividades que evita" (`avoidedActivities`) — el campo en BD ya existe, falta el input.
4. Agregar dependencias del negocio (`mrsk_business_dependencies`) — el campo en BD ya existe, falta el input.

**Vale la pena en el mismo sprint (bajo costo, cierra gaps de señal):**
5. Restaurar granularidad de "¿habló con clientes?" (niveles, no solo sí/no).
6. Pregunta de modelo de ingreso (único/recurrente/suscripción) — mejora la interpretación financiera y comercial a la vez.
7. Usar `uncertaintyComfortScore` y `processComfortScore` en el cálculo (ya se capturan, solo falta conectarlos).

**Pedidos por el usuario el 2026-08-26 (además del rubric):**
10. Capturar costo de adquisición de clientes (CAC) — hoy solo se pregunta el canal, no su costo.
11. Sección de productos/servicios a vender con su precio cada uno — hoy solo hay un `price` único. Ver detalle en [[../decisiones/plan-lanzamiento-60-90-dias#Datos de negocio adicionales a capturar en el onboarding (agregado 2026-08-26)]].

**Puede esperar a una iteración posterior:**
8. Pregunta dedicada de escalabilidad real del negocio (hoy es proxy débil pero no está "roto", solo incompleto).
9. Restricciones personales, diferenciación explícita, ticket/frecuencia — enriquecen el diagnóstico pero no bloquean ni rompen el scoring actual.

## Ver también
[[../framework/scoring-engine]] · [[../framework/dimensiones-de-viabilidad]] · [[../experiencia/flujo-de-onboarding]] · [[../decisiones/evolucion-del-producto]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
