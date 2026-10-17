import { CtaLink } from "@/components/landing/cta-link";
import {
  HERO_JUDGMENT,
  REPORT_INCLUDES,
  REPORT_PLAN_LABELS,
} from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import { CheckCircle2 } from "lucide-react";

export function ExampleResultSection() {
  return (
    <SectionShell
      id="ejemplo"
      title="Así se ve un resultado — no una promesa"
      description="El reporte muestra señales, riesgos y un siguiente paso concreto. Este ejemplo es ilustrativo; el tuyo usa tus respuestas."
      variant="muted"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h3 className="text-base font-semibold text-primary sm:text-lg">
            Qué incluye tu reporte
          </h3>
          <ul className="mt-5 space-y-3">
            {REPORT_INCLUDES.map((item) => (
              <li key={item.text} className="flex items-start gap-2.5 text-sm sm:text-base">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-[#6baed6]"
                  aria-hidden
                />
                <span className="leading-relaxed text-foreground">
                  {item.text}{" "}
                  <span
                    className={
                      item.plan === "paid"
                        ? "ml-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        : "ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    }
                  >
                    {REPORT_PLAN_LABELS[item.plan]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Tu primera evaluación es gratis; el reporte completo y más ideas
            se desbloquean con la suscripción.
          </p>
        </div>

        <article className="rounded-xl border border-border/80 bg-card p-5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">
            Ejemplo ilustrativo
          </p>
          <h3 className="mt-1 text-lg font-semibold text-primary">
            {HERO_JUDGMENT.ideaTitle}
          </h3>
          <p className="mt-3 text-sm font-medium text-primary">
            Recomendación: validar antes de invertir más
          </p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed">
            <div>
              <p className="font-medium text-primary">Fortalezas</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Puede empezar como actividad secundaria.</li>
                <li>No exige local al inicio.</li>
                <li>Permite probar con presupuesto acotado.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-primary">Riesgos</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Canal de adquisición poco definido.</li>
                <li>Depende mucho del tiempo personal.</li>
                <li>Margen real aún sin validar con costos cotizados.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/50 p-4">
              <p className="font-medium text-primary">Siguiente paso</p>
              <p className="mt-2 text-muted-foreground">
                Antes de gastar más de $10,000 MXN: habla con 10 clientes
                potenciales, cotiza insumos y haz 3 servicios piloto.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <CtaLink href="/ejemplo" variant="outline" className="w-full sm:w-auto">
              Ver reporte completo de ejemplo
            </CtaLink>
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
