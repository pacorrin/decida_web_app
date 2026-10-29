import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ generateReasoningJson: vi.fn(), logError: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/ai/openai", () => ({
  generateReasoningJson: m.generateReasoningJson,
  getReasoningModel: () => "razonamiento-test",
}));
vi.mock("@/lib/logging/report-logger", () => ({ logReportGenerationError: m.logError }));

import { computeScoring } from "../index";

const assessment = {
  asmt_id: "a1",
  business_idea: null,
  assessment_profile: null,
  personal_fit_answers: null,
  financial_inputs: null,
  market_risk_inputs: null,
} as never;

beforeEach(() => vi.resetAllMocks());

describe("interpretación del puntaje con IA", () => {
  it("si el modelo falla, el reporte sigue con el respaldo pero se avisa (antes era mudo)", async () => {
    const error = Object.assign(new Error("404 modelo dado de baja"), { status: 404 });
    m.generateReasoningJson.mockRejectedValue(error);

    const { interpretation } = await computeScoring(assessment);

    expect(interpretation.final_recommendation).toBeTruthy();
    expect(m.logError).toHaveBeenCalledWith(
      expect.stringContaining("interpretación con IA falló"),
      expect.objectContaining({
        assessmentId: "a1",
        error,
        aiFallback: { feature: "scoring_interpretation", model: "razonamiento-test" },
      }),
    );
  });

  it("una respuesta que no cumple el esquema también cuenta como respaldo y se avisa", async () => {
    m.generateReasoningJson.mockResolvedValue({});
    await computeScoring(assessment);
    expect(m.logError).toHaveBeenCalledTimes(1);
  });
});
