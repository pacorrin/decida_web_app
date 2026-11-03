# Carrusel 06: 3 sesgos que te hacen creer que tu idea es buena

> Antes de generarlo, lee [base.md](base.md) (Storytelling + reglas) y [diseno.md](diseno.md).  
> Identidad visual: **Marco (Taste)** → detalle en [diseno.md](diseno.md).

- **ID:** `carrusel-06`
- **Identidad:** Marco Taste (cielo + ventana blanca + disco coral)
- **Pilar:** P2 Decidir sin que gane la emoción · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Nombrar tres sesgos con contraste “lo que haces / lo que conviene” y una pregunta correctiva cada uno.
- **Idea controladora:** Quien ya se enamoró de su idea enfrenta atajos mentales que la pintan mejor. Cuando confirma, subestima o se aferra a lo gastado, decide con la emoción. Con tres preguntas correctivas, decide con más claridad.
- **Tipos:** `cover`, `text`, `signal`, `compare`, `cta`
- **Build:** `pnpm build:06` → `builds/carrusel-06.js` + `template/carrusel-06.css`
- **Dials Taste:** VARIANCE 9 / MOTION 1 / DENSITY 3

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
      "apoyo": "Tu cabeza busca atajos. Antes de invertir, conviene verlos.",
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
      "apoyo": "Sesgo de confirmación: ignoras lo que contradice tu idea.",
      "icon": "search",
      "cardTone": "moss",
      "numero": "1"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 1 en acción",
      "titulo": "Del aplauso fácil a una mejor pregunta",
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
      "apoyo": "Exceso de optimismo: subestimas tiempo, costos y obstáculos.",
      "icon": "sun",
      "cardTone": "sky",
      "numero": "2"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 2 en acción",
      "titulo": "Del plan ideal a una estimación con margen",
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
      "apoyo": "Costo hundido: lo gastado no regresa, pero pesa en tu decisión.",
      "icon": "anchor",
      "cardTone": "moss",
      "numero": "3"
    },
    {
      "type": "compare",
      "etiqueta": "Sesgo 3 en acción",
      "titulo": "De lo ya gastado a una decisión desde cero",
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
      "titulo": "Decide con los ojos abiertos",
      "apoyo": "Guárdalo y revísalo antes de tu próxima decisión.",
      "boton": "¿Cuál sesgo reconoces en ti? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Respeta la identidad Marco en `builds/carrusel-06.js` y `template/carrusel-06.css` (ver [diseno.md](diseno.md)).
3. Ejecuta `pnpm build:06` y confirma 9 PNG a 1080x1350 en `output/carrusel-06/`.
4. Revisa cada PNG según `docs/base.md`. Los tres `compare` deben verse como la misma familia (filas apiladas).

Notas específicas:
- Un solo coral por slide (número outline, palabra marcada o botón).
- Sin disclaimers de ejemplo. Sin emojis en pie.
````

## Pie de foto (para Instagram)

```
Tu idea puede parecer mejor de lo que es.

Tres sesgos que nos afectan al emprender: buscar solo lo que nos da la razón, calcular con demasiado optimismo y seguir porque ya invertimos mucho. Reconocerlos no los elimina, pero te ayuda a hacerte mejores preguntas antes de invertir.

Guárdalo para tu próxima decisión. ¿Cuál reconoces en ti?

Contenido informativo. No es asesoría psicológica ni financiera.

#emprender #sesgoscognitivos #tomadedecisiones #emprendimientomexico #decida
```
