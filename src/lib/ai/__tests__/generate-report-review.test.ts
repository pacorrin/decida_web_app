import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  generateText: vi.fn(),
  generateJson: vi.fn(),
  generateReasoningJson: vi.fn(),
  logError: vi.fn(),
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
  logReportGenerationError: m.logError,
  logReportGenerationRetry: vi.fn(),
  logReportGenerationSuccess: vi.fn(),
}));

import { buildReportData } from "../generate-report";
import {
  STRENGTHS_RISKS_SYSTEM_PROMPT,
  VALIDATION_PLAN_SYSTEM_PROMPT,
} from "../schemas/report-sections";

const assessment = {
  asmt_id: "a1",
  business_idea: {
    bide_original_description: "Quiero abrir una cafetería en la colonia Roma Norte para oficinistas.",
    bide_ai_summary: "Cafetería en Roma Norte.",
    bide_ai_detected_assumptions: null,
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

const strengthsJson = {
  strengths: [{ title: "Margen sano", whyItMatters: "Cubre el arranque del negocio." }],
  risks: [{ title: "Competencia alta", whyItMatters: "Hay muchas cafeterías.", howToReduce: "Diferénciate con una propuesta clara." }],
};
const planJson = { weeks: [{ week: 1, title: "Validar demanda", tasks: ["Hablar con 10 clientes", "Visitar 3 cafeterías"] }] };

const emptyReview = {
  contradicciones: [],
  supuestos_sin_fuente: [],
  conclusiones_no_sustentadas: [],
  correcciones: [],
};

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.REPORT_REVIEW_ENABLED;
  process.env.REPORT_REVIEW_MAX_ISSUES = "3";
  m.generateText.mockImplementation(async () => "Texto de la sección generado.");
  m.generateJson.mockImplementation(async (system: string) =>
    system === STRENGTHS_RISKS_SYSTEM_PROMPT
      ? strengthsJson
      : system === VALIDATION_PLAN_SYSTEM_PROMPT
        ? planJson
        : {},
  );
});

const run = () => buildReportData(assessment, deterministic, interpretation);

describe("pasada de revisión dentro de buildReportData", () => {
  it("apagada por entorno: no hay llamada de revisión", async () => {
    process.env.REPORT_REVIEW_ENABLED = "false";
    const r = await run();
    expect(m.generateReasoningJson).not.toHaveBeenCalled();
    expect(r.arep_review.action).toBe("skipped");
    expect(r.arep_needs_human_review).toBe(false);
  });

  it("sin problemas: una llamada de revisión y ninguna reescritura", async () => {
    m.generateReasoningJson.mockResolvedValue(emptyReview);
    const r = await run();
    expect(m.generateReasoningJson).toHaveBeenCalledTimes(1);
    expect(m.generateText).toHaveBeenCalledTimes(7); // solo las 7 secciones originales
    expect(r.arep_review.action).toBe("none");
  });

  it("reescribe solo la sección señalada, una vez", async () => {
    m.generateReasoningJson.mockResolvedValue({
      ...emptyReview,
      conclusiones_no_sustentadas: [
        { seccion: "final_recommendation", afirmacion: "x", motivo: "no se sigue de las cifras" },
      ],
      correcciones: [
        { seccion: "final_recommendation", instruccion: "Alinea el veredicto con las alertas." },
      ],
    });
    m.generateText.mockImplementation(async (_s: string, prompt: string) =>
      prompt.includes("PROBLEMAS DETECTADOS") ? "Recomendación corregida." : "Texto original.",
    );
    const r = await run();
    expect(m.generateText).toHaveBeenCalledTimes(8); // 7 + 1 reescritura
    expect(m.generateReasoningJson).toHaveBeenCalledTimes(1); // sin segunda revisión
    expect(r.arep_final_recommendation_text).toBe("Recomendación corregida.");
    expect(r.arep_executive_summary).toBe("Texto original.");
    expect(r.arep_review.action).toBe("rewrite");
    expect(r.arep_review.rewritten).toEqual(["final_recommendation"]);
  });

  it("reescribe fortalezas y riesgos con las instrucciones y sin volver a completar con deterministas", async () => {
    m.generateReasoningJson.mockResolvedValue({
      ...emptyReview,
      contradicciones: [
        { secciones: ["strengths_risks", "final_recommendation"], afirmacion_a: "a", afirmacion_b: "b" },
      ],
      correcciones: [{ seccion: "strengths_risks", instruccion: "Quita la fortaleza que contradice las alertas." }],
    });
    const r = await run();
    const calls = m.generateJson.mock.calls.filter((c) => c[0] === STRENGTHS_RISKS_SYSTEM_PROMPT);
    expect(calls).toHaveLength(2);
    expect(calls[1][1]).toContain("Quita la fortaleza que contradice las alertas.");
    expect(r.arep_review.rewritten).toEqual(["strengths_risks"]);
  });

  it("con más problemas que N: marca revisión humana y no reescribe nada", async () => {
    m.generateReasoningJson.mockResolvedValue({
      ...emptyReview,
      supuestos_sin_fuente: [
        { seccion: "executive_summary", afirmacion: "1" },
        { seccion: "business_understanding", afirmacion: "2" },
        { seccion: "scalability_analysis", afirmacion: "3" },
        { seccion: "final_recommendation", afirmacion: "4" },
      ],
      correcciones: [{ seccion: "executive_summary", instruccion: "Corrige este punto." }],
    });
    const r = await run();
    expect(r.arep_needs_human_review).toBe(true);
    expect(r.arep_review.action).toBe("human_review");
    expect(m.generateText).toHaveBeenCalledTimes(7);
    expect(m.logError).toHaveBeenCalledWith(
      expect.stringContaining("requiere revisión humana"),
      expect.anything(),
    );
  });

  it("si la revisión falla, el reporte se entrega igual y queda registrado", async () => {
    m.generateReasoningJson.mockRejectedValue(new Error("OpenAI caído"));
    const r = await run();
    expect(r.arep_review.action).toBe("failed");
    expect(r.arep_executive_summary).toBe("Texto de la sección generado.");
    expect(r.arep_needs_human_review).toBe(false);
  });

  it("si la revisión devuelve JSON inválido, también se entrega sin revisar", async () => {
    m.generateReasoningJson.mockResolvedValue({ correcciones: [{ seccion: "otra", instruccion: "x" }] });
    const r = await run();
    expect(r.arep_review.action).toBe("failed");
  });

  it("si una reescritura falla, esa sección conserva su texto original", async () => {
    m.generateReasoningJson.mockResolvedValue({
      ...emptyReview,
      conclusiones_no_sustentadas: [{ seccion: "scalability_analysis", afirmacion: "x", motivo: "y" }],
      correcciones: [{ seccion: "scalability_analysis", instruccion: "Corrige la escalabilidad." }],
    });
    m.generateText.mockImplementation(async (_s: string, prompt: string) => {
      if (prompt.includes("PROBLEMAS DETECTADOS")) throw new Error("falló");
      return "Texto original.";
    });
    const r = await run();
    expect(r.arep_scalability_analysis).toBe("Texto original.");
    expect(r.arep_review.rewritten).toEqual([]);
  });
});
