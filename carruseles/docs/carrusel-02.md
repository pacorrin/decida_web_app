# Carrusel 02: Tener ideas no es el problema: el problema es que ninguna se prueba

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-02`
- **Pilar:** P4 Desarrollo personal · **Semana:** 1 · **Slides:** 8 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Atraer a quien tiene ideas y no las ejecuta; introducir la idea de probar en pequeño.
- **Tipos nuevos que usa:** `checklist` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-02` de Decida (8 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-02.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-02",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Si tienes mil ideas",
      "titulo": "Tener ideas no es tu problema. [Probarlas] sí.",
      "apoyo": "Una idea sin prueba es solo una opinión",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "El patrón",
      "titulo": "Imaginas, te emocionas y la idea se queda en pausa",
      "apoyo": "Casi siempre no es falta de ideas ni de ganas, sino no saber cómo probarlas.",
      "icon": "lightbulb",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Traba 1",
      "titulo": "Esperas a tenerlo todo listo",
      "apoyo": "Mientras esperas el momento perfecto, la idea se enfría y no decides nada.",
      "icon": "hourglass",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Traba 2",
      "titulo": "Crees que probar es lanzar todo el negocio",
      "apoyo": "Probar puede ser una conversación, un cálculo o una página sencilla.",
      "icon": "rocket",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Traba 3",
      "titulo": "No defines qué significaría que funciona",
      "apoyo": "Sin un criterio claro, interpretas los resultados como más te convenga.",
      "icon": "target",
      "cardTone": "sky"
    },
    {
      "type": "checklist",
      "etiqueta": "Cómo empezar",
      "titulo": "Prueba una idea en 4 pasos pequeños",
      "items": [
        "Escribe la idea en una sola frase",
        "Define qué tendría que pasar para seguir",
        "Haz una prueba barata esta semana",
        "Decide: seguir, ajustar o descartar"
      ],
      "cardTone": "moss"
    },
    {
      "type": "text",
      "titulo": "No necesitas más ideas. Necesitas elegir una y [probarla].",
      "apoyo": "Una idea probada te da datos. Una idea guardada solo te da dudas."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y elige hoy la idea que vas a probar primero.",
      "boton": "¿Cuál idea vas a probar? Cuéntanos en comentarios",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `checklist`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-02` y confirma que existen los 8 PNG de 1080x1350 en `output/carrusel-02/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- El slide 6 usa el tipo nuevo `checklist`.
````

## Pie de foto (para Instagram)

```
Tener ideas es fácil. Probarlas es lo que cambia todo. 💡

Muchas ideas se quedan en una libreta no por falta de ganas, sino porque esperamos tenerlo todo listo o creemos que probar es lanzar el negocio completo. No tiene que ser así: una frase, una prueba pequeña y una decisión bastan para empezar.

Guárdalo, elige la idea que vas a probar primero y cuéntanos en comentarios cuál es.

#emprender #ideasdenegocio #validaciondeideas #emprendimientomexico #decida
```
