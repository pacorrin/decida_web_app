---
source: notion
title: "🗄️ 14 - Database Design"
url: https://app.notion.com/p/37d09ab888ba814eacc5ed9706f2ab70
fetched: 2026-08-05
---

## Purpose
Definir la estructura mínima de datos para soportar el MVP sin sobrearquitectura.

## V1 Philosophy
Guardar solo lo necesario para procesar un assessment, recuperar resultados, validar pagos, mejorar el framework con datos agregados y dar soporte básico. No construir todavía: cuentas de usuario, dashboard, historial avanzado, roles, multi-tenant.

> Nota de brecha: el código actual **sí** implementa un mecanismo de historial/identidad ligero (`verification_codes`, `history_sessions` — verificación por email, sin password) para `/mis-evaluaciones`. Ver [[historial-de-evaluaciones]].

## Recommended Storage V1
Opción A SQLite/Turso · Opción B PostgreSQL/Supabase · Opción C JSON simple + metadata de Stripe.
Elección recomendada: PostgreSQL o SQLite con ORM ligero.

> Confirmado en código: se eligió PostgreSQL + Prisma (ORM), consistente con la opción B recomendada aquí.

## Core Entities (diseño relacional completo, propuesto como alternativa)
1. **Assessment** — evaluación completa o en progreso (id, status, email, paymentStatus, timestamps).
2. **AssessmentProfile** — contexto personal (situación, objetivo, horizonte, experiencia, capital, pérdida aceptable, horas/semana, horario).
3. **PersonalFitAnswers** — actividades disfrutadas/evitadas, preferencia de trabajo, scores de comodidad, preferencia de contratación.
4. **BusinessIdea** — descripción, cliente objetivo, problema, por qué pagarían, resumen IA, supuestos detectados, confirmación del usuario.
5. **FinancialInputs** — inversión, precio, costo variable, ventas estimadas, costos fijos + campos calculados (margen, utilidad, break-even, payback).
6. **MarketRiskInputs** — validación con clientes, competencia, canal, dependencias, preocupación principal.
7. **AssessmentScore** — scores y señales por dimensión, recomendación final, red flags, métricas calculadas, versión de scoring.
8. **AssessmentReport** — contenido generado (resumen ejecutivo, análisis por dimensión, plan de validación, texto de recomendación, PDF, modelo/prompt usado).
9. **Payment** — proveedor, referencia, monto, estado, payload crudo.
10. **Feedback** — rating, claridad, utilidad, comentario, consentimiento de testimonio.

## Minimal Tables for MVP (alternativa simplificada)
`assessments` (con answers/scores/diagnosis como JSON) + `payments` + `feedback`. "Esta versión permite lanzar rápido y normalizar después."

> Confirmado en código: se optó por el **modelo relacional completo** (10 entidades normalizadas), no la versión JSON simplificada — ver `prisma/schema.prisma` y [[modelo-de-datos]].

## Data Privacy Notes
No pedir datos financieros sensibles (ingresos exactos, cuentas bancarias). Usar rangos. Explicar el uso de la información. Permitir solicitar eliminación de datos.

## Analytics Events
landing_viewed · cta_clicked · payment_started · payment_completed · assessment_started · step_completed · assessment_completed · report_viewed · pdf_downloaded · feedback_submitted.

## Future Entities
User · Organization · SavedBusinessIdea · Comparison · Scenario · Subscription · Plan · Benchmark · AIConversation.

## Development Recommendation
Para V1 usar answers JSON + scores JSON + diagnosis JSON — permite cambiar preguntas y scoring sin migrar muchas tablas durante validación. (No fue el camino elegido — ver nota arriba.)
