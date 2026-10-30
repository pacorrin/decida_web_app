import { describe, expect, it } from "vitest";
import { normalizeCapture } from "../result";

const today = { year: 2026, month: 10, day: 30 };

describe("normalizeCapture", () => {
  it("acepta una respuesta completa y la deja lista para el formulario", () => {
    const r = normalizeCapture(
      { flow: "expense", amount: 1234.5, category: "alimentos", date: "2026-10-29", description: "Súper Walmart", confidence: "high", note: null },
      today,
    );
    expect(r).toMatchObject({ flow: "expense", amount: "1234.50", category: "alimentos", date: "2026-10-29", description: "Súper Walmart", confidence: "high", warnings: [] });
  });

  it("una categoría fuera de la lista pasa a «otros»", () => {
    expect(normalizeCapture({ flow: "expense", amount: 10, category: "yates" }, today)?.category).toBe("otros");
    // una categoría de ingreso no vale para un egreso
    expect(normalizeCapture({ flow: "expense", amount: 10, category: "sueldo" }, today)?.category).toBe("otros");
    expect(normalizeCapture({ flow: "income", amount: 10, category: "sueldo" }, today)?.category).toBe("sueldo");
  });

  it("sin monto legible avisa y no inventa uno", () => {
    for (const amount of [null, undefined, 0, -5, "abc"]) {
      const r = normalizeCapture({ flow: "expense", amount, category: "otros" }, today);
      expect(r?.amount).toBe("");
      expect(r?.warnings.join(" ")).toContain("monto");
    }
  });

  it("una fecha futura o inválida se cambia por hoy con aviso", () => {
    const future = normalizeCapture({ amount: 5, date: "2026-12-01" }, today);
    expect(future?.date).toBe("2026-10-30");
    expect(future?.warnings.join(" ")).toContain("fecha");
    expect(normalizeCapture({ amount: 5, date: "no sé" }, today)?.date).toBe("2026-10-30");
    expect(normalizeCapture({ amount: 5, date: null }, today)?.warnings).toEqual([]);
  });

  it("sin tipo claro se toma como egreso y la confianza por defecto es media", () => {
    const r = normalizeCapture({ amount: 5, flow: "transferencia" }, today);
    expect(r).toMatchObject({ flow: "expense", confidence: "medium" });
  });

  it("recorta la descripción y limpia espacios", () => {
    const r = normalizeCapture({ amount: 5, description: `  ${"a ".repeat(100)}  ` }, today);
    expect(r!.description.length).toBeLessThanOrEqual(120);
    expect(r!.description).not.toMatch(/\s{2,}/);
  });

  it("una respuesta que no es un objeto se descarta", () => {
    expect(normalizeCapture("hola", today)).toBeNull();
    expect(normalizeCapture(null, today)).toBeNull();
  });
});
