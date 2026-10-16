import { describe, expect, it } from "vitest";
import { getPreviousStep } from "../navigation";

describe("getPreviousStep y la pantalla de planes", () => {
  it("sin suscripción, «Atrás» desde Tu situación vuelve al plan", () => {
    expect(getPreviousStep("perfil")).toBe("pago");
  });

  it("con suscripción, «Atrás» se salta el plan y vuelve a confirmar la idea", () => {
    expect(getPreviousStep("perfil", { skipPlan: true })).toBe("confirmacion");
  });

  it("skipPlan no afecta a los demás pasos", () => {
    expect(getPreviousStep("ajuste", { skipPlan: true })).toBe("perfil");
    expect(getPreviousStep("confirmacion", { skipPlan: true })).toBe("idea");
    expect(getPreviousStep("contacto", { skipPlan: true })).toBeNull();
  });
});
