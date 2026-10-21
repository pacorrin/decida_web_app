/**
 * Calibración del juez LLM contra la revisión a mano.
 *
 *   pnpm evals:calibrate-sheet [conjunto]  → evals/calibration/hoja-de-calibracion.md + humano.json (vacío)
 *   pnpm evals:calibrate [conjunto]        → evals/calibration/acuerdo.md (compara humano.json con el juez)
 *
 * La hoja NO muestra las notas del juez, para no sesgar la revisión.
 * Se llena `humano.json` (1–5 por criterio; null = sin calificar) y luego se corre el reporte.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CRITERIA, CRITERION_IDS } from "./lib/rubric";

/** Mezcla de tipos de caso: local MX, digital, vago, mala idea, otros países, negocio existente. */
const SHEET_CASES = [
  "01-cafeteria-roma-norte",
  "03-curso-ingles-ingenieros",
  "04-comida-para-llevar-vaga",
  "05-tienda-de-cassettes",
  "06-taller-bicicletas-guadalajara",
  "08-foodtruck-bogota",
  "10-consultoria-pymes-chile",
  "12-panaderia-existente-segunda-sucursal",
  "13-app-vaga",
  "15-gadget-sin-demanda",
];

const root = join(process.cwd(), "evals");
const calDir = join(root, "calibration");
const [mode, setName = "actual"] = process.argv.slice(2);

function sheet() {
  mkdirSync(calDir, { recursive: true });
  const parts: string[] = [];
  parts.push(
    "# Hoja de calibración del juez",
    "",
    `Conjunto: \`${setName}\`. Lee cada reporte y califica de 1 a 5 cada criterio en \`evals/calibration/humano.json\` (null = sin calificar). No se muestran las notas del juez.`,
    "",
    "## Rúbrica",
    ...CRITERIA.map((c) => `- **${c.id}** — ${c.question}\n  - ${c.scale}`),
    ""
  );
  const human: Record<string, Record<string, number | null>> = {};
  for (const id of SHEET_CASES) {
    const md = join(root, setName, `${id}.md`);
    const json = join(root, setName, `${id}.json`);
    if (!existsSync(md)) {
      console.warn(`Falta ${md}; se omite.`);
      continue;
    }
    const r = JSON.parse(readFileSync(json, "utf8"));
    const f = r.report?.arep_research?.ficha;
    parts.push(
      "---",
      `## ${id}`,
      "",
      `**Mercado donde la persona venderá (referencia):** ${r.case.expectedMarket}`,
      `**Mercado objetivo que usó el sistema:** ${r.targetMarket ? JSON.stringify(r.targetMarket) : "(no definido)"}`,
      `**Fuentes consultadas:**`,
      ...(f?.fuentes?.length ? f.fuentes.map((s: any) => `- [${s.id}] ${s.titulo ?? ""} ${s.url}`) : ["- (sin investigación web)"]),
      "",
      readFileSync(md, "utf8"),
      ""
    );
    human[id] = Object.fromEntries(CRITERION_IDS.map((k) => [k, null]));
  }
  writeFileSync(join(calDir, "hoja-de-calibracion.md"), parts.join("\n"));
  const humanPath = join(calDir, "humano.json");
  if (!existsSync(humanPath)) writeFileSync(humanPath, JSON.stringify(human, null, 2) + "\n");
  console.log(`Hoja: evals/calibration/hoja-de-calibracion.md · plantilla: evals/calibration/humano.json`);
}

function pearson(a: number[], b: number[]): number | undefined {
  const n = a.length;
  if (n < 3) return undefined;
  const ma = a.reduce((x, y) => x + y, 0) / n;
  const mb = b.reduce((x, y) => x + y, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : undefined;
}

function report() {
  const human = JSON.parse(readFileSync(join(calDir, "humano.json"), "utf8"));
  const judge = JSON.parse(readFileSync(join(root, setName, "_juicio.json"), "utf8"));
  const lines: string[] = ["# Acuerdo entre el juez LLM y la revisión a mano", "", `Conjunto: \`${setName}\`.`, ""];
  lines.push("| Criterio | n | Exacto | ±1 | Error medio | Sesgo del juez | Correlación |", "|---|---|---|---|---|---|---|");
  const verdicts: string[] = [];
  for (const k of CRITERION_IDS) {
    const pairs: [number, number][] = [];
    for (const id of Object.keys(human)) {
      const h = human[id]?.[k];
      const j = judge[id]?.[k]?.score;
      if (typeof h === "number" && typeof j === "number") pairs.push([h, j]);
    }
    const n = pairs.length;
    if (!n) { lines.push(`| ${k} | 0 | — | — | — | — | — |`); continue; }
    const exact = pairs.filter(([h, j]) => h === j).length / n;
    const within = pairs.filter(([h, j]) => Math.abs(h - j) <= 1).length / n;
    const mae = pairs.reduce((s, [h, j]) => s + Math.abs(h - j), 0) / n;
    const bias = pairs.reduce((s, [h, j]) => s + (j - h), 0) / n;
    const r = pearson(pairs.map((p) => p[0]), pairs.map((p) => p[1]));
    lines.push(`| ${k} | ${n} | ${Math.round(exact * 100)}% | ${Math.round(within * 100)}% | ${mae.toFixed(2)} | ${bias >= 0 ? "+" : ""}${bias.toFixed(2)} | ${r === undefined ? "—" : r.toFixed(2)} |`);
    verdicts.push(`${k}: ${within >= 0.8 && Math.abs(bias) < 0.5 ? "confiable" : "NO confiable todavía (ajustar el prompt del juez)"}`);
  }
  lines.push("", "Criterio de aceptación: ±1 en al menos 80% de los casos y sesgo medio menor a 0.5.", "", ...verdicts.map((v) => `- ${v}`));
  const text = lines.join("\n");
  writeFileSync(join(calDir, "acuerdo.md"), text + "\n");
  console.log(text);
}

if (mode === "sheet") sheet();
else if (mode === "report") report();
else throw new Error("Uso: calibrate.ts sheet|report [conjunto]");
