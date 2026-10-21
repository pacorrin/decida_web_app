import type { MarketTarget } from "./schema";

/**
 * Utilidades puras del mercado objetivo, seguras para componentes de cliente:
 * no importan nada de servidor (`server-only`, OpenAI).
 */

/** Lo que se guarda en `business_ideas.bide_target_market`. */
export type StoredTargetMarket = {
  pais: string;
  ciudad: string | null;
  criterio: string;
  /** true mientras lo haya inferido el sistema y la persona no lo haya cambiado. */
  es_supuesto: boolean;
  /** true si la persona lo escribió o corrigió. */
  editado: boolean;
};

export function parseTargetMarket(raw: unknown): MarketTarget | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pais = typeof r.pais === "string" ? r.pais.trim() : "";
  if (!pais) return null;
  const ciudad = typeof r.ciudad === "string" && r.ciudad.trim() ? r.ciudad.trim() : null;
  return {
    pais,
    ciudad,
    criterio:
      typeof r.criterio === "string" && r.criterio.trim()
        ? r.criterio.trim()
        : "Indicado por la persona.",
    es_supuesto: r.es_supuesto === true,
  };
}

/** «México · Monterrey» ↔ { pais, ciudad }. Acepta «·», «,» y «-» como separador. */
export function formatTargetMarket(m: { pais: string; ciudad?: string | null }): string {
  return m.ciudad ? `${m.pais} · ${m.ciudad}` : m.pais;
}

export function parseTargetMarketText(
  text: string | null | undefined,
): { pais: string; ciudad: string | null } | null {
  const clean = (text ?? "").trim().slice(0, 120);
  if (!clean) return null;
  const [pais, ...rest] = clean.split(/\s*[·,–-]\s*/);
  if (!pais.trim()) return null;
  const ciudad = rest.join(", ").trim();
  return { pais: pais.trim(), ciudad: ciudad || null };
}
