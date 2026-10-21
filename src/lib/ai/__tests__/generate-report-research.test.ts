import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  generateText: vi.fn(),
  generateJson: vi.fn(),
  generateReasoningJson: vi.fn(),
  runResearch: vi.fn(),
  isEnabled: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/ai/openai", () => ({
  generateText: m.generateText,
  generateJson: m.generateJson,
  generateReasoningJson: m.generateReasoningJson,
  getNarrativeModel: () => "modelo-test",
}));
vi.mock("@/lib/logging/report-logger", () => ({
  logReportGenerationError: vi.fn(),
  logReportGenerationRetry: vi.fn(),
  logReportGenerationSuccess: vi.fn(),
}));
vi.mock("@/lib/ai/research/run", () => ({ runResearch: m.runResearch }));
vi.mock("@/lib/ai/research/flag", () => ({ isResearchEnabled: m.isEnabled }));

import { buildReportData } from "../generate-report";
import { STRENGTHS_RISKS_SYSTEM_PROMPT, VALIDATION_PLAN_SYSTEM_PROMPT } from "../schemas/report-sections";

const assessment = {
  asmt_id: "a1",
  asmt_user_id: "u1",
  business_idea: {
    bide_original_description: "Quiero abrir una cafetería en la colonia Roma Norte para oficinistas.",
    bide_ai_summary: "Cafetería en Roma Norte.",
    bide_ai_detected_assumptions: null,
    bide_target_market: { pais: "México", ciudad: "Ciudad de México", criterio: "La idea lo menciona", es_supuesto: false, editado: false },
  },
  assessment_profile: null,
  personal_fit_answers: null,
  financial_inputs: { finp_products: [], finp_currency: "MXN" },
  market_risk_inputs: null,
} as never;

const deterministic = {
  dimensions: [{ key: "personal_fit", label: "Compatibilidad personal", score: 70 }],
  metrics: {},
  scoringVersion: "test",
} as never;
const interpretation = {
  personal_fit_signal: "green",
  financial_viability_signal: "green",
  commercial_viability_signal: "yellow",
  risk_level_signal: "yellow",
  time_fit_signal: "green",
  scalability_signal: "yellow",
  final_recommendation: "validate_first",
  red_flags: [],
  reasoning_summary: "",
} as never;

const ficha = {
  idea_normalizada: { resumen: "r", sector: "s", modelo_de_negocio: "m" },
  mercado_objetivo: { pais: "México", ciudad: "Ciudad de México", criterio: "c", es_supuesto: false },
  tamano_mercado: { cifra: "581,530 unidades económicas", anio: 2019, fuente_id: "F1", motivo: null },
  competidores: [],
  precios_referencia: [],
  canales_adquisicion: [],
  costes_tipicos: [],
  huecos_de_informacion: ["Renta típica en Roma Norte"],
  fuentes: [{ id: "F1", titulo: "INEGI", url: "https://www.inegi.org.mx/x", consultada: "2026-10-20", tipo: "oficial" }],
  consultada: "2026-10-20",
  meta: { searches: 5, queries: [], estimatedCostUsd: 0.2, durationMs: 9000, topics: [], skippedTopics: [], models: { official: "a", general: "b", structure: "c" }, injectionAttempts: [] },
};

const strengthsJson = {
  strengths: [{ title: "Margen sano", whyItMatters: "Cubre el arranque del negocio." }],
  risks: [{ title: "Competencia alta", whyItMatters: "Hay muchas cafeterías.", howToReduce: "Diferénciate con una propuesta clara." }],
};
const planJson = { weeks: [{ week: 1, title: "Validar demanda", tasks: ["Hablar con 10 clientes", "Visitar 3 cafeterías"] }] };

beforeEach(() => {
  vi.resetAllMocks();
  process.env.REPORT_REVIEW_ENABLED = "false";
  m.generateText.mockResolvedValue("Texto de la sección.");
  m.generateJson.mockImplementation(async (system: string) =>
    system === STRENGTHS_RISKS_SYSTEM_PROMPT ? strengthsJson : system === VALIDATION_PLAN_SYSTEM_PROMPT ? planJson : {},
  );
});

const run = () => buildReportData(assessment, deterministic, interpretation);
const sectionPrompts = () => m.generateText.mock.calls.map((c) => String(c[1]));

describe("la ficha de mercado en buildReportData", () => {
  it("con el flag encendido, las 7 secciones reciben la ficha con sus fuentes y se guarda en el reporte", async () => {
    m.isEnabled.mockResolvedValue(true);
    m.runResearch.mockResolvedValue({ status: "ok", ficha });
    const r = await run();
    expect(m.isEnabled).toHaveBeenCalledWith("u1");
    expect(sectionPrompts()).toHaveLength(7);
    for (const p of sectionPrompts()) {
      expect(p).toContain("FICHA DE MERCADO (datos externos con fuente");
      expect(p).toContain("[F1] Tamaño de mercado (2019): 581,530 unidades económicas");
      expect(p).toContain("[F1] INEGI");
    }
    expect(r.arep_research).toMatchObject({ status: "ok", ficha: { fuentes: [{ id: "F1" }] } });
  });

  it("las dos llamadas JSON (fortalezas/riesgos y plan) también reciben la ficha", async () => {
    m.isEnabled.mockResolvedValue(true);
    m.runResearch.mockResolvedValue({ status: "ok", ficha });
    await run();
    const jsonPrompts = m.generateJson.mock.calls.map((c) => String(c[1]));
    expect(jsonPrompts).toHaveLength(2);
    for (const p of jsonPrompts) expect(p).toContain("581,530 unidades económicas");
  });

  it("la investigación recibe el mercado objetivo guardado de la idea", async () => {
    m.isEnabled.mockResolvedValue(true);
    m.runResearch.mockResolvedValue({ status: "ok", ficha });
    await run();
    expect(m.runResearch.mock.calls[0][0].userMarket).toMatchObject({ pais: "México", ciudad: "Ciudad de México" });
  });

  it("con el flag apagado no se investiga y las secciones saben que no hay datos externos", async () => {
    m.isEnabled.mockResolvedValue(false);
    const r = await run();
    expect(m.runResearch).not.toHaveBeenCalled();
    for (const p of sectionPrompts()) expect(p).toContain("Ficha de mercado: no disponible");
    expect(r.arep_research).toBeNull();
  });

  it("si la investigación falla, el reporte se genera igual y queda constancia", async () => {
    m.isEnabled.mockResolvedValue(true);
    m.runResearch.mockResolvedValue({ status: "failed", ficha: null, error: "sin cuota" });
    const r = await run();
    expect(r.arep_executive_summary).toBe("Texto de la sección.");
    for (const p of sectionPrompts()) expect(p).toContain("no disponible");
    expect(r.arep_research).toMatchObject({ status: "failed", ficha: null, error: "sin cuota" });
  });
});
