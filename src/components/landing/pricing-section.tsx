import { PRICING_INCLUDES } from "@/components/landing/landing-content";
import { PrimaryCtaButton } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import { CheckCircle2 } from "lucide-react";

export function PricingSection() {
  return (
    <SectionShell
      id="precio"
      title="Un diagnóstico por $99 MXN"
      description="Pagas por claridad sobre una idea — no por un curso ni por asesoría personalizada."
      variant="muted"
    >
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-border/80 bg-card px-6 py-8 text-center sm:px-8">
          <p className="text-5xl font-semibold tracking-tight text-primary">
            $99{" "}
            <span className="text-2xl font-medium text-muted-foreground">
              MXN
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Una evaluación completa
          </p>

          <ul className="mt-8 space-y-3 text-left">
            {PRICING_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-secondary"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center">
            <PrimaryCtaButton href="/analizar">
              Analizar mi idea — $99 MXN
            </PrimaryCtaButton>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Precio de lanzamiento. El pago en producto es simulado en beta; si
            el reporte no se genera, aplica el compromiso de reembolso.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
