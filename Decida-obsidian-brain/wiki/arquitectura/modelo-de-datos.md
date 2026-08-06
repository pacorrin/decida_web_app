---
type: arquitectura
tags: [decida, datos, prisma]
updated: 2026-08-05
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
| `payments` | `paym_` | 1:N | Registro(s) de pago |
| `feedback` | `fdbk_` | 1:1 | Encuesta post-reporte (rating, claridad, utilidad, testimonio) |
| `verification_codes` | `vc_` | — | Códigos de verificación por email (no ligado a assessment); reutilizada para 3 propósitos: `history_access`, `signup_verification`, `password_reset` |
| `history_sessions` | `hses_` | — | Sesiones de acceso a `/mis-evaluaciones` por email (mecanismo passwordless, ver [[historial-de-evaluaciones]]) |
| `users` | `user_` | 1:N con `assessments` (`asmt_user_id`) | Cuenta con email + contraseña. Agregada 2026-08-05, Sprint 1 — ver [[modulo-de-usuarios-y-autenticacion]] |
| `user_sessions` | `usess_` | — | Sesión de cuenta autenticada (cookie httpOnly + token), agregada junto con `users` |

Esto coincide casi 1:1 con las "Core Entities" que Notion proponía como alternativa más escalable — con adiciones que Notion no contemplaba: `verification_codes` y `history_sessions` (que sostienen [[historial-de-evaluaciones]]), y ahora `users`/`user_sessions` (que sostienen [[modulo-de-usuarios-y-autenticacion]]).

> Actualización (mismo día): `users` y `assessments` ya están vinculados (`asmt_user_id`, `onDelete: SetNull`, indexado). Esto estaba asignado a Sprint 2 en la primera versión de esta nota; se adelantó el mismo día a pedido del usuario, junto con la integración al onboarding — ver [[modulo-de-usuarios-y-autenticacion#Integración con el onboarding (mismo día)]].

## Enums
- `assessment_status`: `started` → `paid` → `in_progress` → `completed` | `report_generated` | `failed`
  > Nota: `completed` es legado (mantenido por compatibilidad); el flujo real usa `report_generated` o `failed` como estados terminales — ver [[manejo-de-errores-y-reembolsos]].
- `payment_status`: `pending` · `paid` · `failed` · `refunded`
- `signal_level`: `green` · `yellow` · `red`
- `final_recommendation`: `proceed_small_test` · `validate_first` · `adjust_idea` · `pause_for_now`
- `verification_method`: `email` (único método soportado hoy)
- `verification_purpose`: `history_access` · `signup_verification` · `password_reset` (extendido 2026-08-05 — originalmente solo tenía `history_access`, "diseñado para extenderse" resultó cierto en la práctica, ver [[modulo-de-usuarios-y-autenticacion]])

## Campos nuevos no documentados en Notion
`asmt_name`, `asmt_phone` — agregados vía `git log` (`Modified Prisma schema to include optional fields for assessments`) y confirmados como necesarios por `AGENTS.md` (la migración committeada estaba desincronizada y le faltaban estos campos). Corresponden al paso `contacto` del [[../experiencia/flujo-de-onboarding|flujo real]], que tampoco existía en el diseño Notion original.

## Privacidad (principio que se mantuvo)
No pedir datos financieros sensibles exactos — usar rangos. El esquema respeta esto: `finp_initial_investment` es `Decimal` (monto), pero `aprf_capital_available_range` y `aprf_acceptable_loss_range` siguen siendo `String` (rangos), no montos exactos.

## Ver también
[[stack-tecnico]] · [[historial-de-evaluaciones]] · [[modulo-de-usuarios-y-autenticacion]] · [[../framework/scoring-engine]]
