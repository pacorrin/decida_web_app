import { describe, expect, it } from "vitest";
import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { PLANS } from "@/lib/credits/plans";
import { PUBLIC_PAGES } from "@/lib/seo";
import { CIFRA_CAPTURE_RULES, CIFRA_FAQ, CIFRA_NAV_LINKS, CIFRA_PRICING } from "../content";

describe("página pública de Cifra", () => {
  it("el costo de la captura y el precio salen de la fuente real, no de texto copiado", () => {
    expect(CIFRA_CAPTURE_RULES[2].title).toContain(String(CREDIT_COST_CIFRA_CAPTURE));
    expect(CIFRA_PRICING.plan.priceMxn).toBe(PLANS[0].priceMxn);
    expect(CIFRA_PRICING.captures).toBe(Math.floor(PLANS[0].credits / CREDIT_COST_CIFRA_CAPTURE));
    expect(JSON.stringify(CIFRA_FAQ)).toContain(`$${PLANS[0].priceMxn} MXN`);
  });

  it("los enlaces del menú apuntan a secciones de /cifra", () => {
    expect(CIFRA_NAV_LINKS.every((l) => l.href.startsWith("/cifra#"))).toBe(true);
  });

  it("promete lo que existe: sin banco conectado", () => {
    const faq = JSON.stringify(CIFRA_FAQ);
    expect(faq).toMatch(/No\. Cifra nunca te pide claves/);
  });

  it("está en el mapa del sitio", () => {
    expect(PUBLIC_PAGES.some((p) => p.path === "/cifra")).toBe(true);
  });
});
