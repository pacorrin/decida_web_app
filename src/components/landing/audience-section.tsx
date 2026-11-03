import { FOR_YOU_ITEMS, NOT_FOR_YOU_ITEMS } from "@/components/landing/landing-content";

export function AudienceSection() {
  return (
    <section id="para-quien" aria-labelledby="para-quien-heading" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="para-quien-heading" className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-primary sm:text-5xl">
          ¿Es para ti?
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground">
          Decida ayuda a decidir sobre una idea tuya. No inventa el negocio ni garantiza resultados.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-primary p-6 text-white sm:p-8">
            <h3 className="text-2xl font-semibold">Para ti si…</h3>
            <ul className="mt-5 space-y-4">
              {FOR_YOU_ITEMS.map((item) => (
                <li key={item} className="text-base leading-relaxed text-white/90">{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-muted p-6 sm:p-8">
            <h3 className="text-2xl font-semibold text-primary">No es para ti si…</h3>
            <ul className="mt-5 space-y-4">
              {NOT_FOR_YOU_ITEMS.map((item) => (
                <li key={item} className="text-base leading-relaxed text-foreground">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
