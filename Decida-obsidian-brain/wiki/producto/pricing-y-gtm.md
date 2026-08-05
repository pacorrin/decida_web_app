---
type: product
tags: [decida, pricing, gtm]
updated: 2026-08-05
---

# Pricing y Go-To-Market

Fuente: [[../../raw/notion/07-pricing-go-to-market]]

## Qué se vende
No una plantilla — **claridad**. Promesa: ayudarte a ver si tu idea tiene sentido para ti antes de gastar dinero.

## Hipótesis de precios (Notion, original)
| Plan | Precio | Incluye |
|---|---|---|
| Starter | $99 MXN | Evaluación inmediata, diagnóstico básico, semáforos, riesgos principales, próximos pasos básicos |
| Pro | $299 MXN | Todo Starter + PDF, diagnóstico más profundo, plan de validación de 30 días, mini simulador financiero |
| Expert | $799–$999 MXN | Todo Pro + revisión personalizada, sesión de 30 min, ajustes a la idea |

Estrategia de lanzamiento recomendada: un solo precio, **$99 MXN**, para conseguir los primeros 10 clientes pagados y aprender.

## Estado real en producción
El paso `/analizar/pago` implementa un **pago simulado (beta)** — no hay evidencia de integración real con Stripe o Mercado Pago en el código explorado. Es un paso de "compromiso" con promesa de reembolso si el reporte llega a fallar (ver [[../arquitectura/manejo-de-errores-y-reembolsos]]). Esto es consistente con la fase de validación temprana que describe el PRD, pero significa que **el pricing real de mercado sigue sin validarse con dinero real**.

## Canales de venta propuestos (Notion, no confirmados como ejecutados)
- **LinkedIn** — posicionamiento profesional (errores al evaluar side hustle, autoempleo vs negocio escalable).
- **TikTok/Reels** — alcance (análisis de casos concretos, señales de riesgo).
- **Facebook Groups** — validación rápida (Emprendedores México, Negocios desde casa, etc.).
- **Reddit** — dolores reales (r/entrepreneurship, r/smallbusiness, r/sidehustle, r/MexicoFinance).

> No hay evidencia en ninguna fuente ingerida de que estos canales se hayan ejecutado. Tratar como plan, no como historial.

## Landing copy (ver también [[../experiencia/landing-y-copy]])
Headline: *"¿Vale la pena tu idea de negocio antes de invertir tiempo y dinero?"* CTA: *"Analizar mi idea por $99 MXN"*.

## Métricas de validación propuestas (Notion)
Visitantes a landing · clics en CTA · intentos de pago · pagos completos · tasa de finalización del formulario · descargas de reporte · recomendaciones · comentarios sobre claridad.

> Gap: no hay evidencia de que estas métricas se estén capturando activamente hoy (no se encontró integración de analytics en el código explorado). Punto a verificar en una futura sesión de ingesta.

## Ver también
[[roadmap-y-backlog]] · [[../arquitectura/stack-tecnico]] · [[../decisiones/evolucion-del-producto]]
