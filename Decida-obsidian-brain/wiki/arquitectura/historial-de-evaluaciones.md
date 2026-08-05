---
type: arquitectura
tags: [decida, historial, non-goal-superado]
updated: 2026-08-05
---

# Historial de evaluaciones (`/mis-evaluaciones`)

Fuentes: `prisma/schema.prisma` (modelos `verification_codes`, `history_sessions`) · estructura de rutas `src/app/mis-evaluaciones/`

## Por qué esta página existe en el wiki
Esta feature es el ejemplo más claro de un **non-goal explícito de Notion que fue superado** en producción. La página 01 (PRD) y la página 09 (Backlog) de Notion listan "historial de evaluaciones" como fuera de alcance V1 — colocado en "Future SaaS" junto con cuentas de usuario, portafolio de ideas, y suscripciones. Sin embargo, ya existe implementado.

## Cómo funciona (inferido del esquema, a confirmar leyendo el código de rutas en detalle)
- **Sin contraseñas** — el modelo `verification_codes` (`vc_identifier`, `vc_method: email`, `vc_purpose: history_access`, `vc_code`, expiración) sugiere un flujo de "magic code por email": el usuario pide acceso con su correo, recibe un código temporal, lo confirma.
- **`history_sessions`** (`hses_email`, `hses_token`, expiración) — una vez verificado, se emite un token de sesión temporal para listar y reabrir sus assessments completados, sin necesidad de una cuenta con contraseña.
- Rutas: `/mis-evaluaciones` (lista) y `/mis-evaluaciones/[id]` (detalle de una evaluación).

Esto es un login **ligero** — no contradice del todo el non-goal "sin login completo" del PRD (no hay contraseñas, roles, ni perfil de usuario tradicional), pero sí contradice explícitamente "sin historial de evaluaciones".

## Por qué probablemente se construyó
Conecta directamente con el nivel 2 de éxito de producto definido en `PRODUCT.md`: *"el feedback es lo bastante valioso como para que el usuario pague de nuevo por comparar otra idea."* Sin un mecanismo de identidad (aunque sea ligero, por email), no habría forma de que un usuario recurrente reencuentre sus evaluaciones anteriores para comparar. Es una apuesta de retención, no solo de conveniencia.

## Pregunta abierta para el usuario
¿Esta feature se construyó en respuesta a feedback real de los primeros usuarios pagados, o fue una decisión de producto anticipada sin evidencia aún? No hay fuente (ni Notion ni docs del repo) que documente el "por qué" de esta decisión — buena candidata para la primera minuta de reunión que se ingiera a este cerebro. Ver [[../reuniones/minutas]].

## Ver también
[[../decisiones/evolucion-del-producto]] · [[modelo-de-datos]] · [[../producto/prd#Non-goals]]
