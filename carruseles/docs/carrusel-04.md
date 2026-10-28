# Carrusel 04: Cuánto tienes que vender para que tu idea valga tu tiempo

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-04`
- **Pilar:** P1 Validación de ideas · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Enseñar punto de equilibrio y el costo del propio tiempo con un ejemplo numérico simple.
- **Tipos nuevos que usa:** `calc` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-04` de Decida (9 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-04.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-04",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Antes de invertir",
      "titulo": "Cuánto tienes que vender para que tu idea valga [tu tiempo]",
      "apoyo": "Dos cuentas sencillas antes de empezar",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 1",
      "titulo": "Calcula cuánto te queda por cada venta",
      "apoyo": "Precio de venta menos lo que cuesta producirla y entregarla.",
      "icon": "tag",
      "cardTone": "moss"
    },
    {
      "type": "calc",
      "etiqueta": "Ejemplo ilustrativo",
      "titulo": "Lo que te queda por cada venta",
      "filas": [
        {
          "label": "Precio de venta",
          "valor": "$500"
        },
        {
          "label": "− Materiales y empaque",
          "valor": "$220"
        },
        {
          "label": "− Envío y comisiones",
          "valor": "$80"
        }
      ],
      "total": {
        "label": "Te queda por venta",
        "valor": "$200"
      },
      "nota": "Cifras ilustrativas para explicar la cuenta."
    },
    {
      "type": "signal",
      "etiqueta": "Paso 2",
      "titulo": "Suma lo que pagas aunque no vendas nada",
      "apoyo": "Herramientas, publicidad, renta, suscripciones. Son tus costos fijos.",
      "icon": "receipt",
      "cardTone": "sky"
    },
    {
      "type": "calc",
      "etiqueta": "Punto de equilibrio",
      "titulo": "¿Cuántas ventas necesitas para no perder dinero?",
      "filas": [
        {
          "label": "Costos fijos al mes",
          "valor": "$10,000"
        },
        {
          "label": "÷ Lo que te queda por venta",
          "valor": "$200"
        }
      ],
      "total": {
        "label": "Ventas al mes",
        "valor": "50"
      },
      "nota": "Con 50 ventas al mes cubres tus costos. Todavía no ganas."
    },
    {
      "type": "signal",
      "etiqueta": "Paso 3",
      "titulo": "Ahora suma lo que vale tu tiempo",
      "apoyo": "Si no te pagas a ti, estás trabajando gratis.",
      "icon": "clock",
      "cardTone": "moss"
    },
    {
      "type": "calc",
      "etiqueta": "Con tu pago incluido",
      "titulo": "Tu meta real es más alta",
      "filas": [
        {
          "label": "Costos fijos al mes",
          "valor": "$10,000"
        },
        {
          "label": "+ Lo que quieres pagarte",
          "valor": "$12,000"
        },
        {
          "label": "÷ Lo que te queda por venta",
          "valor": "$200"
        }
      ],
      "total": {
        "label": "Ventas al mes",
        "valor": "110"
      },
      "nota": "Cifras ilustrativas."
    },
    {
      "type": "text",
      "titulo": "Si esa cifra te parece lejana, mejor saberlo [antes] de invertir.",
      "apoyo": "Con la cuenta clara puedes ajustar el precio, los costos o la idea completa."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y haz esta cuenta con los números de tu idea.",
      "boton": "¿Ya conocías tu punto de equilibrio? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `calc`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-04` y confirma que existen los 9 PNG de 1080x1350 en `output/carrusel-04/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- Usa el tipo `calc` en los slides 3, 5 y 7. Los totales llevan el único coral del slide.
````

## Pie de foto (para Instagram)

```
¿Cuántas ventas necesitas para que tu idea valga la pena? 🎯

Hay dos cuentas que conviene hacer antes de invertir: cuántas ventas necesitas para no perder dinero y cuántas para pagarte a ti. Casi siempre la segunda cifra es más alta de lo que imaginas, y es mejor saberlo antes de empezar.

Los números del ejemplo son ilustrativos. Guárdalo y haz la cuenta con los de tu idea.

#emprender #puntodeequilibrio #ideasdenegocio #validaciondeideas #decida
```
