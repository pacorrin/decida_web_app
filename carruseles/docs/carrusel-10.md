# Carrusel 10: Valida tu idea casi sin gastar dinero: 4 formas

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-10`
- **Pilar:** P5 Mentalidad de ejecución · **Semana:** 4 · **Slides:** 8 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Dar 4 pruebas baratas y accionables, y enseñar a distinguir señales débiles de fuertes.
- **Tipos nuevos que usa:** `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-10` de Decida (8 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-10.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-10",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Antes de invertir",
      "titulo": "Valida tu idea casi sin gastar [dinero]: 4 formas",
      "apoyo": "Pruebas baratas para decidir mejor",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Forma 1",
      "titulo": "Habla con posibles clientes",
      "apoyo": "Pregunta cómo resuelven hoy el problema. No les preguntes si tu idea les gusta.",
      "icon": "messages-square",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Forma 2",
      "titulo": "Pide una preventa",
      "apoyo": "Que alguien pague antes de que exista el producto es una de las señales más claras.",
      "icon": "handshake",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Forma 3",
      "titulo": "Haz una página sencilla y mide el interés",
      "apoyo": "Una página con tu propuesta y un botón para que dejen su contacto.",
      "icon": "mouse-pointer-click",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Forma 4",
      "titulo": "Vende a mano antes de automatizar",
      "apoyo": "Hazlo tú con pocos clientes y aprende de cada uno.",
      "icon": "users",
      "cardTone": "sky"
    },
    {
      "type": "compare",
      "etiqueta": "Qué buscar",
      "titulo": "No todas las señales valen lo mismo",
      "izquierda": {
        "label": "Señal débil",
        "texto": "Te dicen que es buena idea y que sí lo comprarían."
      },
      "derecha": {
        "label": "Señal fuerte",
        "texto": "Te dejan su contacto, se apuntan o [pagan]."
      }
    },
    {
      "type": "text",
      "titulo": "Si nadie quiere pagar ni dejar su contacto, es [información], no un fracaso.",
      "apoyo": "Descubrirlo con una prueba barata te ahorra tiempo y dinero."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "En Decida estamos construyendo herramientas para ayudarte a validar tu idea con números claros. Síguenos.",
      "boton": "¿Cuál de las 4 vas a probar? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-10` y confirma que existen los 8 PNG de 1080x1350 en `output/carrusel-10/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.
````

## Pie de foto (para Instagram)

```
Validar una idea no tiene que costarte miles de pesos. 🧪

Habla con posibles clientes, pide una preventa, mide el interés con una página sencilla o vende a mano a unas pocas personas. Y recuerda: que te digan que está bien no es lo mismo que dejar su contacto o pagar.

En Decida estamos construyendo herramientas para ayudarte a validar tu idea con números claros. Síguenos y cuéntanos en comentarios cuál de las 4 vas a probar.

#emprender #validaciondeideas #emprendimientomexico #startups #decida
```
