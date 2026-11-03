# Carrusel 04: Tu idea puede emocionarte… y aún así no pagarte

> Antes de generarlo, lee [base.md](base.md) y [diseno.md](diseno.md).  
> Identidad visual: **Marcador (Taste)** → detalle en [diseno.md](diseno.md).

- **ID:** `carrusel-04`
- **Identidad:** Marcador Taste (9 familias de layout; theme light; acento coral)
- **Pilar:** P1 Validación de ideas · **Semana:** 2 · **Slides:** 9 · **Formato:** 4:5 (1080x1350)
- **Objetivo:** Contar la tensión de invertir sin saber la meta real: margen tras impuestos, punto de equilibrio sin pagarte, y meta con tu sueldo (solo si las ventas lo permiten / reinversión).
- **Tipos que usa:** `cover`, `signal`, `calc`, `text`, `cta`
- **Build:** `pnpm build:04` → `builds/carrusel-04.js` + `template/carrusel-04.css`

## Ángulo de impuestos (contenido)

Los impuestos entran en el **Paso 1**, no como asesoría fiscal sino como línea de la cuenta:

1. Precio de venta  
2. − Costos de producir y entregar  
3. − **Reserva para impuestos**   
4. = Lo que realmente te queda por venta  

Esa contribución neta alimenta los calcs de equilibrio (Paso 2) y de meta con tu pago (Paso 3). Si omites impuestos, la meta de ventas se ve artificialmente baja.

Tono: español de México, cercano, sin promesas. El pie de Instagram aclara que no es asesoría fiscal ni financiera.

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
      "titulo": "Tu idea puede emocionarte… y aún así [no pagarte]",
      "apoyo": "La cuenta que duele es la que te ahorra meses trabajando gratis.",
      "hint": "Desliza →"
    },
    {
      "type": "signal",
      "etiqueta": "Paso 1",
      "titulo": "Lo que crees ganar no es lo que te queda",
      "apoyo": "Cada venta se come sola: materiales, envío y una reserva para impuestos.",
      "icon": "tag",
      "cardTone": "moss"
    },
    {
      "type": "calc",
      "etiqueta": "Ejemplo",
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
        },
        {
          "label": "− Reserva para impuestos",
          "valor": "$50"
        }
      ],
      "total": {
        "label": "Te queda por venta",
        "valor": "$150"
      },
      "nota": "Tu reserva fiscal depende del país y de sus leyes fiscales."
    },
    {
      "type": "signal",
      "etiqueta": "Paso 2",
      "titulo": "Hay dinero que se va aunque no vendas nada",
      "apoyo": "Herramientas, publicidad, renta, suscripciones. Salen igual los días en cero.",
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
          "valor": "$150"
        }
      ],
      "total": {
        "label": "Ventas al mes",
        "valor": "67"
      },
      "nota": "Con 67 solo dejas de perder. Todavía no te pagas ni ganas un peso."
    },
    {
      "type": "signal",
      "etiqueta": "Paso 3",
      "titulo": "Ahora mira lo que vale tu tiempo",
      "apoyo": "Meses sin pagarte no son sacrificio noble: son un riesgo. Y tu sueldo solo entra si las ventas lo sostienen; el negocio también pide reinversión.",
      "icon": "clock",
      "cardTone": "moss"
    },
    {
      "type": "calc",
      "etiqueta": "Con tu pago incluido",
      "titulo": "La meta que casi nadie calcula",
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
          "valor": "$150"
        }
      ],
      "total": {
        "label": "Ventas al mes para costos + tu pago",
        "valor": "147"
      },
      "nota": "$22,000 ÷ $150 ≈ 147. Esa es la meta para cubrir costos y pagarte. Si no llegas, prioriza reinvertir."
    },
    {
      "type": "text",
      "titulo": "Si esa cifra te aprieta el pecho, mejor [ahora] que después de invertir.",
      "apoyo": "Todavía puedes cambiar precio, costos o el plan. Lo caro es descubrirlo cuando ya pusiste el dinero."
    },
    {
      "type": "cta",
      "titulo": "Decide con los ojos abiertos",
      "apoyo": "Guárdalo y haz esta cuenta antes de invertir.",
      "boton": "¿Tu meta se parece a 67… o a 147? Cuéntanos",
      "lema": "Tú decides, nosotros te impulsamos."
    }
  ]
}
```

2. Respeta la identidad Marcador en `builds/carrusel-04.js` y `template/carrusel-04.css` (familias distintas por slide; ver [diseno.md](diseno.md)).
3. Ejecuta `pnpm build:04` (o `node builds/carrusel-04.js`) y confirma 9 PNG a 1080x1350 en `output/carrusel-04/`.
4. Revisa cada PNG según las "Reglas de calidad" de `docs/base.md` y corrige desbordes ajustando CSS, no el texto.

Notas específicas:
- El calc del Paso 1 incluye la fila **Reserva para impuestos**; los totales de equilibrio usan $150 por venta.
- El Paso 3 deja claro: pagarte a ti solo si ventas y números reales lo permiten; el negocio ocupa reinversión.
- Un solo coral por slide (palabra marcada, total o botón).
- No es asesoría fiscal.
````

## Pie de foto (para Instagram)

```
Tu idea puede emocionarte… y aún así no pagarte.

Antes de invertir, haz tres cuentas: qué te queda por venta (después de costos e impuestos), cuántas ventas necesitas para no perder, y cuántas para pagarte a ti. Meses sin cobrarte no son sacrificio noble: son un riesgo. Y tu sueldo solo entra si las ventas reales lo sostienen; el negocio también pide reinversión.

Si la cifra te aprieta, mejor ahora que después de poner el dinero. Guárdalo y haz la cuenta antes de invertir.

Contenido informativo. No es asesoría fiscal ni financiera.

#emprender #puntodeequilibrio #impuestos #ideasdenegocio #validaciondeideas #decida
```

