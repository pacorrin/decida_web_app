import { describe, expect, it } from "vitest";
import { decideAssessmentStart } from "../limits";

describe("decideAssessmentStart", () => {
  it("con saldo suficiente permite otra evaluación tras completar una", () => {
    expect(
      decideAssessmentStart({
        creditsBalance: 50,
        latest: { completed: true },
      }),
    ).toBe("create");
  });

  it("sin evaluaciones previas da la gratuita", () => {
    expect(decideAssessmentStart({ latest: null, creditsBalance: 0 })).toBe(
      "create",
    );
  });

  it("retoma una evaluación sin terminar", () => {
    expect(
      decideAssessmentStart({
        creditsBalance: 0,
        latest: { completed: false },
      }),
    ).toBe("resume");
  });

  it("bloquea la segunda si no hay saldo mínimo", () => {
    expect(
      decideAssessmentStart({
        creditsBalance: 0,
        latest: { completed: true },
      }),
    ).toBe("limit");
    expect(
      decideAssessmentStart({
        creditsBalance: 49,
        latest: { completed: true },
      }),
    ).toBe("limit");
  });
});
