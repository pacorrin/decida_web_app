import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureImmediate, PostHog } = vi.hoisted(() => ({
  captureImmediate: vi.fn(),
  PostHog: vi.fn(function PostHog() {
    return { captureImmediate };
  }),
}));
vi.mock("posthog-node", () => ({ PostHog }));
vi.mock("server-only", () => ({}));

async function load() {
  vi.resetModules();
  return import("../server");
}

describe("trackServer", () => {
  beforeEach(() => {
    captureImmediate.mockReset();
    PostHog.mockClear();
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  });

  it("no envía nada si PostHog no está configurado", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { trackServer } = await load();
    await trackServer("user_1", "account_created");
    expect(captureImmediate).not.toHaveBeenCalled();
  });

  it("envía el evento con el id de la cuenta como distinct_id", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { trackServer } = await load();
    await trackServer("user_1", "onboarding_completed", { assessmentId: "a1" });
    expect(captureImmediate).toHaveBeenCalledWith({
      distinctId: "user_1",
      event: "onboarding_completed",
      properties: { assessmentId: "a1" },
    });
  });

  it("no guarda el contenido de los prompts de la IA (privacyMode)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { getPostHogClient } = await load();
    getPostHogClient();
    expect(PostHog).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ privacyMode: true }),
    );
  });

  it("no lanza error al faltar la clave o el host (solo queda apagado)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");
    const { getPostHogClient } = await load();
    expect(() => getPostHogClient()).not.toThrow();
    expect(getPostHogClient()).toBeNull();
  });

  it("ignora eventos sin cuenta", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { trackServer } = await load();
    await trackServer(null, "account_created");
    expect(captureImmediate).not.toHaveBeenCalled();
  });

  it("nunca lanza aunque PostHog falle", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    captureImmediate.mockRejectedValue(new Error("red caída"));
    const { trackServer } = await load();
    await expect(trackServer("user_1", "account_created")).resolves.toBeUndefined();
  });
});
