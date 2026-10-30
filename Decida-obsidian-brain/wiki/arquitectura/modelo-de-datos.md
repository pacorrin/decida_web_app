---
type: arquitectura
tags: [decida, datos, prisma]
updated: 2026-10-30
---

# Modelo de datos

Fuente: [[../../raw/notion/14-database-design]] · `prisma/schema.prisma`

## Decisión clave: relacional completo, no JSON simple
Notion proponía dos caminos: (a) un esquema mínimo con `answers`/`scores`/`diagnosis` como JSON dentro de una sola tabla `assessments` — "permite lanzar rápido y normalizar después"; o (b) el modelo relacional completo de 10 entidades. **El código implementó la opción (b)** desde el primer commit de datos (`8b6e0fe Add MVP assessment entities with prefixed snake_case schema`) — no hubo una fase intermedia de JSON simple documentada.

## Convención de nombres
Todas las tablas usan **prefijos de 4 letras** por entidad en snake_case (`asmt_`, `aprf_`, `pfit_`, `bide_`, `finp_`, `mrsk_`, `ascs_`, `arep_`, `paym_`, `fdbk_`, `vc_`, `hses_`) — no estaba especificado en el diseño de Notion; es una convención propia del equipo.

## Entidades (confirmadas en `prisma/schema.prisma`)

| Modelo | Prefijo | Relación con `assessments` | Propósito |
|---|---|---|---|
| `assessments` | `asmt_` | — (raíz) · N:1 opcional con `users` vía `asmt_user_id` | Estado del ciclo de vida completo |
| `assessment_profiles` | `aprf_` | 1:1 | Situación, objetivo, horizonte, capital/pérdida/horas (rangos) |
| `personal_fit_answers` | `pfit_` | 1:1 | Actividades disfrutadas/evitadas, preferencia de trabajo, scores de comodidad |
| `business_ideas` | `bide_` | 1:1 | Descripción, cliente, problema, resumen IA, supuestos detectados |
| `financial_inputs` | `finp_` | 1:1 | Inversión, precio, costo, ventas + métricas calculadas (margen, break-even, payback) |
| `market_risk_inputs` | `mrsk_` | 1:1 | Validación con clientes, competencia, canal, dependencias |
| `assessment_scores` | `ascs_` | 1:1 | Scores + señales por dimensión, recomendación final, red flags, versión |
| `assessment_reports` | `arep_` | 1:1 | Contenido generado del reporte, modelo/prompt usado |
| `payments` | `paym_` | 1:N | Registro(s) de pago. Desde 2026-10-14 también pertenece a la cuenta (`paym_user_id`); `paym_asmt_id` es opcional |
| `feedback` | `fdbk_` | 1:1 | Encuesta post-reporte (rating, claridad, utilidad, testimonio) |
| `verification_codes` | `vc_` | — | Códigos de verificación por email (no ligado a assessment); reutilizada para 3 propósitos: `history_access`, `signup_verification`, `password_reset` |
| `history_sessions` | `hses_` | — | Sesiones de acceso a `/mis-evaluaciones` por email (mecanismo passwordless, ver [[historial-de-evaluaciones]]) |
| `users` | `user_` | 1:N con `assessments` (`asmt_user_id`) | Cuenta con email + contraseña. Agregada 2026-08-05, Sprint 1 — ver [[modulo-de-usuarios-y-autenticacion]] |
| `user_sessions` | `usess_` | — | Sesión de cuenta autenticada (cookie httpOnly + token), agregada junto con `users` |
| `credit_ledger` | `cled_` | N:1 opcional con `assessments` (`cled_asmt_id`) y `payments` (`cled_payment_id`) | Libro mayor inmutable de créditos (en centésimos: `100` = 1 crédito). Agregada el 2026-10-22 (`20261023000000_credit_ledger`) — ver [[../decisiones/modelo-de-creditos-hibrido]] |

> **Cifra (2026-10-30):** `cifra_accounts` (`cacc_`), `cifra_debts` (`cdebt_`), `cifra_fixed_expenses` (`cfix_`) y `cifra_transactions` (`ctrx_`), todas con FK a `users` en cascada; importes en centavos (`Int`). Detalle en [[cifra-finanzas-personales]].

> **Sistema de créditos (2026-10-22, commits `02fc586`..`dba140f`):**
> - `credit_ledger`: fuente de verdad append-only (`cled_type` enum `credit_ledger_type`: `purchase`, `welcome_bonus`, `subscription_grant`, `spend`, `refund`, `adjustment`; `cled_amount` con signo en centésimos; `cled_balance_after` ≥ 0; `cled_idempotency_key` UNIQUE).
> - `users.user_credits_balance Int @default(0)`: caché del saldo actualizada en la misma transacción con bloqueo `SELECT ... FOR UPDATE`.
> - `assessments`: `asmt_research_enabled Boolean @default(true)`, `asmt_credit_cost Int?`, `asmt_credits_charged_at DateTime?`. Una evaluación se cobra una sola vez y `asmt_credits_charged_at != null` desbloquea el reporte completo (`hasReportAccess`).
>
> Suscripción en `users` (S3-07, 2026-10-14; oculta por defecto tras `SUBSCRIPTIONS_ENABLED="false"` desde 2026-10-22): `user_subscription_status` (none/active/canceled/past_due), `user_subscription_period_end` y `user_subscription_canceled_at`. Cancelar solo cambia el estado y la fecha de cancelación; el acceso completo llega hasta `period_end` (ver [[manejo-de-errores-y-reembolsos]]).
>
> S3-06 (2026-10-14): suscribirse (simulado) escribe en `users`: `status=active`, `plan=monthly`, `period_end` = ahora + 1 mes, `canceled_at=null`, `provider=simulated`, `provider_id=sim_<user>_<ts>`, y crea una fila en `payments` (`paym_provider=simulated`, $99 MXN) ligada a la cuenta (`paym_user_id`) y, si se suscribió desde el onboarding, a esa evaluación. Ya no se toca `asmt_status`/`asmt_payment_status` al suscribirse; el flujo no depende de ellos. Cambio de schema posterior (2026-10-14): `paym_asmt_id` pasó a opcional y se agregó `paym_user_id`, para suscribirse desde `/cuenta/suscripcion` sin evaluación.

Esto coincide casi 1:1 con las "Core Entities" que Notion proponía como alternativa más escalable — con adiciones que Notion no contemplaba: `verification_codes` y `history_sessions` (que sostienen [[historial-de-evaluaciones]]), y ahora `users`/`user_sessions` (que sostienen [[modulo-de-usuarios-y-autenticacion]]).

> Actualización (mismo día): `users` y `assessments` ya están vinculados (`asmt_user_id`, `onDelete: SetNull`, indexado). Esto estaba asignado a Sprint 2 en la primera versión de esta nota; se adelantó el mismo día a pedido del usuario, junto con la integración al onboarding — ver [[modulo-de-usuarios-y-autenticacion#Integración con el onboarding (mismo día)]].

> S3-16 (2026-10-16, Stripe): `users.user_stripe_customer_id` (único) guarda el Customer de Stripe; con `user_subscription_provider='stripe'`, `user_subscription_provider_id` es el id de la suscripción (`sub_…`). `payments` tiene `@@unique([paym_provider, paym_provider_payment_id])`: para Stripe, `paym_provider_payment_id` es el id de la factura (`in_…`) y da idempotencia al webhook. Ver [[pagos-con-stripe]].

## Enums
- `assessment_status`: `started` → `paid` → `in_progress` → `completed` | `report_generated` | `failed`
  > Nota: `completed` es legado (mantenido por compatibilidad); el flujo real usa `report_generated` o `failed` como estados terminales — ver [[manejo-de-errores-y-reembolsos]].
- `payment_status`: `pending` · `paid` · `failed` · `refunded`
- `signal_level`: `green` · `yellow` · `red`
- `final_recommendation`: `proceed_small_test` · `validate_first` · `adjust_idea` · `pause_for_now`
- `verification_method`: `email` (único método soportado hoy)
- `verification_purpose`: `history_access` · `signup_verification` · `password_reset` (extendido 2026-08-05 — originalmente solo tenía `history_access`, "diseñado para extenderse" resultó cierto en la práctica, ver [[modulo-de-usuarios-y-autenticacion]])
- `credit_ledger_type`: `purchase` · `welcome_bonus` · `subscription_grant` · `spend` · `refund` · `adjustment` (agregado 2026-10-22 para el libro mayor de créditos)

## Campos nuevos no documentados en Notion
`asmt_name`, `asmt_phone` — agregados vía `git log` (`Modified Prisma schema to include optional fields for assessments`) y confirmados como necesarios por `AGENTS.md` (la migración committeada estaba desincronizada y le faltaban estos campos). Corresponden al paso `contacto` del [[../experiencia/flujo-de-onboarding|flujo real]], que tampoco existía en el diseño Notion original.

## Privacidad (principio que se mantuvo)
No pedir datos financieros sensibles exactos — usar rangos. El esquema respeta esto: `finp_initial_investment` es `Decimal` (monto), pero `aprf_capital_available_range` y `aprf_acceptable_loss_range` siguen siendo `String` (rangos), no montos exactos.

## Ver también
[[stack-tecnico]] · [[historial-de-evaluaciones]] · [[modulo-de-usuarios-y-autenticacion]] · [[../framework/scoring-engine]]
