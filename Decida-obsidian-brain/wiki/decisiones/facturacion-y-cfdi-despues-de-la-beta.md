---
type: decision-log
tags: [decida, facturacion, cfdi, sat, fiscal, legal, post-beta, pendiente]
updated: 2026-10-29
---

# Facturación y CFDI: fuera de la beta, pendiente al formalizar la plataforma

Decisión del usuario (2026-10-29), tomada al revisar los pendientes previos al lanzamiento de la beta. Fuentes: `src/lib/email/billing-templates.ts` (correos de cobro), `src/lib/subscription/stripe-webhook.ts`, [[pagos-con-stripe]].

## Decisión
**Durante la beta no se factura.** No se emiten facturas (CFDI), no se capturan datos fiscales de los usuarios y no se construye nada relacionado con el SAT. Lo que recibe quien paga es el **recibo de Stripe**, que manda Stripe por separado (los correos de cobro de la app lo avisan: «Stripe te enviará por separado el recibo de tu pago»).

Hoy la app **no promete facturas** en ninguna parte: no hay mención de facturación ni de CFDI en la landing, los términos, la privacidad ni los correos (verificado con búsqueda en `src/`). Si durante la beta alguien pide factura, la respuesta es que **todavía no está disponible**; no se prometen fechas.

## Pendiente para después de la beta
Se retoma **cuando la plataforma se formalice** (por ejemplo, al constituirse o darse de alta fiscalmente y abrirse al público general). El orden propuesto:

1. **Formalización fiscal.** Definir con un contador el esquema bajo el que Decida cobra y factura. Esto va antes que cualquier código, porque determina qué datos y qué tipo de comprobante hacen falta.
2. **Captura de datos de facturación en la cuenta.** Un formulario opcional en `/cuenta/perfil` para que cada usuario guarde sus datos fiscales. Los campos habituales para un CFDI son nombre o razón social, RFC, código postal fiscal, régimen fiscal y uso del CFDI; **confirmar la lista exacta con el contador** y con la versión vigente del CFDI. Implica columnas nuevas en `users` (o una tabla aparte) y una migración.
3. **Emisión del CFDI.** Requiere un proveedor autorizado de certificación (PAC) o un servicio de facturación; no se ha evaluado ninguno. El disparador natural es el evento de Stripe `invoice.paid` que la app ya procesa en el webhook: al cobrarse un periodo, se emite la factura con los datos guardados y se envía por correo.
4. **Cancelaciones y reembolsos.** Definir qué pasa con la factura cuando se reembolsa un cobro (`charge.refunded`); suele implicar cancelar el CFDI o emitir un comprobante de egreso. A validar con el contador.
5. **Privacidad.** Los datos fiscales son datos personales: actualizar el aviso de privacidad (qué se guarda y para qué) y decidir cómo se protegen en la base de datos. Ver [[seguridad-y-proteccion-de-costos]].
6. **Términos, FAQ y correos.** Actualizar para explicar cómo y cuándo se solicita la factura.
7. **Costos.** Un PAC o servicio de facturación sería un vendor nuevo; agregarlo a [[vendors-y-costos]] con su costo cuando se elija.

## Lo que ya existe y ayudará
- El webhook de Stripe ya recibe `invoice.paid`, `charge.refunded` y `customer.subscription.*`, y el libro de créditos deja el historial de cada cobro.
- `users` ya guarda el cliente de Stripe (`user_stripe_customer_id`), el plan y el periodo vigente.
- Los correos de cobro ya tienen una plantilla común (`billing-templates.ts`) donde se agregaría el enlace a la factura.

## Pendiente relacionado que sigue abierto
La **revisión legal de los términos** (vencimiento de los créditos al renovar o al cancelar, y la política de reembolsos) **no queda resuelta por esta decisión**: sigue como pendiente aparte antes de abrir la beta, y en [[modelo-de-creditos-hibrido]] ya estaba marcada para validar con asesor legal.

## Ver también
[[pagos-con-stripe]] · [[modelo-de-creditos-hibrido]] · [[vendors-y-costos]] · [[../producto/pricing-y-gtm]] · [[../tareas/tablero]]
