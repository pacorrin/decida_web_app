/**
 * Compara una corrida con el baseline congelado.
 *
 *   pnpm evals:compare <conjunto>  → imprime y guarda evals/<conjunto>/_comparacion.md
 *
 * Por caso: latencia, costo medido, búsquedas, citas válidas, acción de la revisión y
 * calificaciones del juez (si existe `_juicio.json`). El baseline se corrió antes de
 * existir el medidor de costo, por eso su costo aparece como n/d.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CRITERIA, CRITERION_IDS } from "./lib/rubric";

type Row = {
  id: string;
  seconds?: number;
  costUsd?: number;
  searches?: number;
  citations: number;
  invalidCitations: number;
  sources: number;
  research: string;
  review: string;
  judge?: Record<string, number>;
};

function load(dir: string): Row[] {
  if (!existsSync(dir)) return [];
  const judgePath = join(dir, "_juicio.json");
  const judge = existsSync(judgePath) ? JSON.parse(readFileSync(judgePath, "utf8")) : {};
  return readdirSync(dir)
    .filter((f) => /^\d{2}-.*\.json$/.test(f))
    .sort()
    .map((file) => {
      const id = file.replace(/\.json$/, "");
      const r = JSON.parse(readFileSync(join(dir, file), "utf8"));
      const md = readFileSync(join(dir, `${id}.md`), "utf8");
      const ficha = r.report?.arep_research?.ficha;
      const ids = new Set<string>((ficha?.fuentes ?? []).map((f: { id: string }) => f.id));
      const cites = [...md.matchAll(/\[(F\d+)\]/g)].map((m) => m[1]);
      const j = judge[id];
      return {
        id,
        seconds: r.latencySeconds,
        costUsd: r.cost?.totalUsd,
        searches: r.cost?.searchCalls ?? ficha?.meta?.searches,
        citations: cites.length,
        invalidCitations: cites.filter((c) => !ids.has(c)).length,
        sources: ids.size,
        research: r.report?.arep_research?.status ?? "—",
        review: r.report?.arep_review?.action ?? "—",
        judge: j && !j.error ? Object.fromEntries(CRITERION_IDS.map((k) => [k, j[k].score])) : undefined,
      };
    });
}

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 1000) / 1000 : undefined);
const fmt = (v: number | string | undefined, pre = "") => (v === undefined || v === "" ? "n/d" : `${pre}${v}`);

function main() {
  const setName = process.argv[2];
  if (!setName) throw new Error("Uso: pnpm evals:compare <conjunto>");
  const root = join(process.cwd(), "evals");
  const base = load(join(root, "baseline"));
  const cur = load(join(root, setName));
  const baseById = new Map(base.map((r) => [r.id, r]));

  const lines: string[] = [];
  lines.push(`# Comparación: ${setName} frente a baseline`, "");
  lines.push(`Casos en ${setName}: ${cur.length} · en baseline: ${base.length}. El baseline se corrió sin medidor de costo (n/d).`, "");
  lines.push("## Por caso", "");
  lines.push("| Caso | Latencia (s) base → actual | Costo USD | Búsquedas | Fuentes | Citas (inválidas) | Investigación | Revisión | " + CRITERION_IDS.map((k) => k.slice(0, 6)).join(" | ") + " |");
  lines.push("|" + "---|".repeat(8 + CRITERION_IDS.length));
  for (const r of cur) {
    const b = baseById.get(r.id);
    lines.push(
      `| ${r.id} | ${fmt(b?.seconds)} → ${fmt(r.seconds)} | ${fmt(r.costUsd, "$")} | ${fmt(r.searches)} | ${r.sources} | ${r.citations} (${r.invalidCitations}) | ${r.research} | ${r.review} | ` +
        CRITERION_IDS.map((k) => {
          const now = r.judge?.[k];
          const was = b?.judge?.[k];
          return now === undefined ? "—" : was === undefined ? `${now}` : `${was}→${now}`;
        }).join(" | ") +
        " |"
    );
  }

  lines.push("", "## Promedios", "");
  const sharedIds = cur.filter((r) => baseById.has(r.id));
  const m = (rows: Row[], pick: (r: Row) => number | undefined) => avg(rows.map(pick).filter((v): v is number => typeof v === "number"));
  lines.push("| Métrica | Baseline (5 casos) | Actual, mismos 5 | Actual, todos |", "|---|---|---|---|");
  const metric = (name: string, pick: (r: Row) => number | undefined, pre = "") =>
    lines.push(`| ${name} | ${fmt(m(sharedIds.map((r) => baseById.get(r.id)!), pick), pre)} | ${fmt(m(sharedIds, pick), pre)} | ${fmt(m(cur, pick), pre)} |`);
  metric("Latencia (s)", (r) => r.seconds);
  metric("Costo USD", (r) => r.costUsd, "$");
  metric("Búsquedas", (r) => r.searches);
  metric("Citas [F#] válidas", (r) => r.citations - r.invalidCitations);
  for (const c of CRITERIA) metric(`Juez · ${c.title}`, (r) => r.judge?.[c.id]);
  lines.push("", `Citas inválidas totales: ${cur.reduce((n, r) => n + r.invalidCitations, 0)} (debe ser 0).`);

  const text = lines.join("\n");
  writeFileSync(join(root, setName, "_comparacion.md"), text + "\n");
  console.log(text);
}

main();
