import { SectionShell } from "@/components/landing/section-shell";

export function ProblemSection() {
  return (
    <SectionShell
      id="problema"
      title="Las ideas no fallan en la cabeza. Fallan al chocar con tu realidad."
      variant="muted"
    >
      <div className="mx-auto max-w-2xl space-y-4 text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        <p>
          Una idea puede sonar bien y romperse cuando la miras con tu tiempo
          disponible, tu dinero, tus clientes posibles y el riesgo que sí puedes
          asumir.
        </p>
        <p>
          Antes de rentar, comprar equipo o pagar publicidad, conviene saber si
          esa idea aguanta{" "}
          <span className="font-medium text-primary">tus</span> condiciones — no
          las de un caso ideal.
        </p>
      </div>
    </SectionShell>
  );
}
