import { describe, expect, it } from "vitest";
import {
  enforceSignals,
  scoreToSignal,
  type ScoringInterpretResult,
} from "../scoring-interpret";

const base: ScoringInterpretResult = {
  personal_fit_signal: "green",
  financial_viability_signal: "green",
  commercial_viability_signal: "green",
  risk_level_signal: "green",
  time_fit_signal: "green",
  scalability_signal: "green",
  final_recommendation: "validate_first",
  red_flags: [],
  reasoning_summary: "",
};

const scores = {
  personal_fit: 74,
  financial_viability: 72,
  commercial_viability: 51,
  risk_level: 94,
  time_fit: 65,
  scalability: 65,
};

describe("scoreToSignal", () => {
  it("umbrales: >=70 verde, 40-69 amarillo, <40 rojo", () => {
    expect(scoreToSignal(70)).toBe("green");
    expect(scoreToSignal(69)).toBe("yellow");
    expect(scoreToSignal(40)).toBe("yellow");
    expect(scoreToSignal(39)).toBe("red");
  });

  it("en riesgo el puntaje alto es MÁS riesgo (invertido)", () => {
    expect(scoreToSignal(94, true)).toBe("red");
    expect(scoreToSignal(60, true)).toBe("yellow");
    expect(scoreToSignal(30, true)).toBe("green");
  });
});

describe("enforceSignals", () => {
  it("un riesgo de 94 nunca sale «Favorable», aunque el modelo diga green", () => {
    const out = enforceSignals(scores, base);
    expect(out.risk_level_signal).toBe("red");
  });

  it("el resto de los semáforos salen de los puntajes, no del modelo", () => {
    const out = enforceSignals(scores, { ...base, commercial_viability_signal: "green" });
    expect(out.personal_fit_signal).toBe("green");
    expect(out.commercial_viability_signal).toBe("yellow");
    expect(out.time_fit_signal).toBe("yellow");
  });

  it("el modelo puede empeorar el riesgo (inversión sobre el capital) pero no mejorarlo", () => {
    const low = { ...scores, risk_level: 20 };
    expect(enforceSignals(low, { ...base, risk_level_signal: "red" }).risk_level_signal).toBe("red");
    expect(enforceSignals(low, { ...base, risk_level_signal: "green" }).risk_level_signal).toBe("green");
    expect(enforceSignals({ ...scores, risk_level: 80 }, { ...base, risk_level_signal: "green" }).risk_level_signal).toBe("red");
  });

  it("conserva la recomendación, las alertas y el resumen", () => {
    const out = enforceSignals(scores, { ...base, red_flags: ["x"], reasoning_summary: "y" });
    expect(out.final_recommendation).toBe("validate_first");
    expect(out.red_flags).toEqual(["x"]);
    expect(out.reasoning_summary).toBe("y");
  });
});
