/**
 * Shared range maps, formatters and dependency helpers used across the scoring
 * engine (`types.ts`), the AI context builder (`index.ts`) and the deterministic
 * strengths (`strengths.ts`). Kept dependency-free on purpose so any of those
 * can import it without pulling in the others.
 *
 * The label maps are deliberately NOT reused from `src/lib/onboarding/options.ts`:
 * those read as standalone form choices ("Menos de $5,000 MXN", "10 – 20 horas")
 * and break when dropped mid-sentence. These are the sentence-fragment variants.
 */

/**
 * Upper bound (MXN) of each `aprf_capital_available_range` /
 * `aprf_acceptable_loss_range` option. Open-ended top ranges use +Infinity so
 * they never trigger a false flag. Kept in sync with CAPITAL_RANGE_OPTIONS /
 * LOSS_RANGE_OPTIONS in `src/lib/onboarding/options.ts`.
 */
export const CAPITAL_RANGE_CEILING: Record<string, number> = {
  menos_10k: 10_000,
  "10k_50k": 50_000,
  "50k_150k": 150_000,
  "150k_500k": 500_000,
  mas_500k: Number.POSITIVE_INFINITY,
};

export const ACCEPTABLE_LOSS_CEILING: Record<string, number> = {
  menos_5k: 5_000,
  "5k_20k": 20_000,
  "20k_50k": 50_000,
  "50k_100k": 100_000,
  mas_100k: Number.POSITIVE_INFINITY,
};

export function rangeCeiling(
  value: string | null | undefined,
  map: Record<string, number>
): number {
  if (!value) return Number.POSITIVE_INFINITY;
  return map[value] ?? Number.POSITIVE_INFINITY;
}

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-MX")}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Risk points added to `riskScore` per declared business dependency (dimension 4
 * of the rubric — "pocas dependencias" = green, "dependencia crítica sin plan B"
 * = red). Platform and permit weigh more because they are in the rubric's hard
 * red-flag checklist. `ninguna` is absent → contributes 0. Kept in sync with
 * BUSINESS_DEPENDENCY_OPTIONS in `src/lib/onboarding/options.ts`.
 */
export const DEPENDENCY_RISK_WEIGHTS: Record<string, number> = {
  plataforma: 6,
  permiso: 6,
  proveedor: 3,
  cliente_unico: 3,
  ubicacion: 3,
  inventario: 3,
};

export const DEPENDENCY_PENALTY_CAP = 16;

export function parseDependencies(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((v): v is string => typeof v === "string")
    : [];
}

export function dependencyRiskPenalty(deps: string[]): number {
  const total = deps.reduce(
    (sum, d) => sum + (DEPENDENCY_RISK_WEIGHTS[d] ?? 0),
    0
  );
  return Math.min(total, DEPENDENCY_PENALTY_CAP);
}

/**
 * Customer-evidence gradient (Question Bank F1) — replaces the yes/no cliff.
 * Kept in sync with CUSTOMER_EVIDENCE_LEVEL_OPTIONS in
 * `src/lib/onboarding/options.ts` and CUSTOMER_EVIDENCE_LEVELS in
 * `src/lib/onboarding/schemas.ts`.
 */
export const CUSTOMER_EVIDENCE_LEVELS = [
  "ninguno",
  "1_3",
  "4_10",
  "mas_10",
  "ya_clientes",
] as const;

/**
 * Points contributed to `commercialScore` (higher = better). The old boolean
 * gave 10 (no) / 35 (yes); `ninguno` keeps 10 so pre-gradient assessments are
 * unaffected, and `ya_clientes` tops out slightly above the old "yes".
 */
export const CUSTOMER_EVIDENCE_COMMERCIAL_POINTS: Record<string, number> = {
  ninguno: 10,
  "1_3": 18,
  "4_10": 26,
  mas_10: 32,
  ya_clientes: 38,
};

/**
 * Delta applied to `riskScore` (higher = riskier). Talking to a handful of
 * prospects is NOT proof of demand, so it barely moves risk; only real paying
 * customers (`ya_clientes`) reduce it, and never having checked demand at all
 * (`ninguno`) is itself a risk. Replaces the old `+10 when talked` term (which
 * was mis-signed — it raised risk for talking).
 */
export const CUSTOMER_EVIDENCE_RISK_DELTA: Record<string, number> = {
  ninguno: 8,
  "1_3": 5,
  "4_10": 3,
  mas_10: 2,
  ya_clientes: -8,
};

/**
 * Resolves the customer-evidence level for an assessment, tolerating older rows
 * that only have the boolean `mrsk_has_talked_to_customers`. Legacy `true` maps
 * to `4_10` (a meaningful but unquantified "yes"); `false`/missing → `ninguno`.
 */
export function resolveCustomerEvidenceLevel(market: {
  mrsk_customer_evidence_level?: string | null;
  mrsk_has_talked_to_customers?: boolean | null;
}): string {
  const level = market.mrsk_customer_evidence_level;
  if (level && (CUSTOMER_EVIDENCE_LEVELS as readonly string[]).includes(level)) {
    return level;
  }
  return market.mrsk_has_talked_to_customers ? "4_10" : "ninguno";
}

/** Sentence-fragment labels — see the file header for why these are separate. */
export const LOSS_RANGE_LABELS: Record<string, string> = {
  menos_5k: "menos de $5,000",
  "5k_20k": "$5,000–$20,000",
  "20k_50k": "$20,000–$50,000",
  "50k_100k": "$50,000–$100,000",
  mas_100k: "más de $100,000",
};

export const CAPITAL_RANGE_LABELS: Record<string, string> = {
  menos_10k: "menos de $10,000",
  "10k_50k": "$10,000–$50,000",
  "50k_150k": "$50,000–$150,000",
  "150k_500k": "$150,000–$500,000",
  mas_500k: "más de $500,000",
};

export const HOURS_RANGE_LABELS: Record<string, string> = {
  menos_5: "Menos de 5 horas",
  "5_10": "5 a 10 horas",
  "10_20": "10 a 20 horas",
  "20_40": "20 a 40 horas",
  mas_40: "Más de 40 horas",
};

export const CHANNEL_LABELS: Record<string, string> = {
  redes_sociales: "redes sociales",
  referidos: "referidos y boca a boca",
  publicidad: "publicidad pagada",
  presencial: "venta presencial",
  otro: "otro canal",
};
