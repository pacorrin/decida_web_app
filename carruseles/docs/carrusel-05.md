# Carrusel 05: Ingresos vs. utilidad: el error que complica a los negocios nuevos

> Antes de generarlo, lee [base.md](base.md) (preparación del proyecto y reglas de calidad).

- **ID:** `carrusel-05`
- **Pilar:** P1 Validación de ideas · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Distinguir ingresos de utilidad con un ejemplo y llevar a calcular la utilidad esperada.
- **Tipos nuevos que usa:** `calc`, `compare` (definidos en [base.md](base.md))

## Prompt para Cursor

````
Genera el carrusel `carrusel-05` de Decida (9 slides, 4:5, 1080x1350).

1. Crea `content/carrusel-05.json` con EXACTAMENTE este contenido. Es la fuente de verdad: no cambies, agregues ni quites palabras, y conserva acentos y signos. Los `[corchetes]` marcan la palabra en coral.

```json
{
  "id": "carrusel-05",
  "slides": [
    {
      "type": "cover",
      "etiqueta": "Un error muy común",
      "titulo": "Vender mucho no es lo mismo que [ganar]",
      "apoyo": "Ingresos vs. utilidad",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Ingresos",
      "titulo": "Ingresos es todo lo que entra",
      "apoyo": "Lo que cobras por tus ventas, antes de pagar cualquier cosa.",
      "icon": "banknote",
      "cardTone": "moss"
    },
    {
      "type": "signal",
      "etiqueta": "Utilidad",
      "titulo": "Utilidad es lo que realmente te queda",
      "apoyo": "Lo que sobra después de pagar todos los costos y gastos.",
      "icon": "piggy-bank",
      "cardTone": "sky"
    },
    {
      "type": "calc",
      "etiqueta": "Ejemplo ilustrativo",
      "titulo": "Vendiste $50,000 este mes. ¿Cuánto te quedó?",
      "filas": [
        {
          "label": "Ingresos por ventas",
          "valor": "$50,000"
        },
        {
          "label": "− Costo de lo vendido",
          "valor": "$30,000"
        },
        {
          "label": "− Publicidad",
          "valor": "$8,000"
        },
        {
          "label": "− Herramientas y servicios",
          "valor": "$4,000"
        },
        {
          "label": "− Comisiones y envíos",
          "valor": "$5,000"
        }
      ],
      "total": {
        "label": "Utilidad",
        "valor": "$3,000"
      },
      "nota": "Cifras ilustrativas."
    },
    {
      "type": "signal",
      "etiqueta": "Ojo",
      "titulo": "Esa utilidad aún no incluye tu sueldo",
      "apoyo": "Si tú trabajas en el negocio, tu tiempo también cuesta.",
      "icon": "clock",
      "cardTone": "moss"
    },
    {
      "type": "compare",
      "etiqueta": "Dos negocios",
      "titulo": "Vender más no siempre es ganar más",
      "izquierda": {
        "label": "Negocio A",
        "texto": "Vende $50,000 y le quedan $3,000."
      },
      "derecha": {
        "label": "Negocio B",
        "texto": "Vende $30,000 y le quedan [$9,000]."
      }
    },
    {
      "type": "signal",
      "etiqueta": "Qué hacer",
      "titulo": "Antes de lanzar, calcula tu utilidad esperada",
      "apoyo": "Pon todos los costos en papel, no solo el de producir.",
      "icon": "clipboard-check",
      "cardTone": "sky"
    },
    {
      "type": "text",
      "titulo": "Un negocio no se mide por cuánto [entra], sino por cuánto se queda.",
      "apoyo": "Esa cuenta conviene hacerla antes de invertir."
    },
    {
      "type": "cta",
      "titulo": "Decide con claridad",
      "apoyo": "Guárdalo y revisa si tu idea mide ingresos o utilidad.",
      "boton": "¿Ya calculas tu utilidad? Cuéntanos en comentarios",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Este carrusel usa los tipos `calc`, `compare`. Si todavía no existen en `build.js` y `template/slide.css`, impleméntalos primero siguiendo la sección "Preparación del proyecto" de `docs/base.md`.
3. Ejecuta `node build.js carrusel-05` y confirma que existen los 9 PNG de 1080x1350 en `output/carrusel-05/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes o líneas huérfanas ajustando el CSS del tipo de slide, no el texto.

Notas específicas:
- Usa `calc` (slide 4) y `compare` (slide 6). El slide 4 tiene 5 filas más total: confirma que cabe sin apretarse.
````

## Pie de foto (para Instagram)

```
Vender mucho no es lo mismo que ganar. 💸

Los ingresos son todo lo que entra. La utilidad es lo que realmente te queda después de pagar costos, publicidad, herramientas y comisiones. Y todavía falta contar tu propio tiempo.

Los números del ejemplo son ilustrativos. Guárdalo y revisa cuál de las dos cifras estás usando para evaluar tu idea.

#emprender #utilidad #finanzasparaemprendedores #emprendimientomexico #decida
```
