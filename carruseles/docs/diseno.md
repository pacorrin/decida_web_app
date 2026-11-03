# Diseño de carruseles Decida

Referencia visual y técnica para armar cada carrusel. **Cada serie debe verse distinta**, pero siempre dentro de la paleta y tipografía de marca.

## Regla de oro

1. Un carrusel = una identidad propia (fondo, jerarquía, composición, textura).
2. No reutilizar la plantilla del anterior: nuevo `builds/carrusel-NN.js` + `template/carrusel-NN.css`.
3. El JSON de `content/` es la fuente de verdad del texto (no inventar copy).
4. Un solo coral por slide (`[corchetes]`, total de calc, o botón CTA).
5. Formato fijo: 4:5 · 1080×1350 · márgenes ~90 px · Geist · logo `decida.mx`.

## Arquitectura

```
carruseles/
  content/carrusel-NN.json     ← copy exacto
  builds/carrusel-NN.js        ← HTML/estructura de ese carrusel
  template/carrusel-NN.css     ← identidad visual de ese carrusel
  lib/common.js                ← Playwright, fuentes, logo, íconos
  output/carrusel-NN/slide-*.png
```

```bash
pnpm build:01   # node builds/carrusel-01.js carrusel-01
pnpm build:02   # node builds/carrusel-02.js
pnpm build:03   # node builds/carrusel-03.js
pnpm build:04   # node builds/carrusel-04.js
pnpm build:05   # node builds/carrusel-05.js
pnpm build:06   # node builds/carrusel-06.js
```

Utilidades compartidas en `lib/common.js`: `escapeHtml`, `renderMarked`, `loadIconSvg`, `resolveLogoHtml({ theme })`, `renderCarousel`.

---

## Identidades publicadas (resumen)

| # | Nombre | Fondo | Texto | Acento coral | Textura | Firma de layout |
|---|--------|-------|-------|--------------|---------|-----------------|
| 01 | Papel blanco | Blanco | Verde | Palabra marcada / botón | Ninguna | Señal: título arriba + card de ícono abajo |
| 02 | Esmeralda | Verde `#05422c` | Blanco; títulos coral | Título (marcado en blanco) / botón | Cuadrícula blanca SVG + fade | Señal: ícono marca de agua (ghost) |
| 03 | Cuenta clara | Gradiente blanco → cielo | Verde | Número de paso / total / marcada | Puntos coral SVG + fade | Señal: número gigante + apoyo en tarjeta |
| 04 | Marcador (Taste) | Blanco editorial | Verde | Coral acento unico por slide | Ninguna | 9 familias distintas: rail/stack/bleed + tiles/ladder/strip |
| 05 | Corte neto | Musgo → papel | Verde | Regla / total / marcada / botón | Líneas de ledger | Signal: panel + franja; compare apilado |
| 06 | Marco (Taste) | Cielo full + ventana blanca | Verde | Disco / marcada / botón | Vignette cielo | Inset marco; compares apilados |

No repetir la misma combinación fondo + textura + layout de un carrusel ya publicado.

---

## Carrusel 03 — Cuenta clara (detalle)

**Archivos:** `builds/carrusel-03.js` · `template/carrusel-03.css` · `content/carrusel-03.json`  
**Tema:** colchón financiero antes de renunciar · sensación de “cuenta / ledger” limpia.

### Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| `--fondo` | `#e8f4fa` | Extremo azul del gradiente de fondo |
| Blanco | `#ffffff` | Extremo claro del gradiente; tarjetas / pastillas |
| `--verde-confianza` | `#05422c` | Títulos, apoyo legible, íconos |
| `--tinta-secundaria` | `#3d5c50` | Texto secundario (filas de calc, etc.) |
| `--coral-accion` | `#ff7043` | Un acento por slide; puntos del patrón |
| `--azul-guia` | `#6baed6` | Etiquetas, hint “Desliza →” |
| `--margen` | `90px` | Padding del slide |

Logo en tema claro (`logoTheme: "light"`).

### Fondo y textura (todas las slides)

1. **Gradiente de lienzo** — misma dirección que la máscara del patrón:
   `linear-gradient(165deg, #ffffff 0%, #e8f4fa 100%)`
2. **Patrón SVG de puntos coral** — `::before` en `.slide`, celdas ~52×52, círculo `#ff7043`, `opacity: 0.4`.
3. **Máscara del patrón** — más visible arriba, se desvanece abajo (suave en la zona superior para no competir con logo/título):
   ```
   165deg → 0.45 → 0.28 → 0.08 → transparent
   ```
4. Contenido por encima: `.slide > * { position: relative; z-index: 1; }`

### Tipografía

- Familia: Geist (Regular 400 / SemiBold 600).
- Títulos: verde, semibold, `text-wrap: balance`; palabra en `[corchetes]` → coral.
- Etiquetas: azul guía.
- Apoyo de pasos: **legible a propósito** (no gris apagado): verde, semibold, en tarjeta blanca.

### Layout por tipo de slide

#### Cover (slide 1)

- Logo arriba.
- Etiqueta en **pastilla** blanca redondeada.
- Título grande anclado abajo (`margin-top: auto`).
- Pie: apoyo en **tarjeta blanca** + hint “Desliza →” a la derecha.
- Sin franja full-bleed (a diferencia del 01/02).

#### Signal / pasos (slides 2–5)

- Logo arriba.
- Cuerpo en dos columnas:
  - Izquierda: **número gigante** coral (`1`…`4`) — es el acento coral del slide.
  - Derecha: ícono chico + etiqueta → título → apoyo.
- Apoyo abajo en **tarjeta blanca** (44px, semibold, verde). No usar tinta secundaria tenue aquí: debe invitar a leerse.
- Íconos lucide en stroke verde (`#05422c`), tamaño ~48–56 px.

#### Calc (slide 6)

- Logo, etiqueta corta (“Ejemplo”), título arriba.
- Tarjeta blanca tipo ledger: filas label/valor, separadores cielo.
- Fila total: borde superior verde; valor total en coral grande (único coral del slide).
- Sin nota de “cifras ilustrativas” en pantalla (el disclaimer vive en el pie de Instagram).

#### Text (slide 7)

- Logo arriba; bloque de lectura centrado en el eje vertical.
- Título con posible `[acento]` coral; apoyo en tinta secundaria / tamaño cómodo.

#### CTA (slide 8)

- Zona superior cielo/gradiente: logo, título, apoyo.
- Franja inferior **verde confianza**: botón coral + lema centrado en blanco suave.

### Decisiones de copy en pantalla (ajustes vs. docs)

- Etiqueta del calc: `Ejemplo` (no “Ejemplo ilustrativo”).
- Sin `nota` bajo la tarjeta del calc en el PNG.

### Qué no copiar en el 04+

- Mismo cielo + puntos coral + número gigante.
- Misma esmeralda + cuadrícula del 02.
- Mismo papel blanco + card de ícono del 01.

---

## Carrusel 04 - Marcador Taste (detalle)

**Archivos:** `builds/carrusel-04.js` · `template/carrusel-04.css` · `content/carrusel-04.json`  
**Dials:** VARIANCE 8 / MOTION 1 / DENSITY 3  
**Tema:** punto de equilibrio. Anti-plantilla: cada slide es una familia distinta.

### Familias de layout (9)

| Slide | Familia |
|-------|---------|
| 1 cover | editorial-type-dominant |
| 2 signal | solid-rail + copy |
| 3 calc | metric-tiles valor-primero |
| 4 signal | apoyo-first stack |
| 5 calc | ladder rows + total suave |
| 6 signal | bleed-bar + ghost icon |
| 7 calc | horizontal strip cells |
| 8 text | manifesto column |
| 9 cta | copy stack + action band |

### Paleta (theme lock light)

| Token | Hex |
|-------|-----|
| fondo | `#ffffff` |
| verde | `#05422c` |
| coral | `#ff7043` (unico acento) |
| azul | `#6baed6` |
| suave | `#f0f5f3` |
| radio | `16px` (shape lock) |

### Qué no copiar en el 05+

- Repetir rail/stack/bleed + tiles/ladder/strip como sistema.
- Combinaciones de 01-03 (ghost unico, numero gigante, ficha, ledger, puntos, grid).

Inventar otra **estructura**, no solo otro color.

---

## Carrusel 05 — Corte neto (detalle)

**Archivos:** `builds/carrusel-05.js` · `template/carrusel-05.css` · `content/carrusel-05.json`  
**Tema:** ingresos vs. utilidad · sensación de “corte” entre lo que entra y lo que queda.

### Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| `--fondo-musgo` | `#f0f5f3` | Extremo superior del fondo; tarjeta A |
| `--papel` | `#ffffff` | Extremo inferior; cards |
| `--verde-confianza` | `#05422c` | Títulos, franja moss, CTA band |
| `--coral-accion` | `#ff7043` | Un acento por slide |
| `--azul-guia` | `#6baed6` | Etiquetas; franja sky |
| `--cielo-tenue` | `#e8f4fa` | Tarjeta B compare |
| `--radio` | `20px` | Shape lock |

Logo en tema claro.

### Fondo y textura

1. Gradiente vertical musgo → papel.
2. Líneas horizontales de ledger (repeating 48px) con máscara que se desvanece abajo.
3. No puntos coral ni cuadrícula.

### Layout por tipo

- **Cover:** regla coral bajo logo; título abajo; pie con apoyo + hint.
- **Signal:** panel anclado abajo con franja lateral (verde o azul según `cardTone`) + ícono en círculo.
- **Calc:** ledger compacto (5 filas + total coral) + nota de contraste.
- **Compare:** dos cards apiladas (musgo / cielo); coral solo en `[$9,000]`.
- **Text:** regla coral + manifiesto.
- **CTA:** zona superior musgo/papel + franja verde con botón coral.

### Qué no copiar en el 06+

- Mismo musgo→papel + líneas de ledger + panel con franja.
- Combinaciones ya usadas en 01–04.

---

## Carrusel 06 — Marco Taste (detalle)

**Archivos:** `builds/carrusel-06.js` · `template/carrusel-06.css` · `content/carrusel-06.json`  
**Dials:** VARIANCE 9 / MOTION 1 / DENSITY 3  
**Tema:** tres sesgos cognitivos · “ventana” de claridad sobre cielo.

### Firma

1. Fondo cielo full-bleed + vignette suave; contenido en **marco** blanco inset (`48px`, radio `28px`).
2. Signal: disco coral relleno con número blanco (no outline).
3. Compare (×3, misma familia): filas apiladas musgo/cielo dentro del marco.
4. CTA: marco verde sólido, logo claro, botón coral.

### Qué no copiar en el 07+

- Cielo + ventana inset + disco coral como sistema.
- Combinaciones 01–05 (ni la iteración Contrapeso/banda del 06).

---

## Checklist para el siguiente carrusel

1. Leer `docs/carrusel-NN.md` y pegar el JSON exacto en `content/carrusel-NN.json`.
2. Definir nombre de identidad + 1 frase de concepto (qué lo hace distinto).
3. Crear `builds/carrusel-NN.js` y `template/carrusel-NN.css` (no extender el CSS del anterior).
4. Elegir: fondo, contraste de texto, dónde vive el coral, textura opcional, layout de `signal` / tipos nuevos.
5. Añadir script `build:NN` en `package.json`.
6. Generar PNG (`pnpm build:NN`) y revisar desbordes / huérfanas / un coral por slide.
7. Actualizar esta tabla de identidades con la nueva fila.
8. Si el diseño final diverge del prompt del doc (etiqueta, nota, etc.), anotar el ajuste aquí o en el `carrusel-NN.md`.
