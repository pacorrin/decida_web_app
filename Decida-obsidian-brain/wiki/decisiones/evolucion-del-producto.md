---
type: decision-log
tags: [decida, decisiones, evolucion]
updated: 2026-09-02
---

# Evolución del producto — dónde el código se separó del PRD

Esta página existe para responder una pregunta recurrente: *"¿esto que veo en Notion sigue siendo cierto hoy?"* Es el registro vivo de brechas confirmadas entre el diseño original (Notion, jun–jul 2026) y el estado implementado (código, a 2026-08-05). Actualizar esta página cada vez que se detecte una nueva brecha.

## 1. Reordenamiento del flujo de onboarding
**Notion**: pago ocurre temprano (paso 3 de 12), antes de describir la idea.
**Código**: idea + confirmación IA ocurren en fase gratis, pago es el paso 4, perfil/ajuste/evaluación ocurren después del pago.
**Commit**: `cba2954 feat: update onboarding flow and enhance form handling`.
**Por qué probablemente**: reduce fricción de "pagar a ciegas" — el usuario paga después de sentir que el producto ya entendió su idea. Ver [[../experiencia/flujo-de-onboarding]].
**Estado**: confirmado, sin documentación explícita del razonamiento en ninguna fuente ingerida.

## 2. Capital y pérdida aceptable removidos del onboarding
**Notion** (Question Bank V1, sección B): preguntas B1 (capital disponible) y B2 (cuánto puede perder) eran parte del cuestionario.
**Código**: removidas de la UX del paso de situación.
**Commit**: `5886b4d refactor: remove capital and loss range from onboarding process`.
**Impacto en cascada**: al menos 2 red flags del [[../framework/scoring-engine#Red flags|scoring engine]] dependían de estos datos ("inversión > capital disponible", "inversión > pérdida aceptable"). `PRODUCT.md` marca esto explícitamente como "abierto/no decidido": *"si las preguntas de capital/pérdida tolerable regresan en una sección financiera posterior (las columnas/opciones pueden seguir existiendo en el esquema)."*
**Estado (actualizado 2026-08-27) — RESUELTO**:
- **Commit `43d1112`** (spec `.kiro/specs/risk-score-fix/`): las preguntas de capital disponible y pérdida aceptable volvieron al paso `perfil` (como `capitalRange` / `acceptableLossRange`, opcionales para no romper assessments viejos); `saveSituation` las persiste; `pfit_uncertainty_comfort_score` y `pfit_process_comfort_score` (que también eran datos muertos) se conectaron al `personalFitScore`. Con tests en `src/lib/scoring/__tests__/types.test.ts`.
- **2026-08-27**: `riskScore` ahora cruza `finp_initial_investment` contra el techo del rango de capital / pérdida (penalización de sobre-exposición) y `detectFinancialRedFlags()` emite las 2 red flags financieras del catálogo. Ver [[../framework/scoring-engine#Red flags]].

Mapeo completo del resto de campos del onboarding aún pendientes en [[../producto/gaps-onboarding-vs-framework]].

## 3. Historial de evaluaciones (non-goal superado)
**Notion**: "sin historial de evaluaciones" listado como non-goal explícito V1, y como ítem de "Future SaaS".
**Código**: `/mis-evaluaciones` implementado, con verificación por email (`verification_codes`, `history_sessions`).
**Estado**: confirmado, sin documentación del razonamiento. Ver [[../arquitectura/historial-de-evaluaciones]].

## 4. Manejo de errores y reembolsos construido antes de tener volumen
**Notion**: no mencionado en absoluto — el diseño original no anticipaba una capa de resiliencia dedicada.
**Código**: sistema completo de retry automático/manual, logging estructurado, UI de error, y proceso de reembolso documentado (`docs/REFUND_PROCESS.md`).
**Issue interno**: `DEC-10`.
**Por qué probablemente**: honrar la promesa de marca "si no se genera tu reporte, te reembolsamos" — decisión de confiabilidad, no de features. Ver [[../arquitectura/manejo-de-errores-y-reembolsos]].

## 5. Contacto (nombre + teléfono) como primer paso
**Notion**: no existía un paso de "contacto" explícito; el email/nombre no aparecían como captura temprana.
**Código**: paso `contacto` es el primer paso del flujo, y `assessments` tiene `asmt_name`/`asmt_phone` opcionales (agregados después del primer esquema — la migración committeada quedó desincronizada según `AGENTS.md`).
**Estado**: confirmado.

## 6. Testing E2E y encuesta de feedback post-reporte
**Notion**: feedback post-resultado estaba en backlog "Next (V1.1)"; testing no se mencionaba.
**Código**: ambos ya implementados (`DEC-11`, integración Playwright).
**Lectura**: el equipo adelantó trabajo de "Next" antes de completar "Now" al 100% según la secuencia original — no es necesariamente un problema, pero es una señal a verificar.

## 7. Markdown en respuestas de IA
**Notion**: no especificaba formato de salida más allá de "output JSON" por sección.
**Código**: soporte de renderizado markdown agregado a las respuestas de IA (`react-markdown`, `remark-gfm`, `rehype-raw`) — mejora probable de legibilidad del reporte.

## 8. Paso "productos" — de un precio único a un catálogo (2026-08-28)
**Notion / código previo**: el paso de evaluación financiera capturaba **un solo** precio por venta, costo variable y ventas/mes.
**Código**: paso nuevo `productos` entre `ajuste` y `evaluacion` — lista de 1-10 productos/servicios, cada uno con nombre, tipo, precio, costo variable y unidades/mes. El paso `evaluacion` perdió esos 3 campos; `saveProducts` los deriva como blend ponderado por unidades y los escribe en las mismas columnas (`finp_price_per_sale`, etc.), así que el motor de scoring no cambió. Listado crudo en la columna JSON nueva `finp_products`.
**Por qué**: pedido del usuario (Sprint 2, punto 5) — capturar el catálogo real da señal de margen por producto y permite la red flag "vende bajo costo". Ver [[../experiencia/flujo-de-onboarding#El paso «productos» — catálogo de lo que se piensa vender (2026-08-28)]].
**Estado**: implementado y verificado end-to-end. Sin commitear al cierre de la sesión del 2026-08-28.

## 9. Las secciones JSON del reporte nunca funcionaron (2026-09-02)
**Notion / diseño**: "Strengths — fortaleza + por qué importa", "Risks — riesgo + por qué importa + cómo validar/reducir", "Validation Plan — 4 semanas". El reporte de ejemplo `/ejemplo` ya implementaba esas formas.
**Código (hasta 2026-09-02)**: las 2 llamadas que piden JSON usaban `generateText` (sin `response_format: json_object`) bajo un system prompt que instruye Markdown → el modelo cercaba el JSON → `JSON.parse` fallaba → `catch {}` mudo guardaba textos genéricos hardcodeados. **33 de 33 reportes** con el bullet "Tu idea tiene elementos a favor según tu perfil.", el plan de validación hardcodeado, y los riesgos duplicados en pantalla.
**Lectura**: el reporte real llevaba meses entregando **menos que su propio preview de venta**, y nadie lo detectó porque los `catch` no logueaban nada y los riesgos se rellenaban con las red flags del scoring, que se veían plausibles.
**Arreglo**: `generateJson` + system prompts sin Markdown + validación Zod + logging + fortalezas determinísticas de respaldo. Ver [[../experiencia/reporte-de-resultado#🔴→✅ Las 3 secciones JSON estaban rotas al 100% (arreglado 2026-09-02)]].
**Estado**: implementado y verificado contra el modelo real. Sin commitear al cierre.

## 10. "¿Habló con clientes?" — de sí/no a gradiente + fix de signo en riskScore (2026-09-02)
**Notion / Question Bank F1**: la pregunta tenía 5 niveles ("No … más de 10 … ya tengo clientes interesados").
**Código (hasta 2026-09-02)**: degradado a `Boolean`. El sí/no valía **35 vs 10 pts** del `commercialScore` (dimensión 25%) — "un café con un amigo" y "15 clientes pagando" puntuaban igual. Además el `riskScore` sumaba `+10 si habló`, un término **mal firmado**: hablar con gente subía el riesgo calculado.
**Arreglo**: columna nueva `mrsk_customer_evidence_level` (5 niveles), bool sincronizado por retrocompat. Gradiente en `commercialScore` (10→38) y en `riskScore` (`ninguno` +8 … `ya_clientes` −8) con la semántica correcta: hablar con prospectos ≠ demanda probada, solo clientes reales bajan el riesgo. Cierra el último punto de Sprint 2. Ver [[alcance-campos-restantes-sprint-2#Granularidad «¿habló con clientes?» — HECHA (2026-09-02)]].
**Estado**: implementado y verificado (`tsc` limpio, 50 tests, e2e actualizados). Sin commitear al cierre.

## Patrón general observado
En casi todos los casos, el código **construyó más resiliencia y más superficie de producto** de lo que el PRD original consideraba necesario para un MVP de validación (ver la advertencia explícita en [[../producto/prd#Riesgo estratégico]]: *"el mayor riesgo es construir demasiada funcionalidad antes de confirmar que la gente paga"*). Ninguna fuente ingerida (Notion o repo) documenta si esto respondió a feedback real de clientes pagados o fue trabajo anticipado. **Esta es la pregunta más valiosa para la primera minuta de reunión que se ingiera** — ver [[../reuniones/minutas]].

## Ver también
[[../producto/roadmap-y-backlog]] · [[../arquitectura/historial-de-evaluaciones]] · [[../experiencia/flujo-de-onboarding]]
