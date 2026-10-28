---
type: arquitectura
tags: [decida, errores, reembolsos, confiabilidad]
updated: 2026-10-27
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

## Reembolsos automáticos en el modelo de créditos (vigente desde 2026-10-22)

Con el [[../decisiones/modelo-de-creditos-hibrido|sistema de créditos]] (`a6bb2dd`), los reembolsos ante fallos técnicos ya no son manuales en dinero, sino **automáticos e idempotentes en el libro mayor de créditos (`credit_ledger`)**:

1. **Fallo total del reporte (`refundFailedReport` en `src/lib/credits/charge.ts`):** si `generateReport` lanza error después de haber descontado créditos, `generateReportWithCredits` acredita de vuelta el total cobrado (`50` o `150` centésimos) con tipo `refund` y llave de idempotencia `refund:{asmtId}:failed`. Además, como `asmt_credits_charged_at` ya quedó marcado o si se reintenta con `retryReportGeneration`, la evaluación no vuelve a cobrarse dos veces por la misma llave `spend:{asmtId}`.
2. **Investigación de mercado degradada (`refundDegradedResearch`):** si el usuario pagó 1.5 créditos (`150`) con el interruptor de investigación encendido, pero la etapa de búsqueda web termina con `arep_research.status === "failed"` o `"skipped"`, el reporte sí se entrega (sin ficha externa) y se reembolsa automáticamente la diferencia de **1.0 crédito (`100` centésimos)** con llave `refund:{asmtId}:research`.
3. **Reembolso de un cargo en Stripe (`handleStripeChargeRefunded` en `src/lib/credits/refund-stripe.ts`):** si se reembolsa un pago en el Dashboard de Stripe (evento `charge.refunded`), el webhook registra un `adjustment` negativo por los créditos de ese paquete hasta el saldo disponible del usuario (nunca deja `user_credits_balance < 0`) y deja un `console.warn` para revisión manual.

## Cambio a suscripción (2026-09-07, reemplazado por créditos el 2026-10-22) — cancelación, sin reembolsos

El [[../producto/pricing-y-gtm#Modelo de cobro decidido (2026-09-07)|modelo de cobro pasó a suscripción mensual + freemium]]. Decisión del usuario sobre esta capa:

- **No se manejan reembolsos.** El `docs/REFUND_PROCESS.md` y la garantía "si no se genera tu reporte, te reembolsamos" dejan de aplicar bajo el modelo de suscripción.
- **Solo cancelación de suscripción.** Al cancelar, el acceso al modo completo se mantiene hasta el **fin del periodo ya pagado** (`subscription_current_period_end`); después la cuenta revierte a la vista freemium recortada. No hay prorrateo ni devolución.
- La UI de error del reporte (`report-error-state.tsx`) hoy muestra la garantía de reembolso de forma prominente — ese copy hay que **revisarlo** cuando se implemente el modelo de suscripción (el retry automático/manual y el logging siguen igual de válidos; lo que cambia es la promesa comercial, no la resiliencia técnica).
- Qué se le ofrece a un suscriptor cuya generación de reporte falla de forma irrecuperable (¿crédito?, ¿mes gratis?, ¿nada más el retry?) **queda pendiente de definir** — es una pregunta menor porque el reporte se genera post-onboarding y el retry cubre casi todos los casos.

**Implementado el 2026-10-14 (S3-07):** en `/cuenta/perfil` la cuenta puede cancelar (confirmación con aviso de sin reembolso). `planCancellation` (`src/lib/subscription/cancel.ts`) solo permite cancelar desde `active`, fija `user_subscription_status = canceled` y `user_subscription_canceled_at`, y **no modifica `user_subscription_period_end`**; la acción `cancelSubscription` (`src/app/cuenta/(dashboard)/perfil/actions.ts`) es idempotente. El acceso lo sigue decidiendo `hasFullAccess` (`access.ts`): completo hasta `period_end`, freemium después. Cuando exista cobro recurrente (Sprint 5), cancelar también deberá avisar al proveedor (`user_subscription_provider_id`); hoy solo cambia la BD.

Esto entra como parte del Sprint 3 (pantallas de pago + gating); la integración con el proveedor de cobro recurrente vive en el Sprint 5. Ver [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]].

## Deuda pendiente reconocida en el propio doc
Integración con Sentry/Datadog/PagerDuty · dashboard admin para ver assessments fallidos · notificación por email cuando el reporte esté listo · reembolso automatizado vía API del proveedor de pago.

## Ver también
[[../experiencia/reporte-de-resultado]] · [[../framework/prompts-de-ia]] · [[../producto/pricing-y-gtm]] · [[modelo-de-datos]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
