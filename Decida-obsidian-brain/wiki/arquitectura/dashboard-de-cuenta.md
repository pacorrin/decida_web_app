---
type: arquitectura
tags: [decida, dashboard, ui, usuarios]
updated: 2026-08-05
---

# Dashboard de cuenta — navbar, sidebar y rutas

Implementado el 2026-08-05, el mismo día que [[modulo-de-usuarios-y-autenticacion]]. El usuario pidió rediseñar específicamente el **área autenticada** (`/cuenta`) con un navbar y sidebar tipo dashboard — dejando las páginas públicas (landing, registro, login, recuperar contraseña) exactamente como estaban. Fuentes: `src/app/cuenta/(dashboard)/`, `src/components/account/`, `src/components/ui/dropdown-menu.tsx`.

## Decisión de alcance: público vs. autenticado

Explícito desde el pedido: "Las páginas públicas se quedarán de momento con el mismo diseño." Esto obligó a resolver un problema de Next.js App Router — `/cuenta/registro`, `/cuenta/iniciar-sesion` y `/cuenta/recuperar` viven bajo el mismo prefijo `/cuenta` que el panel autenticado, pero deben conservar el header/footer de marketing (`SiteHeader`/`SiteFooter`), no el nuevo chrome de dashboard.

**Solución**: un [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups) `(dashboard)` — una carpeta entre paréntesis que Next.js ignora al construir la URL, pero que permite darle un `layout.tsx` propio solo a lo que está adentro.

```
src/app/cuenta/
├── actions.ts                          ← compartido, sin cambios de ubicación
├── registro/page.tsx                   ← SIN tocar, sigue con SiteHeader/SiteFooter
├── iniciar-sesion/page.tsx             ← SIN tocar
├── recuperar/page.tsx                  ← SIN tocar
└── (dashboard)/                        ← nuevo, solo esto lleva el chrome nuevo
    ├── layout.tsx                      ← navbar + sidebar, auth-gated
    ├── page.tsx                        ← "Análisis realizados" (antes: src/app/cuenta/page.tsx)
    ├── perfil/page.tsx                 ← nuevo
    └── evaluaciones/[id]/page.tsx      ← antes: src/app/cuenta/evaluaciones/[id]/page.tsx
```

`/cuenta` y `/cuenta/evaluaciones/[id]` mantienen exactamente las mismas URLs — el route group es invisible para el usuario y para cualquier link existente.

## Layout del dashboard (`(dashboard)/layout.tsx`)

Centraliza el guard de autenticación (antes cada página hacía su propio `if (!user) redirect(...)`): si no hay `getCurrentUser()`, redirige a login antes de renderizar nada del panel. Envuelve el contenido en `<DashboardNavbar>` + `<DashboardSidebar>` + `<main>`, sin `SiteFooter` (un dashboard no necesita el footer de marketing con links legales/redes).

## Navbar (`src/components/account/dashboard-navbar.tsx`)

Layout estándar confirmado con el usuario antes de construir (su mensaje original decía "marca a la derecha, usuario a la izquierda" — al revés del patrón que después confirmó que sí quería): **logo + "Decida" a la izquierda** (link a `/cuenta`), **dropdown de usuario a la derecha** con avatar genérico, nombre (o email si no hay nombre), y dos opciones únicamente:
- **Perfil** → `/cuenta/perfil`
- **Cerrar sesión** → dispara `logOut()` directamente desde el item del menú (sin formulario visible, vía `useTransition`, mismo patrón que ya usaba `AnalyzeAnotherButton`)

## Sidebar (`src/components/account/dashboard-sidebar.tsx`)

Un solo ítem hoy, a propósito: **"Análisis realizados"** → `/cuenta`, marcado activo también cuando la ruta empieza con `/cuenta/evaluaciones` (el detalle de un análisis es conceptualmente parte de la misma sección). Construido como lista de `NAV_ITEMS` para que agregar más opciones en el futuro sea trivial. Oculto en mobile (`hidden sm:block`) — con un solo ítem que además coincide con la página raíz del panel, no hay pérdida de funcionalidad en pantallas chicas.

## Página de perfil (`(dashboard)/perfil/page.tsx`)

Nueva, mínima a propósito (el usuario pidió "algo básico" para no dejar el link del dropdown roto): tarjeta de solo lectura con nombre, correo y teléfono de la cuenta. Sin edición todavía — eso queda abierto para cuando se decida qué more debe vivir ahí.

## Nuevo primitivo de UI: `dropdown-menu.tsx`

Primer uso de `@base-ui/react/menu` en el proyecto (hasta hoy solo se habían envuelto `button`, `dialog` [vía `sheet.tsx`], `select`, etc.). Sigue el mismo patrón que `sheet.tsx`: `data-slot` en cada parte, transiciones vía `data-starting-style`/`data-ending-style`, colores tomados de los tokens ya definidos en `globals.css` (`--popover`, `--popover-foreground`, `--border`, `--muted` — ya soportaban tema claro/oscuro, no hizo falta agregar nada). Reutilizable para cualquier dropdown futuro en el proyecto, no solo este.

## Verificado en navegador real

Login → navbar con marca a la izquierda y "Nueva Persona ⌄" a la derecha, sidebar con "Análisis realizados" resaltado → clic en el dropdown → aparecen "Perfil" y "Cerrar sesión" → clic en "Perfil" → tarjeta con nombre/correo/teléfono correctos, chrome del dashboard se mantiene → clic en "Cerrar sesión" desde el dropdown → redirige a `/cuenta/iniciar-sesion` (diseño público, sin cambios) → login de nuevo → clic en una tarjeta de "Análisis realizados" → el detalle completo del reporte se renderiza igual que antes, con el back-link ahora dice "Análisis realizados" en vez de "Mis evaluaciones". Confirmado también que `/cuenta/registro`, `/cuenta/iniciar-sesion` y `/cuenta/recuperar` siguen renderizando con `SiteHeader`/`SiteFooter` de marketing, sin ningún cambio visual. `tsc --noEmit` y `pnpm lint` limpios.

## Qué queda abierto
- El sidebar solo tiene un ítem — cuando el dashboard crezca (recibos, soporte, ver [[modulo-de-usuarios-y-autenticacion#Dashboard de historial en /cuenta (mismo día, adelantado de Sprint 2)]]), agregar entradas a `NAV_ITEMS` en `dashboard-sidebar.tsx`.
- Perfil es de solo lectura — no hay todavía forma de editar nombre/teléfono ni cambiar contraseña desde ahí (el cambio de contraseña solo existe hoy vía el flujo de "olvidé mi contraseña").
- Sidebar oculto en mobile — aceptable mientras solo tenga un ítem que coincide con la página raíz; revisar si se vuelve insuficiente cuando haya más de una sección.

## Ver también
[[modulo-de-usuarios-y-autenticacion]] · [[../marca/sistema-de-diseno]] · [[../decisiones/plan-lanzamiento-60-90-dias]]
