/*
  THESIS: Constraint Mirror — the landing persuades by reflecting the visitor's
  real limits (time, money, risk) as the diagnostic lens; refuses feature-grid
  theater and motivational coach tone.
  OWN-WORLD: Diagnóstico en Papel Blanco — Verde Confianza ink, Coral Acción CTA,
  Azul Guía signals, flat borders/tints, Geist, no decorative shadows.
  STORY: Believe Decida judges your idea against your constraints → start /analizar
  (or inspect /ejemplo first).
  FIRST VIEWPORT: Brand Decida + one decision H1 + constraint subtitle + coral CTA
  + quiet ejemplo link; single static judgment proof on the side (no carousel).
  FORM: Constraint Mirror (surface seed assigned #3); staging = two-column hero
  with one proof artifact; seed key 6a4b1700 (degraded roll).
*/
import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { MechanismSection } from "@/components/landing/mechanism-section";
import { ExampleResultSection } from "@/components/landing/example-result-section";
import { AudienceSection } from "@/components/landing/audience-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido-principal">
        <HeroSection />
        <ProblemSection />
        <MechanismSection />
        <ExampleResultSection />
        <AudienceSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
