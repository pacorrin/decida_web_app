import { describe, it, expect } from "vitest";
import {
  parseStoredRisks,
  parseStoredStrengths,
  parseStoredValidationPlan,
} from "../sections";

describe("parseStoredStrengths", () => {
  it("lifts legacy string[] rows into the current shape", () => {
    expect(
      parseStoredStrengths(["Tu idea tiene elementos a favor según tu perfil."])
    ).toEqual([
      {
        title: "Tu idea tiene elementos a favor según tu perfil.",
        whyItMatters: "",
      },
    ]);
  });

  it("reads the current object shape", () => {
    expect(
      parseStoredStrengths([{ title: "Margen de 77%", whyItMatters: "Porque X" }])
    ).toEqual([{ title: "Margen de 77%", whyItMatters: "Porque X" }]);
  });

  it("drops items with no title instead of rendering an empty bullet", () => {
    expect(
      parseStoredStrengths([{ whyItMatters: "huérfano" }, "", null, 42])
    ).toEqual([]);
  });

  it("returns [] for non-arrays", () => {
    expect(parseStoredStrengths(null)).toEqual([]);
    expect(parseStoredStrengths({ a: 1 })).toEqual([]);
  });
});

describe("parseStoredRisks", () => {
  it("lifts legacy strings and keeps the full object shape", () => {
    expect(parseStoredRisks(["riesgo viejo"])).toEqual([
      { title: "riesgo viejo", whyItMatters: "", howToReduce: "" },
    ]);
    expect(
      parseStoredRisks([
        { title: "Canal poco claro", whyItMatters: "por A", howToReduce: "haz B" },
      ])
    ).toEqual([
      { title: "Canal poco claro", whyItMatters: "por A", howToReduce: "haz B" },
    ]);
  });
});

describe("parseStoredValidationPlan", () => {
  it("reads the legacy {week1, week2} object", () => {
    expect(
      parseStoredValidationPlan({
        week1: ["Hablar con 10 clientes"],
        week2: ["Hacer una prueba piloto"],
      })
    ).toEqual([
      { week: 1, title: "", tasks: ["Hablar con 10 clientes"] },
      { week: 2, title: "", tasks: ["Hacer una prueba piloto"] },
    ]);
  });

  it("reads the current {weeks: [...]} shape", () => {
    expect(
      parseStoredValidationPlan({
        weeks: [{ week: 1, title: "Validar demanda", tasks: ["a", "b"] }],
      })
    ).toEqual([{ week: 1, title: "Validar demanda", tasks: ["a", "b"] }]);
  });

  it("falls back to positional week numbers and drops empty weeks", () => {
    expect(
      parseStoredValidationPlan([
        { title: "Sin número", tasks: ["a"] },
        { title: "Sin tareas", tasks: [] },
      ])
    ).toEqual([{ week: 1, title: "Sin número", tasks: ["a"] }]);
  });

  it("returns [] for junk", () => {
    expect(parseStoredValidationPlan(null)).toEqual([]);
    expect(parseStoredValidationPlan("nope")).toEqual([]);
  });
});
