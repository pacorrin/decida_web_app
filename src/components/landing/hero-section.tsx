import { AiBadge } from "@/components/beta/ai-badge";
import { BetaBadge } from "@/components/beta/beta-badge";
import { BETA_HERO_TEXT } from "@/lib/beta";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { HeroVerdict } from "@/components/landing/hero-verdict";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="bg-background py-12 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="decida-reveal space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            <AiBadge />
            <BetaBadge>{BETA_HERO_TEXT}</BetaBadge>
          </div>
          <h1
            id="hero-heading"
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-6xl"
          >
            ¿Tu idea vale tu tiempo y tu dinero?
          </h1>
          <p className="max-w-lg text-pretty text-lg leading-relaxed text-foreground">
            Decida cruza tu idea de negocio con tus límites reales y te dice si conviene probar, validar, ajustar o pausar.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCtaButton href="/analizar" location="hero">
              Analizar mi idea gratis
            </PrimaryCtaButton>
            <CtaLink href="/ejemplo" location="hero_example" variant="outline">
              Ver ejemplo de reporte
            </CtaLink>
          </div>
          <p className="max-w-md text-base text-muted-foreground">
            15 a 20 minutos. Primera evaluación gratis, sin tarjeta.
          </p>
        </div>

        <div className="decida-reveal decida-reveal-delay mx-auto w-full max-w-xl lg:max-w-none">
          <HeroVerdict />
        </div>
      </div>
    </section>
  );
}
