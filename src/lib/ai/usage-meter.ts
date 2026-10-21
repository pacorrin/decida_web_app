/**
 * Medidor de uso de OpenAI, solo para los evals: acumula tokens por modelo y
 * llamadas de búsqueda web mientras está activo. En producción nunca se activa
 * (`startUsageMeter` solo se llama desde `evals/`), así que `recordUsage` no hace nada.
 */
export type UsageEntry = { calls: number; inputTokens: number; outputTokens: number };

export type UsageSnapshot = {
  byModel: Record<string, UsageEntry>;
  searchCalls: number;
};

let active: UsageSnapshot | null = null;

export function startUsageMeter(): void {
  active = { byModel: {}, searchCalls: 0 };
}

export function stopUsageMeter(): UsageSnapshot {
  const snapshot = active ?? { byModel: {}, searchCalls: 0 };
  active = null;
  return snapshot;
}

export function recordUsage(
  model: string,
  usage: { inputTokens?: number | null; outputTokens?: number | null } | undefined,
  searchCalls = 0
): void {
  if (!active) return;
  const entry = (active.byModel[model] ??= { calls: 0, inputTokens: 0, outputTokens: 0 });
  entry.calls += 1;
  entry.inputTokens += usage?.inputTokens ?? 0;
  entry.outputTokens += usage?.outputTokens ?? 0;
  active.searchCalls += searchCalls;
}
