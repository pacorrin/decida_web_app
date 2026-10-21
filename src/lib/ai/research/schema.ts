import { z } from "zod";

/**
 * Ficha de mercado: lo que la etapa de investigación entrega a las 9 secciones.
 *
 * Reglas de fondo:
 * - Toda cifra lleva el id de una fuente (`F1`, `F2`…) que fue realmente citada
 *   por la búsqueda. Sin fuente, el campo es `null` o se marca como supuesto.
 * - Lo que no se pudo verificar va a `huecos_de_informacion`; nunca se rellena.
 */

export const sourceIdSchema = z.string().regex(/^F\d+$/);

/** El modelo escribe el id como «F3», «[F3]», «f3» o «3»: se normaliza; lo irreconocible es null. */
const looseSourceId = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v) => {
    const m = String(v ?? "").match(/F?\s*(\d+)/i);
    return m ? `F${m[1]}` : null;
  });

/** El modelo a veces omite la clave en lugar de poner null: se acepta y se normaliza a null. */
const nullable = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((v) => v ?? null);

export const sourceSchema = z.object({
  id: sourceIdSchema,
  titulo: z.string(),
  url: z.string().url(),
  /** Fecha de consulta (YYYY-MM-DD). */
  consultada: z.string(),
  tipo: z.enum(["oficial", "agregador", "otro"]),
});

export type ResearchSource = z.infer<typeof sourceSchema>;

export const marketTargetSchema = z.object({
  pais: z.string(),
  ciudad: z.string().nullable(),
  /** Por qué se eligió ese mercado. */
  criterio: z.string(),
  /** true si lo infirió el sistema (editable por la persona); false si ella lo indicó. */
  es_supuesto: z.boolean(),
});

export type MarketTarget = z.infer<typeof marketTargetSchema>;

/**
 * Texto tolerante: el modelo a veces devuelve un número, un rango como objeto
 * ({ "min": 50, "max": 75 }) o una lista donde pedimos una cadena. Se aplana a
 * un texto legible en lugar de tumbar toda la ficha.
 */
function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${toText(v)}`)
      .join(", ");
  }
  return String(value);
}

const text = z.unknown().transform(toText);

/** Año tolerante: acepta 2019 o "2019"; cualquier otra cosa es null. */
const year = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => {
    const n = typeof v === "string" ? Number.parseInt(v, 10) : v;
    return typeof n === "number" && Number.isFinite(n) && n > 1900 && n < 2100 ? Math.trunc(n) : null;
  });

/** Lista tolerante: si el modelo devuelve de más, se recorta en lugar de fallar toda la ficha. */
const capped = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z
    .array(item)
    .default([])
    .transform((items) => items.slice(0, max));

/** Lo que devuelve la llamada que estructura los hallazgos (sin las fuentes, que se arman aparte). */
export const fichaBodySchema = z.object({
  idea_normalizada: z.object({
    resumen: text,
    sector: text,
    modelo_de_negocio: text,
  }),
  tamano_mercado: z.object({
    cifra: nullable(text),
    anio: year,
    fuente_id: looseSourceId,
    /** Si `cifra` es null: por qué no se pudo. */
    motivo: nullable(text),
  }),
  competidores: capped(
    z.object({
      nombre: text,
      propuesta: text,
      precio_referencia: nullable(text),
      fuente_id: looseSourceId,
    }),
    8,
  ),
  precios_referencia: capped(
    z.object({ descripcion: text, rango: text, fuente_id: looseSourceId }),
    8,
  ),
  canales_adquisicion: capped(
    z.object({ canal: text, nota: text, fuente_id: looseSourceId }),
    6,
  ),
  costes_tipicos: capped(
    z.object({
      concepto: text,
      valor: text,
      fuente_id: looseSourceId,
      es_supuesto: z.boolean().default(true),
    }),
    8,
  ),
  huecos_de_informacion: capped(text, 12),
});

export type FichaBody = z.output<typeof fichaBodySchema>;

export type ResearchMeta = {
  searches: number;
  queries: string[];
  estimatedCostUsd: number;
  durationMs: number;
  topics: string[];
  skippedTopics: string[];
  models: { official: string; general: string; structure: string };
  /** Texto de resultados que parecía dirigirse al modelo y se descartó. */
  injectionAttempts: string[];
};

export type Ficha = FichaBody & {
  mercado_objetivo: MarketTarget;
  fuentes: ResearchSource[];
  consultada: string;
  meta: ResearchMeta;
};

/** Plan de investigación (primera llamada): idea normalizada, mercado y una consulta por tema. */
export const planSchema = z.object({
  idea_normalizada: z.object({
    resumen: z.string(),
    sector: z.string(),
    modelo_de_negocio: z.string(),
  }),
  mercado_objetivo: marketTargetSchema,
  consultas: z.object({
    tamano_mercado: z.string().min(10),
    competidores: z.string().min(10),
    precios: z.string().min(10),
    costes: z.string().min(10),
    canales: z.string().min(10),
  }),
});

export type ResearchPlan = z.infer<typeof planSchema>;

/**
 * Deja la ficha coherente con las fuentes realmente citadas: cualquier
 * referencia a una fuente que no existe se anula y se anota como hueco. Es la
 * defensa contra cifras con una fuente inventada.
 */
export function enforceSources(body: FichaBody, sources: ResearchSource[]): FichaBody {
  const ids = new Set(sources.map((s) => s.id));
  const huecos = [...body.huecos_de_informacion];
  const known = (id: string | null) => (id && ids.has(id) ? id : null);

  const tamano = { ...body.tamano_mercado };
  if (tamano.cifra && !known(tamano.fuente_id)) {
    huecos.push("Tamaño de mercado: se descartó una cifra sin fuente verificable.");
    tamano.cifra = null;
    tamano.anio = null;
    tamano.fuente_id = null;
    tamano.motivo = tamano.motivo ?? "La cifra no traía una fuente verificable.";
  }
  if (!tamano.cifra) {
    tamano.anio = null;
    tamano.fuente_id = null;
    tamano.motivo = tamano.motivo ?? "No se encontró una cifra verificable.";
  }

  const competidores = body.competidores.filter((c) => {
    const ok = !!c.fuente_id && ids.has(c.fuente_id);
    if (!ok) huecos.push(`Competidor «${c.nombre}» descartado: sin fuente verificable.`);
    return ok;
  });

  const precios = body.precios_referencia.filter((p) => {
    const ok = !!p.fuente_id && ids.has(p.fuente_id);
    if (!ok) huecos.push(`Precio de referencia «${p.descripcion}» descartado: sin fuente verificable.`);
    return ok;
  });

  const canales = body.canales_adquisicion.map((c) => ({ ...c, fuente_id: known(c.fuente_id) }));

  const costes = body.costes_tipicos.map((c) => {
    const fuente = known(c.fuente_id);
    // Un coste sin fuente solo puede presentarse como supuesto.
    return { ...c, fuente_id: fuente, es_supuesto: fuente ? c.es_supuesto : true };
  });

  return {
    ...body,
    tamano_mercado: tamano,
    competidores,
    precios_referencia: precios,
    canales_adquisicion: canales,
    costes_tipicos: costes,
    huecos_de_informacion: [...new Set(huecos)],
  };
}

/**
 * Texto de una página que parece dirigirse al modelo («ignora las instrucciones
 * anteriores…»). Los resultados de búsqueda son datos, no instrucciones: estas
 * frases se eliminan y se registran.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignor[ae]r?\s+(todas?\s+)?(las\s+)?(instrucciones|indicaciones|reglas)[^.\n]*/gi,
  /ignore\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above)\s+(instructions|prompts?)[^.\n]*/gi,
  /(system|developer)\s+prompt[^.\n]*/gi,
  /you\s+are\s+now\s+[^.\n]*/gi,
  /(ahora\s+)?(eres|act[uú]a\s+como)\s+(un|una)\s+asistente[^.\n]*/gi,
  /(olvida|disregard)\s+(todo|everything)[^.\n]*/gi,
  /revela\s+(tu|el)\s+(prompt|instrucciones)[^.\n]*/gi,
];

export function stripInjection(text: string): { clean: string; removed: string[] } {
  const removed: string[] = [];
  let clean = text;
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, (match) => {
      removed.push(match.trim().slice(0, 160));
      return "[texto omitido]";
    });
  }
  return { clean, removed };
}

/** Compacta la ficha para meterla en los prompts de las secciones. */
export function fichaForPrompt(ficha: Ficha): string {
  return JSON.stringify({
    mercado_objetivo: ficha.mercado_objetivo,
    idea_normalizada: ficha.idea_normalizada,
    tamano_mercado: ficha.tamano_mercado,
    competidores: ficha.competidores,
    precios_referencia: ficha.precios_referencia,
    canales_adquisicion: ficha.canales_adquisicion,
    costes_tipicos: ficha.costes_tipicos,
    huecos_de_informacion: ficha.huecos_de_informacion,
    fuentes: ficha.fuentes.map((f) => ({ id: f.id, titulo: f.titulo, url: f.url, consultada: f.consultada, tipo: f.tipo })),
  });
}

/**
 * La ficha como lista de datos citables, cada uno con su etiqueta de fuente al
 * principio. Se prefiere al JSON porque el modelo narrativo ignoraba los ids
 * «escondidos» en el JSON y escribía los datos sin citar.
 */
export function fichaAsCitableText(ficha: Ficha): string {
  const tag = (id: string | null) => (id ? `[${id}]` : "[sin fuente]");
  const lines: string[] = [];
  const m = ficha.mercado_objetivo;
  lines.push(
    `Mercado analizado: ${m.pais}${m.ciudad ? ` · ${m.ciudad}` : ""}${m.es_supuesto ? " (supuesto: la idea no indicaba dónde operaría)" : ""}.`,
  );
  lines.push(`Idea normalizada: ${ficha.idea_normalizada.resumen} (sector: ${ficha.idea_normalizada.sector}; modelo: ${ficha.idea_normalizada.modelo_de_negocio}).`);

  lines.push("\nDATOS CITABLES (cada vez que uses uno, termina la frase con su etiqueta):");
  const t = ficha.tamano_mercado;
  lines.push(
    t.cifra
      ? `- ${tag(t.fuente_id)} Tamaño de mercado${t.anio ? ` (${t.anio})` : ""}: ${t.cifra}`
      : `- Tamaño de mercado: no verificado (${t.motivo ?? "sin dato"}).`,
  );
  for (const c of ficha.competidores) {
    lines.push(`- ${tag(c.fuente_id)} Competidor: ${c.nombre} — ${c.propuesta}${c.precio_referencia ? `; precio de referencia: ${c.precio_referencia}` : ""}`);
  }
  for (const p of ficha.precios_referencia) {
    lines.push(`- ${tag(p.fuente_id)} Precio de referencia: ${p.descripcion} — ${p.rango}`);
  }
  for (const c of ficha.canales_adquisicion) {
    lines.push(`- ${tag(c.fuente_id)} Canal: ${c.canal} — ${c.nota}`);
  }
  for (const c of ficha.costes_tipicos) {
    lines.push(`- ${tag(c.fuente_id)} Coste típico: ${c.concepto} — ${c.valor}${c.es_supuesto ? " (supuesto, no verificado)" : ""}`);
  }

  if (ficha.huecos_de_informacion.length > 0) {
    lines.push("\nHUECOS (NO los afirmes como hecho; di que no se pudo verificar o que es un supuesto):");
    for (const h of ficha.huecos_de_informacion) lines.push(`- ${h}`);
  }

  lines.push("\nFUENTES:");
  for (const f of ficha.fuentes) lines.push(`- [${f.id}] ${f.titulo} (${f.tipo}, consultada el ${f.consultada})`);
  return lines.join("\n");
}

