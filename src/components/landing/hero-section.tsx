import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroJudgmentCard } from "@/components/landing/hero-judgment-card";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-border/60 bg-background py-16 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="decida-reveal space-y-8">
          <p className="text-sm font-semibold tracking-tight text-primary">
            Decida
          </p>
          <div className="space-y-5">
            <h1
              id="hero-heading"
              className="text-balance text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl"
            >
              ¿Tu idea vale el tiempo y el dinero que le vas a poner?
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Decida evalúa tu idea de negocio contra tus condiciones reales:
              tiempo, presupuesto, perfil, mercado y riesgo — y te deja con una
              recomendación clara: probar a pequeña escala, validar primero,
              ajustar o pausar.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCtaButton href="/analizar">
              Analizar mi idea gratis
            </PrimaryCtaButton>
            <CtaLink href="/ejemplo" variant="outline">
              Ver ejemplo de reporte
            </CtaLink>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            15 a 20 minutos. Tu primera evaluación es gratis y tu idea es
            privada. Usas estimaciones: no necesitas ser experto en finanzas.
          </p>
        </div>

        <div className="decida-reveal decida-reveal-delay mx-auto w-full max-w-md lg:max-w-none">
          <HeroJudgmentCard />
        </div>
      </div>
    </section>
  );
}
