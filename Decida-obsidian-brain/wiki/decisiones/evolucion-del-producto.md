---
type: decision-log
tags: [decida, decisiones, evolucion]
updated: 2026-08-27
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

## Patrón general observado
En casi todos los casos, el código **construyó más resiliencia y más superficie de producto** de lo que el PRD original consideraba necesario para un MVP de validación (ver la advertencia explícita en [[../producto/prd#Riesgo estratégico]]: *"el mayor riesgo es construir demasiada funcionalidad antes de confirmar que la gente paga"*). Ninguna fuente ingerida (Notion o repo) documenta si esto respondió a feedback real de clientes pagados o fue trabajo anticipado. **Esta es la pregunta más valiosa para la primera minuta de reunión que se ingiera** — ver [[../reuniones/minutas]].

## Ver también
[[../producto/roadmap-y-backlog]] · [[../arquitectura/historial-de-evaluaciones]] · [[../experiencia/flujo-de-onboarding]]
