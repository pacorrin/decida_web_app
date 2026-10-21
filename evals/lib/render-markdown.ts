type Json = Record<string, unknown>;

const arr = (v: unknown): Json[] => (Array.isArray(v) ? (v as Json[]) : []);
const text = (v: unknown) => (typeof v === "string" ? v : "");

/** Reporte → Markdown legible, para revisarlo a ojo y para los jueces. */
export function renderReportMarkdown(args: {
  caseId: string;
  description: string;
  summary: string;
  scores: { dimension: string; puntaje: number; semaforo: string }[];
  recommendation: string;
  redFlags: string[];
  report: Json;
}): string {
  const r = args.report;
  const out: string[] = [];
  out.push(`# ${args.caseId}`, "", `**Idea (texto de la persona):** ${args.description}`, "", `**Resumen de la IA:** ${args.summary}`, "");
  out.push("## Puntajes y semáforos", "");
  for (const s of args.scores) out.push(`- ${s.dimension}: ${s.puntaje}/100 (${s.semaforo})`);
  out.push("", `**Recomendación:** ${args.recommendation}`, "");
  if (args.redFlags.length) out.push("**Alertas calculadas:**", ...args.redFlags.map((f) => `- ${f}`), "");
  const sections: [string, string][] = [
    ["Resumen ejecutivo", text(r.arep_executive_summary)],
    ["Entendimiento del negocio", text(r.arep_business_understanding)],
    ["Análisis financiero", text(r.arep_financial_analysis)],
  ];
  for (const [t, body] of sections) out.push(`## ${t}`, "", body, "");
  out.push("## Fortalezas", "");
  for (const s of arr(r.arep_strengths)) out.push(`- **${text(s.title)}** — ${text(s.whyItMatters)}`);
  out.push("", "## Riesgos", "");
  for (const s of arr(r.arep_risks)) out.push(`- **${text(s.title)}** — ${text(s.whyItMatters)} _Cómo reducirlo:_ ${text(s.howToReduce)}`);
  out.push("");
  const more: [string, string][] = [
    ["Compatibilidad personal", text(r.arep_personal_fit_analysis)],
    ["Tiempo y operación", text(r.arep_time_operation_analysis)],
    ["Escalabilidad", text(r.arep_scalability_analysis)],
  ];
  for (const [t, body] of more) out.push(`## ${t}`, "", body, "");
  out.push("## Plan de validación", "");
  for (const w of arr(r.arep_validation_plan)) {
    out.push(`**Semana ${w.week}: ${text(w.title)}**`);
    for (const t of (w.tasks as string[]) ?? []) out.push(`- ${t}`);
    out.push("");
  }
  out.push("## Recomendación final", "", text(r.arep_final_recommendation_text), "");
  return out.join("\n");
}
