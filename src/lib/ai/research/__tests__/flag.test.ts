import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ client: null as null | { isFeatureEnabled: ReturnType<typeof vi.fn> } }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics/server", () => ({ getPostHogClient: () => m.client }));

import { isResearchEnabled } from "../flag";

beforeEach(() => {
  m.client = null;
});

describe("flag de la etapa de investigación", () => {
  it("REPORT_RESEARCH_ENABLED=true la enciende siempre y =false la apaga siempre", async () => {
    expect(await isResearchEnabled("u1", { REPORT_RESEARCH_ENABLED: "true" } as never)).toBe(true);
    expect(await isResearchEnabled("u1", { REPORT_RESEARCH_ENABLED: "false" } as never)).toBe(false);
  });

  it("por defecto decide el flag de PostHog para esa cuenta", async () => {
    m.client = { isFeatureEnabled: vi.fn().mockResolvedValue(true) };
    expect(await isResearchEnabled("u1", {} as never)).toBe(true);
    expect(m.client.isFeatureEnabled).toHaveBeenCalledWith("report-research", "u1");
    m.client.isFeatureEnabled.mockResolvedValue(false);
    expect(await isResearchEnabled("u2", {} as never)).toBe(false);
  });

  it("sin PostHog, sin cuenta o con error, queda apagada (nunca rompe el reporte)", async () => {
    expect(await isResearchEnabled("u1", {} as never)).toBe(false);
    m.client = { isFeatureEnabled: vi.fn().mockRejectedValue(new Error("red")) };
    expect(await isResearchEnabled("u1", {} as never)).toBe(false);
    expect(await isResearchEnabled(null, {} as never)).toBe(false);
  });
});
