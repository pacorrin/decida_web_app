import { CONSTRAINT_LENSES, MECHANISM_STEPS } from "@/components/landing/landing-content";

export function MechanismSection() {
  return (
    <section id="mecanismo" aria-labelledby="mecanismo-heading" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="mecanismo-heading" className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-primary sm:text-5xl">
          Cómo llega Decida a un resultado
        </h2>

        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {MECHANISM_STEPS.map((step) => (
            <li key={step.step}>
              <p className="text-8xl font-semibold leading-none tracking-tight text-secondary" aria-hidden>
                {step.step}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-primary">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-foreground">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-primary">Lo que cruzamos con tu situación</h3>
            <p
              data-testid="ai-mechanism-note"
              className="mt-4 max-w-md text-base leading-relaxed text-foreground"
            >
              Potenciado con IA, con reglas claras: los puntajes y los cálculos salen de reglas fijas aplicadas a tus respuestas. La IA interpreta tu idea, investiga tu mercado en fuentes que puedes consultar y redacta el reporte.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CONSTRAINT_LENSES.map((item) => (
              <li key={item.label} className="rounded-xl bg-[#e8f4fa] px-5 py-4">
                <p className="text-lg font-semibold text-primary">{item.label}</p>
                <p className="mt-1 text-base text-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
