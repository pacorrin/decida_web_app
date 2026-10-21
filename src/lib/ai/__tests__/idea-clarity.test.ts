import { describe, expect, it } from "vitest";
import { assessIdeaClarity } from "../idea-clarity";
import { BASELINE_CASES } from "../../../../evals/cases/baseline";

describe("assessIdeaClarity", () => {
  it("una idea de una línea es vaga y dice qué falta", () => {
    const r = assessIdeaClarity("Quiero hacer algo con comida para llevar.");
    expect(r.level).toBe("vaga");
    expect(r.missing.length).toBeGreaterThan(0);
  });

  it("vacía o nula es vaga", () => {
    expect(assessIdeaClarity("").level).toBe("vaga");
    expect(assessIdeaClarity(null).level).toBe("vaga");
  });

  it("una idea con cliente, lugar y modelo es clara y no pide nada", () => {
    const r = assessIdeaClarity(
      "Quiero abrir una cafetería de especialidad en la colonia Roma Norte de la Ciudad de México para jóvenes profesionales que trabajan en la zona, con café de productores mexicanos y pan horneado ahí mismo.",
    );
    expect(r.level).toBe("clara");
    expect(r.missing).toEqual([]);
  });

  it("una idea con poco detalle es parcial y señala lo que falta", () => {
    const r = assessIdeaClarity(
      "Quiero vender pasteles caseros por encargo los fines de semana con mis recetas.",
    );
    expect(r.level).toBe("parcial");
    expect(r.missing).toContain("dónde operarías o venderías");
  });

  it("los casos de referencia: solo el 04 sale vago y el 01 y el 05 no dicen a quién le venden", () => {
    const levels = Object.fromEntries(
      BASELINE_CASES.map((c) => [c.id, assessIdeaClarity(c.description).level]),
    );
    expect(levels["04-comida-para-llevar-vaga"]).toBe("vaga");
    expect(levels["01-cafeteria-roma-norte"]).toBe("parcial");
    expect(
      assessIdeaClarity(BASELINE_CASES[0].description).missing,
    ).toEqual(["a quién le venderías"]);
    // 05 tampoco dice quién compraría los cassettes.
    expect(levels["05-tienda-de-cassettes"]).toBe("parcial");
    for (const id of ["02-plantillas-notion", "03-curso-ingles-ingenieros"]) {
      expect(levels[id], id).toBe("clara");
    }
  });
});
