import { CtaLink } from "@/components/landing/cta-link";
import { HERO_JUDGMENT, REPORT_INCLUDES, REPORT_PLAN_LABELS } from "@/components/landing/landing-content";

export function ExampleResultSection() {
  return (
    <section id="ejemplo" aria-labelledby="ejemplo-heading" className="scroll-mt-20 bg-muted/60 py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="lg:col-span-5">
          <h2 id="ejemplo-heading" className="text-balance text-3xl font-semibold tracking-tight text-primary sm:text-5xl">
            Así se ve un resultado, no una promesa
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground">
            Señales, riesgos y un siguiente paso concreto. El tuyo usa tus respuestas.
          </p>
          <ul className="mt-8 space-y-3">
            {REPORT_INCLUDES.map((item) => (
              <li key={item.text} className="flex flex-wrap items-baseline justify-between gap-x-4 text-base text-foreground">
                <span>{item.text}</span>
                <span className={item.plan === "paid" ? "font-medium text-[#b8431f]" : "font-medium text-primary"}>
                  {REPORT_PLAN_LABELS[item.plan]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <article data-ui className="rounded-2xl bg-white p-6 sm:p-8 lg:col-span-7">
          <p className="text-base text-muted-foreground">Ejemplo ilustrativo</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-primary">{HERO_JUDGMENT.ideaTitle}</h3>
          <p className="mt-3 text-xl font-semibold text-primary">Validar antes de invertir más</p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-lg font-semibold text-primary">Fortalezas</p>
              <ul className="mt-2 space-y-2 text-base text-foreground">
                <li>Puede empezar como actividad secundaria.</li>
                <li>No exige local al inicio.</li>
                <li>Permite probar con presupuesto acotado.</li>
              </ul>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">Riesgos</p>
              <ul className="mt-2 space-y-2 text-base text-foreground">
                <li>Canal de adquisición poco definido.</li>
                <li>Depende mucho del tiempo personal.</li>
                <li>Margen real aún sin validar con costos cotizados.</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 rounded-xl bg-[#e8f4fa] p-5">
            <p className="text-lg font-semibold text-primary">Siguiente paso</p>
            <p className="mt-1 text-base leading-relaxed text-foreground">
              Antes de gastar más de $10,000 MXN: habla con 10 clientes potenciales, cotiza insumos y haz 3 servicios piloto.
            </p>
          </div>
          <div className="mt-6">
            <CtaLink href="/ejemplo" location="example_section" variant="outline">
              Ver reporte completo de ejemplo
            </CtaLink>
          </div>
        </article>
      </div>
    </section>
  );
}
