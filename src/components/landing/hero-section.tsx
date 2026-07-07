import { AssessmentPreviewCard } from "@/components/landing/assessment-preview-card";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-x-hidden border-b border-border/60 bg-gradient-to-b from-accent/30 via-background to-background py-16 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="space-y-8">
          <p className="inline-flex items-center rounded-full border border-[#6baed6]/30 bg-accent px-3 py-1 text-xs font-medium text-primary">
            Business Viability Assessment
          </p>
          <div className="space-y-5">
            <h1
              id="hero-heading"
              className="text-balance text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl"
            >
              ¿Vale la pena tu idea de negocio antes de invertir tiempo y
              dinero?
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Obtén un diagnóstico inmediato basado en tu capital, tiempo
              disponible, perfil personal, riesgos, números básicos y
              objetivos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCtaButton href="/analizar">
              Analizar mi idea por $99 MXN
            </PrimaryCtaButton>
            <CtaLink href="/ejemplo" variant="outline">
              Ver ejemplo de reporte
            </CtaLink>
          </div>
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-[#6baed6]"
              aria-hidden
            />
            No necesitas conocimientos financieros. Solo responde algunas
            preguntas y recibe un análisis claro, directo y accionable.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md px-2 py-3 sm:px-3 sm:py-4 lg:max-w-none lg:px-4">
          <AssessmentPreviewCard />
        </div>
      </div>
    </section>
  );
}
