import { CheckCircle2, ChevronDown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FREE_PLAN_INCLUDES, FREE_PLAN_LOCKED } from "@/lib/onboarding/copy";

/**
 * Plan gratuito, a propósito discreto: va debajo de los planes de pago, en una
 * franja compacta con el detalle plegado (qué incluye y qué se bloquea).
 */
export function FreePlanCard({ isCurrent }: { isCurrent: boolean }) {
  return (
    <details
      data-testid="plan-free"
      className="group rounded-xl border border-dashed border-border bg-muted/30 px-5 py-3"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-foreground">Plan gratuito</span>
          <span className="text-muted-foreground">
            $0 · un análisis básico de prueba, sin investigación de mercado
          </span>
          {isCurrent && <Badge variant="outline">Tu plan</Badge>}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          Ver qué incluye y qué se bloquea
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>

      <div className="mt-4 grid gap-6 border-t border-border/60 pt-4 text-xs md:grid-cols-2">
        <div className="space-y-2">
          <p className="font-medium text-foreground">Lo que incluye</p>
          <ul className="space-y-2">
            {FREE_PLAN_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Se desbloquea con un plan</p>
          <ul className="space-y-2 text-muted-foreground">
            {FREE_PLAN_LOCKED.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
