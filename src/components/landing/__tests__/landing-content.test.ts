import { describe, expect, it } from "vitest";
import {
  FAQ_ITEMS,
  NAV_LINKS,
  REPORT_INCLUDES,
} from "../landing-content";

describe("copy de la landing", () => {
  it("el plan de validación se anuncia de cuatro semanas, como lo genera el reporte", () => {
    const plan = REPORT_INCLUDES.find((i) => /validación/.test(i.text));
    expect(plan?.text).toMatch(/cuatro semanas/);
  });

  it("cada elemento del reporte dice si es gratis, parcial o de suscripción", () => {
    for (const item of REPORT_INCLUDES) {
      expect(["free", "partial", "paid"]).toContain(item.plan);
    }
    expect(REPORT_INCLUDES.some((i) => i.plan === "paid")).toBe(true);
  });

  it("el tiempo prometido es el mismo en todas las respuestas (15 a 20 minutos)", () => {
    const tiempo = FAQ_ITEMS.find((f) => f.question === "¿Cuánto tarda?");
    expect(tiempo?.answer).toMatch(/15 y 20 minutos/);
    expect(JSON.stringify(FAQ_ITEMS)).not.toMatch(/10 a 15|diez a quince/i);
  });

  it("el FAQ cubre el modelo de suscripción, la cancelación y la privacidad", () => {
    const preguntas = FAQ_ITEMS.map((f) => f.question).join(" | ");
    expect(preguntas).toMatch(/gratis/i);
    expect(preguntas).toMatch(/cancelo/i);
    expect(preguntas).toMatch(/privada/i);
    expect(preguntas).toMatch(/inteligencia artificial/i);
  });

  it("sin anglicismos en el FAQ y con etiquetas claras en el menú", () => {
    expect(JSON.stringify(FAQ_ITEMS)).not.toMatch(/side hustle/i);
    expect(NAV_LINKS.map((l) => l.label)).toContain("Cómo funciona");
    expect(NAV_LINKS.map((l) => l.label)).not.toContain("Entrar");
    expect(NAV_LINKS.every((l) => l.href.startsWith("/#"))).toBe(true);
  });
});
