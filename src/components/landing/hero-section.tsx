import { AiBadge } from "@/components/beta/ai-badge";
import { BetaBadge } from "@/components/beta/beta-badge";
import { BETA_HERO_TEXT } from "@/lib/beta";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroField } from "@/components/landing/hero-field";

/**
 * Hero del inicio: campo verde profundo con ideas (discos planos) que se mueven en un bucle lento.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-4.75rem)] items-center overflow-hidden bg-primary"
    >
      <HeroField />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="decida-reveal max-w-2xl space-y-8 lg:max-w-[46rem]">
          <div className="flex flex-wrap items-center gap-2">
            <AiBadge className="border-white/25 bg-white/10 text-white" />
            <BetaBadge className="border-white/25 bg-white/10 text-white">{BETA_HERO_TEXT}</BetaBadge>
          </div>
          <h1
            id="hero-heading"
            className="text-[clamp(1.85rem,7.4vw,2.75rem)] lg:text-[3rem] xl:text-[3.5rem] min-[1400px]:text-[4.25rem] font-semibold leading-[1.03] tracking-[-0.035em] text-white"
          >
            ¿Tu idea vale tu tiempo y tu dinero?
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl">
            Decida cruza tu idea de negocio con tus límites reales y te dice si conviene probar, validar, ajustar o pausar.
          </p>
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
    </section>
  );
}
