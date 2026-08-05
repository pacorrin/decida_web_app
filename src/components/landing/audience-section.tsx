import {
  FOR_YOU_ITEMS,
  NOT_FOR_YOU_ITEMS,
} from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import { CheckCircle2, XCircle } from "lucide-react";

export function AudienceSection() {
  return (
    <SectionShell
      id="para-quien"
      title="¿Es para ti?"
      description="Límites claros: Decida ayuda a decidir sobre una idea tuya, no a inventar el negocio ni a garantizar resultados."
    >
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h3 className="text-base font-semibold text-primary">Para ti si…</h3>
          <ul className="mt-4 space-y-3">
            {FOR_YOU_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="leading-relaxed text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-primary">No es para ti si…</h3>
          <ul className="mt-4 space-y-3">
            {NOT_FOR_YOU_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base">
                <XCircle
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
