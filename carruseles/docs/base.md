# Base compartida de los carruseles de Decida

Este archivo reúne todo lo que comparten los carruseles 02 a 12 del plan de 4 semanas: índice, formato, preparación del proyecto (una sola vez) y reglas de calidad. Cada carrusel vive en su propio archivo `docs/carrusel-NN.md`. El carrusel 01 ya está generado (`content/carrusel-01.json`).

**Cómo usarlo con Cursor.** Primera vez: pídele que lea este archivo y aplique la sección "Preparación del proyecto". Después, para cada carrusel: *«Lee `docs/base.md`, `docs/diseno.md` y ejecuta el prompt de `docs/carrusel-NN.md`»*. Cada prompt trae el JSON exacto del contenido, así que no hay que transcribir texto y se evitan errores de ortografía. El pie de foto es para pegarlo en Instagram, no para Cursor.

**Diseño.** Cada carrusel tiene identidad propia (`builds/carrusel-NN.js` + `template/carrusel-NN.css`). La referencia visual acumulada está en [diseno.md](diseno.md) — léela antes de armar el siguiente para no repetir fondo, textura ni layout.

## Índice

| # | Tema | Pilar | Semana | Slides | Tipos nuevos |
|---|------|-------|--------|--------|--------------|
| [02](carrusel-02.md) | Tener ideas no es el problema: el problema es que ninguna se prueba | P4 Desarrollo personal | 1 | 8 | `checklist` |
| [03](carrusel-03.md) | ¿Cuánto necesitas ahorrar antes de renunciar? La cuenta real | P3 Dejar el trabajo / ingresos extra | 1 | 8 | `calc` |
| [04](carrusel-04.md) | Cuánto tienes que vender para que tu idea valga tu tiempo | P1 Validación de ideas | 2 | 9 | `calc` |
| [05](carrusel-05.md) | Ingresos vs. utilidad: el error que complica a los negocios nuevos | P1 Validación de ideas | 2 | 9 | `calc`, `compare` |
| [06](carrusel-06.md) | 3 sesgos que te hacen creer que tu idea es buena | P2 Decidir sin que gane la emoción | 2 | 9 | `compare` |
| [07](carrusel-07.md) | Miedo a renunciar vs. riesgo real: cómo distinguirlos | P3 Dejar el trabajo / ingresos extra | 3 | 8 | `compare` |
| [08](carrusel-08.md) | Pre-mortem: imagina que tu idea fracasó, ¿por qué fue? | P2 Decidir sin que gane la emoción | 3 | 9 | `compare` |
| [09](carrusel-09.md) | Parálisis por análisis: la regla de las 48 horas | P4 Desarrollo personal | 3 | 9 | `checklist` |
| [10](carrusel-10.md) | Valida tu idea casi sin gastar dinero: 4 formas | P5 Mentalidad de ejecución | 4 | 8 | `compare` |
| [11](carrusel-11.md) | Descartar una idea a tiempo también es ganar | P5 Mentalidad de ejecución | 4 | 8 | `compare` |
| [12](carrusel-12.md) | Checklist de 7 preguntas antes de lanzar tu idea | P1 Validación de ideas + CTA a Decida | 4 | 10 | — |

**Orden de publicación sugerido:** lunes, miércoles y viernes, en el orden del índice (el 01 ya está publicado o por publicar). Las semanas 3 y 4 incluyen una mención suave de Decida en el último slide; si el producto o el nombre cambian antes de publicar, ajusta esa línea.

**Formato:** los 11 carruseles son 4:5 (1080x1350), igual que el 01. Es el formato vertical que más espacio ocupa en el feed de Instagram, mantiene la misma plantilla y `build.js` ya lo tiene fijo. Cuando tengas videos, esos sí irán en 9:16.

---

## Preparación del proyecto (aplicar una sola vez, antes del primer carrusel)

````
Contexto: este proyecto genera carruseles de Instagram para la marca Decida como PNG de 1080x1350 desde HTML/CSS con Playwright. Estado actual:
- `node build.js <id>` lee `content/<id>.json` y genera `output/<id>/slide-NN.png`.
- Tipos de slide que ya existen en `build.js`: `cover`, `signal`, `text`, `cta`.
- `template/slide.css` tiene la identidad "Diagnóstico en Papel Blanco" (Geist, paleta de marca, márgenes de 90 px).
- Los íconos son SVG de `lucide-static`, hoy limitados por la lista blanca `ICON_FILES` en `build.js`.
- El logo sale de `assets/logo.svg` como lockup con "decida.mx".

Tarea (no cambies el aspecto de los tipos existentes: `carrusel-01` debe seguir saliendo idéntico):

1. ÍCONOS. Reemplaza la lista blanca `ICON_FILES` por una resolución automática: el nombre del ícono es el nombre del archivo, `<icon>.svg`, dentro de `node_modules/lucide-static/icons/` (o `assets/icons/`). Si no existe, falla con un mensaje claro. Íconos que usarán los carruseles 02 al 12 (todos existen en lucide-static): lightbulb, hourglass, rocket, target, wallet, receipt, tag, banknote, piggy-bank, clock, clipboard-check, search, sun, anchor, circle-help, scale, shield, life-buoy, pencil, triangle-alert, shield-check, book-open, brain, timer, footprints, handshake, mouse-pointer-click, users, graduation-cap, check.

2. TIPO NUEVO `compare` (dos tarjetas apiladas: contraste). JSON:
   { "type": "compare", "etiqueta": "...", "titulo": "...",
     "izquierda": { "label": "...", "texto": "..." },
     "derecha":   { "label": "...", "texto": "..." } }
   Layout: logo arriba a la izquierda, etiqueta (Azul Guía) y título arriba, igual que `signal`. Debajo, anclado abajo, dos tarjetas de ancho completo (900 px), radio 28 px, separadas 28 px: la de `izquierda` en Musgo Suave #f0f5f3 y la de `derecha` en Cielo Tenue #e8f4fa. Cada tarjeta: `label` pequeño (~30 px, Azul Guía, semibold) y `texto` (~44 px, regular, Verde Confianza #05422c), padding ~48 px. El texto de `derecha` admite `[palabra]` para el único acento coral del slide (el mismo renderizado de corchetes que ya existe). El `texto` de `izquierda` no lleva acento.

3. TIPO NUEVO `calc` (una cuenta con filas y un total). JSON:
   { "type": "calc", "etiqueta": "...", "titulo": "...",
     "filas": [ { "label": "...", "valor": "..." } ],
     "total": { "label": "...", "valor": "..." },
     "nota": "..." }   // "nota" es opcional
   Layout: logo, etiqueta y título arriba. Debajo, una tarjeta Musgo Suave de ancho completo (900 px, radio 28 px, padding ~48 px) con una fila por elemento de `filas`: `label` a la izquierda (~38 px, Tinta Secundaria #3d5c50) y `valor` a la derecha (~44 px, semibold, Verde Confianza), separadas por una línea de 2 px en Cielo Tenue. La última fila es el `total`: `label` en semibold (~40 px) y `valor` grande (~64 px, semibold) en Coral Acción #ff7043, que es el único acento coral del slide. Si hay `nota`, va debajo de la tarjeta (~28 px, Tinta Secundaria). Debe caber con hasta 5 filas más el total y un título de 3 líneas sin apretarse; si no cabe, reduce el interlineado de las filas, no el tamaño del título.

4. TIPO NUEVO `checklist` (lista con palomitas). JSON:
   { "type": "checklist", "etiqueta": "...", "titulo": "...", "items": ["..."], "cardTone": "moss" }
   Layout: logo, etiqueta y título arriba. Debajo, una tarjeta (Musgo Suave si `cardTone` es "moss", Cielo Tenue si es "sky") con una fila por item: a la izquierda un círculo de ~56 px con borde de 2 px en Verde Confianza y el ícono `check` (lucide, trazo 2 px) dentro; a la derecha el texto (~40 px, regular, Verde Confianza). Separación de ~32 px entre filas. Soporta hasta 5 items.

5. REGLAS GENERALES para todo lo nuevo:
   - Sin sombras, degradados ni efectos. Solo la paleta de marca. Un solo coral por slide.
   - Texto alineado a la izquierda, márgenes de 90 px, `text-wrap: balance` en títulos.
   - Nada puede desbordarse ni cortarse.
   - Mantén la validación de dimensiones 1080x1350 al final del build.

6. Cuando termines, ejecuta `node build.js carrusel-01` y confirma que los 8 PNG siguen saliendo igual. Después dime que estás listo para recibir un carrusel.
````

---

## Reglas de calidad (aplican a todos los carruseles)

- **Texto exacto.** No cambies, agregues ni quites palabras del JSON. Respeta acentos y signos (¿ ? ¡ !).
- **Un solo coral por slide:** la palabra entre `[corchetes]` o el total/botón. Nunca dos.
- **Sin cifras reales.** Los números de los ejemplos son inventados para ilustrar y los slides lo dicen ("Ejemplo ilustrativo", "Cifras ilustrativas").
- **Tono.** Español de México, cercano pero serio. Sin promesas de resultados ni lenguaje de gurú.
- **Revisión final.** Después de `node build.js <id>`, abre cada PNG y revisa: texto desbordado, palabras huérfanas en una línea, ortografía, que el logo no choque con nada y que todos los slides se vean como la misma serie que el carrusel 01.
