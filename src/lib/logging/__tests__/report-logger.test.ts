import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException }));

import { logReportGenerationError } from "../report-logger";

describe("logReportGenerationError → Sentry", () => {
  beforeEach(() => {
    captureException.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("envía el error original con etiqueta y assessmentId", () => {
    const error = new Error("OpenAI timeout");
    logReportGenerationError("Report generation failed", {
      assessmentId: "asmt_1",
      error,
    });

    expect(captureException).toHaveBeenCalledTimes(1);
    const [sent, options] = captureException.mock.calls[0];
    expect(sent).toBe(error);
    expect(options.tags).toEqual({ area: "report-generation" });
    expect(options.extra.assessmentId).toBe("asmt_1");
  });

  it("crea un Error con el mensaje cuando no hay error original", () => {
    logReportGenerationError("Sin error asociado", { assessmentId: "asmt_2" });
    const [sent] = captureException.mock.calls[0];
    expect(sent).toBeInstanceOf(Error);
    expect((sent as Error).message).toBe("Sin error asociado");
  });

  it("no manda el correo del usuario a Sentry", () => {
    logReportGenerationError("Falló", {
      assessmentId: "asmt_3",
      metadata: { email: "persona@example.com", retryAttempt: true },
    });
    const [, options] = captureException.mock.calls[0];
    expect(JSON.stringify(options)).not.toContain("persona@example.com");
    expect(options.extra.retryAttempt).toBe(true);
  });
});

describe("respaldos de la IA → Sentry (aiFallback)", () => {
  beforeEach(() => {
    captureException.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("etiqueta el fallo con la función, el modelo y el tipo de error", () => {
    const error = Object.assign(new Error("404 model not found"), { status: 404 });
    logReportGenerationError("scoring: respaldo", {
      assessmentId: "asmt_9",
      error,
      aiFallback: { feature: "scoring_interpretation", model: "o4-mini" },
    });
    const [, options] = captureException.mock.calls[0];
    expect(options.tags).toEqual({
      area: "report-generation",
      ai_fallback: "scoring_interpretation",
      ai_error: "http-404",
      ai_model: "o4-mini",
    });
  });

  it("agrupa todos los reportes con el mismo problema en una sola incidencia", () => {
    for (const id of ["a", "b", "c"]) {
      logReportGenerationError("scoring: respaldo", {
        assessmentId: id,
        error: Object.assign(new Error(`distinto ${id}`), { status: 404 }),
        aiFallback: { feature: "scoring_interpretation" },
      });
    }
    const fingerprints = captureException.mock.calls.map(([, o]) => JSON.stringify(o.fingerprint));
    expect(new Set(fingerprints).size).toBe(1);
    expect(fingerprints[0]).toBe('["ai-fallback","scoring_interpretation","http-404"]');
  });

  it("separa por tipo de error: un 404 y una respuesta inválida son incidencias distintas", () => {
    logReportGenerationError("x", {
      error: Object.assign(new Error("a"), { status: 404 }),
      aiFallback: { feature: "report_review" },
    });
    logReportGenerationError("x", {
      error: new SyntaxError("JSON inválido"),
      aiFallback: { feature: "report_review" },
    });
    const [a, b] = captureException.mock.calls.map(([, o]) => o.fingerprint[2]);
    expect(a).toBe("http-404");
    expect(b).toBe("SyntaxError");
  });

  it("los errores sin aiFallback no cambian su etiqueta ni su agrupación", () => {
    logReportGenerationError("Otro fallo", { error: new Error("x") });
    const [, options] = captureException.mock.calls[0];
    expect(options.tags).toEqual({ area: "report-generation" });
    expect(options.fingerprint).toBeUndefined();
  });
});
