import { describe, expect, it } from "vitest";
import {
  CREDIT_COST_BASIC,
  CREDIT_COST_RESEARCH,
  CREDIT_RESEARCH_DIFF,
  creditCostForResearch,
  formatCredits,
} from "../costs";

describe("costs", () => {
  it("usa centésimos: básico 50, investigación 150", () => {
    expect(CREDIT_COST_BASIC).toBe(50);
    expect(CREDIT_COST_RESEARCH).toBe(150);
    expect(CREDIT_RESEARCH_DIFF).toBe(100);
  });

  it("elige costo según investigación", () => {
    expect(creditCostForResearch(false)).toBe(50);
    expect(creditCostForResearch(true)).toBe(150);
  });

  it("formatea créditos legibles", () => {
    expect(formatCredits(50)).toBe("0.5");
    expect(formatCredits(100)).toBe("1");
    expect(formatCredits(150)).toBe("1.5");
  });
});
