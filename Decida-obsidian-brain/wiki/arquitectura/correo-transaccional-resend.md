---
type: arquitectura
tags: [decida, correo, resend, dns, beta, s3-09]
updated: 2026-10-14
---

# Correo transaccional con Resend (dominio propio)

Fuentes: `src/lib/email/resend.ts`, `src/lib/email/templates.ts`, `src/app/cuenta/actions.ts`, `.env.example`, [[modulo-de-usuarios-y-autenticacion#Pendiente que no es código]]. Tarea: S3-09 en [[../tareas/sprint-3]].

## Por qué importa
Hoy el remitente es el de pruebas de Resend (`onboarding@resend.dev`), que **solo entrega al correo con el que se creó la cuenta de Resend**. Cualquier otro destinatario recibe `403/422`. Mientras no se verifique un dominio propio, nadie más que el dueño puede registrarse ni recuperar contraseña. Bloquea la beta.

## Qué correos manda la app
Solo hay dos puntos de envío (ambos en `src/app/cuenta/actions.ts`, plantilla `verificationCodeEmail`):

| Correo | Cuándo | Asunto |
|---|---|---|
| Código de verificación de registro | `signUp` en `/cuenta/registro` | «Tu código de verificación — Decida» |
| Código de restablecer contraseña | `requestPasswordReset` en `/cuenta/recuperar` | «Restablece tu contraseña — Decida» |

El paso `contacto` del onboarding (`/analizar/contacto`) **no** manda correo: crea la cuenta ya verificada.

Remitente: variable `RESEND_FROM_EMAIL`; si falta, el código usa `Decida <onboarding@decida.app>`. **Brecha**: `decida.app` aparece en el sitio (`soporte@decida.app`), pero no hay fuente en el repo ni en el vault que confirme que el dominio es nuestro, así que el default no se cambió. Confirma que el dominio es tuyo antes de usarlo.

## Comportamiento actual (auditoría del 2026-10-14)
- **Sin `RESEND_API_KEY` en desarrollo**: el correo completo (con el código) se imprime en la consola del servidor. Sirve para probar sin Resend.
- **Sin `RESEND_API_KEY` en producción** (`NODE_ENV=production`): `sendEmail` lanza `RESEND_API_KEY no está configurado...`.
- **Resend rechaza el envío** (dominio sin verificar, destinatario no permitido): `sendEmail` lanza `No se pudo enviar el correo: <mensaje de Resend>`. Desde S3-09 además deja en el log del servidor una línea `[email] Resend rechazó el envío (...)` con el nombre del error, el HTTP, el dominio remitente y la pista de qué revisar.
- **Qué ve el usuario**:
  - Registro (`signUp`): el `sendEmail` **no** está en un `try/catch`, así que el error se propaga y el usuario ve el error genérico de Next.js, no un mensaje comprensible. La cuenta ya quedó creada sin verificar; reintentar el registro con el mismo correo es seguro (sobrescribe la contraseña).
  - Recuperar contraseña: el error se captura y se registra a propósito (para no filtrar qué cuentas existen); el usuario ve el mensaje genérico «si el correo tiene una cuenta...» aunque el correo nunca haya salido.
  - Pendiente opcional (no hecho, cambia el flujo de auth): capturar el fallo en `signUp` y mostrar «No pudimos enviar el código, inténtalo de nuevo» en el formulario.

## Checklist para ti (lo haces tú; no requiere código)
1. **Elige el dominio.** Recomendado: un subdominio como `mail.<tu-dominio>` (por ejemplo `mail.decida.app` si el dominio es tuyo). Así los registros SPF/DKIM de Resend no chocan con el correo normal del dominio raíz (Google Workspace, etc.) y la reputación del envío transaccional queda aislada.
2. **Agrégalo en Resend**: [resend.com/domains](https://resend.com/domains) → Add Domain → escribe el subdominio. Elige la región más cercana a tus usuarios.
3. **Copia los registros DNS que Resend te muestre** (SPF, DKIM y los que indique) a tu registrador, exactamente como aparecen: tipo, nombre y valor. No inventes ni retoques valores; si el registrador añade solo el subdominio al nombre, no lo repitas. Opcional pero recomendado: añade un registro DMARC (`_dmarc`) con política `p=none` para empezar; Resend explica el formato en su documentación.
4. **Espera la verificación**: pulsa Verify en Resend. Puede tardar de minutos a horas. El dominio debe quedar en estado **Verified**.
5. **Crea una API key de envío para producción**: Resend → API Keys → Create, permiso *Sending access*, limitada a ese dominio. Guárdala solo en variables de entorno, nunca en el repo ni en el vault.
6. **Define el remitente**: `RESEND_FROM_EMAIL="Decida <hello@tu-dominio.com>"` (formato `Nombre <dirección@dominio-verificado>`; el dominio debe ser el verificado).
7. **Configura las variables**:
   - Local: en `.env` (gitignored) pon `RESEND_API_KEY` y `RESEND_FROM_EMAIL`, y reinicia `pnpm dev`.
   - Railway: las mismas dos variables en el servicio de la app (ver nota de S4-00 abajo).

## Cómo probar que funcionó
1. Con las variables en `.env`, abre `/cuenta/registro` y registra una cuenta con **un correo distinto al de tu cuenta de Resend** (por ejemplo otro Gmail tuyo o el de una persona de confianza).
2. Debe llegar el correo «Tu código de verificación — Decida» (revisa spam). Ingresa el código y confirma que la cuenta se crea.
3. Revisa resend.com → **Emails**: el envío debe aparecer como *Delivered*. Si aparece *Bounced* o *Complained*, el problema es del destinatario o de reputación, no de la app.
4. Repite con `/cuenta/recuperar` para el correo de restablecer contraseña.
5. Criterio de S3-09: una cuenta con un correo que no es el tuyo recibe el código.

## Errores típicos y cómo se ven
| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Log del servidor: `Resend rechazó el envío (...HTTP 403...)` y mensaje de «domain is not verified» | El dominio del remitente no está verificado, o `RESEND_FROM_EMAIL` usa otro dominio | Revisa el estado en resend.com/domains y que el dominio de `RESEND_FROM_EMAIL` sea ese |
| `403/422` con «You can only send testing emails to your own email address» | Sigues usando `onboarding@resend.dev` | Pasos 1-6 de arriba |
| `RESEND_API_KEY no está configurado` | Falta la variable (en producción es obligatoria) | Define la key en el entorno y reinicia/redespliega |
| `401` / «API key is invalid» | Key mal copiada, revocada o de otra cuenta | Crea una nueva y reemplázala |
| El registro muestra el error genérico de Next.js | Falló el envío en `signUp` (ver arriba) | Mira el log del servidor, que ahora trae la causa |
| Llega a spam o no llega, Resend dice *Delivered* | SPF/DKIM/DMARC incompletos o dominio nuevo sin reputación | Confirma los tres registros en Resend y usa el subdominio dedicado; pide a los testers marcar «no es spam» |

## Nota para S4-00 (despliegue en Railway)
El despliegue necesitará exactamente las mismas variables en el servicio: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (además de `DATABASE_URL`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`). En producción, sin la key el registro falla a propósito. Haz esta guía antes de invitar usuarios a la beta.

## Ver también
- [[modulo-de-usuarios-y-autenticacion]]
- [[stack-tecnico]]
- [[../tareas/sprint-3]]
- [[../tareas/tablero]]
