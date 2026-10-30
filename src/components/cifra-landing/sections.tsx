import Link from "next/link";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { BreakdownMock } from "./mocks";
import { PricingSelector } from "./pricing-selector";
import { HeroChart } from "./hero-chart";
import { TicketDemo } from "./ticket-demo";
import {
  CIFRA_ACCOUNTS,
  CIFRA_CAPTURE_RULES,
  CIFRA_FAQ,
  CIFRA_PLAN_ROWS,
  CIFRA_PRIVACY_POINTS,
  CIFRA_SIGNUP,
  CIFRA_SUMMARY_POINTS,
} from "./content";
import { cn } from "@/lib/utils";

const SHELL = "mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12";
const H2 = "text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

/** Barra propia de Cifra: sin bordes, sobre el campo verde del hero. */
export function CifraHero() {
  return (
    <section aria-labelledby="cifra-hero" className="mx-3 mb-3 grid min-h-[calc(100svh-5.5rem)] overflow-hidden rounded-3xl bg-primary text-white sm:mx-6 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-[#0d5a40] px-4 py-10 sm:px-8 lg:col-start-2 lg:row-start-1 lg:justify-end lg:px-12">
        <TicketDemo />
      </div>

      <div className="flex flex-col justify-end gap-6 px-4 pb-12 pt-10 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-12 lg:pb-14">
        <div className="hidden min-h-40 flex-1 items-end pb-6 lg:flex">
          <HeroChart />
        </div>
        <h1 id="cifra-hero" className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          <span className="cifra-line"><span>Tu dinero y tus pagos,</span></span>
          <span className="cifra-line" style={{ "--cifra-delay": "0.11s" } as React.CSSProperties}><span>en orden.</span></span>
        </h1>
        <p className="decida-reveal-delay decida-reveal max-w-md text-lg leading-relaxed text-white/85">
          Foto, voz o texto: Cifra registra el gasto por ti y te dice qué pagar y cuánto te queda.
        </p>
        <div className="decida-reveal decida-reveal-delay flex flex-col gap-3 sm:flex-row sm:items-center">
          <PrimaryCtaButton href={CIFRA_SIGNUP.href} location="cifra_hero">
            {CIFRA_SIGNUP.label}
          </PrimaryCtaButton>
          <Link href="/cifra#captura" className="px-2 text-base font-medium text-white/85 underline-offset-4 hover:text-white hover:underline">
            Ver cómo captura
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CifraStatement() {
  return (
    <section aria-label="Por qué Cifra" className="bg-background py-20 md:py-32">
      <div className={SHELL}>
        <p className="cifra-in max-w-4xl text-pretty text-2xl font-medium leading-snug tracking-tight text-primary sm:text-3xl">
          Las fechas se pasan, no sabes cuánto te queda y anotar cada gasto da flojera. Cifra junta todo en un solo lugar y se
          encarga de lo más pesado: capturar.
        </p>
      </div>
    </section>
  );
}

export function CifraCapture() {
  return (
    <section id="captura" aria-labelledby="captura-heading" className="scroll-mt-8 bg-muted py-20 md:py-32">
      <div className={SHELL}>
        <h2 id="captura-heading" className={cn("cifra-in", H2, "max-w-4xl text-primary")}>
          Una captura, tres formas
        </h2>
        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <ul className="cifra-in space-y-1 text-7xl font-semibold leading-[1.02] tracking-tight text-primary sm:text-8xl lg:col-span-6 lg:text-[8rem]" aria-label="Formas de capturar">
            <li>Foto.</li>
            <li className="text-primary/60">Voz.</li>
            <li className="text-primary/35">Texto.</li>
          </ul>
          <div className="space-y-8 lg:col-span-5 lg:col-start-8">
            <p className="text-lg leading-relaxed text-foreground">
              Mézclalas: sube la foto del ticket y agrega por voz lo que no sale en él. Cifra propone el movimiento con tu catálogo de
              categorías y tú lo confirmas.
            </p>
            <ul className="space-y-4">
              {CIFRA_CAPTURE_RULES.map((r) => (
                <li key={r.title}>
                  <p className="text-base font-semibold text-primary">{r.title}</p>
                  <p className="mt-0.5 text-base leading-relaxed text-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
            <PrimaryCtaButton href={CIFRA_SIGNUP.href} location="cifra_capture">
              Probar la captura inteligente
            </PrimaryCtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const BOARD: { name: string; status: string; tone: string; amount: string; detail: string }[] = [
  { name: "Tarjeta Azul", status: "Vencido", tone: "bg-amber-300 text-amber-950", amount: "$1,850.00", detail: "Vencido hace 1 día. Corte el 20, fecha límite el 9." },
  { name: "Préstamo del auto", status: "En 6 días", tone: "bg-sky-200 text-sky-950", amount: "$3,200.00", detail: "Faltan 14 pagos, estimados con tu vigencia." },
  { name: "Renta", status: "En 8 días", tone: "bg-sky-200 text-sky-950", amount: "$6,500.00", detail: "Gasto fijo recurrente: se proyecta solo cada mes." },
  { name: "Tarjeta Oro", status: "Por confirmar", tone: "bg-white text-primary", amount: "—", detail: "Su monto cambia cada mes: captura el estado de cuenta para confirmarlo." },
  { name: "Internet", status: "En 12 días", tone: "bg-sky-200 text-sky-950", amount: "$599.00", detail: "Gasto fijo recurrente." },
];

export function CifraBoard() {
  return (
    <section id="pagos" aria-labelledby="pagos-heading" className="scroll-mt-8 bg-primary py-20 text-white md:py-32">
      <div className={SHELL}>
        <h2 id="pagos-heading" className={cn("cifra-in", H2, "max-w-4xl")}>
          Qué pagar y cuándo
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
          Lo vencido primero, tus montos que cambian por confirmar y, al pagar, un toque en «Editar y pagar».
        </p>
      </div>
      <div data-ui className="mt-12 space-y-1 px-3 sm:px-4">
        {BOARD.map((row, i) => (
          <details key={row.name} name="cifra-pagos" open={i === 1} className="cifra-in group rounded-lg bg-[#0d5a40] open:bg-background open:text-primary">
            <summary className="flex min-h-[4.25rem] cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:gap-6 sm:px-6 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xl font-medium sm:text-3xl">{row.name}</span>
                <span className="block text-base tabular-nums opacity-80 sm:hidden">{row.amount}</span>
              </span>
              <span className="hidden text-xl tabular-nums sm:block sm:text-3xl">{row.amount}</span>
              <span className={cn("shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold sm:text-base", row.tone)}>{row.status}</span>
            </summary>
            <div className="rounded-b-lg bg-background px-4 pb-5 pt-1 text-primary sm:px-6">
              <p className="max-w-xl text-base leading-relaxed">{row.detail}</p>
              <p className="mt-2 max-w-xl text-base leading-relaxed">
                Al pagar confirmas monto y fecha reales: Cifra registra el egreso, baja la deuda y pasa al siguiente vencimiento.
              </p>
            </div>
          </details>
        ))}
      </div>
      <div className={cn(SHELL, "mt-12 grid gap-6 sm:grid-cols-3")}>
        {[
          ["Por pagar", "$12,149.00"],
          ["En tus cuentas", "$14,300.00"],
          ["Te sobra", "$2,151.00"],
        ].map(([k, v]) => (
          <div key={k} className="cifra-in">
            <p className="text-4xl font-semibold tabular-nums sm:text-5xl">{v}</p>
            <p className="mt-1 text-base text-white/85">{k}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-6 w-full max-w-7xl px-4 text-[13px] text-white/70 sm:px-8 lg:px-12">Ejemplo ilustrativo</p>
    </section>
  );
}

export function CifraAccounts() {
  return (
    <section id="cuentas" aria-labelledby="cuentas-heading" className="scroll-mt-8 bg-background py-20 md:py-32">
      <div className={cn(SHELL, "grid gap-12 lg:grid-cols-12 lg:gap-8")}>
        <h2 id="cuentas-heading" className={cn("cifra-in", H2, "text-primary lg:sticky lg:top-12 lg:col-span-5 lg:self-start")}>
          Lo que tienes y lo que debes
        </h2>
        <ul className="space-y-10 lg:col-span-6 lg:col-start-7">
          {CIFRA_ACCOUNTS.map((a) => (
            <li key={a.title} className="cifra-in">
              <p className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">{a.title}</p>
              <p className="mt-2 max-w-md text-lg leading-relaxed text-foreground">{a.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CifraSummary() {
  return (
    <section id="resumen" aria-labelledby="resumen-heading" className="scroll-mt-8 bg-accent py-20 md:py-32">
      <div className={cn(SHELL, "grid items-center gap-12 lg:grid-cols-12 lg:gap-8")}>
        <div data-ui className="lg:col-span-6">
          <BreakdownMock />
        </div>
        <div className="space-y-6 lg:col-span-5 lg:col-start-8">
          <h2 id="resumen-heading" className={cn("cifra-in", H2, "text-primary")}>
            A dónde se va tu dinero
          </h2>
          <ul className="space-y-2 text-lg leading-relaxed text-foreground">
            {CIFRA_SUMMARY_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CifraPrivacy() {
  return (
    <section aria-labelledby="privacidad-heading" className="bg-background py-20 md:py-32">
      <div className={SHELL}>
        <h2 id="privacidad-heading" className={cn("cifra-in", H2, "max-w-4xl text-primary")}>
          Tus datos, bajo tu control
        </h2>
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {CIFRA_PRIVACY_POINTS.map((p) => (
            <li key={p.title} className="cifra-in">
              <p className="text-lg font-semibold text-primary">{p.title}</p>
              <p className="mt-1 text-base leading-relaxed text-foreground">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CifraPricing() {
  return (
    <section id="precio" aria-labelledby="precio-heading" className="scroll-mt-8 bg-muted py-20 md:py-32">
      <div className={SHELL}>
        <h2 id="precio-heading" className={cn("cifra-in", H2, "max-w-4xl text-primary")}>
          Incluido en tu plan de Decida
        </h2>
        <div className="mt-12">
          <PricingSelector rows={CIFRA_PLAN_ROWS} captureCost={CREDIT_COST_CIFRA_CAPTURE} />
        </div>
        <p className="mt-10">
          <Link href={CREDITS_PLANS_PATH} className="text-base font-medium text-primary underline-offset-4 hover:underline">
            Ver el detalle de los planes
          </Link>
        </p>
      </div>
    </section>
  );
}

export function CifraFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-8 bg-background py-20 md:py-32">
      <div className={cn(SHELL, "grid gap-10 lg:grid-cols-12 lg:gap-8")}>
        <h2 id="faq-heading" className={cn("cifra-in", H2, "text-primary lg:sticky lg:top-12 lg:col-span-4 lg:self-start")}>
          Preguntas
        </h2>
        <div className="space-y-2 lg:col-span-8">
          {CIFRA_FAQ.map((item) => (
            <details key={item.question} name="cifra-faq" className="cifra-in group rounded-lg bg-muted open:bg-primary open:text-white">
              <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6 sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="relative size-4 shrink-0" aria-hidden>
                  <span className="absolute left-0 top-1/2 h-[3px] w-4 -translate-y-1/2 bg-current" />
                  <span className="absolute left-0 top-1/2 h-[3px] w-4 -translate-y-1/2 rotate-90 bg-current transition-transform group-open:rotate-0" />
                </span>
              </summary>
              <p className="max-w-[52ch] px-5 pb-6 text-base leading-relaxed text-white/90 sm:px-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CifraFinalCta() {
  return (
    <section aria-labelledby="cifra-final" className="overflow-hidden bg-background pb-20 md:pb-28">
      <div className="flex gap-2 px-2 sm:gap-3 sm:px-3">
        <div className="hidden w-24 shrink-0 rounded-xl bg-primary sm:block lg:w-[12%]" aria-hidden />
        <div className="min-w-0 flex-1 rounded-xl bg-secondary p-8 text-white sm:p-12 lg:min-h-[22rem] lg:p-14">
          <h2 id="cifra-final" className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Tu dinero, con claridad
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/95">Captura lo que tienes y lo que debes. Lo demás lo hace una foto o tu voz.</p>
          <div className="mt-8">
            <CtaLink href={CIFRA_SIGNUP.href} location="cifra_final_cta" variant="outline" className="border-transparent bg-white text-primary hover:bg-white/90">
              {CIFRA_SIGNUP.label}
            </CtaLink>
          </div>
        </div>
        <div className="hidden w-24 shrink-0 rounded-xl bg-accent sm:block lg:w-[12%]" aria-hidden />
      </div>
    </section>
  );
}
