---
name: Decida
description: Diagnóstico de viabilidad claro y minimalista sobre papel blanco.
colors:
  verde-confianza: "#05422c"
  coral-accion: "#ff7043"
  azul-guia: "#6baed6"
  papel-blanco: "#ffffff"
  musgo-suave: "#f0f5f3"
  tinta-secundaria: "#3d5c50"
  cielo-tenue: "#e8f4fa"
  borde-suave: "#dce8e2"
  error: "#c62828"
  chart-ok: "#81c784"
  chart-warn: "#ffb74d"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.coral-accion}"
    textColor: "{colors.papel-blanco}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#e6653c"
    textColor: "{colors.papel-blanco}"
  button-secondary:
    backgroundColor: "{colors.verde-confianza}"
    textColor: "{colors.papel-blanco}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.papel-blanco}"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-secundaria}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.papel-blanco}"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.xl}"
    padding: "16px"
  option-card:
    backgroundColor: "{colors.papel-blanco}"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.lg}"
    padding: "12px"
  option-card-selected:
    backgroundColor: "#05422c0d"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.lg}"
    padding: "12px"
  input:
    backgroundColor: "{colors.papel-blanco}"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "40px"
  chip-signal:
    backgroundColor: "{colors.cielo-tenue}"
    textColor: "{colors.verde-confianza}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-secundaria}"
    typography: "{typography.label}"
---

# Design System: Decida

## Overview

**Creative North Star: "Diagnóstico en Papel Blanco"**

Decida se ve como un informe limpio sobre blanco: tipografía clara, poco ruido, y color solo cuando aporta juicio. La interfaz debe sentirse seria y profesional sin caer en formalismo frío; amigable sin parecer un coach motivacional. Cada pantalla debe orientar hacia una decisión informada, no entretener.

La profundidad no viene de sombras ni de “lift” decorativo, sino de jerarquía tipográfica, bordes suaves y tintes mínimos. El sistema es minimalista a propósito: lo que no ayuda a decidir no se muestra.

**Key Characteristics:**
- Papel blanco como lienzo; verde para identidad y texto
- Coral reservado a la acción principal (CTA)
- Azul guía para señales, hints y aclaraciones — nunca como hero
- Flat: borde + tono; sin sombras decorativas
- Claridad decisiva en botones y opciones
- Resultados que se sienten fundamentados, no inventados

## Colors

Paleta corta: tres voces de marca y neutros verdes-grises que mantienen el tono de diagnóstico, no de dashboard.

### Primary
- **Verde Confianza** (`#05422c`): Identidad, titulares, texto principal, bordes de selección, navegación de marca. Es la “tinta” del sistema.

### Secondary
- **Coral Acción** (`#ff7043`): Única acción primaria (CTA de marketing y continuar crítico). Su rareza es la señal de “haz esto ahora”.

### Tertiary
- **Azul Guía** (`#6baed6`): Señales, tips, iconos de apoyo, anillos de foco, acentos informativos. Nunca compite con el CTA.

### Neutral
- **Papel Blanco** (`#ffffff`): Fondo y superficies.
- **Musgo Suave** (`#f0f5f3`): Secciones muted / footers de card.
- **Tinta Secundaria** (`#3d5c50`): Body muted, labels secundarios.
- **Cielo Tenue** (`#e8f4fa`): Fondos accent / callouts suaves.
- **Borde Suave** (`#dce8e2`): Bordes e inputs.
- **Error** (`#c62828`): Validación y estados destructivos.
- **Chart OK / Warn** (`#81c784` / `#ffb74d`): Solo datos, no decoración.

### Named Rules
**The Ink vs Action Rule.** Verde Confianza es identidad y lectura; Coral Acción es el único CTA principal. No invertir roles.

**The Signal, Not Spectacle Rule.** El color visualiza información (semáforos, foco, hints). Nunca decora ni distrae.

**The Grounded Result Rule.** Los resultados y métricas deben leerse como juicio fundamentado — tipografía clara, contexto breve (tooltip o nota) cuando haga falta — no como motivación vacía.

## Typography

**Display / Body Font:** Geist (ui-sans-serif, system-ui)
**Mono Font:** Geist Mono (métricas, código, identificadores)

**Character:** Una sola familia para todo: limpia, moderna y legible. Sin serif “consultora”, sin display ornamental. La jerarquía se logra con peso y tamaño, no con cambios de familia.

### Hierarchy
- **Display** (600, `clamp(1.875rem, 4vw, 3rem)`, ~1.15): Héroes y preguntas de paso. Máximo una por viewport.
- **Headline** (600, ~1.5rem, 1.25): Títulos de sección / paso.
- **Title** (600, ~1.125rem, 1.35): Subsecciones de formulario y cards.
- **Body** (400, 1rem, 1.625): Lectura principal; preferir líneas cómodas (~60–75ch en prose).
- **Label** (500, 0.875rem, 1.4): Labels de campo, metadatos, nav.
- **Mono** (400, 0.875rem): Números/IDs cuando el mono ayuda a escanear.

### Named Rules
**The Title Leads the Decision Rule.** Títulos y subtítulos guían el flujo de lectura y la decisión; el cuerpo aclara, no compite.

**The Legibility Floor Rule.** Tamaños mínimos cómodos en móvil y desktop; antialiasing activo; nunca texto tenue sobre tintes débiles que rompa contraste.

## Layout

Contenedores observados: marketing ~`max-w-6xl`; onboarding ~`max-w-2xl`; reporte ~`max-w-5xl`. Ritmo vertical generoso en landing (`py-16`/`md:py-24`), más contenido en diagnóstico. Espaciado base 4/8/16/24/32/48.

Densidad: **media-baja** — aire suficiente para respirar, sin sensación de brochure vacía. En formularios, una pregunta/grupo a la vez con `FieldSet` + leyendas claras.

Responsive: stack en móvil; CTAs de ancho completo en sm, auto en desktop; grid de 2 columnas en hero grande.

### Named Rules
**The One Job Per Band Rule.** Cada bloque tiene un propósito (explicar, preguntar, decidir). No mezclar prueba social inventada ni clutter en el mismo band.

## Elevation & Depth

Sistema **plano (flat)**. Sin sombras decorativas. La profundidad se comunica con:
1. Peso y tamaño tipográfico
2. Borde suave (`borde-suave` / `ring` muy ligero solo si el componente lo requiere estructuralmente)
3. Tintes (`musgo-suave`, `cielo-tenue`, `primary/5` en selección)

Si el código legado aún aplica `shadow-lg` en algún preview, tratarlo como deuda: nuevas superficies no añaden sombra.

### Named Rules
**The Flat-By-Default Rule.** Superficies en reposo sin sombra. Destacar con tipografía y color, no con lift.

## Shapes

Radio base `--radius: 0.625rem` (10px). Escala: sm ~6px, md ~8px, lg ~10px, xl ~14px. Botones `rounded-lg`; cards `rounded-xl`; pills de fase pueden ser `rounded-full` con moderación.

Bordes: 1px `borde-suave` o `border-border/60–80`. Selección: borde `verde-confianza` + fondo `primary/5`. Sin geometría agresiva ni esquinas a 0.

### Named Rules
**The Soft Edge Rule.** Curvas suaves y consistentes; no mezclar sharp + pill en el mismo control set.

## Components

Carácter general: **claros y decisivos** — un control se entiende al instante.

### Buttons
- **Shape:** `rounded-lg` (~10px)
- **Primary (CTA):** Coral Acción sobre blanco de texto; `min-h-11` en CTAs de marketing/onboarding; padding cómodo
- **Brand / default shadcn:** Verde Confianza para acciones no-CTA (secundarias de producto)
- **Outline / Ghost:** Contorno o hover muted; texto en verde o tinta secundaria
- **Hover / Focus:** Oscurecer levemente el fill; focus-visible con ring `azul-guia` / `ring`
- **Motion:** Transiciones mínimas; respetar `prefers-reduced-motion`

### Option cards (selección de onboarding)
- **Style:** Borde suave, padding 12px, stack
- **Selected:** Borde primary + `bg-primary/5`
- **Feel:** Decisión evidente sin animación llamativa

### Cards / Containers
- **Corner:** `rounded-xl`
- **Background:** Papel Blanco
- **Border / ring:** Anillo o borde suave — no sombra
- **Internal padding:** ~16px (`spacing(4)`)

### Inputs / Fields
- **Style:** Fondo blanco, borde `borde-suave`, radio lg
- **Focus:** Ring azul guía
- **Error:** Borde/ring destructive

### Navigation
- Wordmark **Decida** en Verde Confianza, peso semibold
- Links muted → hover primary
- Onboarding: indicador de paso + progress delgado; fases como pills de texto, no chrome pesado

### Signal badges (reporte)
- Punto de color + label; verdes/amarillos/rojos solo como semáforo semántico
- Nunca usar coral como “éxito”

### Named Rules
**The Decisive Control Rule.** Opciones y CTAs deben leerse en <1s: un primary visible, estados selected inequívocos.

**The Quiet Motion Rule.** Animaciones mínimas y solo si aclaran dirección o estado; nada espectacular.

## Do's and Don'ts

### Do:
- **Do** usar Coral Acción solo para la acción principal de la pantalla.
- **Do** priorizar títulos/subtítulos que empujen a la siguiente decisión.
- **Do** explicar métricas del resultado con contexto breve (nota o tooltip) cuando el número no se explica solo.
- **Do** mantener contraste y tamaños legibles en móvil.
- **Do** dejar blanco respirar; el vacío es parte del diagnóstico.

### Don't:
- **Don't** añadir sombras, glows, gradientes decorativos o glassmorphism.
- **Don't** parecer fintech neon, SaaS dashboard genérico, startup púrpura, brochure bancaria fría, ni consultora de negocios pomposa.
- **Don't** sonar a coach motivacional ni a producto “inventado”: sin promesas vacías ni teatro visual.
- **Don't** usar color como adorno; si no informa, quítalo.
- **Don't** competir tipografías (no serif display, no mono para body).
