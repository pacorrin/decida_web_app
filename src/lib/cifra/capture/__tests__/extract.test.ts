import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai", () => ({ generateVisionJson: vi.fn(), createAiObservabilityContext: vi.fn() }));

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../constants";
import { buildCaptureSystemPrompt } from "../extract";

const prompt = buildCaptureSystemPrompt({ year: 2026, month: 10, day: 30 });

describe("prompt de captura", () => {
  it("incluye todo el catálogo de egresos e ingresos con su código", () => {
    for (const c of [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]) expect(prompt).toContain(`- ${c.code} (`);
  });

  it("explica qué incluye cada categoría: el gas es servicios, no vivienda", () => {
    expect(prompt).toMatch(/servicios[^\n]*gas/);
    expect(prompt).not.toMatch(/vivienda[^\n]*\bgas\b/);
    expect(prompt).toContain("MÁS ESPECÍFICA");
  });
});
