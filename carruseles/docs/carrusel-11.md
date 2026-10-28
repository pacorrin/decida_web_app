# Carrusel 11: Descartar una idea a tiempo también es ganar

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-11`
- **Pilar:** P5 Mentalidad de ejecución · **Semana:** 4 · **Slides:** 8 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Reencuadrar el descarte como una ganancia (dinero, tiempo, aprendizaje). Contenido compartible.
- **Tipos nuevos que usa:** `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-11` de Decida (8 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-11.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-11",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Un cambio de perspectiva",
      "titulo": "Descartar una idea a tiempo también es [ganar]",
      "apoyo": "Lo que no pierdes también cuenta",
      "hint": "Desliza →"
    },
    {
      "type": "text",
      "titulo": "Descartar una idea no es fracasar. Es [decidir] con información.",
      "apoyo": "Y suele costar mucho menos que descubrirlo después."
    },
    {
      "type": "signal",
      "etiqueta": "Ganas dinero",
      "titulo": "Evitas una inversión que no iba a regresar",
      "apoyo": "Lo que no pierdes en una mala idea queda disponible para una mejor.",
      "icon": "piggy-bank",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Ganas tiempo",
      "titulo": "Recuperas el tiempo que ibas a dedicarle",
      "apoyo": "Es el único recurso que no se recupera.",
      "icon": "hourglass",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Ganas aprendizaje",
      "titulo": "Sabes qué sí y qué no funciona",
      "apoyo": "Cada idea descartada te deja datos para elegir mejor la siguiente.",
      "icon": "graduation-cap",
      "cardTone": "moss"
    },
    {
      "type": "compare",
      "etiqueta": "Dos caminos",
      "titulo": "El mismo resultado, con distinto costo",
      "izquierda": {
        "label": "Descartar tarde",
        "texto": "Meses de trabajo, dinero invertido y la sensación de haberlo perdido todo."
      },
      "derecha": {
        "label": "Descartar a tiempo",
        "texto": "Una prueba pequeña, una decisión clara y [energía] para la siguiente idea."
      }
    },
    {
      "type": "text",
      "titulo": "Una idea descartada con datos es un [paso adelante], no un paso atrás.",
      "apoyo": "Decidir mejor también es avanzar."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "En Decida estamos construyendo herramientas para decidir con números claros. Síguenos y compártelo con quien lo necesite.",
      "boton": "¿Qué idea descartaste a tiempo? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-11` y confirma que existen los 8 PNG de 1080x1350 en `output/carrusel-11/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- Este es un buen carrusel para compartir: mantén el tono cálido y sin dramatismo.
````

## Pie de foto (para Instagram)

```
Descartar una idea a tiempo también es ganar. ✅

No es fracasar: es decidir con información antes de invertir. Ganas dinero que no pierdes, tiempo que recuperas y aprendizaje para elegir mejor la siguiente idea.

En Decida estamos construyendo herramientas para decidir con números claros. Síguenos, compártelo con alguien que lo necesite y cuéntanos en comentarios qué idea descartaste a tiempo.

#emprender #mentalidad #ideasdenegocio #emprendimientomexico #decida
```
