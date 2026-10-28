import { describe, expect, it } from "vitest";
import {
  CREDIT_COST_BASIC,
  CREDIT_COST_RESEARCH,
  CREDIT_RESEARCH_DIFF,
  creditCostForResearch,
  formatCredits,
} from "../costs";

describe("costs", () => {
  it("básico 50, investigación 150 créditos", () => {
    expect(CREDIT_COST_BASIC).toBe(50);
    expect(CREDIT_COST_RESEARCH).toBe(150);
    expect(CREDIT_RESEARCH_DIFF).toBe(100);
  });

  it("elige costo según investigación", () => {
    expect(creditCostForResearch(false)).toBe(50);
    expect(creditCostForResearch(true)).toBe(150);
  });

  it("formatea créditos enteros con separador de miles", () => {
    expect(formatCredits(50)).toBe("50");
    expect(formatCredits(150)).toBe("150");
    expect(formatCredits(2000)).toBe("2,000");
    expect(formatCredits(-50)).toBe("−50");
  });
});
