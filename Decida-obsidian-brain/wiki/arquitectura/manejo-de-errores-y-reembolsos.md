---
type: arquitectura
tags: [decida, errores, reembolsos, confiabilidad]
updated: 2026-09-07
---

# Manejo de errores y reembolsos

Fuentes: `docs/IMPLEMENTATION_SUMMARY.md` (repo) · `docs/FLOW_DIAGRAMS.md` (repo) · `docs/REFUND_PROCESS.md` (repo)

Esta capa **no existe en el diseño original de Notion** — es una extensión construida sobre la marcha (issue interno `DEC-10`, PR #2) para honrar una promesa que sí es parte de la marca: *"Si no se genera tu reporte, te reembolsamos."*

## Por qué se construyó
Antes de este trabajo, si fallaba la generación del reporte, el usuario llegaba a `/analizar/resultado` sin reporte y solo veía un mensaje genérico de "recarga la página". El assessment se marcaba `completed` aunque no hubiera reporte, y no había reintento ni flujo de reembolso.

## Flujo de estados (`assessment_status`)
```
started → paid → in_progress → report_generated ✓
                              ↘ failed ✗ → (retry manual) → in_progress → ...
```

## Qué se construyó
1. **Retry automático por sección**: cada sección del reporte (resumen ejecutivo, análisis financiero, fortalezas/riesgos, etc.) reintenta hasta 2 veces con backoff exponencial (1s, 2s) antes de fallar — `src/lib/ai/generate-report.ts`.
2. **Retry manual**: acción de servidor `retryReportGeneration()` (`src/app/analizar/actions.ts`), invocable desde un botón en la UI de error.
3. **UI de error dedicada**: `report-error-state.tsx` — explica el problema, muestra el ID del assessment para soporte, incluye mailto directo, y **muestra la garantía de reembolso de forma prominente**.
4. **Auto-refresh**: `auto-refresh.tsx` recarga cada 5s mientras el estado es `in_progress`, para que el usuario vea el reporte en cuanto esté listo sin acción manual.
5. **Logging estructurado**: `src/lib/logging/report-logger.ts` — `logReportGenerationError/Retry/Success()`, con contexto completo (assessment ID, email, stack trace), listo para integrarse con Sentry/Datadog/PagerDuty (no integrado aún, según el propio doc).

## Proceso de reembolso (manual, documentado en `docs/REFUND_PROCESS.md`)
1. Identificar assessment fallido (contacto del usuario o alerta de monitoreo).
2. Verificar por SQL: `status = failed`, `payment = paid`, `report` no generado.
3. Intentar retry manual vía interfaz admin.
4. Si sigue fallando → procesar reembolso vía proveedor de pago → actualizar `paym_status` y `asmt_payment_status` a `refunded` → notificar al usuario por email (plantilla documentada) → documentar el caso.

> Nota de coherencia con [[../producto/pricing-y-gtm]]: este proceso de reembolso está documentado para un **pago real único** vía proveedor, pero el paso de pago en producción hoy es **simulado**. Con el cambio a suscripción (2026-09-07, ver abajo) este proceso **queda obsoleto**: ya no habrá reembolsos.

## Cambio a suscripción (2026-09-07) — cancelación, sin reembolsos

El [[../producto/pricing-y-gtm#Modelo de cobro decidido (2026-09-07)|modelo de cobro pasó a suscripción mensual + freemium]]. Decisión del usuario sobre esta capa:

- **No se manejan reembolsos.** El `docs/REFUND_PROCESS.md` y la garantía "si no se genera tu reporte, te reembolsamos" dejan de aplicar bajo el modelo de suscripción.
- **Solo cancelación de suscripción.** Al cancelar, el acceso al modo completo se mantiene hasta el **fin del periodo ya pagado** (`subscription_current_period_end`); después la cuenta revierte a la vista freemium recortada. No hay prorrateo ni devolución.
- La UI de error del reporte (`report-error-state.tsx`) hoy muestra la garantía de reembolso de forma prominente — ese copy hay que **revisarlo** cuando se implemente el modelo de suscripción (el retry automático/manual y el logging siguen igual de válidos; lo que cambia es la promesa comercial, no la resiliencia técnica).
- Qué se le ofrece a un suscriptor cuya generación de reporte falla de forma irrecuperable (¿crédito?, ¿mes gratis?, ¿nada más el retry?) **queda pendiente de definir** — es una pregunta menor porque el reporte se genera post-onboarding y el retry cubre casi todos los casos.

Esto entra como parte del Sprint 3 (pantallas de pago + gating); la lógica real de cancelación vive junto a la integración de cobro recurrente del Sprint 5. Ver [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]].

## Deuda pendiente reconocida en el propio doc
Integración con Sentry/Datadog/PagerDuty · dashboard admin para ver assessments fallidos · notificación por email cuando el reporte esté listo · reembolso automatizado vía API del proveedor de pago.

## Ver también
[[../experiencia/reporte-de-resultado]] · [[../framework/prompts-de-ia]] · [[../producto/pricing-y-gtm]] · [[modelo-de-datos]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
