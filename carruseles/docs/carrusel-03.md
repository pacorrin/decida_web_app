# Carrusel 03: ¿Cuánto necesitas ahorrar antes de renunciar? La cuenta real

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).  
> Identidad visual final documentada en [diseno.md](diseno.md) → sección **Carrusel 03 — Cuenta clara**.

- **ID:** `carrusel-03`
- **Identidad:** Cuenta clara (cielo + puntos coral + número de paso gigante)
- **Pilar:** P3 Dejar el trabajo / ingresos extra · **Semana:** 1 · **Slides:** 8 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Dar una fórmula concreta y guardable para calcular el colchón antes de dar el salto.
- **Tipos nuevos que usa:** `calc` (definidos en [base.md](base.md))
- **Build:** `pnpm build:03` → `builds/carrusel-03.js` + `template/carrusel-03.css`

## Prompt para Cursor

````
Genera el carrusel `carrusel-03` de Decida (8 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-03.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-03",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Antes de renunciar",
      "titulo": "¿Cuánto necesitas ahorrar antes de [renunciar]?",
      "apoyo": "La cuenta real, paso a paso",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 1",
      "titulo": "Calcula cuánto cuesta vivir cada mes",
      "apoyo": "Renta, comida, transporte, deudas y servicios. Todo, no solo lo básico.",
      "icon": "wallet",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 2",
      "titulo": "Estima cuántos meses tardarás en generar ingresos",
      "apoyo": "Sé honesto: los primeros ingresos suelen tardar más de lo esperado.",
      "icon": "hourglass",
      "cardTone": "sky"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 3",
      "titulo": "Suma lo que cuesta arrancar la idea",
      "apoyo": "Herramientas, permisos, inventario, publicidad. Todo lo previo a vender.",
      "icon": "receipt",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 4",
      "titulo": "Agrega un margen para imprevistos",
      "apoyo": "Siempre aparece algo que no estaba en la cuenta. Mejor tenerlo previsto.",
      "icon": "shield",
      "cardTone": "sky"
    },
    {
      "type": "calc",
      "etiqueta": "Ejemplo ilustrativo",
      "titulo": "Así se ve la cuenta completa",
      "filas": [
        {
          "label": "Gastos al mes",
          "valor": "$15,000"
        },
        {
          "label": "× 6 meses sin ingresos suficientes",
          "valor": "$90,000"
        },
        {
          "label": "+ Costo de arrancar la idea",
          "valor": "$20,000"
        },
        {
          "label": "+ Margen de imprevistos (10%)",
          "valor": "$11,000"
        }
      ],
      "total": {
        "label": "Tu colchón",
        "valor": "$121,000"
      },
      "nota": "Cifras ilustrativas. Las tuyas serán distintas."
    },
    {
      "type": "text",
      "titulo": "Si hoy tu ahorro no alcanza, no es un no. Es un [todavía].",
      "apoyo": "Con la cuenta clara sabes cuánto falta y cómo ir armándolo."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y haz tu cuenta con tus propios números.",
      "boton": "¿Qué paso te costó más? Cuéntanos en comentarios",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `calc`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-03` y confirma que existen los 8 PNG de 1080x1350 en `output/carrusel-03/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- El slide 6 usa el tipo nuevo `calc`. Las cifras son inventadas a propósito y deben decir que son ilustrativas.
````

## Pie de foto (para Instagram)

```
Antes de renunciar, haz la cuenta. 🧮

Para saber cuánto necesitas ahorrar, suma tus gastos de los meses que tardarías en generar ingresos, lo que cuesta arrancar la idea y un margen para imprevistos. Los números del ejemplo son ilustrativos: los tuyos serán distintos.

Guárdalo para hacer tu cuenta con calma y cuéntanos en comentarios qué paso te costó más.

Contenido informativo, no es asesoría financiera.

#emprender #finanzaspersonales #dejarmitrabajo #emprendimientomexico #decida
```
