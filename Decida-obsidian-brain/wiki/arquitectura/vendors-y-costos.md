---
type: arquitectura
tags: [decida, vendors, costos, proveedores, railway, openai, stripe]
updated: 2026-10-29
---

# Vendors externos: para qué sirve cada uno y cuánto cuesta

Inventario de los proveedores de los que depende Decida. Las cifras son **aproximadas** y tomadas de las páginas oficiales de cada vendor el 2026-10-29; los precios cambian, así que revisa el sitio del vendor antes de decidir. Lo marcado como *estimación* es mío, no un dato del vendor. Las dependencias de código abierto (Next.js, React, Prisma, Zod, etc.) no tienen costo y están en [[stack-tecnico]].

## Resumen
| Vendor | Para qué lo usa Decida | Modelo de costo | Costo aproximado |
|---|---|---|---|
| **Railway** | Hosting de la app y de PostgreSQL | Plan base + uso | **US$5 a 20 al mes de base**, más uso |
| **OpenAI** | Redacción e interpretación del reporte, investigación con búsqueda web | Por consumo | **~US$0.04 por vista previa; ~US$0.13 por reporte con investigación** (medido) |
| **Stripe** | Cobro de los planes mensuales | Comisión por transacción | **3.6% + MX$3** por cobro con tarjeta nacional (más impuestos) |
| **Resend** | Correos transaccionales (códigos, bienvenida, cobros) | Capa gratuita | **US$0**; hasta 100 al día y 3,000 al mes |
| **PostHog** | Analítica de producto y *feature flags* | Capa gratuita | **US$0**; hasta 1 millón de eventos al mes |
| **Sentry** | Errores en producción | Capa gratuita | **US$0**; hasta 5,000 errores al mes |
| **Cloudflare Turnstile** | Captcha del registro | Gratis | **US$0**; verificaciones ilimitadas |
| **Hostinger** | Dominio `decida.mx` y cuentas de correo de Decida | Renovación anual | **MX$816.99 al año** el dominio (~MX$68 al mes), vence en octubre de 2030; correo en capa gratuita (hasta 5 cuentas) |

El costo que **escala con el uso real** es OpenAI, y el que se descuenta de cada venta es Stripe. El resto cabe hoy en capas gratuitas o en un plan fijo; el dominio es un cargo anual fijo.

## Costo mensual promedio de la infraestructura
Todo lo siguiente son **estimaciones** para planear, no un presupuesto del vendor. **Supuesto de tipo de cambio: US$1 = MX$18.5** (ajústalo si cambia). Cifras de OpenAI: las medidas en pruebas (~US$0.04 la vista previa gratuita, ~US$0.13 el reporte con investigación). No incluye la comisión de Stripe, que se descuenta de cada cobro y no es un costo fijo.

**Costo fijo mensual (no depende de cuánta gente use Decida):**
| Concepto | US$ al mes |
|---|---|
| Railway (app y base de datos) | 10 a 20 |
| Hostinger (dominio, MX$816.99 al año ÷ 12 ≈ MX$68) | ~3.7 |
| Resend, PostHog, Sentry, Turnstile, correo de Hostinger | 0 (capas gratuitas) |
| **Total fijo** | **~14 a 24** |

**Costo variable (OpenAI) y total, según el uso de la beta:**
| Escenario | Uso al mes | OpenAI | Total aprox. (US$) | En pesos aprox. |
|---|---|---|---|---|
| Beta mínima | ~25 vistas previas | ~1 | **~15 a 25** | MX$280 a 460 |
| Beta ligera | 50 vistas previas y 20 reportes con investigación | ~4.6 | **~19 a 29** | MX$350 a 540 |
| Beta activa | 200 vistas previas y 60 reportes con investigación | ~16 | **~30 a 40** | MX$555 a 740 |

**Promedio para planear la beta: ~US$20 a 30 al mes (≈ MX$370 a 560)**, casi todo hosting; OpenAI pesa poco mientras el volumen sea bajo.

**Qué lo movería hacia arriba:**
- **Resend Pro (+US$20):** si se superan ~50 registros al día (tope de 100 correos diarios en la capa gratuita).
- **Sentry Team (~+US$26):** si se necesitan alertas personalizadas o más de 5,000 errores al mes.
- **Railway Pro (US$20 de base):** si se pasa a ese plan; el uso incluido compensa parte del cobro.
- **Más cuentas de correo en Hostinger:** más de 5 sale de la capa gratuita.
- **Abuso o picos en OpenAI:** es el único costo sin techo; por eso el límite mensual de gasto es la medida pendiente más importante ([[seguridad-y-proteccion-de-costos#Qué sigue protegiendo poco (pendiente)]]).

**Referencia contra ingresos:** un solo suscriptor de Explora (MX$59 al mes) deja unos MX$54 tras la comisión base de Stripe, así que la infraestructura de la beta (≈ MX$370 a 560) se cubre aproximadamente con **7 a 10 suscriptores de Explora**, sin contar el costo de OpenAI de sus propios reportes. Es una cuenta orientativa, no una proyección de negocio.

---

## Railway
- **Para qué:** ejecuta la app Next.js y la base PostgreSQL en producción. Ver [[variables-de-entorno#Para producción (Railway)]].
- **Costo:** plan **Hobby US$5/mes** (incluye US$5 de uso) o **Pro US$20/mes** (incluye US$20 de uso). Después del crédito se factura por minuto: RAM US$10 por GB al mes, CPU US$20 por vCPU al mes, tráfico de salida US$0.05 por GB y volúmenes US$0.15 por GB al mes.
- **Estimación para la beta:** app más Postgres con poco tráfico, unos **US$10 a 20 al mes** en total. Es una estimación, no un presupuesto.
- **Alternativas revisadas (2026-10-29):** Cloudflare Containers no incluye Postgres y exigiría adaptar la app; un VPS de Hostinger (~US$17 a 24 al mes) no ahorra y obliga a administrar el servidor. Se decidió **quedarse en Railway** para la beta.
- Fuente: [docs.railway.com/reference/pricing/plans](https://docs.railway.com/reference/pricing/plans).

## OpenAI
- **Para qué:** modelo de narrativa (secciones del reporte), modelo de razonamiento (interpretar el puntaje y revisar), y modelos con **búsqueda web** para la investigación de mercado. Qué rol usa cada modelo: [[variables-de-entorno#Modelos de OpenAI (quién usa cuál)]].
- **Costo:** por consumo (tokens y búsquedas). Los precios por millón de tokens están en `src/lib/ai/research/config.ts` (verificados 2026-10-29): `gpt-4.1` US$2 entrada y US$8 salida; `gpt-4.1-mini` US$0.40 y US$1.60; `gpt-4o-mini` US$0.15 y US$0.60; `gpt-5-mini` US$0.25 y US$2. La búsqueda web cuesta US$10 por 1,000 llamadas.
- **Costo por reporte (medido en pruebas):** vista previa gratuita **~US$0.04**; reporte con investigación **~US$0.13**. El código estima ~US$0.23 porque asume US$0.03 por búsqueda (colchón; el costo real es US$0.01). Tope reservado por reporte: **US$0.30**.
- **Riesgo:** es el único costo que un abuso puede disparar. Mitigaciones en [[seguridad-y-proteccion-de-costos]]; falta el **límite mensual con alertas** en el panel de OpenAI. Contexto de negocio en [[../decisiones/modelo-de-creditos-hibrido]].

## Stripe
- **Para qué:** cobra las suscripciones mensuales (Explora, Valida, Escala), reembolsos y portal del cliente. Ver [[pagos-con-stripe]].
- **Costo:** sin cuota fija; **comisión por transacción**. La página oficial de México lista **3.6% + MX$3.00** por cobro con tarjeta nacional, **+0.5%** si la tarjeta es internacional y **+2%** si hay conversión de moneda. Se suman impuestos sobre la comisión.
- **Lo que no pude confirmar:** si **Stripe Billing** (suscripciones) agrega un cargo adicional en México. Revísalo en el panel de Stripe antes de lanzar.
- **Efecto en los planes (solo con la tarifa base, sin Billing ni impuestos):**

| Plan | Precio | Comisión aprox. | % del cobro |
|---|---|---|---|
| Explora | MX$59 | MX$5.12 | ~8.7% |
| Valida | MX$149 | MX$8.36 | ~5.6% |
| Escala | MX$399 | MX$17.36 | ~4.4% |

  El plan de entrada pierde proporcionalmente más porque la parte fija (MX$3) pesa más.
- Fuente: [stripe.com/mx/pricing](https://stripe.com/ja-mx/pricing).

## Resend
- **Para qué:** envía los correos de la app: código de verificación, restablecer contraseña, **bienvenida** y avisos de cobro. Detalle y checklist de dominio en [[correo-transaccional-resend]].
- **Costo:** plan **Free US$0** con 3,000 correos al mes y **tope de 100 al día**; **Pro US$20/mes** con 50,000 correos al mes y sin tope diario.
- **Límite que importa:** cada registro manda **2 correos** (código y bienvenida), así que el plan gratuito alcanza para unos **50 registros al día**. Si la beta lo supera, hay que pasar a Pro. Para un reenvío de código o un restablecimiento se gasta uno más.
- Requiere un **dominio verificado** para enviar a cualquier destinatario.
- Fuente: [resend.com/pricing](https://resend.com/pricing.md).

## PostHog
- **Para qué:** analítica de producto (embudo del onboarding, eventos como cuenta creada) y el *feature flag* `report-research` que prende o apaga la investigación con búsqueda web. Variables `NEXT_PUBLIC_POSTHOG_KEY` y `_HOST`.
- **Costo:** capa gratuita de **1 millón de eventos, 5,000 grabaciones de sesión y 1 millón de solicitudes de flags al mes**, que se renueva cada mes. Después es por uso (~US$0.00005 por evento).
- **Nota:** los e2e se ejecutan sin clave de PostHog para no ensuciar los embudos reales (`playwright.config.ts`).
- Fuente: [posthog.com/pricing](https://posthog.com/pricing).

## Sentry
- **Para qué:** captura errores del servidor y del navegador y sube los *source maps* en el build. Variables `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_AUTH_TOKEN`.
- **Costo:** plan **Developer gratuito** con 1 usuario y 5,000 errores al mes. El plan **Team** parte de ~US$26/mes (facturado anual) con 50,000 errores y más usuarios e integraciones. *Cifras de fuentes de terceros; confirma en la página de Sentry.*
- **Respaldos de la IA:** el código ya manda a Sentry cada vez que la IA cae a un respaldo (etiqueta `ai_fallback`); la regla de alerta por correo ya está creada ([[seguridad-y-proteccion-de-costos#Aviso cuando la IA falla (Sentry)]]). Las alertas personalizadas pueden requerir un plan de pago.

## Cloudflare Turnstile
- **Para qué:** captcha en el contacto del análisis y en el registro; frena el alta masiva de cuentas falsas. Ver [[seguridad-y-proteccion-de-costos#4. Captcha: Cloudflare Turnstile]].
- **Costo:** plan **gratuito** con desafíos ilimitados, hasta 20 *widgets* y 10 *hostnames* por widget. El plan Enterprise es «contactar a ventas» y solo agrega capacidad, no es necesario.
- **Operación:** el widget debe tener `localhost` y el dominio de producción en su lista de *hostnames*.
- Fuente: [developers.cloudflare.com/turnstile/plans](https://developers.cloudflare.com/turnstile/plans/).

## Hostinger
- **Para qué:** aloja el **dominio `decida.mx`** y las **cuentas de correo de Decida** (las direcciones de la marca, como la de contacto y soporte). **No** hospeda la app ni la base de datos: eso es Railway.
- **Costo del dominio:** renovación anual de **MX$816.99** (~MX$68 al mes). **Ya está pagado y vence en octubre de 2030**, así que no hay cargo de dominio hasta entonces. Anotar la fecha de renovación para no perder el dominio.
- **Cuentas de correo:** hoy en **capa gratuita, con tope de 5 cuentas**. Si se necesitan más, hay que pasar a un plan de pago (costo por revisar en Hostinger).
- **Conexión con otros vendors:** el dominio es el que se verifica en Resend para enviar correos desde `hello@decida.mx` y `billing@decida.mx` ([[correo-transaccional-resend]]), el que se agrega como *hostname* en Turnstile, y el que se apunta a Railway al publicar. Los registros DNS (SPF, DKIM, DMARC y el CNAME del dominio hacia Railway) se editan en el DNS de Hostinger.
- **Cuidado:** correo corporativo (Hostinger) y envío transaccional (Resend) son cosas distintas. Si los registros SPF/DKIM de Resend se agregan en el dominio raíz pueden chocar con los de las cuentas de correo; por eso la guía de [[correo-transaccional-resend]] recomienda un subdominio dedicado como `mail.`.
- **Alternativa revisada:** su VPS (~US$17 a 24 al mes) se comparó como hosting de la app y se descartó para la beta (ver [[#Railway]]).

---

## Costos que este documento no cubre (a documentar)
- **Facturación (PAC o servicio de CFDI):** no hay proveedor ni costo, porque no se factura en la beta; ver [[../decisiones/facturacion-y-cfdi-despues-de-la-beta]].
- **Herramientas internas** (Notion, Linear) y el costo de ampliar las cuentas de correo más allá de 5.
- **Impuestos y facturación** (IVA sobre comisiones, CFDI): pendiente de revisar con asesoría contable y legal, está en la lista previa al lanzamiento.

## Ver también
[[seguridad-y-proteccion-de-costos]] · [[variables-de-entorno]] · [[pagos-con-stripe]] · [[correo-transaccional-resend]] · [[stack-tecnico]] · [[../producto/pricing-y-gtm]]
