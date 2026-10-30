---
type: arquitectura
tags: [decida, analitica, posthog, eventos, embudos, privacidad]
updated: 2026-10-29
---

# Analítica y eventos (PostHog)

Fuentes: `src/lib/analytics/events.ts` (nombres de los eventos), `src/lib/analytics/server.ts` y `client.ts`, `src/instrumentation-client.ts`, `src/components/landing/cta-link.tsx`, `src/app/analizar/actions.ts`, `src/app/cuenta/`. Proveedor y costo: [[vendors-y-costos#PostHog]].

## Reglas de privacidad
- **Autocaptura y grabación de sesiones apagadas** a propósito: los formularios contienen la idea del usuario.
- **Nunca** se mandan correo, teléfono ni texto de la idea en las propiedades.
- `person_profiles: "identified_only"`: las visitas anónimas no crean persona; se unen a la cuenta al hacer `identify` con el id de la cuenta.
- Los nombres de los eventos son un contrato con los embudos del panel: no cambiarlos sin actualizarlo.

## Qué ya se medía sin eventos
Cada cambio de página manda `$pageview` con la URL, así que las visitas a cada pantalla (`/analizar/contacto`, `/idea`, `/pago`…) salen de la analítica web o de una tendencia por URL.

## Eventos (2026-10-29)
| Evento | Cuándo | Propiedades |
|---|---|---|
| `landing_viewed` | Se ve la landing | — |
| `cta_clicked` | Clic en un botón de la landing | `href`, **`location`** (`hero`, `header`, `header_mobile`, `final_cta`, `pricing_free`, `pricing_plans`, `ejemplo_page`, `example_section`, `report_header`, `header_login`, `header_mobile_login`, `hero_example`) |
| `signup_submitted` | Formulario válido y captcha aprobado | `source` (`registro` / `onboarding`) |
| `captcha_rejected` | Turnstile rechaza el envío | `source`, `reason` (`missing_token`, `rejected`, `unavailable`, `not_configured`) |
| `verification_code_sent` | Se envió el código al correo | `source` (`registro`, `onboarding`, `login`) |
| `verification_failed` | Código incorrecto, vencido o con intentos agotados | `source`, `reason` (`invalid_or_expired`, `attempts_exhausted`) |
| `verification_resent` | Pidió otro código | `source` |
| `account_created` | Correo confirmado | `source` |
| `onboarding_step_completed` | Terminó un paso, no solo lo vio | `step` (`contacto`, `idea`, `confirmacion`, `pago`, `perfil`, `ajuste`, `productos`); en `pago` también `choice` (`free` / `plan`) |
| `onboarding_completed` | Terminó el último paso (`evaluacion`) | — |
| `report_viewed` | Vio el reporte | — |
| `report_generation_failed` | Falló la generación | `stage` (`evaluation` / `retry`) |
| `cifra_item_created` | Agregó un saldo, deuda o gasto fijo | `type`, `kind` o `category` (**nunca montos ni nombres**) |
| `cifra_transaction_logged` | Registró un ingreso o egreso | `flow`, `category` |
| `cifra_payment_marked` | Marcó un pago como pagado | `type` (`debt` / `fixed`) |
| `cifra_data_deleted` | Borró todos sus datos de Cifra | — |
| `subscribe_clicked`, `subscription_activated`, `subscription_cancelled`, `credits_*`, `feedback_submitted`, `suggestion_sent`, `research_toggled`, `user_logged_in` | Ya existían | — |

## Cómo se envían
- **Con cuenta** (`trackServer`, `trackServerDeferred`): el id de distinto es el id de la cuenta. `trackServerDeferred` usa `after()` de Next para enviar **después de responder** y no retrasar la pantalla.
- **Sin cuenta** (`trackAnonymous`): toma el id anónimo de la cookie de PostHog del navegador (`ph_<clave>_posthog`), así el evento queda en la misma visita que las páginas vistas y se une a la cuenta al crearse. Si el navegador bloquea la cookie, no manda nada.
- En los e2e PostHog va apagado (sin clave).

## Embudos sugeridos en PostHog
1. **Alta:** `landing_viewed` → `cta_clicked` → `signup_submitted` → `verification_code_sent` → `account_created`. Para ver dónde se cae, desglosar por `source`.
2. **Análisis:** `onboarding_step_completed` por `step` → `onboarding_completed` → `report_viewed`.
3. **Pago:** `report_viewed` → `subscribe_clicked` → `subscription_activated`.
4. **Salud del registro:** tendencia de `captcha_rejected` y `verification_failed` por `reason` (picos = abuso o un problema de entrega de correo).
5. **Qué botón convierte:** `cta_clicked` desglosado por `location`.

## Pendiente
- Crear los embudos y paneles en PostHog (la conexión de PostHog no está autorizada en esta sesión; hacerlo a mano o autorizarla desde `/mcp`).
- **No se probó contra PostHog real** (los datos de prueba habrían ensuciado los embudos): tras desplegar, revisar en «Eventos en vivo» que lleguen `signup_submitted`, `onboarding_step_completed` y `cta_clicked` con `location`.
- Confirmar que el aviso de privacidad menciona la analítica.

## Ver también
[[vendors-y-costos]] · [[seguridad-y-proteccion-de-costos]] · [[../experiencia/flujo-de-onboarding]] · [[variables-de-entorno]]
