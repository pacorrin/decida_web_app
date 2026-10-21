import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ReportSources } from "../report-sources";

const research = {
  status: "ok",
  ficha: {
    mercado_objetivo: { pais: "México", ciudad: "Ciudad de México", es_supuesto: true },
    fuentes: [
      { id: "F1", titulo: "Censo Económico 2019", url: "https://www.inegi.org.mx/ce", consultada: "2026-10-20", tipo: "oficial" },
      { id: "F2", titulo: "Café Tormenta", url: "https://cafetormenta.com", consultada: "2026-10-20", tipo: "otro" },
    ],
    huecos_de_informacion: ["Renta típica en Roma Norte no verificada."],
  },
};

describe("ReportSources", () => {
  it("lista el mercado analizado, las fuentes con enlace y fecha, y lo que no se pudo verificar", () => {
    const html = renderToStaticMarkup(<ReportSources research={research} />);
    expect(html).toContain("Fuentes y límites");
    expect(html).toContain("México");
    expect(html).toContain("supuesto");
    expect(html).toContain("[F1]");
    expect(html).toContain('href="https://www.inegi.org.mx/ce"');
    expect(html).toContain("Fuente oficial");
    expect(html).toContain("consultada el");
    expect(html).toContain("Renta típica en Roma Norte no verificada.");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("si la investigación falló, lo dice con claridad", () => {
    const html = renderToStaticMarkup(<ReportSources research={{ status: "failed", ficha: null }} />);
    expect(html).toContain("sin investigación de mercado externa");
  });

  it("si la investigación no estaba activa (null), no muestra nada", () => {
    expect(renderToStaticMarkup(<ReportSources research={null} />)).toBe("");
  });
});
