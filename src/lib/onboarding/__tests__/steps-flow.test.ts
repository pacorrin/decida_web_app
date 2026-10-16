import { describe, expect, it } from "vitest";
import {
  getFlowPhases,
  getRemainingMinutes,
  getStepNumber,
  getStepProgress,
  getStepTotal,
} from "../steps";

describe("recorrido sin la pantalla de planes (cuenta suscrita)", () => {
  it("el total baja de 9 a 8 pasos", () => {
    expect(getStepTotal()).toBe(9);
    expect(getStepTotal({ skipPlan: true })).toBe(8);
  });

  it("la numeración no tiene saltos: confirmación es el 3 y «Tu situación» el 4", () => {
    expect(getStepNumber("confirmacion", { skipPlan: true })).toBe(3);
    expect(getStepNumber("perfil", { skipPlan: true })).toBe(4);
    expect(getStepNumber("resultado", { skipPlan: true })).toBe(8);
  });

  it("sin suscripción la numeración original no cambia", () => {
    expect(getStepNumber("pago")).toBe(4);
    expect(getStepNumber("perfil")).toBe(5);
    expect(getStepNumber("resultado")).toBe(9);
  });

  it("el último paso siempre es 100 % y el avance crece sin saltos", () => {
    expect(getStepProgress("resultado", { skipPlan: true })).toBe(100);
    expect(getStepProgress("resultado")).toBe(100);
    const steps = ["contacto", "idea", "confirmacion", "perfil", "ajuste"] as const;
    const values = steps.map((s) => getStepProgress(s, { skipPlan: true }));
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("los minutos restantes no cuentan el plan", () => {
    const withPlan = getRemainingMinutes("confirmacion");
    const withoutPlan = getRemainingMinutes("confirmacion", { skipPlan: true });
    expect(withPlan - withoutPlan).toBe(1);
  });

  it("la pestaña «Plan» desaparece", () => {
    expect(getFlowPhases()).toEqual(["gratis", "pago", "diagnostico"]);
    expect(getFlowPhases({ skipPlan: true })).toEqual(["gratis", "diagnostico"]);
  });
});
