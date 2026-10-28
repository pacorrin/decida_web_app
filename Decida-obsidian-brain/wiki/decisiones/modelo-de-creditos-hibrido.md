---
type: decision-log
tags: [decida, pricing, creditos, planes, stripe, costos, especificacion]
updated: 2026-10-28
status: implementado en código (2026-10-28); pendiente de crear los precios en Stripe y desplegar
---

# Modelo de planes con créditos mensuales

Reemplaza la suscripción única de $99 MXN y también el esquema anterior de paquetes de pago único (documentado el 2026-10-22 e implementado por Cursor). Contexto: [[../producto/pricing-y-gtm]]. Costos de la investigación web: `docs/resultados-paso-2c.md` y `docs/resultados-paso-4.md`. El prompt para Cursor ([[prompt-cursor-creditos]]) quedó **obsoleto**: este cambio se hizo directamente en el repo.

## 1. Decisiones cerradas (2026-10-28)
| Tema | Decisión |
|---|---|
| Producto | Suscripción mensual con 3 planes con nombre. Cada renovación **restablece** el saldo a los créditos del plan; **no se suman** a los que sobraron |
| Planes | **Explora** $59 MXN → 200 créditos · **Valida** $149 → 600 · **Escala** $399 → 2,000 (Valida es el destacado) |
| Costo de un análisis | **Básico** (sin investigación web) = **50 créditos** · **Con investigación de mercado** = **150 créditos** |
| Unidad | Créditos enteros (antes centésimos de crédito; los valores internos no cambiaron: 50 y 150) |
| Caducidad | Los créditos **vencen** al renovar (se restablecen) y al terminar una suscripción cancelada. Debe quedar claro en la compra y en los términos; **validar con asesor legal** (normativa de consumo en México) |
| Análisis gratis | Se conserva la vista previa gratuita del primer análisis, **sin investigación web** (no gasta ~$0.24 USD por registro) |
| Costo de referencia (techo) | **$0.30 USD** por reporte con investigación, aunque las pruebas den ~$0.24; el margen sobrante cubre funciones de IA futuras sin subir precio |
| Regeneraciones | No incluidas; solo el reintento tras un fallo es gratis |
| Reembolsos | Fallo del reporte → se devuelven los créditos; investigación degradada → se devuelven 100 créditos (la diferencia 150−50) |

## 2. Reglas de ciclo de vida
1. **Alta / renovación (`invoice.paid`, `billing_reason` = `subscription_create` o `subscription_cycle`)**: el saldo pasa a los créditos del plan. Si quedaba saldo se registra como `expire` y luego `subscription_grant`, en una transacción.
2. **Subida de plan a mitad de mes** (`subscription_update` con cobro y más créditos que la última renovación): el saldo pasa **al instante** a los créditos del plan nuevo.
3. **Bajada de plan**: no toca el saldo; aplica en la próxima renovación (la factura de ese ciclo ya es del plan nuevo y restablece a menos créditos). **Hay que avisar antes** de que el excedente se pierde.
4. **Se queda sin créditos a mitad de mes**: solo puede esperar o subir de plan (no hay compras sueltas por ahora; añadir un paquete suelto que no caduque si la fricción lo exige).
5. **Cancelación**: conserva los créditos hasta el fin del periodo pagado; al terminar (`customer.subscription.deleted`) vencen. Red de seguridad: si el aviso de Stripe se retrasa, `expireIfSubscriptionEnded` los vence al abrir `/cuenta/creditos`.
6. **Cobro fallido (`past_due`)**: el gasto se bloquea (saldo gastable = 0, `spendableBalance`) hasta regularizar el pago; no se abona nada.
7. **Reembolso de dinero en Stripe** (`charge.refunded`): solo reembolsos **totales** descuentan los créditos que abonó esa factura (hasta el saldo disponible, nunca negativo); los parciales solo avisan por log para revisión manual.
8. **Idempotencia**: cada abono usa la clave `grant:{invoiceId}` (el webhook y el retorno de Checkout pueden llegar en cualquier orden sin duplicar); los vencimientos usan `expire:sub_ended:{subscriptionId}`.

## 3. Economía unitaria (peor caso: el usuario gasta todo en análisis con investigación)
Tipo de cambio ~18.5; Stripe 3.6% + $3 MXN; costo de IA $0.30 USD ≈ $5.55 MXN por análisis con investigación; reserva de impuestos 50%.

| Plan | Análisis con investigación | Precio por análisis | Después de Stripe | Costo de IA | Libre tras impuestos |
|---|---|---|---|---|---|
| Explora $59 | 1.3 (o 4 básicos) | ~$44 | ~$54 | ~$7 | ~$23 |
| Valida $149 | 4 (o 12 básicos) | ~$37 | ~$141 | ~$22 | ~$59 |
| Escala $399 | 13 (o 40 básicos) | ~$30 | ~$382 | ~$74 | ~$154 |

La IA cuesta entre 12% y 19% del precio en el peor caso. Para cubrir ~$2,500 MXN/mes de beta hacen falta ~108 suscriptores de Explora, ~42 de Valida o ~16 de Escala. Como casi nadie gasta todo, el margen real será mayor. El objetivo de la beta es que la plataforma se sostenga sola; utilidades cuando los ingresos superen los gastos operativos.

## 4. Implementación (código)
- `src/lib/credits/plans.ts`: planes, price ids de Stripe por env (`STRIPE_PRICE_EXPLORA/VALIDA/ESCALA`), `planFromSubscription` (por price id; si no hay, por `metadata.plan_id`).
- `src/lib/credits/costs.ts`: 50 / 150 y `formatCredits`.
- `src/lib/credits/ledger.ts`: `resetCreditsToPlan`, `expireCredits`, gasto/reembolso/ajuste atómicos con idempotencia.
- `src/lib/credits/subscription-credits.ts`: `shouldGrantForInvoice`, `grantCreditsForInvoice`, `expireCreditsForEndedSubscription`, `expireIfSubscriptionEnded`.
- `src/lib/credits/access.ts`: `hasReportAccess` (evaluación cobrada) y `spendableBalance` (0 si `past_due`).
- `src/lib/subscription/*`: Checkout de suscripción por plan (`stripe-checkout.ts`), `start.ts`/`subscribe.ts` con `planId` (el modo simulado también abona créditos), webhook (`stripe-webhook.ts`) que abona en `invoice.paid` y vence en `customer.subscription.deleted`.
- Tabla `credit_ledger` (tipos: `purchase`, `welcome_bonus`, `subscription_grant`, `spend`, `refund`, `adjustment`, `expire`), `users.user_credits_balance`, `assessments.asmt_research_enabled / asmt_credit_cost / asmt_credits_charged_at`. Migración nueva: `20261028000000_credit_expire`.
- UI: `/cuenta/suscripcion` (planes, estado, cancelar, administrar pagos), `/cuenta/creditos` (saldo, fecha de restablecimiento, historial), paso de pago del onboarding, sección de precios de la landing, FAQ, términos, privacidad y correos de cobro con el nombre y los créditos del plan.
- Se eliminó el flag `SUBSCRIPTIONS_ENABLED` y todo el código de paquetes de pago único.

## 5. Para activarlo (pendiente del dueño)
1. En Stripe (modo prueba y luego producción): crear 3 productos con precio **recurrente mensual en MXN** ($59, $149, $399) y poner sus ids en `STRIPE_PRICE_EXPLORA`, `STRIPE_PRICE_VALIDA`, `STRIPE_PRICE_ESCALA`. Sin ids funciona con precios en línea, pero el plan se reconoce por metadata y es más frágil tras un cambio de plan.
2. Configurar el **Customer Portal** de Stripe: permitir cambio de plan entre esos 3 precios, **subidas con cobro inmediato y bajadas al fin del periodo**, y cancelación al fin del periodo.
3. El webhook debe recibir: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`.
4. Aplicar la migración `20261028000000_credit_expire` (en desarrollo: `pnpm db:push`).
5. Revisar con asesor legal los términos (vencimiento de créditos) y el aviso de privacidad.

## 6. Pendiente / siguiente
- Probar el ciclo completo con Stripe en modo prueba (`stripe listen`, relojes de prueba para renovar y cancelar).
- El e2e `e2e/subscription-flow.spec.ts` sigue escrito para el modelo freemium anterior (textos y botones obsoletos): reescribirlo para planes.
- Medir en PostHog: `credits_granted`, `credits_expired`, `credits_spent`, `credits_insufficient`, `research_toggled`, `subscribe_clicked` (con `plan_id`) para ver conversión y fricción por quedarse sin créditos.
- Evaluar un paquete suelto que no caduque y la opción de plan anual.
