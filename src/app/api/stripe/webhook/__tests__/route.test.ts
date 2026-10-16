import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  getStripe: vi.fn(),
  handle: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe/client", () => ({ getStripe: m.getStripe }));
vi.mock("@/lib/subscription/stripe-webhook", () => ({ handleStripeEvent: m.handle }));

import { POST } from "../route";

const req = (headers: Record<string, string> = { "stripe-signature": "t=1,v1=x" }) =>
  new Request("http://localhost/api/stripe/webhook", { method: "POST", body: '{"a":1}', headers });

beforeEach(() => {
  vi.resetAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  m.getStripe.mockReturnValue({ webhooks: { constructEvent: m.constructEvent } });
});

describe("POST /api/stripe/webhook", () => {
  it("rechaza con 400 una firma inválida", async () => {
    m.constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await POST(req());
    expect(res.status).toBe(400);
    expect(m.handle).not.toHaveBeenCalled();
  });

  it("rechaza con 400 si falta la cabecera de firma", async () => {
    expect((await POST(req({}))).status).toBe(400);
  });

  it("verifica con el cuerpo crudo y el secreto, y responde 200", async () => {
    m.constructEvent.mockReturnValue({ type: "charge.updated", data: { object: {} } });
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(m.constructEvent).toHaveBeenCalledWith('{"a":1}', "t=1,v1=x", "whsec_test");
    expect(m.handle).toHaveBeenCalledTimes(1);
  });

  it("responde 500 (Stripe reintenta) si el procesamiento falla", async () => {
    m.constructEvent.mockReturnValue({ type: "invoice.paid" });
    m.handle.mockRejectedValue(new Error("db"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect((await POST(req())).status).toBe(500);
  });

  it("503 si Stripe no está configurado", async () => {
    m.getStripe.mockReturnValue(null);
    expect((await POST(req())).status).toBe(503);
  });
});
