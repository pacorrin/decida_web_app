import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  captureImmediate: vi.fn(),
  cookieValue: undefined as string | undefined,
  after: vi.fn(),
}));

vi.mock("posthog-node", () => ({
  PostHog: vi.fn(function PostHog() {
    return { captureImmediate: m.captureImmediate };
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "ph_phc_test_posthog" && m.cookieValue ? { value: m.cookieValue } : undefined,
  }),
}));
vi.mock("next/server", () => ({ after: m.after }));

async function load() {
  vi.resetModules();
  return import("../server");
}

describe("eventos de visitantes sin cuenta", () => {
  beforeEach(() => {
    m.captureImmediate.mockReset();
    m.after.mockReset();
    m.cookieValue = undefined;
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  });

  it("usa el id anónimo de la cookie de PostHog", async () => {
    m.cookieValue = encodeURIComponent(JSON.stringify({ distinct_id: "anon-123" }));
    m.after.mockImplementation((task: () => Promise<void>) => void task());
    const { trackAnonymous } = await load();
    await trackAnonymous("signup_submitted", { source: "registro" });
    await vi.waitFor(() =>
      expect(m.captureImmediate).toHaveBeenCalledWith({
        distinctId: "anon-123",
        event: "signup_submitted",
        properties: { source: "registro" },
      }),
    );
  });

  it("sin cookie (bloqueada) no manda nada", async () => {
    const { trackAnonymous } = await load();
    await trackAnonymous("signup_submitted");
    expect(m.after).not.toHaveBeenCalled();
    expect(m.captureImmediate).not.toHaveBeenCalled();
  });

  it("una cookie dañada no rompe nada", async () => {
    m.cookieValue = "%%%no-es-json";
    const { trackAnonymous } = await load();
    await expect(trackAnonymous("captcha_rejected")).resolves.toBeUndefined();
    expect(m.captureImmediate).not.toHaveBeenCalled();
  });

  it("fuera de una petición (sin «after») envía directo", async () => {
    m.after.mockImplementation(() => {
      throw new Error("fuera de una petición");
    });
    const { trackServerDeferred } = await load();
    trackServerDeferred("user_1", "onboarding_step_completed", { step: "idea" });
    await vi.waitFor(() => expect(m.captureImmediate).toHaveBeenCalledTimes(1));
  });

  it("sin id de cuenta no manda nada", async () => {
    const { trackServerDeferred } = await load();
    trackServerDeferred(null, "onboarding_step_completed");
    expect(m.after).not.toHaveBeenCalled();
  });
});
