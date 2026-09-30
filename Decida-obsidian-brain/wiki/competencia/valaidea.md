---
type: competencia
tags: [decida, competencia, valaidea, validacion]
updated: 2026-09-29
---

# ValaIdea

Fuente: sitio público https://www.valaidea.com/ (home, `/pricing`, `/help`, `/tools/idea-scorecard`, `/explore`, `/blog`, `/terms`, `/contact`, `sitemap.xml`), revisado el **2026-09-29**. Todo lo que aparece aquí son **afirmaciones de ValaIdea en su propio sitio**, no datos verificados por nosotros. Lo que no aparece en el sitio se marca como *no encontrado en el sitio*.

## Qué es

Plataforma SaaS (en inglés, precios en USD) que vende un **"validation sprint" de 7 días** por **$29 USD pago único**. El usuario describe su idea, la plataforma genera una hipótesis, arma con IA una landing page mínima, le sugiere 15 comunidades donde compartirla, mide **vistas, clics y registros** de gente real, y el día 7 entrega un **veredicto: Proceed / Iterate / Kill** (más un cuarto estado, *Insufficient Data*).

Su tesis central es *"señales reales, no puntajes de confianza de IA"*: se posiciona explícitamente **en contra** de los "AI idea validators" que califican ideas con base en texto.

- Operado por "ValaIdea"; en `/contact` la información de negocio dice **India**. Los términos se rigen por leyes de **Estados Unidos**.
- Stack declarado en su help center: Supabase (base de datos y auth), Vercel (hosting), PayPal (pagos), Google Analytics 4 (solo sitio de marketing).
- Tamaño del equipo, fundadores, fecha de lanzamiento, página "About": *no encontrado en el sitio*.

## Para quién

Según `/help`: *"cualquiera con una idea de startup o producto que quiera probar demanda antes de construir"* — solo founders, side-project builders, emprendedores primerizos y founders seriales. El tono, los ejemplos (AI writing coach, meal-planning app, marketplace de nicho) y el blog (Twitter, TikTok, lifetime deals, G2) apuntan a **founders de software/SaaS angloparlantes**, no a negocios físicos ni a pymes tradicionales.

## Cómo funciona

1. **Compra** de un crédito de sprint ($29, vía PayPal). Los créditos no expiran. Cuenta con magic link o Google / GitHub / LinkedIn (sin contraseña).
2. **Arranque con 4 preguntas**: nombre de la idea, para quién es, qué problema resuelve, cómo lo resuelven hoy (workaround actual).
3. **Día 1 — Clarify**: la IA genera una **hipótesis de validación** ("la pregunta exacta que tu sprint va a responder").
4. **Día 2 — Launch**: la IA genera headline, subheadline, 3 bullets y CTA; el usuario edita el texto (no el diseño) y publica en `valaidea.com/v/tu-slug`. El diseño fijo es deliberado: *"elimina 'mi página no era lo bastante buena' como excusa"*.
5. **Día 3 — Share**: **Community Playbook** con 15 comunidades por nicho y un mensaje listo para copiar por comunidad; compartir en un clic a Twitter, LinkedIn y Hacker News. Opcional: listarse en `/explore` (vitrina pública de ideas en validación, *opt-in*).
6. **Días 4–6 — Commit / Reality Check / Final Push**: dashboard en tiempo real con benchmarks; el día 5 la IA genera un resumen de señales. El usuario avanza a su ritmo: cada día se desbloquea al completar el anterior.
7. **Día 7 — Verdict**: veredicto con explicación. El usuario puede **aceptarlo o hacer override, pero debe escribir por qué** (queda registrado junto a los datos).

Regla: **un solo sprint activo a la vez** ("te obliga a enfocarte en una hipótesis").

## Qué entrega

- Hipótesis de validación escrita.
- Landing page publicada y hospedada.
- Dashboard de **3 señales**: vistas (exposición), clics en CTA (interés), registros con email (compromiso). Declaran explícitamente que **no** miden tiempo en página, scroll, rebote, likes ni "sentimiento IA".
- **Veredicto con umbrales públicos** (según `/help`): mínimo 100 vistas para un veredicto válido; CTR ≥ 2% = interés; ≥ 3 registros o ≥ 1% de conversión = compromiso. Ambos → *Proceed*; interés sin compromiso → *Iterate*; poco interés con exposición suficiente → *Kill*; < 100 vistas → *Insufficient Data*. (En la home y en `/pricing` citan como "fuerte" 5%+ CTR y 2%+ conversión — son benchmarks de referencia distintos a los umbrales del veredicto.)
- Los datos y la landing siguen accesibles después del día 7.
- **No entrega**: análisis financiero, costos, precios, unit economics, evaluación de fit personal, riesgos operativos ni plan de validación posterior — *no encontrado en el sitio*. Tampoco se encontró un reporte descargable/PDF.

**Gancho gratuito — AI Idea Scorecard** (`/tools/idea-scorecard`): sin registro ni email, en ~30 segundos califica la idea con IA en **4 dimensiones** (Problem Clarity, Market Potential, Differentiation, Testability) y da un score con feedback breve. Ellos mismos lo presentan como *"un gut-check, no un veredicto"*.

## Precio y monetización

| Concepto | Detalle (según su sitio) |
|---|---|
| Sprint | **$29 USD, pago único**, sin suscripción ni cargos recurrentes |
| Sprints adicionales | $29 c/u; "sin bundles, sin tiers" |
| Créditos | No expiran; se pueden comprar por adelantado |
| Gratis | AI Idea Scorecard (sin cuenta) |
| Pagos | PayPal |
| Reembolsos | Completo antes de iniciar el sprint "sin preguntas"; falla técnica suya → reembolso completo o crédito en cualquier momento; durante el sprint por falla técnica → parcial o crédito; **después de terminar, sin reembolso** ("el entregable ya se proporcionó") |

Planes empresariales, descuentos, afiliados o precios en otras monedas: *no encontrado en el sitio*.

## Posicionamiento y mensajes

- Headline: *"Stop analyzing. Start validating."* · Title: *"Test your idea in 7 days"*.
- Anti-posicionamiento visual: muestran maquetas falsas de competidores con mensajes como *"Not an idea scoring tool"*, *"Not a market research dashboard"*, *"Not another 'AI idea validator'"* (ej. una "IA" que dice *"94% success probability! Ship it!"*).
- Filtro de audiencia: *"If you want motivation, this isn't for you. If you want data, keep reading."*
- Narrativa de dolor: comparativa "sin validación" (checklist, 3 meses después, *"$12,000 spent. Zero users. Zero data."*) vs "con un sprint" (dashboard con verdict).
- Tres historias de caso, una por veredicto: Proceed (AI writing coach), **Iterate** (meal-planning: tráfico decente, 1 registro de 800 vistas → cambiaron el CTA), **Kill** (*"The honest kill"*: 500 vistas, 2 clics, 0 registros → *"doloroso por un día, ahorró 3 meses"*). Marcado como *"Example sprint — results vary"*.
- Pricing: *"Pay for commitment."* / *"One sprint. One price. One verdict."*
- Blog: *"No fluff. Just validation."* — ~18 artículos (ene 2025 – feb 2026), mayoría sobre growth/marketing para founders; último artículo del sitemap: 2026-02-24.

## Señales de confianza

- **Testimonios, logos de clientes, número de usuarios, prensa, ratings**: *no encontrado en el sitio*. Las historias de la home se presentan como ejemplos ("Example sprint"), no como clientes con nombre.
- `/explore` ("Ideas being validated this week") mostraba **una sola tarjeta** ("FitMeal"), que coincide con el ejemplo usado en el placeholder del scorecard — no se puede interpretar como tracción.
- Sí hay señales de confianza **por transparencia**: umbrales del veredicto publicados, lista de lo que *no* miden, política de reembolso clara en la página de precios, privacidad explícita (no entrenan IA con tus ideas, visitantes anónimos, borrado en 30 días), FAQ amplio, soporte por email con promesa de respuesta en 24 h hábiles, disclaimer de "el veredicto no es garantía" repetido en help y términos.
- Búsqueda web (2026-09-29): no aparecieron reseñas independientes ni resultados verificados; solo sus propias páginas y un producto distinto con nombre parecido (Validea).

## Puntos fuertes que nos podrían servir para Decida

Ideas concretas, mapeadas a áreas de Decida. Ninguna implica copiar su modelo (medir tráfico) — solo adaptar la mecánica.

### Onboarding
1. **Arranque de 4 preguntas ultra claras** (idea, para quién, problema, cómo lo resuelven hoy). → Decida podría agregar o reforzar **"¿cómo lo resuelve hoy tu cliente?"** (alternativa actual) en la fase de mercado: alimenta *viabilidad comercial* y es una pregunta que el emprendedor casi nunca se hace. Revisar contra [[../producto/gaps-onboarding-vs-framework]].
2. **Hipótesis explícita al inicio** ("la pregunta exacta que vas a responder"). → Nuestro paso *"Así entendimos tu idea"* podría cerrar con una frase tipo **"La pregunta que vamos a responder: ¿tiene sentido para ti abrir X con Y pesos y Z horas a la semana?"**. Refuerza que es un diagnóstico, no un oráculo.
3. **Progreso por etapas con nombre** (Clarify → Launch → Share → …). → Nombrar las fases del cuestionario de Decida (ej. *Tú · Tu producto · Tus números · Tu mercado · Tus riesgos*) para que se sienta como un proceso guiado y reduzca abandono. Ver [[../experiencia/flujo-de-onboarding]].

### Reporte
4. **Veredicto con reglas publicadas.** Explican exactamente qué umbral lleva a cada veredicto. → En el reporte (o en una página "Cómo evaluamos") explicar **por qué salió cada semáforo** y cómo los pesos (20/25/25/15/10/5) llevan a la recomendación. Transparencia = confianza, y es coherente con "el diagnóstico es el producto".
5. **Override con justificación escrita.** El usuario puede no estar de acuerdo, pero debe escribir por qué. → Decida podría permitir **"No estoy de acuerdo con esta recomendación"** con un campo de razón: da señal de producto valiosa (¿dónde el motor se equivoca?) y respeta la autonomía del usuario sin diluir el diagnóstico. Candidato para el feedback survey existente.
6. **Estado "datos insuficientes".** No fuerzan un veredicto si no hay datos. → Decida podría marcar dimensiones con **"confianza baja: faltan datos"** cuando el usuario dejó campos vagos o en fallback, en vez de un semáforo que aparente precisión. Conecta con [[../framework/scoring-engine]].
7. **Decir qué NO mide.** → Una línea en el reporte: *"Este diagnóstico no mide demanda real ni garantiza ventas; para eso está tu plan de validación"*. Encaja con la regla de nunca prometer éxito. Ver [[../experiencia/reporte-de-resultado]].

### Landing / copy
8. **Normalizar el resultado negativo.** El caso *"The honest kill"* vende la recomendación dura como ahorro ("doloroso un día, ahorra 3 meses"). → Decida tiene *pausar por ahora* y *ajustar la idea*: la landing podría mostrar **un ejemplo por cada una de las 4 recomendaciones**, no solo el caso positivo, con el mensaje "saber que no hoy también es ganar". Marcarlos siempre como ejemplos ilustrativos (nunca como testimonios).
9. **Contraste "sin diagnóstico / con diagnóstico"** con costo concreto del error (ellos: *$12,000 spent*). → Versión mexicana: renta, inventario, equipo comprado antes de validar, en MXN — siempre como escenario ilustrativo, no como estadística.
10. **Anti-posicionamiento + filtro de audiencia** (*"si buscas motivación, esto no es para ti"*). → Decida podría decir abiertamente **"No te vamos a decir que tu idea es genial. Te vamos a decir si tiene sentido para ti"**. Ver [[../experiencia/landing-y-copy]].

### Pricing / freemium
11. **Herramienta gratis sin registro como imán de tráfico** (Scorecard, 30 segundos, sin email). → Decida podría tener un **mini-chequeo gratuito sin cuenta** (3–5 preguntas → 1–2 semáforos orientativos) que invite al diagnóstico freemium completo. Ojo: hoy el freemium requiere cuenta; esto sería un escalón previo, no un reemplazo. Decisión pendiente de producto, ver [[../producto/pricing-y-gtm]].
12. **Precio simple y un solo mensaje** (*"One sprint. One price. One verdict."*). → Mantener la oferta de lanzamiento en **un solo plan de $99 MXN/mes** y comunicarlo con la misma limpieza antes de agregar niveles.
13. **"Un activo a la vez" como regla de enfoque, no como castigo.** Ellos lo justifican como disciplina. → Decida ya tiene *1 evaluación activa sin suscripción*; se puede **enmarcar en copy como enfoque** ("una idea a la vez, bien pensada") en lugar de solo como límite del plan gratis.

### Confianza
14. **Política de cobro clara junto al precio** (tabla "Clear terms, no surprises"). → Como Decida es **sin reembolsos**, poner en la página de precios, en lenguaje simple: qué ves gratis, qué desbloqueas, cómo cancelas y que el acceso sigue hasta fin de mes. Claridad compensa la ausencia de reembolso.
15. **Privacidad explícita**: "no entrenamos IA con tus ideas", "tus datos son solo tuyos", borrado de cuenta en 30 días. → Muy relevante para emprendedores que temen que "les roben la idea". Agregar un bloque corto de privacidad en landing y FAQ de Decida (verificando antes qué hacemos realmente con los datos y con OpenAI).
16. **FAQ extenso y honesto** que incluye "¿Debo confiar en el resultado?" con respuesta humilde. → Replicar esa pregunta en el FAQ de Decida.

## Dónde Decida se diferencia / debilidades de ellos

- **Diferente trabajo por hacer.** ValaIdea responde *"¿hay gente interesada?"* (demanda). Decida responde *"¿tiene sentido para mí, con mis recursos?"* (viabilidad integral: fit personal, finanzas, riesgo, operación). No miden costos, margen, capital, tiempo disponible ni riesgo personal. Son **complementarios**: el plan de validación de Decida podría incluso recomendar un experimento tipo landing.
- **Mercado e idioma.** Solo inglés, USD, PayPal, términos bajo leyes de EE. UU., ejemplos y comunidades anglosajonas (Hacker News, Twitter). Decida es español de México, MXN, pensado para negocios locales — no solo startups de software.
- **Tipo de negocio.** Su método (landing + comunidades online + registros por email) sirve para productos digitales; es débil para una taquería, un taller, una tienda o un servicio local, donde la demanda no se mide con signups. Ahí Decida es más aplicable.
- **Exige trabajo y audiencia.** El resultado depende de que el usuario consiga ≥ 100 visitas en comunidades; si no, sale *Insufficient Data*. Decida entrega diagnóstico en una sesión sin depender de tráfico.
- **Señal estrecha.** 3 métricas de embudo; un Kill puede reflejar un mal copy o comunidades equivocadas más que una mala idea (ellos mismos lo reconocen en el caso Iterate).
- **Sin prueba social.** No hay testimonios, números ni prensa en el sitio; `/explore` casi vacío; blog sin publicaciones desde feb 2026 según el sitemap. Sugiere tracción temprana o limitada (inferencia, no dato).
- **Pago único sin gratis real del producto principal** (solo el scorecard). Decida ofrece el diagnóstico completo en freemium con vista recortada.

## Qué nos dice sobre el mercado

- Hay emprendedores dispuestos a **pagar por reducir incertidumbre antes de construir**, y al menos un competidor apuesta a que el punto de precio de entrada es bajo (~$29 USD por evento de validación). Es una señal a favor de que el problema existe — **no** prueba que el negocio de ValaIdea funcione (no publican usuarios ni ingresos).
- Existe saturación percibida de "validadores de ideas con IA" en inglés — tanta que ValaIdea construye su marca en contra de ellos. Lectura para Decida: el diferenciador no puede ser "usamos IA", sino **el marco (6 dimensiones, fit personal, números) y el idioma/mercado**.
- El segmento hispanohablante / mexicano **no aparece atendido** por este competidor. Oportunidad, pero también hipótesis a validar en la beta, no conclusión.
- La honestidad (resultados negativos, "no es garantía") es un valor de marca que el mercado de este nicho ya usa como argumento de venta; coincide con los principios de Decida.

## Fuente

- https://www.valaidea.com/ — revisado el 2026-09-29 (WebFetch + `curl` de HTML y `sitemap.xml`; sin navegador).
- Páginas revisadas: `/`, `/pricing`, `/help`, `/tools/idea-scorecard`, `/explore`, `/blog`, `/terms` (última actualización declarada: 2026-02-18), `/contact`, `sitemap.xml`, `robots.txt`.
- No revisadas: `/privacy`, `/refund`, `/cookies` (su contenido clave aparece resumido en `/help` y `/pricing`); artículos individuales del blog; el dashboard y el flujo interno del sprint (requieren cuenta y pago). Las respuestas del FAQ de la home no se renderizan sin JS, pero las mismas preguntas están respondidas en `/help`.

## Ver también
[[competencia]] · [[../producto/pricing-y-gtm]] · [[../experiencia/landing-y-copy]] · [[../experiencia/reporte-de-resultado]] · [[../experiencia/flujo-de-onboarding]] · [[../framework/dimensiones-de-viabilidad]]
