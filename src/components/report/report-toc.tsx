import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "resumen", label: "Resumen ejecutivo" },
  { id: "viabilidad", label: "Semáforos de viabilidad" },
  { id: "negocio", label: "Entendimiento del negocio" },
  { id: "financiero", label: "Análisis financiero" },
  { id: "fortalezas", label: "Fortalezas" },
  { id: "riesgos", label: "Riesgos" },
  { id: "personal", label: "Compatibilidad personal" },
  { id: "tiempo", label: "Tiempo y operación" },
  { id: "escalabilidad", label: "Escalabilidad" },
  { id: "validacion", label: "Plan de validación" },
  { id: "recomendacion", label: "Recomendación final" },
] as const;

export function ReportToc({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Contenido del reporte"
      className={cn("rounded-xl border border-border/70 bg-muted/30 p-4", className)}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Contenido
      </p>
      <ol className="space-y-1">
        {SECTIONS.map((section, index) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              className="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-xs tabular-nums text-muted-foreground/70">
                {index + 1}.
              </span>
              {section.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
