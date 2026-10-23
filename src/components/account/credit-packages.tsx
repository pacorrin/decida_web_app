import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKAGES } from "@/lib/credits/packages";
import { CREDIT_COST_BASIC, CREDIT_COST_RESEARCH, formatCredits } from "@/lib/credits/costs";
import { BuyCreditsButton } from "./buy-credits-button";

function pricePerBasic(priceMxn: number, credits: number): number {
  const analyses = (credits * 100) / CREDIT_COST_BASIC;
  return Math.round(priceMxn / analyses);
}

export function CreditPackages() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CREDIT_PACKAGES.map((pkg) => (
        <Card
          key={pkg.id}
          className={
            pkg.highlighted
              ? "border-primary/30 shadow-lg shadow-primary/5"
              : undefined
          }
          data-testid={`credit-package-${pkg.id}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xl">{pkg.label}</CardTitle>
              {pkg.highlighted && <Badge variant="secondary">Mejor valor</Badge>}
            </div>
            <CardDescription>
              ~${pricePerBasic(pkg.priceMxn, pkg.credits)} MXN por análisis
              básico ({formatCredits(CREDIT_COST_BASIC)} créditos)
            </CardDescription>
            <p className="pt-2 text-4xl font-semibold text-primary">
              ${pkg.priceMxn}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                MXN
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Hasta {Math.floor((pkg.credits * 100) / CREDIT_COST_BASIC)} análisis
              básicos, o {Math.floor((pkg.credits * 100) / CREDIT_COST_RESEARCH)}{" "}
              con investigación de mercado.
            </p>
            <p>Los créditos no caducan.</p>
          </CardContent>
          <CardFooter>
            <BuyCreditsButton
              packageId={pkg.id}
              label={`Comprar ${pkg.label}`}
              highlighted={pkg.highlighted}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
