---
type: product
tags: [decida, features, roadmap, brief-de-marca, ia, creditos]
updated: 2026-10-30
status: planeado, sin implementar (brief de marca y finanzas personales)
---

# Nuevas features — planes por construir

Registro de funcionalidades nuevas **planeadas** (no implementadas). Cada una se documenta aquí antes de tocar código; cuando se construya se mueve su detalle a la página de arquitectura o experiencia que corresponda. Contexto del producto: [[prd]] · [[roadmap-y-backlog]] · [[retencion-y-plan-de-ejecucion]].

| # | Feature | Estado | Fecha |
|---|---|---|---|
| 1 | Generador de brief de marca | Plan, sin alcance cerrado; en el mapa, no es prioridad ahora | 2026-10-30 |
| 2 | **Cifra** (finanzas personales) | Plan inicial, en el mapa; la prioridad actual sigue siendo el análisis de ideas | 2026-10-30 |

## Visión de plataforma (2026-10-30)

Decisión del usuario que da contexto a todo lo de esta página:

- **Decida es una plataforma con varias herramientas, no un solo sitio.** El análisis de ideas es el enfoque principal **por ahora**; las demás herramientas llegan después.
- **El propósito es construir una comunidad** de desarrollo personal acompañado de finanzas y planeación, para emprendedores y para quien quiere ingresos extra. Cada persona decide su rumbo: dejar su empleo, crecer un proyecto dentro de su marca, hacer crecer su marca, o solo generar un ingreso adicional.
- **Las herramientas son el complemento, no el uso principal.** Pueden ser una fuente fuerte de ingreso, pero no es lo que más le importa al usuario; sirven para dar a la comunidad la mayor cantidad posible de ayuda útil.
- **Por eso se rehízo el navbar público** (commit `25d187e`): el navbar principal queda con «Inicio» y las acciones de cuenta, y la franja de abajo muestra las secciones de la landing. Más adelante el navbar principal sumará las herramientas nuevas (brief de marca, finanzas personales u otras), cada una como entrada propia.
- **Nombres:** la herramienta de finanzas se llama **Cifra** (ver abajo). Las demás herramientas tienen nombre de trabajo en la metodología.

### Metodología CDPE: Cifra, Decida, Planifica, Ejecuta (2026-10-30)

Propuesta del usuario: darle a la plataforma una filosofía propia y simple (no se reinventa nada): **hay un orden para llegar a un objetivo preciso**. Cuatro herramientas en secuencia, todas bajo la marca Decida:

| Etapa | Herramienta | Qué hace | Estado |
|---|---|---|---|
| **C**ifra | Finanzas | Estatus financiero y antecedentes de la persona o del negocio: visibilidad actual y proyección para saldar deudas, ahorrar para una inversión u otros objetivos | Planeada ([[#2. Cifra (finanzas personales)]]) |
| **D**ecida | Análisis de ideas | Lo que ya existe: análisis de la idea y cierto análisis de mercado | **Construida** (beta) |
| **P**lanifica | Planes | Arma planes de corto y mediano plazo con toda la información recabada del usuario | Por definir (relacionada con [[retencion-y-plan-de-ejecucion]]) |
| **E**jecuta | Arranque del proyecto | Herramientas pequeñas para empezar: brief de marca ([[#1. Generador de brief de marca]]), identidad, y más adelante generar videos cortos publicitarios e imágenes para redes | Largo plazo |

Idea a largo plazo dentro de Ejecuta (sin compromiso): ser **intermediario entre usuarios y profesionales** (finanzas, marketing, contabilidad, administración) para acompañar la realización de la idea. Si se explora, revisar responsabilidad sobre el trabajo del profesional, asesoría regulada y comisiones.

Notas de diseño:
- Cifra es el único nombre sin forma de acción; el usuario lo prefiere así («cifra son números»). Los otros tres son verbos.
- «Decida» es a la vez la marca y una etapa; al comunicarlo conviene distinguir «Decida, la plataforma» de «Decida, el análisis de ideas» (por ejemplo, llamar a la etapa «Análisis Decida» en la interfaz).
- El orden C-D-P-E no obliga al usuario: puede entrar por cualquier herramienta; la secuencia es la guía.
- La **sigla CDPE** es difícil de pronunciar; usarla solo como etiqueta interna y comunicar la secuencia con los cuatro nombres.

Cómo contarlo al público: [[../marca/narrativa-del-orden-decida]].

Relación con lo ya escrito: refuerza el insight de [[retencion-y-plan-de-ejecucion]] (retención en la ejecución, no en el diagnóstico). Ojo con el alcance de [[prd]], que hoy describe un producto de diagnóstico de ideas y deja fuera la comunidad: este cambio de enfoque habría que reflejarlo ahí cuando se decida formalmente.

---

## 1. Generador de brief de marca

### Qué es
Que Decida, además de decir si una idea conviene, genere un **brief de marca**: el documento que una persona le entrega a un diseñador o agencia para crear la identidad del negocio. Se arma con los puntos de un brief estándar y con lo que Decida ya sabe de la idea.

### Por qué encaja
- Es el paso natural después del veredicto: quien decide probar la idea necesita ponerle nombre, voz y rostro. Apoya la tesis de [[retencion-y-plan-de-ejecucion]] (retención en la ejecución, no solo en el diagnóstico).
- Reutiliza datos que ya se capturan (resumen de la idea, perfil, mercado objetivo, competencia de la investigación web), así que el usuario responde poco.
- Es una salida concreta y compartible, útil como entregable aparte del reporte.

### Tensión con el alcance actual
El backlog original de Notion deja **fuera de alcance** un «generador de plan de negocio/pitch deck» ([[roadmap-y-backlog]]). El brief de marca es un documento más acotado, pero roza esa línea. **Decisión pendiente** del usuario: tratarlo como extensión del reporte (post-beta) y no como producto nuevo.

### Contenido del brief (las 7 secciones base)
Fuente de los puntos: lista de secciones esenciales de un brief de marca que pasó el usuario el 2026-10-30.

| # | Sección | Qué incluye | De dónde sale |
|---|---|---|---|
| 1 | Información general de la empresa | Nombre del negocio y orígenes; misión (qué hace hoy), visión (a dónde aspira), valores principales | Resumen de la idea (ya existe); nombre, misión, visión y valores los propone la IA y el usuario corrige |
| 2 | Diagnóstico y objetivos | Por qué el proyecto ahora (lanzamiento, relanzamiento, expansión); problema de negocio que resuelve la marca | Pregunta corta al usuario + inferencia del veredicto |
| 3 | Público objetivo | Demográficos (edad, género, ubicación); psicográficos (estilo de vida, intereses, dolores y necesidades) | Mercado objetivo del reporte / investigación web, si existe |
| 4 | Propuesta de valor y diferenciadores | Qué lo hace único frente a la competencia; beneficio principal para el cliente | Reporte (fortalezas) + idea |
| 5 | Competencia | Competidores directos e indirectos; qué admirar y qué errores evitar | Investigación de mercado del reporte; sin ella queda vacío o se pide al usuario |
| 6 | Tono y personalidad | Cómo suena y habla la marca (cercana, disruptiva, elegante, técnica); atributos si la marca fuera una persona | Selección del usuario entre opciones + redacción de la IA |
| 7 | Alcance y entregables | Qué se necesita (logotipo, manual de identidad, tipografías, papelería, empaques); tiempos y fechas | Casillas que marca el usuario; fechas las pone el usuario |

### Propuesta de flujo
1. Desde un reporte terminado aparece «Crear brief de marca».
2. Pantalla corta de confirmación: se muestran las secciones 1–5 **ya prellenadas** con lo que se sabe; el usuario edita lo que no le cuadre.
3. Preguntas nuevas solo para lo que no se puede inferir: motivo del proyecto (2), tono (6), entregables y fechas (7).
4. La IA redacta el brief completo con salida estructurada (una clave por sección) para poder editar y volver a generar por sección.
5. Vista del brief editable, con descarga (PDF) y copia, y guardado ligado al análisis.

### Propuesta técnica (a validar contra el código antes de empezar)
- **Datos:** modelo nuevo ligado al análisis (por ejemplo `brand_briefs`, con las respuestas del usuario y el contenido por sección en JSON), siguiendo el prefijo snake_case de [[../arquitectura/modelo-de-datos]].
- **IA:** módulo propio junto a `src/lib/ai/` con esquema por sección y prompt con las mismas reglas de tono de [[../framework/prompts-de-ia]]; respaldo determinista si OpenAI falla, como en el reporte.
- **Créditos:** debe cobrarse con el flujo de [[../decisiones/modelo-de-creditos-hibrido]] (cobro antes, devolución si falla). Costo en créditos **por definir** una vez medido el gasto real de IA; la generación de un brief sin investigación web debería costar bastante menos que un análisis.
- **Acceso:** requiere cuenta verificada y un análisis propio; la vista previa gratuita queda fuera para no gastar IA sin compromiso.
- **Analítica y errores:** eventos nuevos en [[../arquitectura/analitica-y-eventos]] (inicio, completado, fallo, descarga) y alerta de respaldo de IA en Sentry, igual que el reporte.
- **Legal y marca:** el brief no sugiere ni verifica nombres comerciales registrables; aclarar que no es asesoría legal sobre marcas.

### Preguntas abiertas
1. ¿Se vende dentro de los planes con créditos o como complemento aparte? ¿Cuántos créditos?
2. ¿Solo para análisis con investigación de mercado (mejores secciones 3 y 5) o también para los básicos?
3. ¿La IA propone nombres de marca o solo se usa el que da el usuario?
4. ¿Idioma y país: solo español de México?
5. ¿Entra antes o después de salir de la beta? (Propuesta: después, ver tensión con el alcance arriba.)
6. ¿Formato de salida: PDF, copiar texto, ambos?

### Fases sugeridas
1. **Spec cerrado:** responder las preguntas abiertas y definir costo en créditos.
2. **Núcleo:** modelo de datos, generación con IA por sección, créditos y pruebas.
3. **Experiencia:** pantalla de confirmación, vista editable y descarga.
4. **Medición:** eventos, embudo de uso y revisión de calidad con briefs reales.

---

## 2. Cifra (finanzas personales)

> Nombre elegido el 2026-10-30: **Cifra**, por el usuario, entre varias propuestas (descartó *Alcanza* porque suena a ejecución, no a finanzas). Es un subproducto de la plataforma Decida, no una submarca; la marca principal sigue siendo Decida. Falta revisar dominio y marca en el IMPI.

### Qué es
Una herramienta para que cualquier usuario **ponga al día y capture con facilidad toda su situación financiera**: gastos, deudas, ingresos y lo que tenga que ver con su dinero. No es solo para quien analiza una idea; sirve a la comunidad en general.

### Para qué
1. **Orden propio:** que la persona vea dónde está parada (cuánto entra, cuánto sale, qué debe) y planee a partir de ahí.
2. **Más contexto para ayudar mejor:** con su situación real, Decida puede decir si una idea cabe en su vida (colchón, deudas, tiempo de recuperación) en vez de depender de estimaciones sueltas.
3. **Complemento del análisis de ideas:** hoy el análisis pide presupuesto y datos financieros dentro del onboarding de cada idea ([[../experiencia/flujo-de-onboarding]]). Con esta herramienta esos datos podrían venir ya capturados y actualizados.

### Condición central: consentimiento
Los datos financieros **solo se usan en los análisis si el usuario lo autoriza**. Principios propuestos:
- Opt-in explícito, por separado de los términos generales, y revocable en cualquier momento (con efecto: dejan de usarse y se pueden borrar).
- La herramienta funciona sola aunque la persona no autorice el cruce con el análisis de ideas.
- Se explica en lenguaje claro qué dato se usa, para qué análisis y con qué fin.
- Nunca se usan para publicidad ni se comparten con terceros; coherente con [[principios-de-producto]].

### Qué se captura (borrador, por afinar)
| Bloque | Ejemplos |
|---|---|
| Ingresos | Sueldo, ingresos extra, frecuencia |
| Gastos | Fijos, variables, suscripciones |
| Deudas | Tarjetas, préstamos, saldo, tasa, pago mínimo y fecha |
| Ahorro y colchón | Fondo de emergencia, meses de gasto cubiertos |
| Metas | Ahorrar para arrancar un proyecto, salir de deudas, dejar el empleo |

### Cómo se conecta con el análisis de ideas
- Prellenar presupuesto y capacidad de inversión en el onboarding.
- Ajustar el semáforo financiero con la situación real (por ejemplo, deudas altas o poco colchón pesan más ante una idea con riesgo).
- Añadir al reporte un punto de «cabe en tu vida financiera» solo si hay autorización.
- Cuidar que ninguna salida suene a asesoría de inversión o fiscal personalizada.

### Propuesta técnica (a validar contra el código)
- **Captura manual primero.** Sin conexión a bancos en la primera versión: cuesta, exige cumplimiento y genera riesgo. Importar CSV o conectar cuentas queda como fase posterior.
- **Datos:** modelos nuevos ligados a la cuenta del usuario (no al análisis), con un campo de autorización de uso en análisis y su fecha. Prefijo snake_case como en [[../arquitectura/modelo-de-datos]].
- **Seguridad:** son los datos más sensibles de la plataforma; revisar cifrado en reposo, acceso solo del dueño, borrado completo al cerrar la cuenta y registro de quién los lee. Actualizar [[../arquitectura/seguridad-y-proteccion-de-costos]].
- **Legal:** aviso de privacidad específico (datos financieros personales en México) y revisión con asesor antes de lanzar; reglas de [[../decisiones/facturacion-y-cfdi-despues-de-la-beta]] aplican si algo se cobra.
- **Cobro:** por definir si va gratis (ancla de comunidad y fuente de contexto) o dentro de los créditos de [[../decisiones/modelo-de-creditos-hibrido]]. Sin IA, el costo variable es casi nulo.
- **Analítica:** eventos de uso sin enviar montos ni datos financieros a PostHog.

### Tensiones y riesgos
- **Confianza:** pedir datos financieros a un producto en beta exige mucha claridad; un mal manejo daña toda la marca.
- **Alcance:** es un producto grande (cercano a una app de finanzas personales) y compite con apps existentes; conviene un primer corte pequeño.
- **Asesoría regulada:** evitar recomendaciones personalizadas de inversión (ver reglas del producto).
- **Foco:** el análisis de ideas sigue siendo la prioridad; esto va en el mapa sin comprometer fecha.

### Preguntas abiertas
1. ¿Nombre de la herramienta y de la plataforma?
2. ¿Gratis o con créditos? ¿Requiere cuenta verificada (sí, casi seguro)?
3. ¿Primer corte: solo gastos y deudas, o también ingresos, ahorro y metas?
4. ¿Cómo se pide y guarda el consentimiento, y qué pasa al revocarlo?
5. ¿Quién la usa primero: usuarios del análisis o la comunidad abierta?
6. ¿Cuándo se hace la revisión legal de datos financieros?
7. ¿Hay seguimiento (recordatorios, avance de metas) como parte de la comunidad?

### Fases sugeridas
1. **Spec y legal:** responder preguntas, definir consentimiento y aviso de privacidad.
2. **Captura manual** de gastos y deudas, con vista de resumen.
3. **Consentimiento y cruce** con el onboarding y el reporte.
4. **Seguimiento y comunidad:** metas, recordatorios y, más adelante, importación de movimientos.

## Ver también
[[prd]] · [[roadmap-y-backlog]] · [[retencion-y-plan-de-ejecucion]] · [[pricing-y-gtm]] · [[principios-de-producto]] · [[../decisiones/modelo-de-creditos-hibrido]] · [[../framework/prompts-de-ia]]
