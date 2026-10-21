/**
 * Fuentes oficiales por país, para el filtro de dominios de la búsqueda del
 * tamaño de mercado. México es el mercado por defecto de la plataforma, pero la
 * lista depende del mercado OBJETIVO de la idea, no del visitante.
 */

const OFFICIAL_DOMAINS: Record<string, string[]> = {
  MX: [
    "inegi.org.mx",
    "gob.mx",
    "economia.gob.mx",
    "imss.gob.mx",
    "sat.gob.mx",
    "coneval.org.mx",
    "profeco.gob.mx",
    "canirac.org.mx",
    "condusef.gob.mx",
    "banxico.org.mx",
  ],
  US: ["census.gov", "bls.gov", "sba.gov", "data.gov", "bea.gov"],
  ES: ["ine.es", "mineco.gob.es", "boe.es"],
  AR: ["indec.gob.ar", "argentina.gob.ar"],
  CO: ["dane.gov.co", "mincit.gov.co", "gov.co"],
  CL: ["ine.gob.cl", "gob.cl"],
  PE: ["inei.gob.pe", "gob.pe"],
};

/** Nombre de país (como lo escribe la persona o el modelo) → código. */
const COUNTRY_CODES: Record<string, string> = {
  méxico: "MX",
  mexico: "MX",
  "estados unidos": "US",
  eeuu: "US",
  "ee. uu.": "US",
  usa: "US",
  españa: "ES",
  espana: "ES",
  argentina: "AR",
  colombia: "CO",
  chile: "CL",
  perú: "PE",
  peru: "PE",
};

export function countryCodeFor(country: string | null | undefined): string | null {
  const key = (country ?? "").trim().toLowerCase();
  if (!key) return null;
  if (/^[a-z]{2}$/i.test(key)) return key.toUpperCase();
  return COUNTRY_CODES[key] ?? null;
}

export function officialDomainsFor(country: string | null | undefined): string[] {
  const code = countryCodeFor(country);
  return code ? (OFFICIAL_DOMAINS[code] ?? []) : [];
}

const AGGREGATORS = [
  "rappi.com",
  "didiglobal.com",
  "ubereats.com",
  "tripadvisor.",
  "yelp.",
  "pinterest.",
  "facebook.com",
  "instagram.com",
  "medium.com",
  "quora.com",
  "wikipedia.org",
];

export type SourceKind = "oficial" | "agregador" | "otro";

/** Clasificación simple por dominio; la fuente «original» es la oficial o la de la empresa. */
export function classifySource(url: string): SourceKind {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "otro";
  }
  const all = Object.values(OFFICIAL_DOMAINS).flat();
  if (all.some((d) => host === d || host.endsWith(`.${d}`)) || /\.gob\.[a-z]{2}$|\.gov(\.[a-z]{2})?$/.test(host)) {
    return "oficial";
  }
  if (AGGREGATORS.some((a) => host.includes(a))) return "agregador";
  return "otro";
}
