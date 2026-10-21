/**
 * Corre el pipeline del reporte sobre un conjunto de casos, SIN base de datos.
 *
 *   pnpm evals:baseline        → evals/baseline/<caso>.json y .md (referencia congelada)
 *   pnpm evals:run <nombre>    → evals/<nombre>/… (corrida nueva, para comparar con baseline)
 *   pnpm evals:run <nombre> --research   → con la etapa de investigación (búsqueda web)
 *
 * Requiere OPENAI_API_KEY en .env. PostHog y Stripe se apagan a propósito para
 * que los evals no ensucien las métricas reales.
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

config({ path: join(process.cwd(), ".env") });
process.env.NEXT_PUBLIC_POSTHOG_KEY = "";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "";
process.env.STRIPE_SECRET_KEY = "";
// La investigación con búsqueda web solo corre si se pide (`--research`): cuesta dinero y tiempo.
const research = process.argv.includes("--research");
process.env.REPORT_RESEARCH_ENABLED = research ? "true" : "false";
process.argv = process.argv.filter((a) => a !== "--research");

async function main() {
  const setName = process.argv[2] ?? "baseline";
  const only = process.argv[3]; // id de un caso, opcional
  const outDir = join(process.cwd(), "evals", setName);
  mkdirSync(outDir, { recursive: true });

  const { ALL_CASES } = await import("./cases/extended");
  const { BASELINE_CASES } = await import("./cases/baseline");
  const { buildAssessment } = await import("./lib/build-assessment");
  const { renderReportMarkdown } = await import("./lib/render-markdown");
  const { generateIdeaSummary, generateFallbackIdeaSummary } = await import("@/lib/ai/openai");
  const { computeScoring } = await import("@/lib/scoring");
  const { buildReportData, REPORT_PROMPT_VERSION } = await import("@/lib/ai/generate-report");
  const { buildScoresForAi } = await import("@/lib/ai/report-context");
  const { inferTargetMarket } = await import("@/lib/ai/research/target-market");
  const { startUsageMeter, stopUsageMeter } = await import("@/lib/ai/usage-meter");
  const { MODEL_PRICES_USD_PER_M, researchConfig } = await import("@/lib/ai/research/config");

  // El baseline congelado usa solo los 5 casos de referencia; el resto de las corridas, los 15.
  const cases = setName === "baseline" ? BASELINE_CASES : ALL_CASES;
  const selected = only ? cases.filter((c) => c.id === only) : cases;
  if (selected.length === 0) throw new Error(`Sin casos para «${setName}»${only ? ` / ${only}` : ""}`);

  const summary: Record<string, unknown>[] = [];
  for (const c of selected) {
    const started = Date.now();
    startUsageMeter();
    process.stdout.write(`▸ ${c.id} … `);
    try {
      // Igual que `saveIdea`: si la IA no devuelve un resumen válido, se usa el de respaldo.
      let summarySource: "ai" | "fallback" = "ai";
      let idea;
      try {
        idea = await generateIdeaSummary(c.description);
      } catch {
        summarySource = "fallback";
        idea = generateFallbackIdeaSummary(c.description);
      }
      // Igual que `saveIdea`: el mercado objetivo se infiere de la idea.
      const targetMarket = await inferTargetMarket(c.description);
      const assessment = buildAssessment(c, idea.summary, targetMarket);
      const { deterministic, interpretation } = await computeScoring(assessment);
      const report = await buildReportData(assessment, deterministic, interpretation);
      const seconds = Math.round((Date.now() - started) / 100) / 10;
      const usage = stopUsageMeter();
      // Costo medido con tokens reales y tarifas de `MODEL_PRICES_USD_PER_M`; la búsqueda
      // se cobra a la tarifa conservadora de `researchConfig().searchFeeUsd`.
      const tokenCost = Object.entries(usage.byModel).reduce((sum, [model, u]) => {
        const price = MODEL_PRICES_USD_PER_M[model] ?? { in: 2, out: 8 };
        return sum + (u.inputTokens * price.in + u.outputTokens * price.out) / 1_000_000;
      }, 0);
      const searchCost = usage.searchCalls * researchConfig().searchFeeUsd;
      const cost = {
        tokensUsd: Math.round(tokenCost * 1000) / 1000,
        searchUsd: Math.round(searchCost * 1000) / 1000,
        totalUsd: Math.round((tokenCost + searchCost) * 1000) / 1000,
        searchCalls: usage.searchCalls,
        byModel: usage.byModel,
      };

      const scores = buildScoresForAi(deterministic, interpretation).map((s) => ({
        dimension: s.dimension,
        puntaje: s.puntaje,
        semaforo: s.semaforo,
      }));
      const result = {
        case: c,
        promptVersion: REPORT_PROMPT_VERSION,
        researchEnabled: research,
        targetMarket,
        generatedAt: new Date().toISOString(),
        latencySeconds: seconds,
        cost,
        ideaSummary: idea.summary,
        summarySource,
        scores,
        metrics: deterministic.metrics,
        interpretation,
        report,
      };
      writeFileSync(join(outDir, `${c.id}.json`), JSON.stringify(result, null, 2));
      writeFileSync(
        join(outDir, `${c.id}.md`),
        renderReportMarkdown({
          caseId: c.id,
          description: c.description,
          summary: idea.summary,
          scores,
          recommendation: interpretation.final_recommendation,
          redFlags: interpretation.red_flags,
          report: report as unknown as Record<string, unknown>,
        })
      );
      summary.push({ id: c.id, ok: true, seconds, costUsd: cost.totalUsd, searchCalls: cost.searchCalls });
      console.log(`ok (${seconds}s, $${cost.totalUsd}, ${cost.searchCalls} búsquedas)`);
    } catch (error) {
      stopUsageMeter();
      summary.push({ id: c.id, ok: false, error: String(error) });
      console.log(`FALLÓ: ${String(error).slice(0, 160)}`);
    }
  }
  writeFileSync(join(outDir, "_resumen.json"), JSON.stringify(summary, null, 2));
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
