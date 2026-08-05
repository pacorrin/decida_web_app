---
type: marca
tags: [decida, diseno, marca, ui]
updated: 2026-08-05
---

# Sistema de diseño — "Diagnóstico en Papel Blanco"

Fuente: `DESIGN.md` (repo, autoritativo — derivado del código ya construido, no de intención).

## North star creativo
Decida se ve como un informe limpio sobre blanco: tipografía clara, poco ruido, color solo cuando aporta juicio. Serio y profesional sin caer en formalismo frío; amigable sin parecer coach motivacional. Cada pantalla orienta hacia una decisión informada, no entretiene. Sin sombras ni "lift" decorativo — la profundidad viene de jerarquía tipográfica, bordes suaves y tintes mínimos.

Esto es la traducción visual directa de los valores de [[../vision-mision-valores]] (claridad, honestidad, prudencia) y del principio de producto "claridad sobre teatro" ([[../producto/principios-de-producto]]).

## Paleta (roles, no solo colores)
| Rol | Color | Uso |
|---|---|---|
| Verde Confianza | `#05422c` | Identidad, titulares, texto principal — la "tinta" del sistema |
| Coral Acción | `#ff7043` | **Única** acción primaria (CTA); su rareza es la señal de "haz esto ahora" |
| Azul Guía | `#6baed6` | Señales, tips, focus rings — nunca compite con el CTA |
| Papel Blanco | `#ffffff` | Fondo y superficies |
| Chart OK/Warn | `#81c784` / `#ffb74d` | Solo datos (semáforos), nunca decoración |

### Reglas nombradas (las que más importan para no romper el sistema)
- **The Ink vs Action Rule**: Verde = identidad/lectura; Coral = único CTA principal. No invertir roles.
- **The Signal, Not Spectacle Rule**: el color visualiza información (semáforos, foco, hints), nunca decora.
- **The Grounded Result Rule**: resultados y métricas se leen como juicio fundamentado, no como motivación vacía — conecta directo con [[../experiencia/reporte-de-resultado#Report Quality Rules]].
- **The Flat-By-Default Rule**: sin sombras decorativas, glows, gradientes ni glassmorphism.

## Tipografía
Una sola familia (Geist) para todo — jerarquía por peso y tamaño, no por cambio de familia. Mono (Geist Mono) reservado para números/IDs donde ayuda a escanear.

## Layout
Contenedores: marketing `max-w-6xl` · onboarding `max-w-2xl` · reporte `max-w-5xl`. Densidad media-baja. En formularios: una pregunta/grupo a la vez, coherente con el principio de onboarding "conversación, no encuesta pesada" ([[../experiencia/flujo-de-onboarding]]).

## Do's / Don'ts que más se rompen en productos similares (y aquí se prohíben explícitamente)
**No parecer**: fintech neon, SaaS dashboard genérico, startup púrpura, brochure bancaria fría, ni consultora de negocios pomposa. **No sonar** a coach motivacional ni a producto "inventado" — sin promesas vacías ni teatro visual.

Esto es la versión visual exacta de los guardrails de [[../framework/prompts-de-ia#Guardrails]] y de las "palabras a evitar" en [[../experiencia/landing-y-copy#Palabras a evitar]] — los tres sistemas (visual, copy, IA) protegen la misma promesa de marca desde ángulos distintos.

## Ver también
[[../vision-mision-valores]] · [[../producto/principios-de-producto]] · [[../experiencia/landing-y-copy]]
