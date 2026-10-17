import {
  PRICING_FREE_INCLUDES,
  PRICING_PAID_INCLUDES,
} from "@/components/landing/landing-content";
import { CtaLink } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import { isStripeEnabled, isStripeTestMode } from "@/lib/stripe/config";
import { CheckCircle2 } from "lucide-react";

function IncludeList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-secondary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * El aviso de pago depende de cómo corre la app: sin Stripe el pago es
 * simulado; con claves de prueba no hay cargos reales; con claves reales no
 * se menciona (decir «simulado» o «sin cargo» sería falso).
 */
function paymentNote(): string {
  const cancel =
    "Cancela cuando quieras: conservas el acceso hasta el fin del periodo pagado.";
  if (!isStripeEnabled()) {
    return `${cancel} En esta beta el pago es simulado y no se hace ningún cargo.`;
  }
  if (isStripeTestMode()) {
    return `${cancel} Estamos en modo de prueba: no se hace ningún cargo real.`;
  }
  return `${cancel} Pago seguro con Stripe.`;
}

export function PricingSection() {
  return (
    <SectionShell
      id="precio"
      title="Empieza gratis, suscríbete cuando lo necesites"
      description="Evalúa tu primera idea sin costo y sin tarjeta. Si quieres el reporte completo y más ideas, te suscribes — no es un curso ni asesoría personalizada."
      variant="muted"
    >
      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-border/80 bg-card px-6 py-8 sm:px-8">
          <p className="text-sm font-medium text-muted-foreground">Gratis</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
            $0
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu primera evaluación
          </p>
          <IncludeList items={PRICING_FREE_INCLUDES} />
          <div className="mt-auto flex justify-center pt-8">
            <CtaLink href="/analizar" variant="primary">
              Analizar mi idea gratis
            </CtaLink>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-primary/30 bg-card px-6 py-8 shadow-lg shadow-primary/5 sm:px-8">
          <p className="text-sm font-medium text-muted-foreground">
            Suscripción
          </p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
            $99{" "}
            <span className="text-2xl font-medium text-muted-foreground">
              MXN / mes
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reporte completo, sin límite de ideas
          </p>
          <IncludeList items={PRICING_PAID_INCLUDES} />
          <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
            Te suscribes desde tu cuenta cuando quieras desbloquear el
            reporte completo.
          </p>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
        {paymentNote()}
      </p>
    </SectionShell>
  );
}
