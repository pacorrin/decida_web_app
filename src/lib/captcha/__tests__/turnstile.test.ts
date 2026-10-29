import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
}));

import { turnstileSiteKey, verifyTurnstile } from "../turnstile";

const form = (token?: string) => {
  const f = new FormData();
  if (token !== undefined) f.set("cf-turnstile-response", token);
  return f;
};

const respond = (body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body)));

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secreto");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "publica");
    vi.stubEnv("TURNSTILE_DISABLED", "");
    vi.stubEnv("NODE_ENV", "development");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("acepta un token válido y manda secreto, token e IP a Cloudflare", async () => {
    const spy = respond({ success: true });
    expect(await verifyTurnstile(form("tok"))).toEqual({ success: true });
    const body = spy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("secret")).toBe("secreto");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("203.0.113.9");
  });

  it("devuelve el motivo del rechazo para medirlo en analítica", async () => {
    respond({ success: false });
    expect(await verifyTurnstile(form("tok"))).toMatchObject({ success: false, reason: "rejected" });
    expect(await verifyTurnstile(form())).toMatchObject({ success: false, reason: "missing_token" });
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("red"));
    expect(await verifyTurnstile(form("tok"))).toMatchObject({ success: false, reason: "unavailable" });
  });

  it("rechaza sin token sin llamar a Cloudflare", async () => {
    const spy = respond({ success: true });
    expect((await verifyTurnstile(form())).success).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("rechaza si Cloudflare responde que no", async () => {
    respond({ success: false, "error-codes": ["invalid-input-response"] });
    expect((await verifyTurnstile(form("tok"))).success).toBe(false);
  });

  it("falla cerrado si Cloudflare no responde", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("red"));
    expect((await verifyTurnstile(form("tok"))).success).toBe(false);
  });

  it("en producción sin secreto rechaza", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect((await verifyTurnstile(form("tok"))).success).toBe(false);
  });

  it("TURNSTILE_DISABLED apaga el captcha fuera de producción", async () => {
    vi.stubEnv("TURNSTILE_DISABLED", "true");
    expect(await verifyTurnstile(form())).toEqual({ success: true });
    expect(turnstileSiteKey()).toBeNull();
  });

  it("TURNSTILE_DISABLED no apaga nada en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_DISABLED", "true");
    respond({ success: false });
    expect((await verifyTurnstile(form("tok"))).success).toBe(false);
    expect(turnstileSiteKey()).toBe("publica");
  });
});
