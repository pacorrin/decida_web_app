import { describe, expect, it } from "vitest";
import {
  buildReviewPrompt,
  correctionsFor,
  countIssues,
  decideReviewAction,
  reviewConfig,
  reviewSchema,
  REPORT_SECTION_KEYS,
  type ReportReview,
} from "../review-report";

const empty: ReportReview = {
  contradicciones: [],
  supuestos_sin_fuente: [],
  conclusiones_no_sustentadas: [],
  correcciones: [],
};

const cfg = { maxIssues: 3, maxRewrites: 2 };

describe("reviewSchema", () => {
  it("acepta una revisión vacía (el reporte está bien)", () => {
    expect(reviewSchema.safeParse(empty).success).toBe(true);
  });

  it("rechaza una sección que no existe", () => {
    const bad = {
      ...empty,
      correcciones: [{ seccion: "otra_cosa", instruccion: "corrige esto" }],
    };
    expect(reviewSchema.safeParse(bad).success).toBe(false);
  });

  it("una contradicción exige exactamente dos secciones", () => {
    const one = {
      ...empty,
      contradicciones: [
        { secciones: ["executive_summary"], afirmacion_a: "a", afirmacion_b: "b" },
      ],
    };
    expect(reviewSchema.safeParse(one).success).toBe(false);
  });
});

describe("decideReviewAction", () => {
  it("sin problemas ni correcciones no hace nada", () => {
    expect(decideReviewAction(empty, cfg).action).toBe("none");
  });

  it("reescribe solo las secciones señaladas, sin repetir", () => {
    const review: ReportReview = {
      ...empty,
      contradicciones: [
        { secciones: ["strengths_risks", "final_recommendation"], afirmacion_a: "a", afirmacion_b: "b" },
      ],
      correcciones: [
        { seccion: "strengths_risks", instruccion: "quita la fortaleza duplicada" },
        { seccion: "strengths_risks", instruccion: "no listes la inversión como fortaleza" },
        { seccion: "final_recommendation", instruccion: "alinea con las alertas" },
      ],
    };
    const d = decideReviewAction(review, cfg);
    expect(d.action).toBe("rewrite");
    expect(d.sections).toEqual(["strengths_risks", "final_recommendation"]);
  });

  it("respeta el tope de secciones a reescribir (una sola iteración acotada)", () => {
    const review: ReportReview = {
      ...empty,
      supuestos_sin_fuente: [{ seccion: "executive_summary", afirmacion: "x" }],
      correcciones: REPORT_SECTION_KEYS.slice(0, 5).map((s) => ({
        seccion: s,
        instruccion: "corrige este punto",
      })),
    };
    expect(decideReviewAction(review, cfg).sections).toHaveLength(2);
  });

  it("con más de N problemas pasa a revisión humana y NO reescribe", () => {
    const review: ReportReview = {
      ...empty,
      supuestos_sin_fuente: [
        { seccion: "executive_summary", afirmacion: "1" },
        { seccion: "business_understanding", afirmacion: "2" },
        { seccion: "scalability_analysis", afirmacion: "3" },
        { seccion: "final_recommendation", afirmacion: "4" },
      ],
      correcciones: [{ seccion: "executive_summary", instruccion: "corrige algo" }],
    };
    expect(countIssues(review)).toBe(4);
    expect(decideReviewAction(review, cfg)).toEqual({ action: "human_review", sections: [] });
  });
});

describe("reviewConfig", () => {
  it("por defecto está activa con N = 6 y 4 reescrituras", () => {
    expect(reviewConfig({} as never)).toEqual({ enabled: true, maxIssues: 6, maxRewrites: 4 });
  });

  it("se puede apagar y ajustar por entorno", () => {
    const c = reviewConfig({
      REPORT_REVIEW_ENABLED: "false",
      REPORT_REVIEW_MAX_ISSUES: "10",
      REPORT_REVIEW_MAX_REWRITES: "2",
    } as never);
    expect(c).toEqual({ enabled: false, maxIssues: 10, maxRewrites: 2 });
  });

  it("valores inválidos vuelven al valor por defecto", () => {
    expect(reviewConfig({ REPORT_REVIEW_MAX_ISSUES: "abc" } as never).maxIssues).toBe(6);
  });
});

describe("helpers", () => {
  it("correctionsFor junta las instrucciones de una sección", () => {
    const r: ReportReview = {
      ...empty,
      correcciones: [
        { seccion: "strengths_risks", instruccion: "primera instrucción" },
        { seccion: "final_recommendation", instruccion: "otra instrucción" },
        { seccion: "strengths_risks", instruccion: "segunda instrucción" },
      ],
    };
    expect(correctionsFor(r, "strengths_risks")).toEqual([
      "primera instrucción",
      "segunda instrucción",
    ]);
  });

  it("el prompt lleva las 9 secciones con su identificador y los datos de partida", () => {
    const sections = Object.fromEntries(REPORT_SECTION_KEYS.map((k) => [k, `texto de ${k}`]));
    const prompt = buildReviewPrompt({
      sections: sections as never,
      scores: "S",
      metrics: "M",
      interpretation: "I",
      market: "MK",
      clarity: "C",
      ideaOriginal: "IDEA",
      products: "P",
      financialInputs: "F",
      profile: "PR",
    });
    for (const k of REPORT_SECTION_KEYS) expect(prompt).toContain(`[${k}]`);
    expect(prompt).toContain("IDEA");
    expect(prompt).toContain("texto de strengths_risks");
  });
});
