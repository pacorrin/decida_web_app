import { PRICING_FREE_INCLUDES } from "@/components/landing/landing-content";
import { CtaLink } from "@/components/landing/cta-link";
import { planFeatures } from "@/components/account/plan-card";
import { PLANS } from "@/lib/credits/plans";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { cn } from "@/lib/utils";

function IncludeList({ items, dark }: { items: readonly string[]; dark?: boolean }) {
  return (
    <ul className="mt-6 space-y-3 text-left">
      {items.map((item) => (
        <li key={item} className={cn("text-base leading-snug", dark ? "text-white/90" : "text-foreground")}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  return (
    <section id="precio" aria-labelledby="precio-heading" className="scroll-mt-20 bg-muted/60 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="precio-heading" className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-primary sm:text-5xl">
          Empieza gratis, elige un plan cuando lo necesites
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground">
          Tu primera evaluación es gratis. Para el reporte completo o más ideas, un plan mensual te da créditos cada mes. Cancelas cuando quieras.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          <div className="flex flex-col rounded-2xl bg-white px-6 py-8">
            <p className="text-lg font-semibold text-primary">Gratis</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">$0</p>
            <p className="mt-2 text-base text-muted-foreground">Tu primera evaluación (vista previa)</p>
            <IncludeList items={PRICING_FREE_INCLUDES} />
            <div className="mt-auto pt-8">
              <CtaLink href="/analizar" location="pricing_free" variant="outline" className="w-full">
                Analizar mi idea gratis
              </CtaLink>
            </div>
          </div>

          {PLANS.map((plan) => (
            <div
              key={plan.id}
              data-testid={`pricing-${plan.id}`}
              className={cn("flex flex-col rounded-2xl px-6 py-8", plan.highlighted ? "bg-primary text-white" : "bg-white")}
            >
              <p className={cn("text-lg font-semibold", plan.highlighted ? "text-white" : "text-primary")}>
                {plan.name}
                {plan.highlighted ? " · Recomendado" : ""}
              </p>
              <p className={cn("mt-2 text-5xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-primary")}>
                ${plan.priceMxn}
                <span className={cn("ml-1 text-lg font-medium", plan.highlighted ? "text-white/75" : "text-muted-foreground")}>MXN</span>
              </p>
              <p className={cn("mt-2 text-base", plan.highlighted ? "text-white/80" : "text-muted-foreground")}>
                al mes · {plan.tagline}
              </p>
              <IncludeList items={planFeatures(plan)} dark={plan.highlighted} />
              <div className="mt-auto pt-8">
                <CtaLink href={CREDITS_PLANS_PATH} location="pricing_plans" variant="primary" className="w-full">
                  Elegir {plan.name}
                </CtaLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
