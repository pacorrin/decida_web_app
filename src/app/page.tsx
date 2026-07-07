import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { AnalyzesSection } from "@/components/landing/analyzes-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ExampleResultSection } from "@/components/landing/example-result-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { AudienceSection } from "@/components/landing/audience-section";
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
        <AnalyzesSection />
        <HowItWorksSection />
        <ExampleResultSection />
        <PricingSection />
        <AudienceSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
