import { PRICING_INCLUDES } from "@/components/landing/landing-content";
import { PrimaryCtaButton } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function PricingSection() {
  return (
    <SectionShell
      id="precio"
      title="Precio beta"
      description="Empieza con claridad antes de invertir más."
      variant="muted"
    >
      <div className="mx-auto max-w-lg">
        <Card className="border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="text-center">
            <CardDescription>Precio de lanzamiento</CardDescription>
            <CardTitle className="text-5xl font-semibold text-primary">
              $99{" "}
              <span className="text-2xl font-medium text-muted-foreground">
                MXN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
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
          </CardContent>
          <CardFooter className="justify-center pb-8">
            <PrimaryCtaButton href="/analizar">
              Analizar mi idea ahora
            </PrimaryCtaButton>
          </CardFooter>
        </Card>
      </div>
    </SectionShell>
  );
}
