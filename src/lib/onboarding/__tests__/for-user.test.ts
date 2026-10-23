import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getCurrentAssessment: vi.fn(),
  getAssessmentById: vi.fn(),
  setAssessmentCookie: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: { assessments: { findFirst: mocks.findFirst, create: mocks.create } },
}));
vi.mock("@/lib/auth/session-server", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));
vi.mock("../session-server", () => ({
  getCurrentAssessment: mocks.getCurrentAssessment,
  getAssessmentById: mocks.getAssessmentById,
  setAssessmentCookie: mocks.setAssessmentCookie,
}));

import { ensureAssessmentForCurrentUser } from "../for-user";

function user(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "u1",
    user_email: "a@b.com",
    user_name: "Ana",
    user_phone: "5512345678",
    user_subscription_status: "none",
    user_subscription_period_end: null,
    user_credits_balance: 0,
    ...overrides,
  };
}

const inProgress = { asmt_id: "a-open", asmt_user_id: "u1", asmt_status: "in_progress" };
const completed = { asmt_id: "a-done", asmt_user_id: "u1", asmt_status: "completed" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCurrentAssessment.mockResolvedValue(null);
  mocks.findFirst.mockResolvedValue(null);
});

describe("ensureAssessmentForCurrentUser", () => {
  it("devuelve anonymous para un visitante sin sesión", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await ensureAssessmentForCurrentUser()).toEqual({ status: "anonymous" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("reutiliza la evaluación en curso de la cookie sin consultar la BD", async () => {
    mocks.getCurrentUser.mockResolvedValue(user());
    mocks.getCurrentAssessment.mockResolvedValue(inProgress);
    const result = await ensureAssessmentForCurrentUser();
    expect(result).toEqual({ status: "ready", assessment: inProgress });
    expect(mocks.findFirst).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("sin evaluaciones: crea la gratuita precargada con el perfil", async () => {
    mocks.getCurrentUser.mockResolvedValue(user());
    mocks.create.mockResolvedValue({ asmt_id: "nueva" });
    mocks.getAssessmentById.mockResolvedValue({ asmt_id: "nueva" });
    const result = await ensureAssessmentForCurrentUser();
    expect(result).toEqual({ status: "ready", assessment: { asmt_id: "nueva" } });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      asmt_user_id: "u1",
      asmt_email: "a@b.com",
      asmt_name: "Ana",
      asmt_phone: "5512345678",
    });
    expect(mocks.setAssessmentCookie).toHaveBeenCalledWith("nueva");
  });

  it("con evaluación completada y sin saldo: límite alcanzado", async () => {
    mocks.getCurrentUser.mockResolvedValue(user({ user_credits_balance: 0 }));
    mocks.findFirst.mockResolvedValue({ asmt_id: "a-done" });
    mocks.getAssessmentById.mockResolvedValue(completed);
    expect(await ensureAssessmentForCurrentUser()).toEqual({ status: "limit_reached" });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.setAssessmentCookie).toHaveBeenCalledWith("a-done");
  });

  it("con evaluación sin terminar (cookie perdida): la retoma", async () => {
    mocks.getCurrentUser.mockResolvedValue(user());
    mocks.findFirst.mockResolvedValue({ asmt_id: "a-open" });
    mocks.getAssessmentById.mockResolvedValue(inProgress);
    expect(await ensureAssessmentForCurrentUser()).toEqual({
      status: "ready",
      assessment: inProgress,
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.setAssessmentCookie).toHaveBeenCalledWith("a-open");
  });

  it("la cookie de otra cuenta no se reutiliza", async () => {
    mocks.getCurrentUser.mockResolvedValue(user());
    mocks.getCurrentAssessment.mockResolvedValue({ ...inProgress, asmt_user_id: "otro" });
    mocks.findFirst.mockResolvedValue({ asmt_id: "a-done" });
    mocks.getAssessmentById.mockResolvedValue(completed);
    expect(await ensureAssessmentForCurrentUser()).toEqual({ status: "limit_reached" });
  });

  it("con saldo ≥ 0.5 créditos puede crear otra tras completar", async () => {
    mocks.getCurrentUser.mockResolvedValue(user({ user_credits_balance: 50 }));
    mocks.findFirst.mockResolvedValue({ asmt_id: "a-done" });
    mocks.getAssessmentById
      .mockResolvedValueOnce(completed)
      .mockResolvedValueOnce({ asmt_id: "segunda" });
    mocks.create.mockResolvedValue({ asmt_id: "segunda" });
    const result = await ensureAssessmentForCurrentUser();
    expect(result).toEqual({ status: "ready", assessment: { asmt_id: "segunda" } });
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it("suscripción activa ya no abre evaluaciones ilimitadas sin créditos", async () => {
    mocks.getCurrentUser.mockResolvedValue(
      user({
        user_subscription_status: "active",
        user_subscription_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        user_credits_balance: 0,
      }),
    );
    mocks.findFirst.mockResolvedValue({ asmt_id: "a-done" });
    mocks.getAssessmentById.mockResolvedValue(completed);
    expect(await ensureAssessmentForCurrentUser()).toEqual({ status: "limit_reached" });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
