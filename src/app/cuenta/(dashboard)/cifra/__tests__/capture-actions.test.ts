import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  trackServer: vi.fn(),
  spendCredits: vi.fn(),
  refundCreditsByKey: vi.fn(),
  extractCapture: vi.fn(),
  captureException: vi.fn(),
  prisma: { users: { update: vi.fn() } },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session-server", () => ({ getCurrentUser: m.getCurrentUser }));
vi.mock("@/lib/analytics/server", () => ({ trackServer: m.trackServer }));
vi.mock("@/lib/prisma", () => ({ prisma: m.prisma }));
vi.mock("@sentry/nextjs", () => ({ captureException: m.captureException }));
vi.mock("@/lib/cifra/capture/extract", () => ({ extractCapture: m.extractCapture }));
vi.mock("@/lib/credits/ledger", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/credits/ledger")>()),
  spendCredits: m.spendCredits,
  refundCreditsByKey: m.refundCreditsByKey,
}));

import { InsufficientCreditsError } from "@/lib/credits/ledger";
import { grantCifraAiConsent, smartCapture } from "../capture-actions";

const ID = "11111111-1111-4111-8111-111111111111";
const future = new Date(Date.now() + 86_400_000);
const user = (over: Record<string, unknown> = {}) => ({
  user_id: "u1",
  user_subscription_status: "active",
  user_subscription_period_end: future,
  user_credits_balance: 200,
  user_cifra_ai_consent_at: new Date(),
  ...over,
});

function form(values: Record<string, string> = {}, files = 0): FormData {
  const f = new FormData();
  f.set("captureId", ID);
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  for (let i = 0; i < files; i++) f.append("images", new File([new Uint8Array([1, 2, 3])], `t${i}.jpg`, { type: "image/jpeg" }));
  return f;
}

const proposal = { flow: "expense", amount: "250.00", category: "alimentos", date: "2026-10-30", description: "Súper", confidence: "high", warnings: [] };

beforeEach(() => {
  vi.resetAllMocks();
  m.getCurrentUser.mockResolvedValue(user());
  m.spendCredits.mockResolvedValue({ created: true });
  m.extractCapture.mockResolvedValue(proposal);
});

describe("captura inteligente", () => {
  it("sin sesión, sin plan o sin consentimiento no cobra ni llama a la IA", async () => {
    m.getCurrentUser.mockResolvedValue(null);
    expect((await smartCapture(form({ text: "gasto" }))).success).toBe(false);

    m.getCurrentUser.mockResolvedValue(user({ user_subscription_status: "none" }));
    expect((await smartCapture(form({ text: "gasto" }))).success).toBe(false);

    m.getCurrentUser.mockResolvedValue(user({ user_cifra_ai_consent_at: null }));
    const r = await smartCapture(form({ text: "gasto" }));
    expect(r).toMatchObject({ success: false, needsConsent: true });

    expect(m.spendCredits).not.toHaveBeenCalled();
    expect(m.extractCapture).not.toHaveBeenCalled();
  });

  it("una captura vacía o con demasiadas fotos no cobra", async () => {
    expect((await smartCapture(form())).success).toBe(false);
    expect((await smartCapture(form({}, 4))).success).toBe(false);
    expect((await smartCapture(form({ text: "x".repeat(501) }))).success).toBe(false);
    expect(m.spendCredits).not.toHaveBeenCalled();
  });

  it("con saldo insuficiente no cobra ni llama a la IA", async () => {
    m.getCurrentUser.mockResolvedValue(user({ user_credits_balance: 2 }));
    const r = await smartCapture(form({ text: "gasto" }));
    expect(r).toMatchObject({ success: false, insufficientCredits: true });
    expect(m.spendCredits).not.toHaveBeenCalled();
    expect(m.extractCapture).not.toHaveBeenCalled();
  });

  it("si el saldo se agota justo antes del cobro, no se llama a la IA", async () => {
    m.getCurrentUser.mockResolvedValue(
      user({ user_subscription_status: "active", user_credits_balance: 200 }),
    );
    m.spendCredits.mockRejectedValue(new InsufficientCreditsError("x", 3, 0));
    const r = await smartCapture(form({ text: "gasto" }));
    expect(r).toMatchObject({ success: false, insufficientCredits: true });
  });

  it("cobra 3 créditos una vez, con clave idempotente, y devuelve la propuesta sin guardar nada", async () => {
    const r = await smartCapture(form({ text: "súper 250" }, 1));
    expect(r).toMatchObject({ success: true, proposal, creditsLeft: 197 });
    expect(m.spendCredits).toHaveBeenCalledTimes(1);
    expect(m.spendCredits).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", amount: 3, idempotencyKey: `cifra-capture:u1:${ID}` }),
    );
    const sent = m.extractCapture.mock.calls[0][0];
    expect(sent.images[0]).toMatch(/^data:image\/jpeg;base64,/);
    expect(sent.text).toBe("súper 250");
    expect(m.refundCreditsByKey).not.toHaveBeenCalled();
  });

  it("la analítica no lleva montos, textos ni descripciones", async () => {
    await smartCapture(form({ text: "súper 250" }));
    const props = JSON.stringify(m.trackServer.mock.calls);
    expect(props).not.toContain("250");
    expect(props).not.toContain("Súper");
  });

  it("si la IA falla devuelve los créditos y avisa", async () => {
    m.extractCapture.mockRejectedValue(new Error("OpenAI caído"));
    const r = await smartCapture(form({ text: "gasto" }));
    expect(r.success).toBe(false);
    expect(m.refundCreditsByKey).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", amount: 3, idempotencyKey: `refund:cifra-capture:u1:${ID}` }),
    );
    expect(m.captureException).toHaveBeenCalled();
  });

  it("si la IA responde algo inservible también devuelve los créditos", async () => {
    m.extractCapture.mockResolvedValue(null);
    const r = await smartCapture(form({ text: "gasto" }));
    expect(r.success).toBe(false);
    expect(m.refundCreditsByKey).toHaveBeenCalledTimes(1);
  });
});

describe("consentimiento", () => {
  it("se guarda una sola vez", async () => {
    m.getCurrentUser.mockResolvedValue(user({ user_cifra_ai_consent_at: null }));
    expect((await grantCifraAiConsent()).success).toBe(true);
    expect(m.prisma.users.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user_id: "u1" } }),
    );

    m.prisma.users.update.mockClear();
    m.getCurrentUser.mockResolvedValue(user());
    expect((await grantCifraAiConsent()).success).toBe(true);
    expect(m.prisma.users.update).not.toHaveBeenCalled();
  });

  it("sin sesión no guarda nada", async () => {
    m.getCurrentUser.mockResolvedValue(null);
    expect((await grantCifraAiConsent()).success).toBe(false);
    expect(m.prisma.users.update).not.toHaveBeenCalled();
  });
});
