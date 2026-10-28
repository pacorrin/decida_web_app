# Carrusel 06: 3 sesgos que te hacen creer que tu idea es buena

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-06`
- **Pilar:** P2 Decidir sin que gane la emoción · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Nombrar tres sesgos conocidos con un ejemplo y una pregunta correctiva cada uno.
- **Tipos nuevos que usa:** `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-06` de Decida (9 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-06.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-06",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Decidir sin emoción",
      "titulo": "3 sesgos que te hacen creer que tu idea es [buena]",
      "apoyo": "Todos los tenemos",
      "hint": "Desliza →"
    },
    {
      "type": "text",
      "titulo": "Un sesgo es un atajo mental que [no siempre] te ayuda a decidir bien.",
      "apoyo": "Reconocerlos antes de invertir ya es una ventaja."
    },
    {
      "type": "signal",
      "etiqueta": "Sesgo 1",
      "titulo": "Solo buscas lo que te da la razón",
      "apoyo": "Es el sesgo de confirmación: ignoras lo que contradice tu idea.",
      "icon": "search",
      "cardTone": "moss"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 1 en acción",
      "titulo": "Del sesgo de confirmación a una mejor pregunta",
      "izquierda": {
        "label": "Lo que haces",
        "texto": "Buscas casos de éxito y le preguntas a quien te va a decir que sí."
      },
      "derecha": {
        "label": "Lo que conviene",
        "texto": "Buscar [por qué podría fallar] y preguntar a quien no tiene razón para aplaudirte."
      }
    },
    {
      "type": "signal",
      "etiqueta": "Sesgo 2",
      "titulo": "Imaginas que todo saldrá mejor de lo que calculas",
      "apoyo": "Es el exceso de optimismo: subestimas el tiempo, los costos y los obstáculos.",
      "icon": "sun",
      "cardTone": "sky"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 2 en acción",
      "titulo": "Del exceso de optimismo a una estimación realista",
      "izquierda": {
        "label": "Lo que haces",
        "texto": "Calculas tres meses para arrancar porque así lo imaginas."
      },
      "derecha": {
        "label": "Lo que conviene",
        "texto": "Agregar un [margen] a tu estimación y revisar cuánto les tomó a otros."
      }
    },
    {
      "type": "signal",
      "etiqueta": "Sesgo 3",
      "titulo": "Ya invertiste mucho, así que sigues",
      "apoyo": "Es el costo hundido: lo gastado no regresa, pero pesa en tu decisión.",
      "icon": "anchor",
      "cardTone": "moss"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 3 en acción",
      "titulo": "Del costo hundido a una decisión desde cero",
      "izquierda": {
        "label": "Lo que haces",
        "texto": "Sigues porque ya llevas meses y dinero metidos."
      },
      "derecha": {
        "label": "Lo que conviene",
        "texto": "Preguntarte: si empezara hoy [desde cero], ¿invertiría en esto?"
      }
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y revísalo antes de tu próxima decisión.",
      "boton": "¿Cuál sesgo reconoces en ti? Cuéntanos en comentarios",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-06` y confirma que existen los 9 PNG de 1080x1350 en `output/carrusel-06/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- Usa `compare` en los slides 4, 6 y 8. Los tres deben verse como una misma familia visual.
````

## Pie de foto (para Instagram)

```
Tu idea puede parecer mejor de lo que es. 🧠

Tres sesgos que nos afectan a todos al emprender: buscar solo lo que nos da la razón, calcular todo con demasiado optimismo y seguir porque ya invertimos mucho. Reconocerlos no los elimina, pero te ayuda a hacerte mejores preguntas antes de invertir.

Guárdalo para tu próxima decisión y cuéntanos en comentarios: ¿cuál reconoces en ti?

#emprender #sesgoscognitivos #tomadedecisiones #emprendimientomexico #decida
```
