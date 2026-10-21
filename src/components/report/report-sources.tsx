import { ReportSection } from "@/components/report/report-section";
import { classifySource } from "@/lib/ai/research/official-sources";

type Source = { id: string; titulo: string; url: string; consultada: string; tipo?: string };
type Ficha = {
  mercado_objetivo?: { pais: string; ciudad: string | null; es_supuesto: boolean };
  fuentes?: Source[];
  huecos_de_informacion?: string[];
};
type Research = { status?: string; ficha?: Ficha | null } | null | undefined;

const KIND_LABEL: Record<string, string> = {
  oficial: "Fuente oficial",
  agregador: "Agregador",
  otro: "Sitio web",
};

/**
 * Fuentes y límites del reporte: qué mercado se analizó, de dónde salen los
 * datos externos [F#] y qué no se pudo verificar. Si la investigación no estaba
 * activa para la cuenta no se muestra nada; si falló, lo dice.
 */
export function ReportSources({ research }: { research: unknown }) {
  const r = research as Research;
  if (!r || typeof r !== "object") return null;

  if (r.status === "failed" || !r.ficha) {
    return (
      <ReportSection id="fuentes" title="Fuentes y límites">
        <p className="text-sm text-muted-foreground">
          Este reporte se generó sin investigación de mercado externa: no incluye cifras de
          mercado, competidores ni precios de referencia.
        </p>
      </ReportSection>
    );
  }

  const ficha = r.ficha;
  const market = ficha.mercado_objetivo;
  const sources = ficha.fuentes ?? [];
  const gaps = ficha.huecos_de_informacion ?? [];

  return (
    <ReportSection id="fuentes" title="Fuentes y límites">
      <div className="space-y-5 text-sm">
        {market && (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Mercado analizado: </span>
            {market.pais}
            {market.ciudad ? ` · ${market.ciudad}` : ""}
            {market.es_supuesto ? " (supuesto: no indicaste dónde operarías)" : ""}.
          </p>
        )}

        {sources.length > 0 && (
          <div>
            <p className="mb-2 font-medium text-foreground">Fuentes consultadas</p>
            <ul className="space-y-2" data-testid="report-sources">
              {sources.map((s) => (
                <li key={s.id} className="text-muted-foreground">
                  <span className="font-medium text-foreground">[{s.id}]</span>{" "}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {s.titulo}
                  </a>{" "}
                  <span className="text-xs">
                    · {KIND_LABEL[s.tipo ?? classifySource(s.url)] ?? "Sitio web"} · consultada el{" "}
                    {s.consultada}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gaps.length > 0 && (
          <div>
            <p className="mb-2 font-medium text-foreground">Lo que no se pudo verificar</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ReportSection>
  );
}
