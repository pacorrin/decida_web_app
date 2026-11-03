# Carrusel 05: Vender mucho no es lo mismo que ganar

> Antes de generarlo, lee [base.md](base.md) (Storytelling + reglas) y [diseno.md](diseno.md).  
> Identidad visual: **Corte neto** → detalle en [diseno.md](diseno.md).

- **ID:** `carrusel-05`
- **Identidad:** Corte neto (ledger lines + panel con franja)
- **Pilar:** P1 Validación de ideas · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Distinguir ingresos de utilidad con un ejemplo numérico y el contraste A/B; llevar a calcular utilidad antes de lanzar.
- **Idea controladora:** Quien celebra lo que vende enfrenta confundir volumen con ganancia. Cuando ve $50,000 de ingresos, puede quedarle $3,000 (y aún sin sueldo). Con la cuenta de utilidad, decide si la idea vale la pena.
- **Tipos:** `cover`, `signal`, `calc`, `compare`, `text`, `cta`
- **Build:** `pnpm build:05` → `builds/carrusel-05.js` + `template/carrusel-05.css`

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
      "apoyo": "La cifra que emociona no siempre es la que te queda.",
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
      "etiqueta": "Ejemplo",
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
      "nota": "De $50,000 solo quedaron $3,000."
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

2. Respeta la identidad Corte neto en `builds/carrusel-05.js` y `template/carrusel-05.css` (ver [diseno.md](diseno.md)).
3. Ejecuta `pnpm build:05` (o `node builds/carrusel-05.js`) y confirma 9 PNG a 1080x1350 en `output/carrusel-05/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes ajustando CSS, no el texto.

Notas específicas:
- El calc tiene 5 filas + total: no apretar el título; reduce padding de filas si hace falta.
- Compare: tarjeta A musgo, B cielo; único coral en `[$9,000]`.
- Un solo coral por slide. Sin disclaimers de “tus números serán distintos”.
````

## Pie de foto (para Instagram)

```
Vender mucho no es lo mismo que ganar.

Los ingresos son todo lo que entra. La utilidad es lo que realmente te queda después de pagar costos, publicidad, herramientas y comisiones. Y todavía falta contar tu propio tiempo.

Guárdalo y revisa si tu idea mide ingresos o utilidad.

Contenido informativo. No es asesoría financiera.

#emprender #utilidad #finanzasparaemprendedores #emprendimientomexico #decida
```
