import { PrimaryCtaButton } from "@/components/landing/cta-link";

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="bg-primary py-16 text-primary-foreground md:py-20"
    >
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2
          id="final-cta-heading"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
        >
          Evalúa tu idea bajo tus condiciones
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Entre 15 y 20 minutos para saber si conviene probar, validar,
          ajustar o pausar — antes de invertir más tiempo o dinero.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryCtaButton
            href="/analizar" location="final_cta"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Analizar mi idea gratis
          </PrimaryCtaButton>
        </div>
      </div>
    </section>
  );
}
