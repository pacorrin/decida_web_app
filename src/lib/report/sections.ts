/**
 * Shapes and coercion for the structured report sections (`arep_strengths`,
 * `arep_risks`, `arep_validation_plan`).
 *
 * Deliberately Zod-free: the report renderer imports these, and pulling the AI
 * schema layer into a Client Component would drag the whole prompt module with
 * it. `src/lib/ai/schemas/report-sections.ts` imports the types from here so
 * there is a single source of truth for the shape.
 *
 * Reports written before prompt version v1.1.0 stored plain `string[]` for
 * strengths and risks, and a `{week1, week2}` object for the plan. The parsers
 * below lift those into the current shapes so old rows keep rendering.
 * Modelled on `parseStoredProducts` in `src/lib/onboarding/products.ts`.
 */

export type ReportStrength = { title: string; whyItMatters: string };

export type ReportRisk = {
  title: string;
  whyItMatters: string;
  howToReduce: string;
};

export type ValidationWeek = { week: number; title: string; tasks: string[] };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(str).filter(Boolean);
}

/**
 * Legacy rows stored a bare sentence per strength. Those become the title with
 * an empty body — we never invent an explanation for them, which would be the
 * same fabrication this shape change exists to remove.
 */
export function parseStoredStrengths(raw: unknown): ReportStrength[] {
  if (!Array.isArray(raw)) return [];
  const out: ReportStrength[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const title = item.trim();
      if (title) out.push({ title, whyItMatters: "" });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const title = str(r.title);
    if (!title) continue;
    out.push({ title, whyItMatters: str(r.whyItMatters) });
  }
  return out;
}

export function parseStoredRisks(raw: unknown): ReportRisk[] {
  if (!Array.isArray(raw)) return [];
  const out: ReportRisk[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const title = item.trim();
      if (title) out.push({ title, whyItMatters: "", howToReduce: "" });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const title = str(r.title);
    if (!title) continue;
    out.push({
      title,
      whyItMatters: str(r.whyItMatters),
      howToReduce: str(r.howToReduce),
    });
  }
  return out;
}

/**
 * Accepts both the current `{weeks: [...]}` / bare array shape and the legacy
 * `{week1: string[], week2: string[]}` object.
 */
export function parseStoredValidationPlan(raw: unknown): ValidationWeek[] {
  if (!raw || typeof raw !== "object") return [];

  const asArray = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>).weeks)
      ? ((raw as Record<string, unknown>).weeks as unknown[])
      : null;

  if (asArray) {
    const out: ValidationWeek[] = [];
    asArray.forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const r = item as Record<string, unknown>;
      const tasks = strList(r.tasks);
      if (tasks.length === 0) return;
      const week = Number(r.week);
      out.push({
        week: Number.isFinite(week) && week > 0 ? Math.trunc(week) : index + 1,
        title: str(r.title),
        tasks,
      });
    });
    return out;
  }

  // Legacy {week1, week2}
  const legacy = raw as Record<string, unknown>;
  const out: ValidationWeek[] = [];
  for (const [key, week] of [
    ["week1", 1],
    ["week2", 2],
  ] as const) {
    const tasks = strList(legacy[key]);
    if (tasks.length > 0) out.push({ week, title: "", tasks });
  }
  return out;
}
