import { categoryColor } from "@/lib/cifra/colors";
import { cn } from "@/lib/utils";

/** Maqueta ilustrativa con los mismos colores y etiquetas de la app real; los datos son de ejemplo. */

const FIGURE = "rounded-xl border border-border/80 bg-card p-5 sm:p-6";

function Caption({ children = "Ejemplo ilustrativo" }: { children?: string }) {
  return <figcaption className="mt-4 text-[13px] text-muted-foreground">{children}</figcaption>;
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-medium", className)}>{children}</span>;
}

export function BreakdownMock() {
  const rows: [string, string, number, string][] = [
    ["vivienda", "Vivienda", 58, "$6,500.00"],
    ["alimentos", "Alimentos", 22, "$2,480.00"],
    ["transporte", "Transporte", 12, "$1,350.00"],
    ["servicios", "Servicios", 8, "$910.50"],
  ];
  return (
    <figure className={FIGURE} aria-label="Ejemplo ilustrativo de egresos por categoría">
      <p className="text-sm font-medium text-muted-foreground">Egresos por categoría</p>
      <ul className="mt-4 space-y-3">
        {rows.map(([code, label, pct, amount]) => (
          <li key={code} className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <Chip className={categoryColor("expense", code)}>{label}</Chip>
              <span className="tabular-nums">
                <span className="font-medium">{amount}</span>
                <span className="ml-2 text-xs text-muted-foreground">{pct}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <Caption />
    </figure>
  );
}
