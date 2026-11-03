import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroField } from "@/components/landing/hero-field";

/**
 * Hero del inicio: una idea cruzando seis filtros sobre el verde de la marca; el titular, a gran escala.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-4.75rem)] items-center overflow-hidden bg-primary"
    >
      <HeroField />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="hero-step flex flex-wrap items-center gap-2" style={{ animationDelay: "0ms" }}>
            {["IA", "Beta"].map((label) => (
              <span
                key={label}
                data-testid={label === "IA" ? "ai-badge" : "beta-badge"}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium text-white"
              >
                {label}
              </span>
            ))}
          </div>
          <h1
            id="hero-heading"
            className="text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            {["¿Tu idea vale", "tu tiempo", "y tu dinero?"].map((line, i) => (
              <span key={line} className="hero-step block whitespace-nowrap" style={{ animationDelay: `${120 + i * 120}ms` }}>
                {line}
              </span>
            ))}
          </h1>
          <p style={{ animationDelay: "560ms" }} className="hero-step max-w-[34rem] text-pretty text-lg leading-relaxed text-white/85 sm:text-xl">
            Decida cruza tu idea de negocio con tus límites reales y te dice si conviene probar, validar, ajustar o pausar.
          </p>
          <div className="hero-step space-y-4" style={{ animationDelay: "700ms" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryCtaButton href="/analizar" location="hero">
                Analizar mi idea gratis
              </PrimaryCtaButton>
              <CtaLink
                href="/ejemplo"
                location="hero_example"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Ver ejemplo de reporte
              </CtaLink>
            </div>
            <p className="max-w-md text-base text-white/80">15 a 20 minutos. Primera evaluación gratis, sin tarjeta.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
