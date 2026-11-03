import { cn } from "@/lib/utils";
import type { SignalLevel } from "@/lib/example-report-data";

/** Colores de la marca para cada semáforo: el color vive solo en el dato. */
export const SIGNAL_FILL: Record<SignalLevel, string> = {
  green: "var(--rc-good, #81c784)",
  yellow: "var(--rc-warn, #ffb74d)",
  red: "var(--rc-bad, #ff7043)",
};

const COST_FILL = "var(--rc-cost, #6baed6)";
const PROFIT_FILL = "var(--rc-profit, #05422c)";

function pct(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

/** Barra de 0 a 100 para el puntaje de una dimensión. */
export function ScoreBar({
  score,
  signal,
  label,
}: {
  score: number | null | undefined;
  signal: SignalLevel;
  label: string;
}) {
  const value = score ?? 0;
  return (
    <div
      role="img"
      aria-label={`${label}: ${score ?? "sin dato"} de 100`}
      className="h-3 w-full overflow-hidden rounded-full bg-[var(--rc-rule,#eef0ef)]"
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct(value, 100)}%`, backgroundColor: SIGNAL_FILL[signal] }}
      />
    </div>
  );
}

/** Ventas estimadas contra el punto de equilibrio, sobre la misma escala. */
export function BreakEvenChart({
  sales,
  breakEven,
}: {
  sales: number;
  breakEven: number;
}) {
  const max = Math.max(sales, breakEven) * 1.15;
  const covers = sales >= breakEven;
  return (
    <figure className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <figcaption className="text-base font-medium text-foreground">
          Ventas estimadas contra punto de equilibrio
        </figcaption>
        <p className="text-sm text-muted-foreground">
          {covers
            ? "Tus ventas estimadas superan el equilibrio."
            : "Tus ventas estimadas no alcanzan el equilibrio."}
        </p>
      </div>
      <div
        role="img"
        aria-label={`Ventas estimadas ${sales} al mes; punto de equilibrio ${breakEven} al mes`}
        className="relative pt-6"
      >
        <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--rc-track,#eef0ef)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct(sales, max)}%`,
              backgroundColor: covers ? SIGNAL_FILL.green : SIGNAL_FILL.red,
            }}
          />
        </div>
        <div
          className="absolute bottom-[-4px] top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${pct(breakEven, max)}%` }}
        >
          <span className="whitespace-nowrap text-xs font-medium text-foreground">
            Equilibrio · {breakEven}
          </span>
          <span className="w-0.5 flex-1 bg-[var(--rc-ink,#05422c)]" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        Ventas estimadas: <span className="font-medium text-foreground">{sales}</span> al mes
      </p>
    </figure>
  );
}

export type SplitSegment = { label: string; value: number; color: string };

/** Una barra completa partida en segmentos, con su leyenda y monto. */
export function SplitBar({
  title,
  segments,
  format,
}: {
  title: string;
  segments: SplitSegment[];
  format: (value: number) => string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <figure className="space-y-3">
      <figcaption className="text-base font-medium text-foreground">{title}</figcaption>
      <div
        role="img"
        aria-label={segments.map((s) => `${s.label} ${format(s.value)}`).join(", ")}
        className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {segments.map((s) => (
          <span
            key={s.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${pct(s.value, total)}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-muted-foreground">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
            <span className="font-medium tabular-nums text-foreground">{format(s.value)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export const SPLIT_COLORS = { cost: COST_FILL, profit: PROFIT_FILL, fixed: "var(--rc-warn, #ffb74d)" };

export type MarginRow = {
  name: string;
  kind: string;
  price: number;
  variableCost: number;
};

/** Por cada producto, cuánto del precio es costo variable y cuánto queda de margen. */
export function MarginBars({ rows }: { rows: MarginRow[] }) {
  return (
    <figure className="space-y-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="text-base font-medium text-foreground">De cada precio, cuánto queda de margen</span>
        <span className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: COST_FILL }} />
            Costo variable
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: PROFIT_FILL }} />
            Margen
          </span>
        </span>
      </figcaption>
      <ul className="space-y-3">
        {rows.map((row, i) => {
          const margin = row.price > 0 ? ((row.price - row.variableCost) / row.price) * 100 : null;
          const losing = margin != null && margin <= 0;
          const costShare = losing ? 100 : row.price > 0 ? (row.variableCost / row.price) * 100 : 0;
          return (
            <li key={i} className="grid grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-3 sm:grid-cols-[minmax(0,14rem)_1fr_3.5rem]">
              <span className="truncate text-sm text-foreground">{row.name}</span>
              <div
                role="img"
                aria-label={`${row.name}: margen ${margin == null ? "sin dato" : `${margin.toFixed(0)}%`}`}
                className="flex h-3 overflow-hidden rounded-full bg-[var(--rc-track,#eef0ef)]"
              >
                <span
                  className="h-full"
                  style={{ width: `${costShare}%`, backgroundColor: losing ? SIGNAL_FILL.red : COST_FILL }}
                />
                {!losing && <span className="h-full flex-1" style={{ backgroundColor: PROFIT_FILL }} />}
              </div>
              <span className={cn("text-right text-sm font-medium tabular-nums", losing && "text-destructive")}>
                {margin == null ? "—" : `${margin.toFixed(0)}%`}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** Regla de meses que se llena hasta el mes en que vuelve la inversión; el último tramo, parcial, va en coral. */
export function PaybackRuler({ payback }: { payback: number }) {
  const months = Math.min(24, Math.max(12, Math.ceil(payback) + 1));
  return (
    <figure className="mt-8 space-y-3">
      <figcaption className="text-base font-medium text-foreground">
        Mes en que recuperas tu inversión: {Math.ceil(payback)}
      </figcaption>
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${months}, minmax(0, 1fr))` }}>
        {Array.from({ length: months }, (_, i) => {
          const fill = Math.max(0, Math.min(1, payback - i));
          const partial = fill > 0 && fill < 1;
          return (
            <li key={i} className="space-y-1.5 text-center">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--rc-rule,#eef0ef)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${fill * 100}%`, backgroundColor: partial ? SIGNAL_FILL.red : PROFIT_FILL }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
