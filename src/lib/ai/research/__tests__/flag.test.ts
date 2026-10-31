import { describe, expect, it } from "vitest";
import { isResearchEnabled } from "../flag";

describe("disponibilidad de la investigación de mercado", () => {
  it("por defecto está disponible: la decide la persona en su evaluación", async () => {
    expect(await isResearchEnabled("u1", {} as never)).toBe(true);
    expect(await isResearchEnabled(null, {} as never)).toBe(true);
    expect(await isResearchEnabled("u1", { REPORT_RESEARCH_ENABLED: "posthog" } as never)).toBe(true);
    expect(await isResearchEnabled("u1", { REPORT_RESEARCH_ENABLED: "true" } as never)).toBe(true);
  });

  it("solo un apagado explícito de emergencia la desactiva", async () => {
    for (const v of ["false", "off", "0", " FALSE "]) {
      expect(await isResearchEnabled("u1", { REPORT_RESEARCH_ENABLED: v } as never)).toBe(false);
    }
  });
});
