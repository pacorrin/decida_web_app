import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  trackServer: vi.fn(),
  spendCredits: vi.fn(),
  refundCreditsByKey: vi.fn(),
  extractCapture: vi.fn(),
  transcribeAudio: vi.fn(),
  captureException: vi.fn(),
  prisma: { users: { update: vi.fn() }, credit_ledger: { findUnique: vi.fn() } },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session-server", () => ({ getCurrentUser: m.getCurrentUser }));
vi.mock("@/lib/analytics/server", () => ({ trackServer: m.trackServer }));
vi.mock("@/lib/prisma", () => ({ prisma: m.prisma }));
vi.mock("@sentry/nextjs", () => ({ captureException: m.captureException }));
vi.mock("@/lib/cifra/capture/extract", () => ({ extractCapture: m.extractCapture }));
vi.mock("@/lib/ai/openai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/openai")>()),
  transcribeAudio: m.transcribeAudio,
}));
vi.mock("@/lib/credits/ledger", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/credits/ledger")>()),
  spendCredits: m.spendCredits,
  refundCreditsByKey: m.refundCreditsByKey,
}));

import { InsufficientCreditsError } from "@/lib/credits/ledger";
import { grantCifraAiConsent, smartCapture, transcribeCapture } from "../capture-actions";

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
  m.spendCredits.mockResolvedValue({ created: true, entry: { cled_balance_after: 197 } });
  m.prisma.credit_ledger.findUnique.mockResolvedValue(null);
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

function audioForm(over: { type?: string; size?: number } = {}): FormData {
  const f = new FormData();
  f.set("captureId", ID);
  f.set("audio", new File([new Uint8Array(over.size ?? 10)], "voz.webm", { type: over.type ?? "audio/webm" }));
  return f;
}

describe("nota de voz", () => {
  it("transcribe, cobra 3 créditos con la clave de la captura y devuelve el texto", async () => {
    m.transcribeAudio.mockResolvedValue("  súper walmart ochocientos  ");
    const r = await transcribeCapture(audioForm());
    expect(r).toEqual({ success: true, text: "súper walmart ochocientos" });
    expect(m.spendCredits).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 3, idempotencyKey: `cifra-capture:u1:${ID}` }),
    );
  });

  it("si la captura ya se cobró (voz y luego fotos) no vuelve a cobrar", async () => {
    m.prisma.credit_ledger.findUnique.mockImplementation(async ({ where }: { where: { cled_idempotency_key: string } }) =>
      where.cled_idempotency_key.startsWith("refund:") ? null : { cled_balance_after: 197 },
    );
    m.transcribeAudio.mockResolvedValue("hola");
    expect((await transcribeCapture(audioForm())).success).toBe(true);
    expect((await smartCapture(form({ text: "hola" }))).success).toBe(true);
    expect(m.spendCredits).not.toHaveBeenCalled();
  });

  it("si no se entiende nada o falla devuelve los créditos", async () => {
    m.transcribeAudio.mockResolvedValue("   ");
    expect((await transcribeCapture(audioForm())).success).toBe(false);
    expect(m.refundCreditsByKey).toHaveBeenCalledTimes(1);

    m.transcribeAudio.mockRejectedValue(new Error("caído"));
    expect((await transcribeCapture(audioForm())).success).toBe(false);
    expect(m.refundCreditsByKey).toHaveBeenCalledTimes(2);
  });

  it("una captura ya devuelta no se puede reutilizar gratis", async () => {
    m.prisma.credit_ledger.findUnique.mockResolvedValue({ cled_balance_after: 197 });
    const r = await transcribeCapture(audioForm());
    expect(r.success).toBe(false);
    expect(m.transcribeAudio).not.toHaveBeenCalled();
    const s2 = await smartCapture(form({ text: "gasto" }));
    expect(s2.success).toBe(false);
    expect(m.extractCapture).not.toHaveBeenCalled();
  });

  it("rechaza audio inválido o grande sin cobrar", async () => {
    expect((await transcribeCapture(audioForm({ type: "image/png" }))).success).toBe(false);
    expect((await transcribeCapture(audioForm({ size: 0 }))).success).toBe(false);
    expect((await transcribeCapture(audioForm({ size: 50_000_000 }))).success).toBe(false);
    expect(m.spendCredits).not.toHaveBeenCalled();
  });

  it("sin consentimiento no cobra ni transcribe", async () => {
    m.getCurrentUser.mockResolvedValue(user({ user_cifra_ai_consent_at: null }));
    expect(await transcribeCapture(audioForm())).toMatchObject({ success: false, needsConsent: true });
    expect(m.spendCredits).not.toHaveBeenCalled();
    expect(m.transcribeAudio).not.toHaveBeenCalled();
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
