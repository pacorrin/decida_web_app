# Carrusel 07: Miedo a renunciar vs. riesgo real: cómo distinguirlos

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-07`
- **Pilar:** P3 Dejar el trabajo / ingresos extra · **Semana:** 3 · **Slides:** 8 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Dar 4 preguntas para convertir un miedo difuso en un riesgo que se puede gestionar. Primera mención suave de Decida.
- **Tipos nuevos que usa:** `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-07` de Decida (8 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-07.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-07",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Antes de dar el salto",
      "titulo": "Miedo a renunciar vs. [riesgo real]",
      "apoyo": "Cómo distinguirlos",
      "hint": "Desliza →"
    },
    {
      "type": "compare",
      "etiqueta": "No son lo mismo",
      "titulo": "Miedo y riesgo se sienten igual, pero no pesan igual",
      "izquierda": {
        "label": "Miedo",
        "texto": "Es una sensación. Te dice que algo importa, pero no mide qué tan probable es que salga mal."
      },
      "derecha": {
        "label": "Riesgo real",
        "texto": "Es algo que puedes nombrar, [medir] y preparar."
      }
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 1",
      "titulo": "¿Qué es exactamente lo que temo que pase?",
      "apoyo": "Si no lo puedes decir con claridad, probablemente es un miedo difuso.",
      "icon": "circle-help",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 2",
      "titulo": "¿Qué tan probable es y qué tan grave sería?",
      "apoyo": "Un riesgo probable pero pequeño no pesa igual que uno raro pero grave.",
      "icon": "scale",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 3",
      "titulo": "¿Qué puedo hacer para reducirlo?",
      "apoyo": "Ahorrar un colchón, probar la idea antes o empezar en paralelo a tu empleo.",
      "icon": "shield",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 4",
      "titulo": "¿Qué haría si ocurre el peor escenario?",
      "apoyo": "Con un plan B, el riesgo deja de ser un salto al vacío.",
      "icon": "life-buoy",
      "cardTone": "sky"
    },
    {
      "type": "text",
      "titulo": "Sentir miedo no significa que debas parar. Tampoco que debas [ignorarlo].",
      "apoyo": "Significa que vale la pena entenderlo antes de decidir."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "En Decida estamos construyendo herramientas para evaluar tu idea con números claros. Síguenos y sé parte de la comunidad.",
      "boton": "¿Qué es lo que más temes? Cuéntanos en comentarios",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-07` y confirma que existen los 8 PNG de 1080x1350 en `output/carrusel-07/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- El slide 2 usa `compare` con un texto largo en la tarjeta izquierda: verifica que no se corte.
````

## Pie de foto (para Instagram)

```
Sentir miedo antes de renunciar es normal. Lo útil es saber si estás frente a un miedo o a un riesgo real. 🧭

Un miedo es una sensación. Un riesgo lo puedes nombrar, estimar y preparar. Con estas 4 preguntas puedes pasar de uno a otro y decidir con más claridad.

En Decida estamos construyendo herramientas para evaluar tu idea con números claros. Síguenos para enterarte de las novedades.

#emprender #dejarmitrabajo #gestionderiesgos #emprendimientomexico #decida
```
