---
type: product
tags: [decida, pricing, gtm]
updated: 2026-09-07
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

## Modelo de cobro decidido (2026-09-07)

El usuario cerró la decisión que estaba pendiente desde 2026-08-05: **Decida se cobra por suscripción, no por análisis único.**

| Nivel | Precio | Estado |
|---|---|---|
| **Freemium** | $0 — requiere cuenta | Se diseña en el Sprint 3 |
| **Suscripción base** | **$99 MXN / mes** | Se diseña en el Sprint 3 |
| Niveles superiores | — | **Pendientes de definir.** Los planes Pro / Expert de la hipótesis de abajo son el punto de partida, pero no se comprometen todavía. |

**Freemium — reglas decididas (2026-09-07):**
- Requiere crear cuenta (el paso `contacto` ya lo hace).
- **1 evaluación activa a la vez** — para hacer otra hay que suscribirse.
- **El onboarding NO se recorta** — el freemium responde el cuestionario completo (que vea todo lo que se evalúa). El reporte se genera y se guarda completo, igual que hoy.
- Lo único que cambia es la **vista del resultado**: freemium solo ve **recomendación + semáforos de las 6 dimensiones + el riesgo principal**. Todo lo demás bloqueado con CTA a suscripción. Ver [[../experiencia/reporte-de-resultado#Vista freemium (recortada) — decidida 2026-09-07]].

**Suscripción — reglas decididas (2026-09-07):**
- Al pagar se **desbloquea el modo completo de forma retroactiva**: todas las evaluaciones previas del usuario (hechas como freemium) pasan a verse completas, no solo las nuevas.
- **Cancelación sin reembolso.** Al cancelar, el acceso completo se mantiene hasta el **fin del mes ya pagado**; después la cuenta vuelve a la vista freemium. No se manejan reembolsos (ver [[../arquitectura/manejo-de-errores-y-reembolsos#Cambio a suscripción (2026-09-07) — cancelación, sin reembolsos]]).

El freemium es explícitamente un **embudo de conversión**: dar suficiente señal para que el usuario quiera el reporte completo y las herramientas de pago.

> **Alcance en el Sprint 3**: rediseño de las pantallas de pago (de "pago único simulado" a "elige plan / suscríbete") + gating freemium/suscriptor. **La integración de cobro recurrente real (Stripe / Mercado Pago) NO** — sigue simulada y se mantiene en el Sprint 5. Ver [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 3 — Modelo de suscripción y freemium (pantallas de pago)]].

## Estado real en producción
El paso `/analizar/pago` implementa un **pago simulado (beta)** — `savePayment` marca el assessment como `paid` sin llamar a ningún proveedor. No hay integración real con Stripe o Mercado Pago. Es un paso de "compromiso" con promesa de reembolso si el reporte llega a fallar (ver [[../arquitectura/manejo-de-errores-y-reembolsos]]). **El pricing real de mercado sigue sin validarse con dinero real** — y con el cambio a suscripción (2026-09-07), la promesa de reembolso de pago único hay que replantearla.

## Canales de venta propuestos (Notion, no confirmados como ejecutados)
- **LinkedIn** — posicionamiento profesional (errores al evaluar side hustle, autoempleo vs negocio escalable).
- **TikTok/Reels** — alcance (análisis de casos concretos, señales de riesgo).
- **Facebook Groups** — validación rápida (Emprendedores México, Negocios desde casa, etc.).
- **Reddit** — dolores reales (r/entrepreneurship, r/smallbusiness, r/sidehustle, r/MexicoFinance).

> No hay evidencia en ninguna fuente ingerida de que estos canales se hayan ejecutado. Tratar como plan, no como historial.

## Landing copy (ver también [[../experiencia/landing-y-copy]])
Headline: *"¿Vale la pena tu idea de negocio antes de invertir tiempo y dinero?"* CTA: *"Analizar mi idea por $99 MXN"*.

> ⚠️ El CTA "por $99 MXN" asume pago único. Con el modelo de suscripción + freemium (2026-09-07) hay que revisarlo — probablemente "Analiza tu idea gratis" (entrada freemium) con la suscripción como upsell posterior. Parte del Sprint 3.

## Métricas de validación propuestas (Notion)
Visitantes a landing · clics en CTA · intentos de pago · pagos completos · tasa de finalización del formulario · descargas de reporte · recomendaciones · comentarios sobre claridad.

> Gap: no hay evidencia de que estas métricas se estén capturando activamente hoy (no se encontró integración de analytics en el código explorado). Punto a verificar en una futura sesión de ingesta.

## Ver también
[[roadmap-y-backlog]] · [[../arquitectura/stack-tecnico]] · [[../decisiones/evolucion-del-producto]] · [[../decisiones/plan-lanzamiento-60-90-dias]] · [[../experiencia/reporte-de-resultado]]
