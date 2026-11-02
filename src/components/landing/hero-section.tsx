import { AiBadge } from "@/components/beta/ai-badge";
import { BetaBadge } from "@/components/beta/beta-badge";
import { BETA_HERO_TEXT } from "@/lib/beta";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroVerdict } from "@/components/landing/hero-verdict";

/**
 * Hero del inicio: un campo verde profundo y, en él, lo único iluminado: las piezas de la propia
 * herramienta (tus límites, lo que pesan, el veredicto) en perspectiva.
 */
export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="px-3 pb-6 pt-3 sm:px-6 md:pb-10">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 overflow-hidden rounded-[2rem] bg-primary px-6 py-12 sm:px-10 md:py-16 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:px-14 lg:py-20">
        <div className="decida-reveal space-y-8">
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

        <HeroVerdict />
      </div>
    </section>
  );
}
