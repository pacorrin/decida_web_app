import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroField } from "@/components/landing/hero-field";

/**
 * Hero del inicio, con la distribución del de Cifra: tarjeta en dos columnas, marca y badges arriba a la
 * izquierda, titular y CTAs abajo, y un panel claro a la derecha con fragmentos de reporte. Sin verde de fondo.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-3 mb-3 grid min-h-[calc(100svh-5.5rem)] overflow-hidden rounded-3xl border border-border bg-background sm:mx-6 lg:grid-cols-2"
    >
      <div className="flex flex-col justify-between gap-10 px-4 pb-12 pt-10 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-12 lg:pb-14">
        <div className="hero-step flex flex-wrap items-center gap-3" style={{ animationDelay: "0ms" }}>
          <p className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">Decida</p>
          {["IA", "Beta"].map((label) => (
            <span
              key={label}
              data-testid={label === "IA" ? "ai-badge" : "beta-badge"}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="space-y-6">
          <h1
            id="hero-heading"
            className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-primary sm:text-6xl xl:text-7xl"
          >
            {["¿Tu idea vale", "tu tiempo", "y tu dinero?"].map((line, i) => (
              <span key={line} className="hero-step block whitespace-nowrap" style={{ animationDelay: `${120 + i * 120}ms` }}>
                {line}
              </span>
            ))}
          </h1>
          <p style={{ animationDelay: "560ms" }} className="hero-step max-w-[34rem] text-pretty text-lg leading-relaxed text-foreground/80 sm:text-xl">
            Decida cruza tu idea de negocio con tus límites reales y te dice si conviene probar, validar, ajustar o pausar.
          </p>
          <div className="hero-step space-y-4" style={{ animationDelay: "700ms" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <PrimaryCtaButton href="/analizar" location="hero">
                Analizar mi idea gratis
              </PrimaryCtaButton>
              <CtaLink
                href="/ejemplo"
                location="hero_example"
                variant="outline"
                className="border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:text-primary"
              >
                Ver ejemplo de reporte
              </CtaLink>
            </div>
            <p className="max-w-md text-base text-muted-foreground">15 a 20 minutos. Primera evaluación gratis, sin tarjeta.</p>
          </div>
        </div>
      </div>

      <div className="relative min-h-72 bg-muted max-lg:order-first lg:col-start-2 lg:row-start-1">
        <HeroField />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-40 bg-gradient-to-r from-background to-transparent lg:block" />
      </div>
    </section>
  );
}
