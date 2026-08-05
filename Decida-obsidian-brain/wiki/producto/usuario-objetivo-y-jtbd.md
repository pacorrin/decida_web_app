---
type: product
tags: [decida, usuario, jtbd]
updated: 2026-08-05
---

# Usuario objetivo y Jobs To Be Done

Fuentes: [[../../raw/notion/01-prd-business-viability-assessment]] · `PRODUCT.md`

## Usuario primario
Personas con un trabajo principal que quieren iniciar un negocio, o personas que ya tienen un negocio y quieren escalarlo — enfocadas en **una idea a la vez**. Llegan cuando necesitan evaluar si una idea específica vale el riesgo bajo sus **condiciones y restricciones actuales** (ingreso, horario, capital, tolerancia al riesgo, objetivos).

## Perfil inicial ideal (Notion)
- Tiene una o varias ideas en mente, no sabe cuál conviene más.
- Tiene miedo de perder dinero.
- Tiene tiempo limitado.
- Quiere claridad antes de invertir.
- Está dispuesta a pagar poco por un diagnóstico inmediato.

## Audiencias secundarias (implícitas, no primarias)
Freelancers, estudiantes, y otros comparando una sola oportunidad — mismo job: decidir si proceder, ajustar o pausar.

## Jobs To Be Done
1. *Cuando tengo una idea de negocio y no sé si vale la pena*, quiero analizarla con criterios objetivos para decidir si avanzar, ajustar o descartarla.
2. *Cuando tengo capital limitado*, quiero saber qué tan riesgosa es mi idea antes de gastar dinero.
3. *Cuando tengo empleo*, quiero saber si mi idea cabe en mis horarios y si realmente podría crecer.

## Preguntas centrales que el usuario trae
- ¿Con mis recursos actuales, esta idea tiene sentido?
- ¿Cuál es el mayor riesgo que no estoy viendo?
- ¿Cuánto tendría que vender para recuperar mi inversión?
- ¿Este negocio cabe en mis horarios?
- ¿Estoy creando un negocio o un autoempleo?
- ¿Qué debería validar primero antes de invertir más?

Estas preguntas mapean 1:1 con las 6 dimensiones del [[../framework/dimensiones-de-viabilidad|framework de viabilidad]].

## Contexto operativo (código, `PRODUCT.md`)
- Idioma y mercado: español (tono de México), precios y ejemplos en MXN.
- Sesión típica: ~10–15 minutos a través del onboarding multi-paso bajo `/analizar`.
- Loop central: describir idea → confirmar entendimiento compartido → comprometerse (paso de pago) → responder preguntas guiadas → recibir reporte con señales por dimensión, riesgos y plan de validación.
- Los usuarios pueden volver más tarde vía **Mis evaluaciones** para reabrir diagnósticos completados (email + verificación).

## Ver también
[[prd]] · [[principios-de-producto]] · [[../experiencia/flujo-de-onboarding]]
