import { describe, expect, it } from "vitest";
import { decideAssessmentStart } from "../limits";

describe("decideAssessmentStart", () => {
  it("lets a subscriber start another evaluation even with a completed one", () => {
    expect(
      decideAssessmentStart({ fullAccess: true, latest: { completed: true } }),
    ).toBe("create");
  });

  it("gives a freemium account with no evaluations its free one", () => {
    expect(decideAssessmentStart({ fullAccess: false, latest: null })).toBe(
      "create",
    );
  });

  it("resumes an unfinished evaluation instead of creating a second one", () => {
    expect(
      decideAssessmentStart({ fullAccess: false, latest: { completed: false } }),
    ).toBe("resume");
  });

  it("blocks a second evaluation once the free one is completed", () => {
    expect(
      decideAssessmentStart({ fullAccess: false, latest: { completed: true } }),
    ).toBe("limit");
  });
});
