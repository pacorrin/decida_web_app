import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai", () => ({ generateVisionJson: vi.fn(), createAiObservabilityContext: vi.fn() }));

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SYSTEM_EXPENSE_CATEGORIES } from "../../constants";
import { buildCaptureSystemPrompt } from "../extract";

const prompt = buildCaptureSystemPrompt({ year: 2026, month: 10, day: 30 });

describe("prompt de captura", () => {
  it("incluye todo el catálogo de egresos e ingresos con su código", () => {
    for (const c of [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]) {
      if (SYSTEM_EXPENSE_CATEGORIES.includes(c.code)) expect(prompt).not.toContain(`- ${c.code} (`);
      else expect(prompt).toContain(`- ${c.code} (`);
    }
  });

  it("explica qué incluye cada categoría: el gas es servicios, no vivienda", () => {
    expect(prompt).toMatch(/servicios[^\n]*gas/);
    expect(prompt).not.toMatch(/vivienda[^\n]*\bgas\b/);
    expect(prompt).toContain("MÁS ESPECÍFICA");
  });

  it("sin tarjetas no pide cardId", () => {
    expect(prompt).not.toContain("cardId");
  });

  it("con tarjetas le pasa nombre e id y pide devolver solo un id de la lista", () => {
    const withCards = buildCaptureSystemPrompt({ year: 2026, month: 10, day: 30 }, [
      { id: "card_1", name: "Nu Bank" },
      { id: "card_2", name: "Rappi" },
    ]);
    expect(withCards).toContain('"Nu Bank" → card_1');
    expect(withCards).toContain('"Rappi" → card_2');
    expect(withCards).toContain("Nunca inventes un id");
  });

  it("un cobro hecho a la persona es egreso, no ingreso", () => {
    expect(prompt).toContain("QUIÉN PONE EL DINERO");
    expect(prompt).toMatch(/"me cobraron"/);
    expect(prompt).toContain("Un cobro hecho a la persona con su tarjeta es siempre un egreso");
  });

  it("iCloud cae en suscripciones", () => {
    expect(prompt).toMatch(/suscripciones[^\n]*iCloud/);
  });
});
