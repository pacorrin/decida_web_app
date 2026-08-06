# obsidian-brain de Decida — schema

Este directorio es un **segundo cerebro** sobre el negocio Decida, siguiendo el patrón LLM Wiki (raw sources inmutables → wiki interconectado que un LLM mantiene → este documento como schema). Vive dentro del repo (`decida/Decida-obsidian-brain/`) pero es conceptualmente independiente del código de la app — es la capa de conocimiento de negocio, no de ingeniería. Es el vault de Obsidian del usuario (contiene `.obsidian/` con su configuración local — no tocar esa carpeta).

Está pensado para abrirse como **vault de Obsidian** (grafo, backlinks, búsqueda) mientras un agente de Claude Code lo mantiene.

## Las tres capas de conocimiento (importante, léelo antes de tocar nada)

1. **`raw/`** — fuentes inmutables. Snapshots de Notion (con URL + fecha de fetch en el frontmatter), futuras minutas, y cualquier documento externo que se ingiera. **Nunca edites un archivo de `raw/` para "corregirlo"** — si una fuente quedó obsoleta, la corrección va en el wiki, señalando la brecha. Si hay que reflejar una nueva versión de la fuente (ej. la página de Notion cambió), agrega una nota de actualización o un nuevo snapshot fechado, no sobrescribas silenciosamente el original.
2. **Código del repo** (`../src`, `../prisma`, `../PRODUCT.md`, `../DESIGN.md`, `../AGENTS.md`, `../docs/`) — **también es una fuente, pero no se duplica en `raw/`**. El código cambia constantemente y vive versionado en git; duplicarlo aquí lo volvería stale de inmediato. Las páginas wiki citan rutas de archivo directamente (ej. `src/lib/scoring/index.ts`) en vez de copiar código. Cuando cites código, cita la ruta real, no la pegues completa salvo fragmentos cortos e ilustrativos.
3. **`wiki/`** — el cerebro propiamente dicho. Páginas markdown interconectadas con `[[wikilinks]]`, frontmatter YAML, y **síntesis** — no transcripción. Aquí es donde vive el valor: cruces entre lo que Notion dice que debería pasar y lo que el código realmente hace.

## Estructura de `wiki/`

```
wiki/
├── overview.md                      ← punto de entrada, mapa de todo
├── vision-mision-valores.md
├── glosario.md
├── producto/                        ← qué es, para quién, cómo se vende
│   ├── prd.md
│   ├── usuario-objetivo-y-jtbd.md
│   ├── principios-de-producto.md
│   ├── pricing-y-gtm.md
│   └── roadmap-y-backlog.md
├── framework/                       ← el IP central: cómo se evalúa una idea
│   ├── dimensiones-de-viabilidad.md
│   ├── scoring-engine.md
│   ├── criterios-de-evaluacion.md
│   └── prompts-de-ia.md
├── experiencia/                     ← cómo lo vive el usuario
│   ├── flujo-de-onboarding.md
│   ├── reporte-de-resultado.md
│   └── landing-y-copy.md
├── arquitectura/                    ← cómo está construido
│   ├── stack-tecnico.md
│   ├── modelo-de-datos.md
│   ├── manejo-de-errores-y-reembolsos.md
│   └── historial-de-evaluaciones.md
├── marca/
│   └── sistema-de-diseno.md
├── decisiones/
│   └── evolucion-del-producto.md    ← registro vivo de brechas Notion vs código
└── reuniones/
    └── minutas.md                   ← índice; hoy documenta que NO hay minutas de Decida aún
```

Cuando una categoría crezca (ej. varias minutas reales), conviértela en carpeta con un índice (`minutas.md` ya está preparado para eso).

## Convención de página wiki

Cada página lleva frontmatter:
```yaml
---
type: overview | product | framework | experiencia | arquitectura | marca | decision-log | reuniones | reference | concept
tags: [decida, ...]
updated: YYYY-MM-DD
---
```

Estructura de contenido recomendada:
- Línea de fuentes al inicio (enlaza `raw/` y/o rutas de código reales).
- Síntesis del contenido, no copia — para el contenido crudo, el lector va a `raw/`.
- **Notas de brecha explícitas** cuando el diseño (Notion) y la implementación (código) difieren — usa el formato `> ⚠️ **Brecha confirmada**: ...` o `> Nota de brecha: ...` para que sean grep-eables.
- Sección `## Ver también` al final con 3-5 `[[wikilinks]]` a páginas relacionadas. Enlaza liberalmente — un link a una página que aún no existe está bien, marca algo pendiente de escribir.

## Convención de brecha (Notion vs código)

Este negocio tiene una particularidad: el diseño original en Notion (jun–jul 2026) y el código en producción ya divergieron en varios puntos (ver [[wiki/decisiones/evolucion-del-producto]]). Cuando detectes una divergencia nueva durante una ingesta o consulta:
1. No la "arregles" silenciosamente en `raw/`.
2. Anótala en la página wiki relevante con el formato de brecha de arriba.
3. Agrégala como entrada nueva en `wiki/decisiones/evolucion-del-producto.md`.
4. Si afecta al mapa de gaps activos, actualiza `wiki/overview.md#Gaps de conocimiento activos`.

## Operaciones

### Ingest (ingerir una fuente nueva)
1. Si es Notion: usar las herramientas MCP de Notion (`notion-search`, `notion-fetch`) para traer el contenido completo. Guardar snapshot en `raw/notion/<slug>.md` con frontmatter `source`, `title`, `url`, `fetched`.
2. Si es una minuta de reunión: seguir el protocolo detallado en `wiki/reuniones/minutas.md`.
3. Si es código: **no copiar a raw/** — leer el código directamente y actualizar las páginas wiki que correspondan, citando rutas.
4. Determinar qué páginas wiki toca la fuente nueva (normalmente 3-10). Actualizarlas: agregar el hecho nuevo, resolver o confirmar una brecha pendiente, agregar cross-links.
5. Actualizar `index.md` si se crea una página nueva.
6. Agregar entrada a `log.md`.

Modo de trabajo con este usuario: **ingesta en batch, sin checkpoints intermedios** — se procesa todo de un tirón y se presenta el resultado completo para revisión posterior. El usuario pedirá ajustes después de revisar, no durante.

### Query (responder una pregunta contra el cerebro)
1. Leer `index.md` primero para ubicar páginas candidatas.
2. Leer las páginas wiki relevantes (no `raw/` directamente, salvo que la pregunta pida el texto original exacto de una fuente).
3. Si la pregunta requiere ver código actual (no solo lo que el wiki ya sintetizó), leer el archivo real del repo — el wiki puede estar desactualizado respecto al código si no se ha hecho lint recientemente.
4. Si la respuesta genera una síntesis nueva de valor duradero (una comparación, un análisis, una decisión), ofrecer archivarla como página nueva en `wiki/` en vez de dejarla solo en el chat.

### Lint (chequeo de salud, ejecutar cuando el usuario lo pida)
Buscar: contradicciones entre páginas · brechas Notion-vs-código detectadas en el código pero no anotadas en `wiki/decisiones/evolucion-del-producto.md` · páginas huérfanas sin backlinks · conceptos mencionados repetidamente sin página propia · `raw/` desactualizado respecto a Notion (recomendar re-fetch de páginas con `fetched` viejo si se sospecha que cambiaron) · afirmaciones sobre "evidencia de clientes reales" que no estén respaldadas por ninguna fuente (recordar la regla de `PRODUCT.md`: nunca fabricar testimonios, métricas o benchmarks).

## Reglas duras (no negociables)

- **Nunca inventar evidencia de negocio**: testimonios, métricas de conversión, número de clientes pagados, benchmarks — si no está en una fuente ingerida, se marca como gap, no se estima ni se asume. Esto hereda la regla explícita de `PRODUCT.md` del propio producto.
- **El código es la fuente de verdad sobre "qué existe hoy"**; Notion es la fuente de verdad sobre "qué se diseñó originalmente y por qué". Cuando entren en conflicto, decir ambas cosas y marcarlo como brecha — nunca resolver el conflicto adivinando cuál es "la correcta".
- Español para todo el contenido del wiki (el negocio opera en español/MX-first) — el código y nombres de archivo/variable se citan tal cual (inglés).
- Todo archivo de página nueva debe llevar frontmatter y terminar en `## Ver también` con links.

## Índice y log
- `index.md` — catálogo por categoría de todas las páginas del wiki, actualizado en cada ingest.
- `log.md` — bitácora cronológica append-only. Formato de entrada: `## [YYYY-MM-DD] tipo | Título` (tipo = ingest, query, lint). Permite `grep "^## \[" log.md | tail -5`.
