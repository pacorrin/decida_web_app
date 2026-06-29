import { HOW_IT_WORKS_STEPS } from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HowItWorksSection() {
  return (
    <SectionShell
      id="como-funciona"
      title="Cómo funciona"
      description="Una mini-consultoría interactiva en tres pasos."
      variant="muted"
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li key={step.step}>
            <Card className="h-full border-border/70 bg-card">
              <CardHeader>
                <p className="text-sm font-semibold text-[#6baed6]">
                  Paso {step.step}
                </p>
                <CardTitle className="text-xl text-primary">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
