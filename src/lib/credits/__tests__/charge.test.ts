import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  count: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  isResearchEnabled: vi.fn(),
  spendCredits: vi.fn(),
  refundCredits: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ trackServer: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessments: {
      count: m.count,
      findUnique: m.findUnique,
      update: m.update,
    },
  },
}));
vi.mock("@/lib/ai/research/flag", () => ({
  isResearchEnabled: m.isResearchEnabled,
}));
vi.mock("../ledger", () => ({
  spendCredits: m.spendCredits,
  refundCredits: m.refundCredits,
  InsufficientCreditsError: class InsufficientCreditsError extends Error {
    constructor() {
      super("insufficient");
      this.name = "InsufficientCreditsError";
    }
  },
}));

import {
  isFreePreviewAssessment,
  planAndChargeForReport,
  refundDegradedResearch,
  refundFailedReport,
  refundResearchUpgrade,
} from "../charge";

beforeEach(() => {
  vi.resetAllMocks();
  m.spendCredits.mockResolvedValue({ created: true, entry: {} });
  m.refundCredits.mockResolvedValue({ created: true, entry: {} });
  m.update.mockResolvedValue({});
});

describe("isFreePreviewAssessment", () => {
  it("es preview si no está cobrada y no hay otras usadas", async () => {
    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: null });
    m.count.mockResolvedValue(0);
    expect(await isFreePreviewAssessment("a1", "u1")).toBe(true);
  });

  it("no es preview si ya cobró o hay otra completada", async () => {
    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: new Date() });
    expect(await isFreePreviewAssessment("a1", "u1")).toBe(false);

    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: null });
    m.count.mockResolvedValue(1);
    expect(await isFreePreviewAssessment("a1", "u1")).toBe(false);
  });
});

describe("planAndChargeForReport", () => {
  it("free_preview: sin investigación ni cobro", async () => {
    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: null });
    m.count.mockResolvedValue(0);
    const plan = await planAndChargeForReport({
      assessmentId: "a1",
      userId: "u1",
      researchEnabledOnAssessment: true,
      alreadyChargedAt: null,
      creditsBalance: 0,
    });
    expect(plan).toEqual({ mode: "free_preview", research: false, cost: 0 });
    expect(m.spendCredits).not.toHaveBeenCalled();
  });

  it("retry: ya cobrada, no vuelve a gastar", async () => {
    m.isResearchEnabled.mockResolvedValue(true);
    const plan = await planAndChargeForReport({
      assessmentId: "a1",
      userId: "u1",
      researchEnabledOnAssessment: true,
      alreadyChargedAt: new Date(),
      creditsBalance: 0,
    });
    expect(plan.mode).toBe("retry");
    expect(plan.research).toBe(true);
    expect(m.spendCredits).not.toHaveBeenCalled();
  });

  it("paid: cobra 150 con investigación", async () => {
    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: null });
    m.count.mockResolvedValue(1);
    m.isResearchEnabled.mockResolvedValue(true);
    const plan = await planAndChargeForReport({
      assessmentId: "a2",
      userId: "u1",
      researchEnabledOnAssessment: true,
      alreadyChargedAt: null,
      creditsBalance: 200,
    });
    expect(plan).toEqual({ mode: "paid", research: true, cost: 150 });
    expect(m.spendCredits).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150,
        idempotencyKey: "spend:a2",
        markAssessmentCharged: true,
      }),
    );
  });

  it("insufficient: no cobra", async () => {
    m.findUnique.mockResolvedValue({ asmt_credits_charged_at: null });
    m.count.mockResolvedValue(1);
    m.isResearchEnabled.mockResolvedValue(false);
    const plan = await planAndChargeForReport({
      assessmentId: "a2",
      userId: "u1",
      researchEnabledOnAssessment: true,
      alreadyChargedAt: null,
      creditsBalance: 40,
    });
    expect(plan.mode).toBe("insufficient");
    expect(plan.cost).toBe(50);
    expect(m.spendCredits).not.toHaveBeenCalled();
  });
});

describe("reembolsos", () => {
  it("refundFailedReport usa clave failed", async () => {
    await refundFailedReport({ userId: "u1", assessmentId: "a1", amount: 150 });
    expect(m.refundCredits).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 150,
        reason: "failed",
      }),
    );
  });

  it("refundDegradedResearch solo si cobró research y status failed/skipped", async () => {
    expect(
      await refundDegradedResearch({
        userId: "u1",
        assessmentId: "a1",
        chargedCost: 150,
        researchStatus: "failed",
      }),
    ).toBe(true);
    expect(m.refundCredits).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100, reason: "research" }),
    );

    m.refundCredits.mockClear();
    expect(
      await refundDegradedResearch({
        userId: "u1",
        assessmentId: "a1",
        chargedCost: 50,
        researchStatus: "failed",
      }),
    ).toBe(false);
    expect(m.refundCredits).not.toHaveBeenCalled();
  });
});

describe("refundResearchUpgrade", () => {
  it("devuelve la parte de investigación (100) y deja el costo en el básico (50)", async () => {
    const ok = await refundResearchUpgrade({
      userId: "u1",
      assessmentId: "a1",
      chargedAmount: 150,
      reason: "failed",
    });
    expect(ok).toBe(true);
    expect(m.refundCredits).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", assessmentId: "a1", amount: 100, reason: expect.stringMatching(/^research_upgrade_/) }),
    );
    expect(m.update).toHaveBeenCalledWith({
      where: { asmt_id: "a1" },
      data: { asmt_credit_cost: 50 },
    });
  });

  it("si ya había pagado el básico y la mejora costó 100, también devuelve 100", async () => {
    await refundResearchUpgrade({ userId: "u1", assessmentId: "a1", chargedAmount: 100, reason: "degraded" });
    expect(m.refundCredits).toHaveBeenCalledWith(expect.objectContaining({ amount: 100 }));
  });

  it("si la mejora no cobró nada, no devuelve nada", async () => {
    const ok = await refundResearchUpgrade({ userId: "u1", assessmentId: "a1", chargedAmount: 0, reason: "failed" });
    expect(ok).toBe(false);
    expect(m.refundCredits).not.toHaveBeenCalled();
  });
});
