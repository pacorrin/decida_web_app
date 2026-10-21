/**
 * Rúbrica de los evals (Paso 4). Cada criterio se califica de 1 a 5.
 * La rúbrica es la misma para el juez LLM y para la revisión a mano (hoja de calibración).
 */
export const CRITERIA = [
  {
    id: "cifras_con_fuente",
    title: "Cifras con fuente y fecha",
    question:
      "Las cifras externas (tamaño de mercado, precios de la competencia, costos de referencia, número de competidores) llevan fuente y año/fecha, o se presentan claramente como supuesto. No hay estadísticas inventadas.",
    scale:
      "5 = toda cifra externa tiene fuente y fecha o es un supuesto explícito · 3 = algunas cifras externas sin fuente · 1 = hay cifras externas específicas inventadas, presentadas como hecho.",
  },
  {
    id: "consistencia",
    title: "Consistencia entre secciones",
    question: "Ninguna sección contradice a otra ni a los puntajes, semáforos y datos de la persona.",
    scale: "5 = ninguna contradicción · 3 = una contradicción menor · 1 = contradicciones que cambian la conclusión.",
  },
  {
    id: "conclusiones_sustentadas",
    title: "Las conclusiones siguen de los números",
    question:
      "Las conclusiones y recomendaciones se derivan de los puntajes, márgenes, punto de equilibrio y datos de la persona; no hay saltos de lógica ni cálculos incorrectos.",
    scale: "5 = todo se sigue de los números · 3 = algún salto menor · 1 = conclusiones que los números no sostienen o cálculos erróneos.",
  },
  {
    id: "huecos_declarados",
    title: "Huecos declarados",
    question:
      "Cuando falta información (idea vaga, sin datos de mercado, sin evidencia de clientes) el reporte lo dice con claridad en vez de rellenar con generalidades o suposiciones disfrazadas de hecho.",
    scale: "5 = los huecos se declaran y se dice cómo cubrirlos · 3 = se declaran a medias · 1 = rellena los huecos como si hubiera datos.",
  },
  {
    id: "mercado_objetivo",
    title: "Mercado analizado = mercado objetivo",
    question:
      "El análisis de mercado (competencia, precios, tamaño) corresponde al mercado donde la persona venderá según su idea (país, ciudad o audiencia), no a otro por defecto.",
    scale: "5 = coincide y lo hace explícito · 3 = coincide pero sin hacerlo explícito, o parcialmente · 1 = analiza un mercado distinto al de la idea.",
  },
] as const;

export type CriterionId = (typeof CRITERIA)[number]["id"];
export const CRITERION_IDS = CRITERIA.map((c) => c.id) as CriterionId[];

export type Scores = Record<CriterionId, number>;
