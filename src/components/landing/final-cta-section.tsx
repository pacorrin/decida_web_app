import { PrimaryCtaButton } from "@/components/landing/cta-link";

export function FinalCtaSection() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-background px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl bg-[#e8f4fa] p-8 sm:p-14 lg:grid-cols-12 lg:items-end">
        <h2 id="final-cta-heading" className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-primary sm:text-6xl lg:col-span-8">
          Evalúa tu idea bajo tus condiciones
        </h2>
        <div className="space-y-5 lg:col-span-4">
          <p className="text-lg leading-relaxed text-foreground">
            15 a 20 minutos para saber si conviene probar, validar, ajustar o pausar.
          </p>
          <PrimaryCtaButton href="/analizar" location="final_cta">
            Analizar mi idea gratis
          </PrimaryCtaButton>
        </div>
      </div>
    </section>
  );
}
