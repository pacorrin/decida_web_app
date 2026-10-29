import { PRICING_FREE_INCLUDES } from "@/components/landing/landing-content";
import { CtaLink } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import { CheckCircle2 } from "lucide-react";
import { planFeatures } from "@/components/account/plan-card";
import { PLANS } from "@/lib/credits/plans";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";

function IncludeList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
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
      title="Empieza gratis, elige un plan cuando lo necesites"
      description="Tu primera evaluación es gratis (vista previa, sin investigación de mercado). Para el reporte completo o más ideas, un plan mensual te da créditos cada mes. Cancelas cuando quieras."
      variant="muted"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border border-border/80 bg-card px-6 py-8 sm:px-8">
          <p className="text-sm font-medium text-muted-foreground">Gratis</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">$0</p>
          <p className="mt-2 text-sm text-muted-foreground">Tu primera evaluación (vista previa)</p>
          <IncludeList items={PRICING_FREE_INCLUDES} />
          <div className="mt-auto flex justify-center pt-8">
            <CtaLink href="/analizar" variant="outline">
              Analizar mi idea gratis
            </CtaLink>
          </div>
        </div>

        {PLANS.map((plan) => (
          <div
            key={plan.id}
            data-testid={`pricing-${plan.id}`}
            className={
              plan.highlighted
                ? "flex flex-col rounded-xl border border-primary/30 bg-card px-6 py-8 shadow-lg shadow-primary/5 sm:px-8"
                : "flex flex-col rounded-xl border border-border/80 bg-card px-6 py-8 sm:px-8"
            }
          >
            <p className="text-sm font-medium text-muted-foreground">
              {plan.name}
              {plan.highlighted ? " · Recomendado" : ""}
            </p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
              ${plan.priceMxn}{" "}
              <span className="text-2xl font-medium text-muted-foreground">MXN</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">al mes · {plan.tagline}</p>
            <IncludeList items={planFeatures(plan)} />
            <div className="mt-auto flex flex-col items-center gap-2 pt-8">
              <CtaLink href={CREDITS_PLANS_PATH} variant="primary">
                Elegir {plan.name}
              </CtaLink>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
