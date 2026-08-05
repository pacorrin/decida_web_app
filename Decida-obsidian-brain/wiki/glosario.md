---
type: reference
tags: [decida, glosario]
updated: 2026-08-05
---

# Glosario

## Semáforo / Signal (`signal_level`)
Verde / Amarillo / Rojo. Cómo se comunica el estado de cada una de las 6 dimensiones. Verde = favorable, Amarillo = requiere validación, Rojo = riesgo alto o incompatibilidad. Ver [[framework/dimensiones-de-viabilidad]].

## Recomendación final (`final_recommendation`)
Una de 4 salidas posibles, nunca "sí/no" absoluto: `proceed_small_test`, `validate_first`, `adjust_idea`, `pause_for_now`. Ver [[framework/scoring-engine]].

## Red flag
Regla dura que puede tumbar una recomendación aunque el score global parezca aceptable (ej. inversión inicial mayor al capital disponible). Ver [[framework/scoring-engine#Red flags]].

## Personal Fit (Compatibilidad personal)
Dimensión (20% del peso) que mide si el negocio encaja con los gustos, habilidades y tolerancias de la persona — no con el negocio en abstracto.

## Financial Viability (Viabilidad financiera)
Dimensión (25%) — margen, punto de equilibrio, payback, inversión vs capital/pérdida aceptable.

## Commercial Viability (Viabilidad comercial)
Dimensión (25%) — evidencia de demanda, canal de adquisición, competencia.

## Risk Level (Nivel de riesgo)
Dimensión (15%) — nota: score alto = *más* riesgo (es la única dimensión invertida respecto a "más alto es mejor").

## Time Fit (Tiempo y operación)
Dimensión (10%) — si la idea cabe en la disponibilidad horaria real del usuario.

## Scalability (Escalabilidad)
Dimensión (5%) — autoempleo vs negocio delegable vs sistema escalable.

## Break-even (punto de equilibrio)
Ventas necesarias para cubrir costos fijos = costos fijos / margen por venta.

## Payback (recuperación de inversión)
Meses para recuperar la inversión inicial = inversión inicial / utilidad neta mensual.

## Unit economics
Si una sola venta deja dinero de verdad, antes de pensar en escala.

## Hecho / Supuesto / Deseo
Marco de [[framework/criterios-de-evaluacion]] para separar evidencia real ("ya vendí 3 servicios") de proyección ("creo que venderé 16/mes") de aspiración ("quiero libertad financiera en 6 meses"). La evaluación seria ataca supuestos, no motiva deseos.

## Assessment
Unidad central de datos: una evaluación de una idea de negocio, de principio a fin. Estados (`assessment_status`): `started → paid → in_progress → report_generated` (o `failed`). Ver [[arquitectura/modelo-de-datos]].

## Fases del onboarding (`OnboardingPhase`, código)
`gratis` (contacto, idea, confirmación) → `pago` (compromiso) → `diagnostico` (perfil, ajuste, evaluación, resultado). Ver [[experiencia/flujo-de-onboarding]].

## Pago simulado (beta)
El paso de pago en producción no cobra realmente — es un compromiso simulado con promesa de reembolso si el reporte falla. Ver [[producto/pricing-y-gtm]] y [[arquitectura/manejo-de-errores-y-reembolsos]].
