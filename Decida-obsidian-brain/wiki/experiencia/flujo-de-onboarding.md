---
type: experiencia
tags: [decida, onboarding, ux]
updated: 2026-08-05
---

# Flujo de onboarding — diseño vs implementado

Fuentes: [[../../raw/notion/03-onboarding-user-flow]] · [[../../raw/notion/13-ux-wireframes]] · `src/lib/onboarding/steps.ts`

## Flujo diseñado originalmente (Notion, 12 pasos)
Landing → CTA → **pago o acceso inicial** → perfil personal → recursos → perfil de trabajo → descripción de idea → **confirmación IA de la idea** → evaluación guiada → resultado → reporte/PDF → upsell.

En este diseño, el pago ocurre **antes** de que el usuario invierta esfuerzo describiendo su idea — para validar pago real cuanto antes.

## Flujo implementado (código, `ONBOARDING_STEPS` en `src/lib/onboarding/steps.ts`)

| # | Paso (slug) | Fase | Min. est. |
|---|---|---|---|
| 1 | `contacto` | gratis | 1 |
| 2 | `idea` | gratis | 2 |
| 3 | `confirmacion` | gratis | 1 |
| 4 | `pago` | pago | 1 |
| 5 | `perfil` | diagnostico | 6 |
| 6 | `ajuste` | diagnostico | 3 |
| 7 | `evaluacion` | diagnostico | 5 |
| 8 | `resultado` | diagnostico | 0 |

Tres fases explícitas: **`gratis`** (contacto, idea, confirmación) → **`pago`** (compromiso) → **`diagnostico`** (perfil, ajuste, evaluación, resultado).

## La diferencia clave
En el código, **la idea se captura y se confirma con IA antes del pago**, no después. El usuario ve que el sistema entendió su idea (gratis) y *luego* decide comprometerse pagando. Esto es lo opuesto al orden original de Notion, y probablemente una decisión deliberada de conversión: reduce la fricción de pagar "a ciegas" — el usuario paga después de sentir que el producto ya lo entendió, no antes.

Esto también significa que **perfil, recursos y ajuste personal ocurren después del pago**, en la fase "diagnóstico" — el usuario ya se comprometió antes de invertir el tiempo más largo del cuestionario (perfil = 6 min, el paso más largo).

> Ver [[../decisiones/evolucion-del-producto]] para el registro de esta decisión de reordenamiento (commit `cba2954 feat: update onboarding flow and enhance form handling`).

## Paso "ajuste" — no existía en el diseño original
`ajuste` (fase diagnóstico, ~3 min) no tiene equivalente directo en los 12 pasos de Notion. Por el nombre ("Ajuste personal") probablemente corresponde a lo que Notion llamaba "Personal Work Fit" (Step 4) — pero movido de antes-del-pago a después-del-pago, y separado de "perfil" como su propio paso. A verificar leyendo `src/app/analizar/ajuste/page.tsx` en una próxima sesión si se necesita el detalle exacto de qué preguntas contiene hoy.

## Principio de UX que se mantiene sin cambios
"El onboarding debe sentirse como una conversación inteligente, no como una encuesta pesada." Y de los wireframes: no mostrar un score numérico global primero en resultados — llevar con recomendación + diagnóstico narrativo de 3 líneas. Ver [[reporte-de-resultado]].

## Question Bank original (Notion, 25 preguntas máx., por sección)
A (perfil) · B (recursos — **B1/B2 de capital y pérdida removidos en producción**, ver [[../decisiones/evolucion-del-producto]]) · C (personal fit) · D (idea de negocio) · E (financial basics) · F (mercado y riesgo) · G (contexto final). Detalle completo: [[../../raw/notion/05-question-bank-v1]].

## Ver también
[[../producto/prd]] · [[reporte-de-resultado]] · [[../decisiones/evolucion-del-producto]] · [[../marca/sistema-de-diseno]]
