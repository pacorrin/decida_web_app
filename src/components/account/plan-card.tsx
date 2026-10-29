import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CREDIT_COST_BASIC, CREDIT_COST_RESEARCH, formatCredits } from "@/lib/credits/costs";
import { analysesPerPlan, type Plan } from "@/lib/credits/plans";

/** Lo que incluye un plan, en frases para tarjetas (cuenta, onboarding y landing). */
export function planFeatures(plan: Plan): string[] {
  return [
    `${formatCredits(plan.credits)} créditos cada mes`,
    `Hasta ${analysesPerPlan(plan, CREDIT_COST_RESEARCH)} análisis con investigación de mercado (${CREDIT_COST_RESEARCH} créditos c/u)`,
    `O hasta ${analysesPerPlan(plan, CREDIT_COST_BASIC)} análisis básicos (${CREDIT_COST_BASIC} créditos c/u)`,
  ];
}

export function PlanCard({
  plan,
  badge,
  footer,
}: {
  plan: Plan;
  badge?: string;
  footer: React.ReactNode;
}) {
  return (
    <Card
      className={plan.highlighted ? "border-primary/30 shadow-lg shadow-primary/5" : undefined}
      data-testid={`plan-${plan.id}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {badge ? (
            <Badge variant="secondary">{badge}</Badge>
          ) : plan.highlighted ? (
            <Badge variant="secondary">Recomendado</Badge>
          ) : null}
        </div>
        <CardDescription>{plan.tagline}</CardDescription>
        <p className="pt-2 text-4xl font-semibold text-primary">
          ${plan.priceMxn}{" "}
          <span className="text-base font-normal text-muted-foreground">MXN / mes</span>
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5 text-sm">
          {planFeatures(plan).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">{footer}</CardFooter>
    </Card>
  );
}
