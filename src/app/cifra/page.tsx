import { TrackEvent } from "@/components/analytics/track-event";
import {
  CifraAccounts,
  CifraBoard,
  CifraCapture,
  CifraFaq,
  CifraFinalCta,
  CifraFooter,
  CifraHero,
  CifraPricing,
  CifraPrivacy,
  CifraStatement,
  CifraSummary,
} from "@/components/cifra-landing/sections";
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
      <main id="contenido-principal">
        <CifraHero />
        <CifraStatement />
        <CifraCapture />
        <CifraBoard />
        <CifraAccounts />
        <CifraSummary />
        <CifraPrivacy />
        <CifraPricing />
        <CifraFaq />
        <CifraFinalCta />
      </main>
      <CifraFooter />
    </>
  );
}
