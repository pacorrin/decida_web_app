---
type: product
tags: [decida, features, roadmap, brief-de-marca, ia, creditos]
updated: 2026-10-30
status: planeado, sin implementar
---

# Nuevas features — planes por construir

Registro de funcionalidades nuevas **planeadas** (no implementadas). Cada una se documenta aquí antes de tocar código; cuando se construya se mueve su detalle a la página de arquitectura o experiencia que corresponda. Contexto del producto: [[prd]] · [[roadmap-y-backlog]] · [[retencion-y-plan-de-ejecucion]].

| # | Feature | Estado | Fecha |
|---|---|---|---|
| 1 | Generador de brief de marca | Plan, sin alcance cerrado | 2026-10-30 |

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

## Ver también
[[prd]] · [[roadmap-y-backlog]] · [[retencion-y-plan-de-ejecucion]] · [[pricing-y-gtm]] · [[../decisiones/modelo-de-creditos-hibrido]] · [[../framework/prompts-de-ia]]
