import { SectionShell } from "@/components/landing/section-shell";

export function ProblemSection() {
  return (
    <SectionShell
      id="problema"
      title="La mayoría de las personas no falla por falta de ideas. Falla por no evaluarlas bien."
      variant="muted"
    >
      <div className="mx-auto max-w-3xl space-y-4 text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        <p>
          Muchas ideas suenan bien en la cabeza, pero se rompen cuando analizas
          inversión, tiempo, clientes, margen, riesgo y operación real.
        </p>
        <p>
          Antes de comprar equipo, rentar local, pagar publicidad o invertir
          tus ahorros, evalúa si la idea tiene sentido bajo tus condiciones
          actuales.
        </p>
      </div>
    </SectionShell>
  );
}
