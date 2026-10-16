---
type: arquitectura
tags: [decida, pagos, stripe, suscripcion]
updated: 2026-10-16
---

# Pagos con Stripe

Fuentes: `src/lib/stripe/`, `src/lib/subscription/` (`start.ts`, `stripe-checkout.ts`, `stripe-sync.ts`, `stripe-webhook.ts`, `stripe-mapping.ts`, `checkout-return.ts`), `src/app/api/stripe/webhook/route.ts`. Reglas de negocio en [[../producto/pricing-y-gtm]].

La suscripción de **$99 MXN/mes** se cobra con **Stripe Checkout alojado**. Si no hay `STRIPE_SECRET_KEY`, la app sigue con la suscripción **simulada** (desarrollo local y e2e). Con la clave puesta, el banner «Modo beta — pago simulado» desaparece.

## Flujo

1. «Suscribirme» (cuenta o paso de plan del onboarding) llama a `startSubscription(user, { returnTo })` (`src/lib/subscription/start.ts`), la única entrada.
2. Con Stripe: se crea o reutiliza el Customer (`users.user_stripe_customer_id`) y una Checkout Session `mode: subscription` en MXN. Usa `STRIPE_PRICE_ID` si existe; si no, `price_data` en línea (9900 centavos, mensual, producto «Decida — Suscripción»). Lleva `client_reference_id` y `metadata.user_id` (también en `subscription_data.metadata`). Redirige a `session.url`.
3. `success_url` = `/cuenta/suscripcion` o `/analizar/pago` con `?checkout=success&session_id={CHECKOUT_SESSION_ID}`; `cancel_url` = la misma pantalla con `?checkout=cancelled` (aviso discreto).
4. **Retorno robusto a webhook tardío:** al volver con `session_id`, la página (servidor) recupera la sesión por API, verifica que `metadata.user_id` es la cuenta y que está `complete` y pagada, y aplica la activación con la misma función del webhook. Si aún no se refleja, muestra «Pago recibido, activando…» y se refresca sola. En el onboarding, al activarse sigue al paso «perfil».
5. **Webhook** `POST /api/stripe/webhook` (runtime nodejs, sin sesión): verifica la firma con `STRIPE_WEBHOOK_SECRET` sobre el cuerpo crudo (`req.text()`); firma inválida → 400; error al procesar → 500 (Stripe reintenta, todo es idempotente); eventos desconocidos → 200.

## Eventos manejados

| Evento | Qué hace |
|---|---|
| `checkout.session.completed` | recupera la suscripción y la aplica a la cuenta |
| `customer.subscription.updated` / `.deleted` | aplica el estado de la suscripción |
| `invoice.paid` | aplica la suscripción y registra el pago en `payments` |
| `invoice.payment_failed` | aplica la suscripción (queda `past_due`) |

La cuenta se localiza por `user_stripe_customer_id` o, si no, por `metadata.user_id`.

## Mapeo de estados (`stripe-mapping.ts`, función pura)

| Stripe | Decida |
|---|---|
| `active` / `trialing` sin cancelar | `active` |
| `cancel_at_period_end: true` | `canceled`, `period_end` intacto (acceso hasta esa fecha) |
| `past_due` / `unpaid` / `paused` | `past_due` (sin acceso) |
| `canceled` / `incomplete_expired` / deleted | `canceled` con el `period_end` vigente |
| `incomplete` | sin cambios |

`period_end` = fin del periodo actual **en los items** de la suscripción (en la API 2026 ya no vive en la suscripción). Un evento de una suscripción vieja no pisa a la que hoy da acceso a la cuenta.

## Idempotencia

- Pagos: `payments` tiene `@@unique([paym_provider, paym_provider_payment_id])`; se guarda ahí el id de la factura (`in_…`) y el duplicado (Prisma `P2002`) se ignora.
- Activación: un `updateMany` condicional hace de cerrojo entre webhook y retorno; `subscription_activated` (PostHog) se emite una sola vez, cuando la cuenta pasa de sin acceso a con acceso.
- Nota: el pago de la primera factura lo registra el webhook `invoice.paid`; si el retorno de Checkout llega antes, la cuenta ya está activa pero la fila de `payments` aparece cuando llega el webhook.

## Cancelar y reactivar

Si `user_subscription_provider = 'stripe'`: cancelar llama `subscriptions.update(sub, { cancel_at_period_end: true })` y actualiza el estado local; reactivar (dentro del periodo) usa `cancel_at_period_end: false`. Si Stripe falla, el estado local no cambia y se muestra un mensaje. Con proveedor `simulated`, todo igual que antes. Sin reembolsos ni prorrateo. «Administrar método de pago» abre el Customer Portal (`src/lib/stripe/portal.ts`; hay que activarlo en el Dashboard).

## Variables de entorno

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (opcional). Sin valores en `.env.example`; los reales van en `.env` y en Railway.

## Guía paso a paso (lo que te toca a ti)

1. Crea una cuenta en stripe.com (no necesitas activar el modo live todavía).
2. En el Dashboard, deja activado **modo de prueba** (Test mode).
3. **Developers → API keys**: copia la clave secreta `sk_test_…` a `STRIPE_SECRET_KEY` en tu `.env`.
4. (Opcional) crea el producto «Decida — Suscripción» con precio recurrente 99 MXN/mes y pega su `price_…` en `STRIPE_PRICE_ID`. Sin él se usa un precio en línea.
5. Instala la CLI de Stripe y corre `stripe login`; luego `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Copia el `whsec_…` que imprime a `STRIPE_WEBHOOK_SECRET` y reinicia `pnpm dev`.
6. Prueba: entra a `/cuenta/suscripcion`, «Suscribirme», paga con la tarjeta `4242 4242 4242 4242` (fecha futura, CVC y código postal cualquiera). Debes volver con «Pago recibido» y ver la suscripción activa. Prueba también cancelar y reactivar, y `4000 0000 0000 0341` (el cobro de renovación falla) para ver `past_due`.
7. (Opcional) Customer Portal: Dashboard → Settings → Billing → Customer portal → activar.

### Producción (Railway)

1. Dashboard → Developers → Webhooks → **Add endpoint**: URL `https://<dominio-de-railway>/api/stripe/webhook`.
2. Eventos a suscribir: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
3. Copia el **Signing secret** del endpoint a `STRIPE_WEBHOOK_SECRET` en Railway; `STRIPE_SECRET_KEY` y (opcional) `STRIPE_PRICE_ID` también. `NEXT_PUBLIC_APP_URL` debe ser la URL pública (se usa para `success_url`/`cancel_url`).
4. **Cambio a modo live:** activa tu cuenta de Stripe (datos del negocio y cuenta bancaria), apaga Test mode, y repite: clave `sk_live_…`, precio en live si usas `STRIPE_PRICE_ID`, nuevo endpoint de webhook en live con su propio `whsec_…`. Los datos de test no pasan a live.

## Qué está probado y qué no

Probado con Vitest (SDK mockeado): mapeo de estados, firma inválida (400), idempotencia de pagos, activación una sola vez, cancelar/reactivar contra Stripe, y que sin clave se usa el flujo simulado. E2E simulado (`subscription-flow`) sigue pasando. **No probado contra Stripe real** (sin claves en el desarrollo): Checkout alojado, retorno con `session_id`, firma real del webhook, Customer Portal.

## Ver también
- [[../producto/pricing-y-gtm]]
- [[stack-tecnico]]
- [[modelo-de-datos]]
- [[../tareas/sprint-3]]

## Correos de cobro (2026-10-16)

Quién manda qué cuando hay cobro real (solo en modo Stripe; en modo simulado no se manda nada, porque no hubo pago):

| Momento | Quién | Detalle |
|---|---|---|
| Recibo / factura de cada cobro | **Stripe** | Se activa en el Dashboard: Settings → Customer emails → «Successful payments». En modo test Stripe no los envía a clientes; en live sí. |
| Suscripción activada | **Decida (Resend)** | Al pasar de «sin acceso» a «activa» (una sola vez, mismo cerrojo que `subscription_activated`). Dice monto y fecha de renovación. |
| Cancelación | **Decida (Resend)** | Desde `/cuenta` lo manda la acción `cancelSubscription` si ganó el cambio de estado; si se cancela en el Customer Portal o el Dashboard, lo manda `applyStripeSubscription` al ver `active → canceled`. El cerrojo evita duplicarlo. Dice hasta cuándo conserva el acceso. |
| Reactivación (2026-10-16) | **Decida (Resend)** | Una cancelada dentro de su periodo que se reactiva: dice que **no hubo cobro** y cuándo se renueva. Desde `/cuenta` lo manda `startSubscription` si ganó el cambio de estado (`updateMany` condicionado a `canceled`); si se reactiva en el Customer Portal, lo manda `applyStripeSubscription` al ver `canceled → active` con acceso vigente. Mismo cerrojo: no se duplica. |
| Cobro fallido | **Decida (Resend)** | Solo en el primer intento (`invoice.attempt_count === 1`), porque Stripe reintenta y emite el evento cada vez. |

- Remitente: variable `RESEND_BILLING_FROM_EMAIL` (por defecto `Decida <billing@decida.mx>`); los códigos de verificación siguen saliendo de `RESEND_FROM_EMAIL` (`hello@`). El buzón `billing@decida.mx` debe existir para recibir respuestas.
- Código: `src/lib/email/billing.ts` (`sendBillingEmail`, nunca lanza: un fallo de correo no hace que Stripe reintente el webhook), `src/lib/email/billing-templates.ts`, disparadores en `src/lib/subscription/stripe-sync.ts`, `stripe-webhook.ts` y `perfil/actions.ts`. Tests en `src/lib/email/__tests__/billing.test.ts` y `stripe-sync.test.ts`.
- No cubierto: aviso de renovación próxima (Stripe puede mandar recordatorios desde el Dashboard). Sin probar contra Stripe y Resend reales.
- Railway (S4-00): agregar `RESEND_BILLING_FROM_EMAIL` a las variables.

