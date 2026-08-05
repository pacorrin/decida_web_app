import {
  CONSTRAINT_LENSES,
  MECHANISM_STEPS,
} from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";

export function MechanismSection() {
  return (
    <SectionShell
      id="mecanismo"
      title="Cómo llega Decida a un resultado"
      description="No te propone un negocio. Cruza tu idea con las restricciones que ya tienes y te dice qué implica avanzar."
    >
      <ol className="mx-auto mb-14 grid max-w-4xl gap-8 md:grid-cols-3 md:gap-6">
        {MECHANISM_STEPS.map((step) => (
          <li key={step.step} className="text-center md:text-left">
            <p className="text-sm font-medium text-[#6baed6]">
              {step.step}. {step.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      <div className="mx-auto max-w-4xl">
        <h3 className="mb-6 text-center text-base font-semibold text-primary sm:text-lg">
          Dimensiones que cruzamos con tu situación
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONSTRAINT_LENSES.map((item) => (
            <li
              key={item.label}
              className="rounded-xl border border-border/80 bg-card px-4 py-3"
            >
              <p className="text-sm font-medium text-primary">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
