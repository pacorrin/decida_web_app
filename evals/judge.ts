/**
 * Juez LLM de los evals.
 *
 *   pnpm evals:judge <conjunto>            → evals/<conjunto>/_juicio.json
 *   pnpm evals:judge <conjunto> <id-caso>  → solo ese caso
 *
 * Califica cada reporte de 1 a 5 en los criterios de `evals/lib/rubric.ts`, con
 * evidencia citada. Usa un modelo distinto al que genera el reporte (OPENAI_MODEL_JUDGE,
 * por defecto gpt-4.1). Su acuerdo con la revisión a mano se mide en `evals:calibrate`.
 */
import { config } from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { CRITERIA, CRITERION_IDS } from "./lib/rubric";

config({ path: join(process.cwd(), ".env") });
process.env.NEXT_PUBLIC_POSTHOG_KEY = "";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "";

const judgeSchema = z.object(
  Object.fromEntries(
    CRITERION_IDS.map((id) => [
      id,
      z.object({
        score: z.coerce.number().int().min(1).max(5),
        evidence: z.string(),
        reason: z.string(),
      }),
    ])
  ) as Record<(typeof CRITERION_IDS)[number], z.ZodObject<{ score: z.ZodNumber; evidence: z.ZodString; reason: z.ZodString }>>
);

const JUDGE_SYSTEM = `Eres un evaluador estricto e independiente de reportes de viabilidad de ideas de negocio. Calificas un reporte con una rúbrica, de 1 a 5 por criterio.

Reglas:
- Basa cada calificación en evidencia citada literalmente del reporte (máximo 200 caracteres). Si no hay evidencia, di «sin evidencia» y califica con prudencia.
- Las cifras con etiqueta [F#] se consideran con fuente SOLO si ese F# existe en la lista de fuentes. Verifica que la cifra citada aparezca en la ficha de datos; una cita que no respalda la cifra no cuenta.
- Los puntajes, semáforos, métricas calculadas y la recomendación son datos deterministas correctos; no los califiques, úsalos para verificar la coherencia.
- Una inferencia razonable marcada como tal («podría», «probablemente», «si…») no es una cifra inventada.
- Se te da el conteo mecánico de citas [F#] válidas del reporte. Si es 0 y el reporte afirma cifras externas específicas (tamaño de mercado, precios de competidores, número de competidores), «cifras_con_fuente» no puede pasar de 2. Si hay una ficha con cifras y el reporte no las usa, descuenta en «huecos_declarados» solo si deja sin decir que faltan datos.
- Un 5 exige que puedas señalar al menos una cifra externa concreta con su fuente y fecha, o que el reporte no use cifras externas y lo diga. Sin esa evidencia, máximo 4.
- No premies la longitud ni el tono amable. Sé consistente: ante la duda entre dos notas, elige la más baja.
- Responde SOLO JSON con esta forma exacta, una clave por criterio: { "<criterio>": { "score": 1-5, "evidence": "...", "reason": "..." } }`;

function buildJudgePrompt(result: Record<string, any>, markdown: string): string {
  const c = result.case;
  const research = result.report?.arep_research;
  const ficha = research?.ficha;
  const fuentes = ficha?.fuentes
    ? ficha.fuentes.map((f: any) => `[${f.id}] ${f.titulo ?? ""} — ${f.url}`).join("\n")
    : "(sin investigación web: no hay fuentes)";
  const fichaText = ficha
    ? JSON.stringify({ ...ficha, meta: undefined, fuentes: undefined }, null, 1).slice(0, 9000)
    : "(sin ficha)";
  const ids = new Set<string>((ficha?.fuentes ?? []).map((f: { id: string }) => f.id));
  const cites = [...markdown.matchAll(/\[(F\d+)\]/g)].map((m) => m[1]);
  const validCites = cites.filter((c) => ids.has(c)).length;
  const criteria = CRITERIA.map((k) => `- ${k.id}: ${k.question}\n  Escala: ${k.scale}`).join("\n");
  return `# Rúbrica
${criteria}

# Datos de la persona
Idea (texto original): ${c.description}
Mercado donde la persona venderá (verdad de referencia): ${c.expectedMarket}
Mercado objetivo que usó el sistema: ${result.targetMarket ? JSON.stringify(result.targetMarket) : "(no definido)"}
Investigación web: ${research?.status ?? "no corrió"}

# Ficha de investigación (datos que el reporte puede citar)
${fichaText}

# Fuentes
${fuentes}

# Chequeo mecánico
Citas [F#] válidas en el reporte: ${validCites} (inválidas: ${cites.length - validCites}) · Fuentes disponibles: ${ids.size}

# Reporte a evaluar
${markdown.slice(0, 30000)}`;
}

async function main() {
  const setName = process.argv[2];
  if (!setName) throw new Error("Uso: pnpm evals:judge <conjunto> [id-caso]");
  const only = process.argv[3];
  const dir = join(process.cwd(), "evals", setName);
  const model = process.env.OPENAI_MODEL_JUDGE ?? "gpt-4.1";
  const { generateJson } = await import("@/lib/ai/openai");

  const files = (await import("node:fs")).readdirSync(dir).filter((f) => /^\d{2}-.*\.json$/.test(f));
  const outPath = join(dir, "_juicio.json");
  const out: Record<string, unknown> = existsSync(outPath) && only ? JSON.parse(readFileSync(outPath, "utf8")) : {};

  for (const file of files) {
    const id = file.replace(/\.json$/, "");
    if (only && id !== only) continue;
    process.stdout.write(`⚖ ${setName}/${id} … `);
    const result = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const markdown = readFileSync(join(dir, `${id}.md`), "utf8");
    try {
      const raw = await generateJson<unknown>(JUDGE_SYSTEM, buildJudgePrompt(result, markdown), model);
      const parsed = judgeSchema.parse(raw);
      out[id] = { model, ...parsed };
      console.log(CRITERION_IDS.map((k) => parsed[k].score).join(" "));
    } catch (e) {
      out[id] = { model, error: String(e).slice(0, 200) };
      console.log(`FALLÓ: ${String(e).slice(0, 120)}`);
    }
  }
  writeFileSync(outPath, JSON.stringify(out, null, 2));
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
