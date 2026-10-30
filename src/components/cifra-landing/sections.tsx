import { CheckCircle2, Camera, Mic, PencilLine, ShieldCheck, Sparkles } from "lucide-react";
import { BetaBadge } from "@/components/beta/beta-badge";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { SectionShell } from "@/components/landing/section-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { BreakdownMock, CaptureMock, PaymentsMock, SummaryMock } from "./mocks";
import {
  CIFRA_ACCOUNTS,
  CIFRA_CAPTURE_MODES,
  CIFRA_CAPTURE_RULES,
  CIFRA_CAPTURE_STEPS,
  CIFRA_FAQ,
  CIFRA_PAYMENTS_POINTS,
  CIFRA_PRICING,
  CIFRA_PRIVACY_POINTS,
  CIFRA_PROBLEMS,
  CIFRA_SIGNUP,
  CIFRA_SUMMARY_POINTS,
} from "./content";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm leading-relaxed">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-wide text-[#3d7ea6]">{children}</p>;
}

export function CifraHero() {
  return (
    <section aria-labelledby="cifra-hero" className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="decida-reveal space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6baed6]/40 bg-[#e8f4fa] px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              Con captura inteligente
            </span>
            <BetaBadge>Beta</BetaBadge>
          </div>
          <div className="space-y-5">
            <h1 id="cifra-hero" className="text-balance text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
              Tu dinero y tus pagos, en orden.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cifra junta tus cuentas, deudas, gastos fijos e ingresos en un solo lugar y te dice qué tienes que pagar y cuánto te
              queda. ¿Saliste del súper? Toma una foto del ticket o cuéntalo con tu voz: Cifra lo registra por ti.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCtaButton href={CIFRA_SIGNUP.href} location="cifra_hero">
              {CIFRA_SIGNUP.label}
            </PrimaryCtaButton>
            <CtaLink href="/cifra#captura" location="cifra_hero_capture" variant="outline">
              Ver la captura inteligente
            </CtaLink>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Se usa con un plan de Decida desde ${CIFRA_PRICING.plan.priceMxn} MXN al mes. Registrar a mano no gasta créditos.
          </p>
        </div>
        <div className="decida-reveal decida-reveal-delay mx-auto w-full max-w-md lg:max-w-none">
          <SummaryMock />
        </div>
      </div>
    </section>
  );
}

export function CifraProblem() {
  return (
    <SectionShell
      id="problema"
      title="Llevar tus finanzas no debería ser un segundo trabajo"
      description="La mayoría no falla por falta de ganas, sino porque ordenar el dinero se vuelve tedioso."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {CIFRA_PROBLEMS.map((p) => (
          <li key={p.title} className="rounded-xl border border-border/80 bg-card p-6">
            <h3 className="text-lg font-semibold tracking-tight text-primary">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-medium text-primary">
        Cifra pone todo en un solo lugar y quita la parte más pesada: capturar.
      </p>
    </SectionShell>
  );
}

const MODE_ICONS = [Camera, Mic, PencilLine] as const;

export function CifraCapture() {
  return (
    <SectionShell
      id="captura"
      variant="muted"
      title="Captura inteligente: de la foto del ticket al movimiento registrado"
      description="Sales de la tienda, tomas una foto y Cifra llena el formulario por ti. También puedes contarlo con tu voz, escribirlo o mezclar las tres formas."
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
        <div>
          <Eyebrow>Cómo funciona</Eyebrow>
          <ol className="mt-4 space-y-5">
            {CIFRA_CAPTURE_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <CaptureMock />
      </div>

      <div className="mt-14">
        <Eyebrow>Tres formas, una captura</Eyebrow>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {CIFRA_CAPTURE_MODES.map((m, i) => {
            const Icon = MODE_ICONS[i];
            return (
              <li key={m.title} className="rounded-xl border border-border/80 bg-card p-6">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-primary">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Se pueden combinar: sube la foto del ticket y agrega por voz lo que no sale en él, o captura solo con la voz. Con cualquier
          combinación llegas a un movimiento listo para confirmar.
        </p>
      </div>

      <div className="mt-14 rounded-xl border border-border/80 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" aria-hidden />
          <h3 className="text-lg font-semibold tracking-tight">Reglas claras</h3>
        </div>
        <ul className="mt-5 grid gap-6 md:grid-cols-3">
          {CIFRA_CAPTURE_RULES.map((r) => (
            <li key={r.title}>
              <p className="font-medium text-primary">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-border/70 pt-4 text-sm leading-relaxed text-muted-foreground">
          La inteligencia artificial puede equivocarse, sobre todo con tickets borrosos o con varios totales. Por eso la última palabra
          siempre es tuya: lo revisas antes de guardar.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <PrimaryCtaButton href={CIFRA_SIGNUP.href} location="cifra_capture">
          Probar la captura inteligente
        </PrimaryCtaButton>
      </div>
    </SectionShell>
  );
}

export function CifraAccounts() {
  return (
    <SectionShell
      id="cuentas"
      title="Todo lo que tienes y todo lo que debes, en un solo lugar"
      description="Mis cuentas reúne tus saldos, tus deudas y tus gastos fijos, con las fechas que importan."
    >
      <ul className="grid gap-4 lg:grid-cols-3">
        {CIFRA_ACCOUNTS.map((a) => (
          <li key={a.title} className="flex flex-col rounded-xl border border-border/80 bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{a.lead}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-primary">{a.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {a.items.map((i) => (
                <Check key={i}>{i}</Check>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function CifraPayments() {
  return (
    <SectionShell
      id="pagos"
      variant="muted"
      title="Sabe qué pagar esta semana, no al final del mes"
      description="El reporte «¿Qué tengo que pagar?» ordena tus vencimientos y los compara con lo que tienes en tus cuentas."
    >
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <ul className="space-y-5">
          {CIFRA_PAYMENTS_POINTS.map((p) => (
            <li key={p.title}>
              <h3 className="text-base font-semibold text-primary">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </li>
          ))}
          <li className="rounded-xl border border-border/80 bg-card p-5">
            <h3 className="text-base font-semibold text-primary">«Editar y pagar» en un toque</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Cuando pagas, confirmas el monto y la fecha reales. Cifra registra el egreso, baja el saldo de la deuda y pasa al siguiente
              vencimiento. Nada se genera solo, y si te equivocas, al borrar el pago todo vuelve a como estaba.
            </p>
          </li>
        </ul>
        <PaymentsMock />
      </div>
    </SectionShell>
  );
}

export function CifraSummary() {
  return (
    <SectionShell
      id="resumen"
      title="Cuánto entra, cuánto sale y a dónde se va"
      description="Un resumen del mes y tus movimientos, sin armar tablas."
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <ul className="space-y-3">
            {CIFRA_SUMMARY_POINTS.map((p) => (
              <Check key={p}>{p}</Check>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Registras ingresos y egresos con su categoría, monto, fecha y una nota, a mano o con la captura inteligente. Cada categoría
            tiene su color fijo para que escanees la lista de un vistazo.
          </p>
        </div>
        <BreakdownMock />
      </div>
    </SectionShell>
  );
}

export function CifraPrivacy() {
  return (
    <SectionShell
      id="privacidad-cifra"
      variant="muted"
      title="Tus datos, bajo tu control"
      description="Cifra maneja información sensible. Estas son las reglas con las que está hecha."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {CIFRA_PRIVACY_POINTS.map((p) => (
          <li key={p.title} className="rounded-xl border border-border/80 bg-card p-6">
            <h3 className="text-base font-semibold text-primary">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function CifraPricing() {
  const { plan, captures } = CIFRA_PRICING;
  return (
    <SectionShell
      id="precio"
      title="Incluido en tu plan de Decida"
      description="Cifra y el análisis de ideas comparten el mismo plan y los mismos créditos."
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-primary/30 bg-card p-6 sm:p-8">
        <p className="text-sm font-medium text-muted-foreground">Desde el plan {plan.name}</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
          ${plan.priceMxn} <span className="text-2xl font-medium text-muted-foreground">MXN al mes</span>
        </p>
        <ul className="mt-6 space-y-3">
          <Check>Registro a mano ilimitado: saldos, deudas, gastos fijos, ingresos y egresos, sin gastar créditos.</Check>
          <Check>
            Captura inteligente: {CREDIT_COST_CIFRA_CAPTURE} créditos por captura. Con los {plan.credits} créditos de{" "}
            {plan.name} alcanzan para unas {captures} al mes si no los usas en otros análisis.
          </Check>
          <Check>Si la lectura falla, los créditos se te devuelven.</Check>
          <Check>Cancelas cuando quieras y tus datos se conservan.</Check>
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryCtaButton href={CIFRA_SIGNUP.href} location="cifra_pricing">
            {CIFRA_SIGNUP.label}
          </PrimaryCtaButton>
          <CtaLink href={CREDITS_PLANS_PATH} location="cifra_pricing_plans" variant="outline">
            Ver todos los planes
          </CtaLink>
        </div>
      </div>
    </SectionShell>
  );
}

export function CifraFaq() {
  return (
    <SectionShell id="faq" title="Preguntas frecuentes sobre Cifra" variant="muted">
      <Accordion className="mx-auto max-w-3xl rounded-xl border border-border/70 bg-card px-4 sm:px-6">
        {CIFRA_FAQ.map((item, index) => (
          <AccordionItem key={item.question} value={`cifra-faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium text-primary hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}

export function CifraFinalCta() {
  return (
    <section aria-labelledby="cifra-final" className="bg-primary py-16 text-primary-foreground md:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 id="cifra-final" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Empieza a ver tu dinero con claridad
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Captura lo que tienes y lo que debes, y deja que una foto o tu voz se encarguen del resto.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryCtaButton
            href={CIFRA_SIGNUP.href}
            location="cifra_final_cta"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {CIFRA_SIGNUP.label}
          </PrimaryCtaButton>
        </div>
      </div>
    </section>
  );
}
