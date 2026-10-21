---
type: decision-log
tags: [decida, pricing, creditos, suscripcion, stripe, costos]
updated: 2026-10-21
status: en evaluación (no implementado)
---

# Modelo de créditos híbrido (créditos + suscripción con créditos incluidos)

Opción en evaluación para reemplazar la suscripción actual de 99 MXN. Contexto: [[../producto/pricing-y-gtm]]. Costos vienen de la etapa de investigación con búsqueda web (PR 12, `docs/resultados-paso-2c.md`).

## Por qué cambiar
- La suscripción es precio fijo con costo variable ilimitado. Con investigación web (`web_search`) un análisis completo cuesta ~**$0.25–0.40 USD** (estimado; el precio real de la búsqueda sigue por confirmar con la factura de OpenAI).
- 99 MXN ≈ $5.3 USD; descontando la comisión de Stripe (~3.6% + $3 MXN, verificar tarifa vigente) quedan ~$5 USD. A partir de ~16 análisis al mes no hay margen; un usuario que analiza 30 ideas cuesta ~$9 USD.

## Propuesta híbrida
**Dos formas de pagar, ambas consumen créditos:**

1. **Paquetes de créditos (pago único, sin caducidad o con caducidad larga)**

| Paquete | Precio sugerido (MXN) | Por análisis |
|---|---|---|
| 1 crédito | $59 | $59 |
| 3 créditos | $149 | ~$50 |
| 10 créditos | $399 | ~$40 |

2. **Suscripción mensual con créditos incluidos** (mantiene ingreso recurrente). Ejemplo a probar: ~$199 MXN/mes con 5 créditos, o ~$99 con 2–3. Créditos adicionales a precio de paquete. Debe quedar más barata por crédito que el paquete de 1 para que valga la pena, pero no que compita con el de 10.

**Primer análisis gratis** (o resumen con tarjetas bloqueadas, como hoy). Costo de un crédito de bienvenida ≈ $6 MXN.

### Interruptor «Investigación de mercado» (en el onboarding)
- **Básico = 1 crédito**: sin búsqueda web (costo API ~$0.05–0.10 USD). Las cifras de mercado son supuestos de la persona y no llevan fuentes.
- **Con investigación = 2 créditos**: ficha de mercado con fuentes `[F#]` (costo ~$0.30 USD).
- Valor por defecto: **activado** (es el diferenciador); se explica qué se pierde al apagarlo.
- Técnicamente: hoy la bandera `REPORT_RESEARCH_ENABLED` es global; habría que guardar la elección por assessment (campo nuevo) y que el pipeline la lea antes de investigar.

## Precio base y margen
- Lista sugerida: **$59 MXN** por análisis completo (margen bruto ~85%); no bajar de ~$49 por la comisión fija de Stripe. Probar $49 / $59 / $79 con PostHog.
- Versión ligera opcional a ~$29.

## Qué implica construirlo
- **Libro de créditos**: tabla de movimientos (compra, gasto, reembolso, bono, mensualidad) + saldo; débito atómico (sin doble gasto).
- **Stripe**: pagos únicos con Checkout para paquetes; la suscripción pasa a otorgar créditos en cada ciclo (evento de factura pagada). Webhooks idempotentes por evento.
- **Fallos**: si el reporte falla, devolver crédito; si la investigación se degrada (`arep_research.status = failed|skipped`), cobrar solo el nivel entregado (o devolver el diferencial).
- **Regeneraciones**: definir si un crédito las incluye (cada una cuesta lo mismo que un análisis).
- **Caducidad**: sin caducidad es más simple pero deja pasivo abierto; en suscripción, definir si los créditos del mes acumulan o vencen.
- **Migración de suscriptores actuales**: convertir periodo pagado en créditos; trato justo y comunicación.
- Revisar landing, `/privacidad`, términos y el proceso de reembolsos ([[../arquitectura/manejo-de-errores-y-reembolsos]]).

## Decisiones abiertas
- Precio final por crédito y valor de la suscripción (probar con tráfico real).
- Créditos con o sin caducidad; acumulación mensual.
- ¿Regeneración incluida?
- Costo en créditos del nivel básico frente al completo (1 vs 2 propuesto).
- Medir costo real por reporte (el Paso 4 de evals puede leer tokens de cada respuesta).

## Siguiente paso sugerido
Después de cerrar el Paso 4 de evals: diseño técnico (tablas, flujo de Stripe, migración) en rama y PR propios, antes de tocar código. Estado: **solo documentado, sin decisión tomada**.
