---
type: arquitectura
tags: [decida, seguridad, captcha, verificacion, costos, beta, turnstile]
updated: 2026-10-29
---

# Seguridad y protección de costos (preparación de la beta)

Fuentes (código real): `src/lib/auth/verification.ts`, `src/lib/auth/pending-verification.ts`, `src/lib/auth/signup-code.ts`, `src/lib/auth/password-strength.ts`, `src/lib/captcha/turnstile.ts`, `src/lib/onboarding/guard.ts`, `src/app/cuenta/verification-actions.ts`, `src/app/cuenta/actions.ts`, `src/app/analizar/actions.ts`, `src/components/auth/`, `prisma/migrations/20261030000000_verification_attempts`, `e2e/verificacion-correo.spec.ts`.

## Por qué se hizo
Antes de la beta cada cuenta nueva quedaba verificada **al instante y sin correo**, y cada vista previa gratuita cuesta ~US$0.04 de OpenAI ([[vendors-y-costos#OpenAI]]). Un bot podía crear cuentas en masa y gastar el saldo de OpenAI. El objetivo fue cerrar ese hueco sin añadir fricción a personas reales: **sin correo confirmado no hay sesión, y sin sesión no se llama a OpenAI**.

## Qué cambió

### 1. Verificación de correo con código, en una pantalla aparte
- `/analizar/contacto` y `/cuenta/registro` **ya no abren sesión**: crean (o reclaman) la cuenta sin verificar, mandan un código de 6 dígitos y redirigen a **`/analizar/verificar`** o **`/cuenta/registro/verificar`**.
- Solo al confirmar el código (`verifyEmailCode`) se marca el correo como verificado, se abre la sesión y se avanza. Es el **único punto** para los dos flujos.
- El correo pendiente viaja en una **cookie `httpOnly`** (`decida_pending_email`, 1 hora), no en la URL, y se muestra enmascarado (`ab***@gmail.com`). Sin esa cookie las pantallas de verificación redirigen al formulario.
- El análisis del onboarding se guarda **sin dueño** (`asmt_user_id = null`) y se liga a la cuenta al confirmar, solo si `asmt_email` coincide con el correo verificado.
- La pantalla ofrece **Reenviar código** y **Usar otro correo**.

> ⚠️ **Brecha confirmada (2026-10-29)**: [[modulo-de-usuarios-y-autenticacion#Integración con el onboarding (mismo día)]] documenta que el contacto marcaba la cuenta verificada «sin pedir código». Eso quedó **reemplazado** por este flujo. Ver [[../decisiones/evolucion-del-producto#15. Verificación de correo obligatoria antes de la sesión (2026-10-29)]].

### 2. Hueco cerrado: saltarse la pantalla escribiendo la URL
En la primera prueba en navegador, ir directo a `/analizar/idea` cargaba la página sin verificar, porque la guarda de pasos solo miraba la cookie del análisis. Ahora `requireVerifiedOwner` (`src/lib/onboarding/guard.ts`) exige **sesión verificada y que el análisis sea de esa cuenta**. La usan `enforceStepAccess` (páginas) y `requireAssessment` (todas las server actions del onboarding, incluidas las que cuestan dinero: idea, evaluación y generación del reporte). Si se dejó la verificación a medias, redirige a `/analizar/verificar`; si no, al contacto.

### 3. Los códigos ya no se pueden adivinar por fuerza bruta
Eran 6 dígitos sin límite de intentos. Ahora cada código se invalida tras **5 intentos fallidos** (`MAX_AUTH_CODE_ATTEMPTS`, columna `vc_attempts`; migración `20261030000000_verification_attempts`). Los límites que ya existían se mantienen: **3 códigos por hora por correo** y caducidad de **15 minutos**. Aplica también al código de restablecer contraseña.

### 4. Captcha: Cloudflare Turnstile
- Widget en `/analizar/contacto` y `/cuenta/registro` (tema claro, ancho flexible). Se implementó sin dependencias nuevas: carga el script oficial y deja el token en un campo oculto.
- El **servidor valida el token** (`verifyTurnstile`) antes de crear la cuenta o enviar el código, mandando también la IP. **Falla cerrado**: sin token, con respuesta negativa, si Cloudflare no responde o si falta `TURNSTILE_SECRET_KEY` en producción, el formulario no se procesa.
- `TURNSTILE_DISABLED=true` lo apaga **solo fuera de producción** (desarrollo y e2e); en producción se ignora. Variables en [[variables-de-entorno]].
- Modo **Managed**: casi nadie ve un reto. En un navegador automatizado sí pide marcar la casilla (un agente no debe resolverlo).

### 5. Login con cuenta sin verificar
Con la contraseña correcta y el correo sin confirmar, el login manda un código nuevo y lleva a `/cuenta/registro/verificar`. Con contraseña incorrecta sigue diciendo «Correo o contraseña incorrectos», sin revelar que la cuenta existe.

### 6. Barra de seguridad de la contraseña
En los dos formularios que crean cuentas (`PasswordField`, `src/lib/auth/password-strength.ts`): 4 niveles (débil, regular, buena, fuerte) con sugerencia de qué mejorar. Es solo una guía; el servidor sigue exigiendo 8 caracteres. Heurística propia, sin librería (no detecta todos los patrones que sí detectaría `zxcvbn`).

### 7. Endurecimientos menores
- `getCurrentUser` ya no truena si la cookie apunta a una sesión que no existe (antes intentaba borrar la cookie durante el render y Next lo prohíbe).
- Si el envío del código falla, el formulario muestra un mensaje comprensible en vez del error genérico (resuelve el pendiente anotado en [[correo-transaccional-resend]]).

## Correos relacionados
Código de verificación, **bienvenida** (se manda una sola vez, al primer correo confirmado, desde `verifyEmailCode`) y cobros llevan ahora el **logo** (PNG en `public/email/logo.png`, por URL absoluta; los clientes de correo bloquean SVG y base64). Detalle en [[correo-transaccional-resend]].

## Pruebas
- Vitest: intentos de código, validación de Turnstile (incluido que `TURNSTILE_DISABLED` no apaga nada en producción), fuerza de contraseña, correos. **346 tests** al cierre.
- Playwright (`e2e/verificacion-correo.spec.ts`): no se avanza sin código ni saltándose la URL; 5 intentos invalidan el código; el registro entra a `/cuenta`; el login sin verificar lleva a verificar. Los e2e del onboarding usan `confirmarCodigo` (`e2e/flow.ts`), que lee el código de la base de datos.
- `sendEmail` omite los correos a dominios `.test` (reservado, nunca entrega): los e2e no gastan envíos de Resend. Si se reutiliza un `pnpm dev` ya abierto para e2e, hay que arrancarlo con `TURNSTILE_DISABLED=true`.
- Lo que **no** se pudo probar automáticamente: resolver la casilla real de Turnstile (la probó el usuario a mano).

## Aviso cuando la IA falla (Sentry)
Si un modelo de OpenAI falla, el reporte **sigue con un respaldo** (interpretación determinística, revisión omitida, etc.) y nadie ve un error: así pasó con `o4-mini`, dado de baja por OpenAI, y los reportes salieron degradados sin que nadie lo notara. Ahora cada respaldo se reporta a Sentry (`logReportGenerationError` con `aiFallback`, `src/lib/logging/report-logger.ts`):
- **Etiquetas:** `ai_fallback` (la función que falló), `ai_error` (tipo de error, p. ej. `http-404`, `http-401`, `http-429`, `SyntaxError`, `ZodError`) y `ai_model` (el modelo usado).
- **Funciones cubiertas:** `scoring_interpretation` (razonamiento, antes **sin ningún log**), `report_review`, `report_review_rewrite`, `strengths_risks`, `validation_plan`, `research` y `target_market` (antes también mudo).
- **Agrupación:** una incidencia por función y tipo de error, no una por reporte. Un modelo dado de baja es **una sola incidencia** que se repite, y se nota de inmediato.
- Los errores de generación que no son un respaldo conservan su etiqueta `area:report-generation`.
- **Regla de alerta creada (2026-10-29)** en Sentry (org `atino`, proyecto `javascript-nextjs`): «La IA cayó a un respaldo (ai_fallback)», id `6261497` ([abrir](https://atino.sentry.io/monitors/alerts/6261497/)). Manda **correo** (mismos destinatarios que la regla de prioridad alta: dueños de la incidencia, o miembros activos) cuando aparece una incidencia **nueva** o que **reaparece** con la etiqueta `ai_fallback`, con un mínimo de 30 minutos entre avisos.
- **Cómo se comporta:** como las incidencias se agrupan por función y tipo de error, llega **un correo por cada tipo de problema nuevo**, no uno por reporte. Si un modelo se da de baja, el aviso llega con el primer reporte afectado y no se repite por cada uno de los siguientes.
- **Sin DSN no hay aviso:** `SENTRY_DSN` debe estar configurado en Railway; en local sin DSN Sentry no envía nada. El envío real a Sentry no se probó en local, solo con pruebas automáticas.

## Datos financieros de Cifra (2026-10-30)
Son los datos más sensibles de la plataforma. Cada consulta filtra por el usuario de la sesión, no se mandan montos ni nombres a PostHog, no se registran en logs, se pueden borrar en cualquier momento y están declarados en la política de privacidad. Falta cifrado adicional en reposo, borrado de cuenta, exportación y revisión legal. Detalle en [[cifra-finanzas-personales]].

## Qué sigue protegiendo poco (pendiente)
| Riesgo | Estado |
|---|---|
| **Límite mensual de gasto y alertas en OpenAI** | Pendiente, lo hace el usuario en el panel de OpenAI antes de publicar. Es la red de seguridad final. |
| **Límite por IP** | No existe. El freno actual es por correo (3 códigos/hora) más el captcha. Alguien con muchos correos reales sí podría crear cuentas; cada una gasta ~US$0.04 solo si además confirma el correo. |
| **Captcha en el login y en «Reenviar código»** | No. Reenviar está limitado a 3 por hora por correo; el login con cuenta sin verificar exige la contraseña correcta. |
| **Alerta de Sentry cuando la IA cae a su respaldo** | **Código hecho (2026-10-29)**: cada respaldo se reporta a Sentry con la etiqueta `ai_fallback`. Regla de alerta ya creada en Sentry (ver [[#Aviso cuando la IA falla (Sentry)]]). |
| **Agotar el envío de correos** | La capa gratuita de Resend permite 100 correos al día; cada registro manda 2 (código y bienvenida), así que ~50 registros al día. Ver [[vendors-y-costos#Resend]]. |
| **Despliegue** | Correr `pnpm db:deploy` en producción **antes** de la versión nueva (la migración `vc_attempts` es obligatoria) y cargar las claves de Turnstile con el dominio de Railway en sus hostnames. |

## Ver también
[[modulo-de-usuarios-y-autenticacion]] · [[correo-transaccional-resend]] · [[variables-de-entorno]] · [[vendors-y-costos]] · [[manejo-de-errores-y-reembolsos]]
