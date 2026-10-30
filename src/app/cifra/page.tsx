import { TrackEvent } from "@/components/analytics/track-event";
import {
  CifraAccounts,
  CifraCapture,
  CifraFaq,
  CifraFinalCta,
  CifraHero,
  CifraPayments,
  CifraPricing,
  CifraPrivacy,
  CifraProblem,
  CifraSummary,
} from "@/components/cifra-landing/sections";
import { CIFRA_NAV_LINKS } from "@/components/cifra-landing/content";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cifra: tus cuentas, deudas y pagos en orden, con captura por foto o voz | Decida",
  description:
    "Cifra reúne tus saldos, deudas, gastos fijos, ingresos y egresos, te dice qué pagar y cuánto te queda. Registra un gasto con la foto de un ticket o con tu voz.",
  path: "/cifra",
});

export default function CifraPage() {
  return (
    <>
      <TrackEvent event={ANALYTICS_EVENTS.cifraLandingViewed} />
      <SiteHeader sectionLinks={CIFRA_NAV_LINKS} />
      <main id="contenido-principal">
        <CifraHero />
        <CifraProblem />
        <CifraCapture />
        <CifraAccounts />
        <CifraPayments />
        <CifraSummary />
        <CifraPrivacy />
        <CifraPricing />
        <CifraFaq />
        <CifraFinalCta />
      </main>
      <SiteFooter links={CIFRA_NAV_LINKS} />
    </>
  );
}
