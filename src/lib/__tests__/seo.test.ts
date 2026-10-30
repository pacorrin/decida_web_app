import { afterEach, describe, expect, it, vi } from "vitest";
import { isIndexableSite, pageMetadata, PUBLIC_PAGES } from "../seo";
import sitemap from "../../app/sitemap";
import robots from "../../app/robots";

afterEach(() => vi.unstubAllEnvs());

describe("sitemap", () => {
  it("lista solo las páginas públicas, con URL absoluta y fecha real", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://decida.mx/");
    const entries = sitemap();
    expect(entries.map((e) => e.url)).toEqual([
      "https://decida.mx",
      "https://decida.mx/cifra",
      "https://decida.mx/ejemplo",
      "https://decida.mx/privacidad",
      "https://decida.mx/terminos",
    ]);
    for (const e of entries) {
      expect(e.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("nunca incluye rutas privadas", () => {
    for (const { path } of PUBLIC_PAGES) {
      expect(path).not.toMatch(/^\/(cuenta|analizar|api|mis-evaluaciones)/);
    }
  });

  it("no manda changeFrequency ni priority (Google los ignora)", () => {
    for (const e of sitemap()) {
      expect(e).not.toHaveProperty("changeFrequency");
      expect(e).not.toHaveProperty("priority");
    }
  });
});

describe("robots", () => {
  it("en el dominio real permite todo, bloquea lo privado y apunta al sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://decida.mx");
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/cuenta", "/analizar", "/api", "/mis-evaluaciones"],
      },
      sitemap: "https://decida.mx/sitemap.xml",
    });
  });

  it("bloquea todo en local y en direcciones de prueba, sin sitemap", () => {
    for (const url of ["http://localhost:3000", "https://decida-app.up.railway.app"]) {
      vi.stubEnv("NEXT_PUBLIC_APP_URL", url);
      expect(isIndexableSite()).toBe(false);
      expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    }
  });
});

describe("pageMetadata", () => {
  it("define canónica, Open Graph y Twitter de la propia página", () => {
    const m = pageMetadata({ title: "Ejemplo | Decida", description: "d", path: "/ejemplo" });
    expect(m.alternates?.canonical).toBe("/ejemplo");
    expect(m.openGraph).toMatchObject({ title: "Ejemplo | Decida", url: "/ejemplo", locale: "es_MX" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Ejemplo | Decida" });
  });

  it("la raíz tiene canónica «/»", () => {
    expect(pageMetadata({ title: "t", description: "d", path: "" }).alternates?.canonical).toBe("/");
  });
});
