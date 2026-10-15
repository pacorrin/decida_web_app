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
