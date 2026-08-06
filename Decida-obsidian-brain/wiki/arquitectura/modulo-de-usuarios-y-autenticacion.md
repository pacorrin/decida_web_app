---
type: arquitectura
tags: [decida, usuarios, autenticacion, sprint-1, onboarding]
updated: 2026-08-05
---

# Módulo de usuarios y autenticación

Implementado el 2026-08-05, Sprint 1 de [[../decisiones/plan-lanzamiento-60-90-dias]] — arrancó el mismo día en que se cerró el plan, 5 días antes de la fecha de referencia. Ampliado el mismo día con la integración al onboarding (ver [[#Integración con el onboarding (mismo día)]]), que adelanta parte del alcance que este documento originalmente asignaba a Sprint 2. Fuentes: código real en `prisma/schema.prisma`, `src/lib/auth/`, `src/lib/email/`, `src/lib/onboarding/for-user.ts`, `src/app/cuenta/`, `src/app/analizar/`, `src/components/auth/`.

## Por qué existe
Hasta este sprint, la única identidad de usuario en el producto era el mecanismo passwordless de `/mis-evaluaciones` (`verification_codes` + `history_sessions`), y ese mecanismo estaba **roto en producción** — generaba códigos pero nunca los enviaba por no existir ninguna librería de email en el repo (ver [[historial-de-evaluaciones#Brecha confirmada]]). El usuario decidió priorizar una cuenta real (email + contraseña) sobre el pago real, para poder guardar evaluaciones, recibos y soporte a futuro. Ver la decisión completa en [[../decisiones/plan-lanzamiento-60-90-dias#Módulo de usuarios y cuentas]].

## Qué se construyó

### Esquema de datos (`prisma/schema.prisma`)
Dos modelos nuevos, agregados sin tocar los existentes:

```prisma
model users {
  user_id                String    @id @default(cuid())
  user_email             String    @unique
  user_password_hash     String
  user_name              String?
  user_phone             String?
  user_email_verified_at DateTime?
  user_created_at        DateTime  @default(now())
  user_updated_at        DateTime  @updatedAt
}

model user_sessions {
  usess_id         String   @id @default(cuid())
  usess_user_id    String
  usess_token      String   @unique
  usess_created_at DateTime @default(now())
  usess_expires_at DateTime
}
```

El enum `verification_purpose` se extendió de un solo valor (`history_access`) a tres: `history_access`, `signup_verification`, `password_reset`. **`verification_codes` se reutiliza, no se duplica** — los códigos de registro y de reset de contraseña viven en la misma tabla que ya existía, solo con un `purpose` distinto. Ver [[modelo-de-datos]] para el resto del esquema.

> Actualización (mismo día): `assessments` ahora **sí** tiene relación con `users` (`asmt_user_id`, `onDelete: SetNull`, indexado). Esta pieza estaba asignada a Sprint 2 en la primera versión de este documento; el usuario pidió adelantarla el mismo día al pedir que el onboarding detectara cuentas existentes. Ver [[#Integración con el onboarding (mismo día)]].

### Autenticación (`src/lib/auth/`)
- `password.ts` — hash y verificación con `bcryptjs` (12 rounds).
- `verification.ts` — genera/valida códigos de 6 dígitos, parametrizado por `purpose` (a diferencia de `src/lib/history/verification.ts`, que sigue existiendo tal cual y solo sirve a `history_access` — deliberadamente no se tocó ese archivo para no arriesgar el trabajo que le corresponde a Sprint 2).
- `users.ts` — `createUser`, `findUserByEmail`, `markEmailVerified`, `updateUserPassword`.
- `session-server.ts` — sesión por cookie httpOnly + token en `user_sessions`, mismo patrón que ya usaba `src/lib/history/session-server.ts` para el historial (token aleatorio de 32 bytes, cookie `decida_user_token`, expira a los 30 días).
- `schemas.ts` — validación Zod de registro, login, y reset.

### Email transaccional (`src/lib/email/`)
- `resend.ts` — usa el SDK de **Resend** si existe `RESEND_API_KEY`; si no, registra el correo completo en la consola del servidor. Mismo principio de "fallback determinístico" que ya usaba el proyecto para `OPENAI_API_KEY` (ver [[stack-tecnico]]). En producción (`NODE_ENV=production`) sin la key, lanza error en vez de fallar en silencio.
- `templates.ts` — plantilla HTML con estilos inline (código de verificación), usando los colores de marca de [[../marca/sistema-de-diseno]].

> Nota de diseño: los tamaños de fuente de esta plantilla están fuera del type ramp de `DESIGN.md` a propósito — el HTML de email no soporta la escala rem/CSS vars de la app. Confirmado con el usuario y registrado como excepción en `.impeccable/config.json` (regla `design-system-font-size`, alcance solo a este archivo).

### Rutas y UI (`src/app/cuenta/`, `src/components/auth/`)
| Ruta | Qué hace |
|---|---|
| `/cuenta/registro` | Nombre + email + contraseña → código de verificación por correo → confirma y crea sesión |
| `/cuenta/iniciar-sesion` | Email + contraseña → sesión |
| `/cuenta/recuperar` | Solicita código de reset (mensaje genérico, no revela si el email existe) → nueva contraseña |
| `/cuenta` | Panel protegido — redirige a `/cuenta/iniciar-sesion` si no hay sesión. Hoy solo saluda al usuario y ofrece "Analizar una idea" / "Cerrar sesión"; el historial real de evaluaciones es Sprint 2 |

Componentes en `src/components/auth/` (`SignUpForm`, `SignInForm`, `ResetPasswordForm`) siguen el mismo patrón de UI que el resto del onboarding: `useActionState` + `FieldGroup`/`Field`/`FieldError` de `src/components/ui/field.tsx`, consistente con [[../marca/sistema-de-diseno]].

## Verificado en navegador real (no solo compilación)
Registro → código capturado del log del servidor (sin `RESEND_API_KEY` configurado) → cuenta creada y sesión iniciada → logout → login con la misma contraseña → solicitar reset → código nuevo → contraseña actualizada → login con la contraseña vieja falla, login con la nueva funciona → acceso directo a `/cuenta` sin sesión redirige a login. `tsc --noEmit` y `pnpm lint` limpios en todos los archivos nuevos.

Verificado también (integración con onboarding, mismo día, contra la base de datos real, no solo la UI):
- Flujo 1: clic real en "Analizar una idea" desde `/cuenta` → aterriza directo en "Cuéntanos tu idea de negocio" (paso `idea`), `asmt_user_id` correctamente poblado. Navegar por 3 páginas con el CTA visible sin hacer clic → 0 assessments nuevos (antes del fix: 3).
- Flujo 2, correo con cuenta existente → mensaje + link a login con `next=/analizar` → login → retoma el onboarding automáticamente en `idea`, sin volver a pedir `contacto`.
- Flujo 2, correo nuevo → cuenta creada (`user_email_verified_at` poblado de inmediato), sesión iniciada, assessment creado con `asmt_user_id` correcto → aterriza en `idea`.

## Decisiones de diseño notables
- **Passwordless → password, pero sin descartar la infraestructura de códigos.** En vez de construir un sistema de verificación nuevo desde cero, se generalizó el patrón ya usado por `history_access` (tabla `verification_codes` parametrizada por `purpose`). Menor superficie nueva, mismo modelo mental para quien lea el código.
- **Reintentar registro con email no verificado sobreescribe la contraseña**, no crea un usuario duplicado — si alguien empieza el registro y no confirma el código, puede volver a intentarlo con el mismo email.
- **Mensajes de reset de contraseña son genéricos** ("si el correo tiene una cuenta...") para no filtrar qué emails están registrados.
- **`/cuenta` es la única ruta protegida hoy.** `/mis-evaluaciones` (el flujo passwordless viejo) sigue existiendo sin cambios — su migración a este sistema de cuentas es Sprint 2, no se tocó en este sprint para mantener el cambio acotado y revisable.

## Integración con el onboarding (mismo día)

El usuario notó, probando la primera versión, que entrar a `/cuenta` y darle a "Analizar una idea" volvía a pedir los datos que la cuenta ya tenía. Pidió dos flujos:

**Flujo 1 — usuario logueado nunca vuelve a ver el paso de contacto.** El botón "Analizar una idea" de `/cuenta` dispara el Server Action `startAssessmentForCurrentUser()` (`src/app/analizar/actions.ts`), que reutiliza `ensureAssessmentForCurrentUser()` (`src/lib/onboarding/for-user.ts`): si ya hay un assessment sin terminar ligado a esa cuenta, lo retoma; si no, crea uno nuevo prellenado con los datos del usuario y `asmt_user_id` puesto. `getResumeStep()` ya sabía saltarse `contacto` cuando `asmt_email` existe (lógica de antes de hoy, sin tocar) — solo hacía falta proveer esa cuenta con datos reales.

**Flujo 2 — el paso `contacto` (`/analizar/contacto`, "Empecemos con lo básico") ahora hace doble función.** `contactSchema` ganó un campo `password`. Al enviar el formulario, `saveContact` (`src/app/analizar/actions.ts`) revisa el correo:
- Si ya existe una cuenta verificada con ese correo → no se crea ni modifica nada; se muestra "Ya tienes una cuenta con este correo. Inicia sesión para continuar." con link a `/cuenta/iniciar-sesion?next=/analizar`. El login soporta un parámetro `next` (validado como ruta local, nunca una URL externa) para retomar el onboarding automáticamente después de autenticar.
- Si no existe cuenta (o existe pero nunca se verificó) → se crea/actualiza la cuenta con esa contraseña, se marca verificada de inmediato **sin pedir código** (mismo nivel de confianza que el flujo anónimo ya tenía con ese correo, ahora respaldado por una cuenta real en vez de un assessment desechable), se inicia sesión, y el assessment queda vinculado (`asmt_user_id`).

### 🔴 Bug encontrado y corregido en el camino: GET con efectos secundarios + prefetch de `<Link>`

El primer intento de Flujo 1 convirtió `/analizar` en un Route Handler que creaba el assessment y ponía la cookie directamente en el GET. Rompió de dos formas:
1. **Cookies no se pueden escribir durante el render de una página** en Next.js 16 (`Cookies can only be modified in a Server Action or Route Handler`) — afectaba a `enforceStepAccess` cuando se llamaba desde `/analizar/contacto` (un Server Component).
2. Incluso arreglado como Route Handler, **Next.js hace prefetch automático de cualquier `<Link>` visible en pantalla** — y el CTA "Analizar mi idea" está en el header de casi toda la app. Cada prefetch silencioso golpeaba el GET y creaba un assessment nuevo, sin que nadie hiciera clic. Se confirmó en la base de datos: navegar por 3 páginas con el CTA visible, sin tocarlo, generó 3 assessments huérfanos.

**Fix**: la mutación (crear assessment + cookie) vive **solo** en el Server Action `startAssessmentForCurrentUser()`, que únicamente se dispara con un clic real (`onClick` + `useTransition`, mismo patrón que `AnalyzeAnotherButton`/`StartNewFromHistoryButton` que ya existían en el código). `/analizar` volvió a ser una página de solo lectura (sin mutaciones, segura para prefetch). Para el caso borde de un usuario logueado que aterriza directo en `/analizar/contacto` (ej. un bookmark viejo), se agregó `AutoContinueForUser` — un componente cliente que dispara el mismo Server Action al montarse, sin escribir nada durante el render de la página.

**Lección para futuras rutas de este tipo**: cualquier entry-point que deba "crear algo si no existe" debe vivir en un Server Action o Route Handler invocado explícitamente, nunca en el cuerpo de una página ni en un Route Handler GET que pueda ser objetivo de un `<Link>` en el resto de la app.

## Qué falta (movido a Sprint 2, sigue pendiente)
- Migrar `/mis-evaluaciones` para que use `getCurrentUser()` en vez del flujo de `history_sessions`.
- Dashboard real de historial dentro de `/cuenta`.

Ver el detalle completo en [[../decisiones/plan-lanzamiento-60-90-dias#Sprint 2]] y [[../producto/gaps-onboarding-vs-framework]].

## Pendiente que no es código
Crear una cuenta real de Resend y configurar `RESEND_API_KEY` en el entorno de producción — sin eso, los correos de verificación y reset seguirán sin salir realmente, solo se ven en el log del servidor en desarrollo.

## Ver también
[[../decisiones/plan-lanzamiento-60-90-dias]] · [[historial-de-evaluaciones]] · [[modelo-de-datos]] · [[stack-tecnico]] · [[manejo-de-errores-y-reembolsos]]
