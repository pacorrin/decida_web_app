# Carrusel 08: Pre-mortem: imagina que tu idea fracasó, ¿por qué fue?

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-08`
- **Pilar:** P2 Decidir sin que gane la emoción · **Semana:** 3 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Enseñar un ejercicio práctico de 4 pasos para anticipar riesgos. Mención suave de Decida en el cierre.
- **Tipos nuevos que usa:** `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-08` de Decida (9 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-08.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-08",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Un ejercicio sencillo",
      "titulo": "Imagina que tu idea [fracasó]. ¿Por qué fue?",
      "apoyo": "El pre-mortem",
      "hint": "Desliza →"
    },
    {
      "type": "text",
      "titulo": "El pre-mortem consiste en imaginar el fracaso [antes] de empezar.",
      "apoyo": "Así detectas riesgos mientras todavía puedes hacer algo al respecto."
    },
    {
      "type": "signal",
      "etiqueta": "Paso 1",
      "titulo": "Imagina que pasó un año y la idea fracasó",
      "apoyo": "Hazlo como si ya hubiera ocurrido, no como una simple posibilidad.",
      "icon": "calendar",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 2",
      "titulo": "Escribe todas las razones por las que falló",
      "apoyo": "Sin filtro: dinero, tiempo, clientes, socios y hasta tú mismo.",
      "icon": "pencil",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 3",
      "titulo": "Elige las 3 razones más probables y más graves",
      "apoyo": "No todas pesan igual. Prioriza las que más te preocuparían.",
      "icon": "triangle-alert",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 4",
      "titulo": "Convierte cada una en una acción preventiva",
      "apoyo": "Es la parte que protege tu dinero y tu tiempo.",
      "icon": "shield-check",
      "cardTone": "sky"
    },
    {
      "type": "compare",
      "etiqueta": "Un ejemplo",
      "titulo": "Del miedo vago a una acción concreta",
      "izquierda": {
        "label": "Razón del fracaso",
        "texto": "Nadie compró porque no había demanda real."
      },
      "derecha": {
        "label": "Acción preventiva",
        "texto": "Hablar con posibles clientes y pedir una [preventa] antes de producir."
      }
    },
    {
      "type": "text",
      "titulo": "Pensar en el fracaso no es ser pesimista. Es [prepararte] para decidir mejor.",
      "apoyo": "Haz el ejercicio con tu idea hoy y guarda tus respuestas."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y haz tu pre-mortem esta semana. En Decida estamos construyendo herramientas para evaluar riesgos antes de invertir.",
      "boton": "¿Cuál sería tu razón número uno? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-08` y confirma que existen los 9 PNG de 1080x1350 en `output/carrusel-08/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.
````

## Pie de foto (para Instagram)

```
Antes de empezar, imagina que tu idea fracasó. ¿Por qué fue? 🔍

Se llama pre-mortem: pensar en el fracaso de antemano para detectar riesgos mientras todavía puedes actuar. Escribe las razones, elige las más probables y conviértelas en acciones preventivas.

Guárdalo, haz el ejercicio con tu idea esta semana y cuéntanos en comentarios cuál sería tu razón número uno.

#emprender #premortem #gestionderiesgos #ideasdenegocio #decida
```
