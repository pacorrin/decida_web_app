export function ProblemSection() {
  return (
    <section id="problema" aria-labelledby="problema-heading" className="scroll-mt-20 bg-primary py-20 text-white md:py-32">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="problema-heading"
          className="max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          Las ideas no fallan en la cabeza. Fallan al chocar con tu realidad.
        </h2>
        <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl">
          Antes de rentar, comprar equipo o pagar publicidad, conviene saber si tu idea aguanta tu tiempo, tu dinero y el riesgo que sí puedes asumir. No los de un caso ideal.
        </p>
      </div>
    </section>
  );
}
