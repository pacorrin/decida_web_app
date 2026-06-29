import { PrimaryCtaButton } from "@/components/landing/cta-link";

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="bg-primary py-16 text-primary-foreground md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          id="final-cta-heading"
          className="text-balance text-2xl font-semibold sm:text-3xl md:text-4xl"
        >
          No inviertas a ciegas
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Analiza tu idea antes de gastar tiempo, dinero o energía en el camino
          equivocado.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryCtaButton
            href="/analizar"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Analizar mi idea por $99 MXN
          </PrimaryCtaButton>
        </div>
      </div>
    </section>
  );
}
