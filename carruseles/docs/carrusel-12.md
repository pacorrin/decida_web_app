# Carrusel 12: Checklist de 7 preguntas antes de lanzar tu idea

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-12`
- **Pilar:** P1 Validación de ideas + CTA a Decida · **Semana:** 4 · **Slides:** 10 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Cierre de la serie: resumir lo anterior en un checklist guardable y presentar Decida con más claridad que en los anteriores.

## Prompt para Cursor

````
Genera el carrusel `carrusel-12` de Decida (10 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-12.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-12",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Antes de lanzar",
      "titulo": "7 preguntas que debes responder antes de [lanzar] tu idea",
      "apoyo": "Un checklist para guardar",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 1",
      "titulo": "¿Quién tiene el problema y qué tan seguido le pasa?",
      "apoyo": "Si no puedes describir a tu cliente, todavía no lo conoces.",
      "icon": "users",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 2",
      "titulo": "¿Cómo lo resuelven hoy?",
      "apoyo": "Si ya pagan por una solución, hay demanda. Si no hacen nada, averigua por qué.",
      "icon": "search",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 3",
      "titulo": "¿Alguien ya pagó o se comprometió a pagar?",
      "apoyo": "Una promesa de pago dice más que muchos halagos.",
      "icon": "banknote",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 4",
      "titulo": "¿Sabes cuántas ventas necesitas para no perder dinero?",
      "apoyo": "Tu punto de equilibrio, con tu propio pago incluido.",
      "icon": "calculator",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 5",
      "titulo": "¿Cuánto dinero y tiempo puedes arriesgar?",
      "apoyo": "Define cuánto estás dispuesto a perder sin comprometer tu estabilidad.",
      "icon": "wallet",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 6",
      "titulo": "¿Qué es lo peor que podría pasar y qué harías?",
      "apoyo": "Con un plan para el peor escenario, tienes un riesgo, no un salto al vacío.",
      "icon": "life-buoy",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Pregunta 7",
      "titulo": "¿Qué paso pequeño puedes dar esta semana?",
      "apoyo": "Una conversación, una prueba, una cuenta. Algo que puedas hacer ya.",
      "icon": "footprints",
      "cardTone": "moss"
    },
    {
      "type": "text",
      "titulo": "Responderlas no asegura nada, pero te permite decidir con [más claridad].",
      "apoyo": "Y si alguna no tiene respuesta, ya sabes dónde probar primero."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "En Decida estamos construyendo una herramienta para responder estas preguntas con números claros. Síguenos para enterarte de las novedades.",
      "boton": "Guárdalo y compártelo con quien está por emprender",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel solo usa tipos que ya existen (`cover`, `signal`, `text`, `cta`) y íconos de lucide-static. Si algún ícono no se resuelve, avísame en lugar de sustituirlo en silencio.
3. Ejecuta `node build.js carrusel-12` y confirma que existen los 10 PNG de 1080x1350 en `output/carrusel-12/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- Son 10 slides, el máximo de la serie. Cada pregunta es un slide `signal`; no hace falta ningún tipo nuevo.
````

## Pie de foto (para Instagram)

```
7 preguntas que conviene responder antes de lanzar tu idea. 📋

Quién tiene el problema, cómo lo resuelve hoy, si alguien ya pagó, cuántas ventas necesitas, cuánto puedes arriesgar, qué harías si sale mal y cuál es tu siguiente paso. Si alguna no tiene respuesta, ya sabes dónde probar primero.

En Decida estamos construyendo una herramienta para responder estas preguntas con números claros. Síguenos para enterarte de las novedades y guarda este checklist para cuando lo necesites.

#emprender #validaciondeideas #ideasdenegocio #emprendimientomexico #decida
```
