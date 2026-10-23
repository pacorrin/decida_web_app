import { PRICING_FREE_INCLUDES } from "@/components/landing/landing-content";
import { CtaLink } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import { CheckCircle2 } from "lucide-react";
import { CREDIT_PACKAGES } from "@/lib/credits/packages";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import {
  CREDIT_COST_BASIC,
  CREDIT_COST_RESEARCH,
  formatCredits,
} from "@/lib/credits/costs";

function IncludeList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-secondary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  return (
    <SectionShell
      id="precio"
      title="Empieza gratis, compra créditos cuando lo necesites"
      description="Tu primera evaluación es gratis (vista previa, sin investigación de mercado). Para el reporte completo o más ideas, usa créditos que no caducan."
      variant="muted"
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border border-border/80 bg-card px-6 py-8 sm:px-8">
          <p className="text-sm font-medium text-muted-foreground">Gratis</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
            $0
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu primera evaluación (vista previa)
          </p>
          <IncludeList items={PRICING_FREE_INCLUDES} />
          <div className="mt-auto flex justify-center pt-8">
            <CtaLink href="/analizar" variant="outline">
              Analizar mi idea gratis
            </CtaLink>
          </div>
        </div>

        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={
              pkg.highlighted
                ? "flex flex-col rounded-xl border border-primary/30 bg-card px-6 py-8 shadow-lg shadow-primary/5 sm:px-8"
                : "flex flex-col rounded-xl border border-border/80 bg-card px-6 py-8 sm:px-8"
            }
          >
            <p className="text-sm font-medium text-muted-foreground">
              {pkg.label}
              {pkg.highlighted ? " · Mejor valor" : ""}
            </p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
              ${pkg.priceMxn}{" "}
              <span className="text-2xl font-medium text-muted-foreground">
                MXN
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatCredits(pkg.credits * 100)} créditos · no caducan
            </p>
            <ul className="mt-6 space-y-3 text-left text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-secondary"
                  aria-hidden
                />
                <span>
                  Hasta{" "}
                  {Math.floor((pkg.credits * 100) / CREDIT_COST_BASIC)} análisis
                  básicos ({formatCredits(CREDIT_COST_BASIC)} c/u)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-secondary"
                  aria-hidden
                />
                <span>
                  O {Math.floor((pkg.credits * 100) / CREDIT_COST_RESEARCH)} con
                  investigación ({formatCredits(CREDIT_COST_RESEARCH)} c/u)
                </span>
              </li>
            </ul>
            <div className="mt-auto flex flex-col items-center gap-2 pt-8">
              <CtaLink href={CREDITS_PACKAGES_PATH} variant="primary">
                Comprar {pkg.label}
              </CtaLink>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
