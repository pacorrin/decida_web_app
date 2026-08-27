---
type: overview
tags: [decida, hub]
updated: 2026-08-26
---

# Decida — Overview

Nota de navegación: este es el punto de entrada del cerebro. Desde aquí se llega a todo lo demás. Ver también [[../index|índice completo]].

## Qué es Decida

Decida es un **business viability assessment**: un diagnóstico guiado que ayuda a una persona a evaluar **una idea de negocio que ya tiene** antes de invertir más tiempo o dinero en ella. No inventa negocios, no recomienda qué abrir, y no garantiza éxito — reduce incertidumbre dando señales de viabilidad, riesgos y próximos pasos concretos.

> "El score no es el producto. El diagnóstico es el producto." — [[framework/scoring-engine|Scoring Engine]]

La pregunta que resuelve: **¿Vale la pena esta idea para mí, ahora, con mis recursos?**

## Las tres capas del negocio (cómo navegar este cerebro)

1. **Intención de producto** (Notion, `raw/notion/`) — el diseño original: PRD, framework de 6 dimensiones, prompts, pricing, arquitectura V1. Es la visión fundacional, escrita entre jun–jul 2026.
2. **Estado implementado** (código, `../src`, `../prisma`) — lo que realmente corre hoy. En varios puntos diverge del diseño original (ver [[decisiones/evolucion-del-producto]]).
3. **Síntesis** (este wiki) — páginas que cruzan ambas capas, señalan las brechas, y sirven de mapa mental para tomar decisiones de producto informadas.

## Identidad

- **Propósito**: ayudar a las personas a tomar decisiones más inteligentes antes de invertir tiempo, dinero y esfuerzo en una idea de negocio.
- **Visión**: ser la plataforma de referencia para cualquier persona que quiera emprender, reduciendo la cantidad de negocios que fracasan por falta de análisis previo.
- Detalle completo: [[vision-mision-valores]]

## Mapa del producto

| Área | Página wiki | Resumen |
|---|---|---|
| Producto | [[producto/prd]] | Qué es, para quién, qué no es |
| Producto | [[producto/usuario-objetivo-y-jtbd]] | Perfil del usuario y jobs-to-be-done |
| Producto | [[producto/principios-de-producto]] | Reglas de decisión de producto |
| Producto | [[producto/pricing-y-gtm]] | Precio, canales, estado real del pago |
| Producto | [[producto/roadmap-y-backlog]] | Plan MVP original vs línea de tiempo real (git) |
| Producto | [[producto/gaps-onboarding-vs-framework]] | Mapeo del onboarding vs. el rubric de 6 dimensiones — incluye bug crítico del score de riesgo |
| Framework | [[framework/dimensiones-de-viabilidad]] | Las 6 dimensiones — el IP central del producto |
| Framework | [[framework/scoring-engine]] | Reglas determinísticas + interpretación IA |
| Framework | [[framework/criterios-de-evaluacion]] | Marco de juicio humano detrás del scoring |
| Framework | [[framework/prompts-de-ia]] | Arquitectura de prompts y guardrails |
| Experiencia | [[experiencia/flujo-de-onboarding]] | Flujo diseñado vs flujo implementado |
| Experiencia | [[experiencia/reporte-de-resultado]] | Estructura del reporte final |
| Experiencia | [[experiencia/landing-y-copy]] | Mensaje, tono, palabras a usar/evitar |
| Arquitectura | [[arquitectura/stack-tecnico]] | Next.js 16, Prisma 7, Postgres, OpenAI |
| Arquitectura | [[arquitectura/modelo-de-datos]] | Esquema relacional real vs propuesta Notion |
| Arquitectura | [[arquitectura/manejo-de-errores-y-reembolsos]] | Qué pasa cuando falla la generación del reporte |
| Arquitectura | [[arquitectura/historial-de-evaluaciones]] | Feature que superó los non-goals originales |
| Arquitectura | [[arquitectura/modulo-de-usuarios-y-autenticacion]] | Cuentas con contraseña, email transaccional — Sprint 1 (2026-08-05) |
| Marca | [[marca/sistema-de-diseno]] | "Diagnóstico en Papel Blanco" |
| Decisiones | [[decisiones/evolucion-del-producto]] | Dónde y por qué el código se separó del PRD |
| Decisiones | [[decisiones/plan-lanzamiento-60-90-dias]] | Plan de 12 semanas con fechas, prioridades y estrategia comercial |
| Reuniones | [[reuniones/minutas]] | Estado de las minutas (aún no hay para Decida) |
| — | [[glosario]] | Términos clave del negocio |

## Los 6 pilares de decisión (resumen ultra-rápido)

Compatibilidad personal (20%) · Viabilidad financiera (25%) · Viabilidad comercial (25%) · Nivel de riesgo (15%) · Tiempo y operación (10%) · Escalabilidad (5%). Detalle en [[framework/dimensiones-de-viabilidad]].

Salida siempre es una de 4: **Proceed small test / Validate first / Adjust idea / Pause for now**.

## Gaps de conocimiento activos

- No existen minutas de reuniones de Decida en Notion todavía — ver [[reuniones/minutas]].
- No hay evidencia de clientes reales, testimonios o métricas de validación registradas en ninguna fuente (ni Notion ni código) — `PRODUCT.md` lo marca explícitamente como "no fabricar".
- El pago en producción es simulado (beta), y se pospuso deliberadamente hasta definir el modelo de cobro — ver [[producto/pricing-y-gtm]] y [[decisiones/plan-lanzamiento-60-90-dias]].
- El score de "Nivel de riesgo" está roto en producción (no solo incompleto) — ver [[producto/gaps-onboarding-vs-framework#🔴 Hallazgo crítico]], arreglo agendado en Sprint 2.
- Falta vincular `assessments` a `users` y migrar `/mis-evaluaciones` al nuevo módulo de cuentas — ver [[arquitectura/modulo-de-usuarios-y-autenticacion#Qué falta]].

## Estado de desarrollo (actualizado 2026-08-26)

Hay un plan activo de lanzamiento en 60-90 días con fechas y checkpoints — ver [[decisiones/plan-lanzamiento-60-90-dias]]. Sprint 1 (fundamentos de cuenta) prácticamente cerrado: auth con contraseña, dashboard `/cuenta`, y recuperación de contraseña en wizard de 3 pantallas ya commiteados; pendiente real no-código = verificar un dominio propio en Resend antes de la beta. Empezó a trabajarse el primer lote del Sprint 2: pulido del paso "Así entendimos tu idea" del onboarding (en un commit local sin subir — ver [[experiencia/flujo-de-onboarding#El paso «confirmacion» («Así entendimos tu idea») — pulido de IA (commit pendiente, 2026-08-26)]]).
