# Carrusel 09: Parálisis por análisis: la regla de las 48 horas

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-09`
- **Pilar:** P4 Desarrollo personal · **Semana:** 3 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Dar una regla simple para salir de la indecisión, con un plan accionable. Mención suave de Decida.
- **Tipos nuevos que usa:** `checklist` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-09` de Decida (9 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-09.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-09",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Si llevas semanas dándole vueltas",
      "titulo": "Parálisis por análisis: la regla de las [48 horas]",
      "apoyo": "Cómo salir de ahí sin decidir a ciegas",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Señal",
      "titulo": "Investigas más y decides menos",
      "apoyo": "Llega un punto en que más información ya no te da claridad, solo dudas.",
      "icon": "book-open",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Por qué pasa",
      "titulo": "Esperas la decisión perfecta y no existe",
      "apoyo": "Casi siempre el miedo a equivocarte pesa más que lo que te falta saber.",
      "icon": "brain",
      "cardTone": "sky"
    },
    {
      "type": "text",
      "titulo": "La regla: tienes [48 horas] para decidir el siguiente paso, no toda la idea.",
      "apoyo": "Decidir un paso pequeño pesa mucho menos que decidir todo."
    },
    {
      "type": "checklist",
      "etiqueta": "Cómo aplicarla",
      "titulo": "Tu plan de 48 horas",
      "items": [
        "Escribe la decisión pendiente en una frase",
        "Anota qué te falta saber de verdad",
        "Busca solo eso, con límite de tiempo",
        "Decide: seguir, ajustar o descartar"
      ],
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Ojo",
      "titulo": "Decidir en 48 horas no es decidir a ciegas",
      "apoyo": "Es poner un límite a la búsqueda y quedarte con lo esencial.",
      "icon": "timer",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Después",
      "titulo": "Cada paso te da información nueva",
      "apoyo": "Si te equivocas en algo pequeño, lo corriges. Si no decides, no aprendes.",
      "icon": "footprints",
      "cardTone": "sky"
    },
    {
      "type": "text",
      "titulo": "No necesitas la decisión perfecta. Necesitas la [siguiente].",
      "apoyo": "Y una fecha para tomarla."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "En Decida estamos construyendo herramientas para ayudarte a decidir con números claros. Síguenos y sé parte de la comunidad.",
      "boton": "¿Qué decisión llevas posponiendo? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `checklist`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-09` y confirma que existen los 9 PNG de 1080x1350 en `output/carrusel-09/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- El slide 5 usa `checklist`. Los slides 4 y 8 usan `text` de forma seguida en la serie: se ven bien porque cambian de ritmo.
````

## Pie de foto (para Instagram)

```
Si llevas semanas investigando y sigues sin decidir, esto es para ti. ⏱️

Cuando más información ya no te da claridad, puede ser parálisis por análisis. La regla de las 48 horas no te pide decidir toda la idea, solo el siguiente paso pequeño, con una fecha límite.

En Decida estamos construyendo herramientas para ayudarte a decidir con números claros. Síguenos y cuéntanos en comentarios qué decisión llevas posponiendo.

#emprender #desarrollopersonal #tomadedecisiones #productividad #decida
```
