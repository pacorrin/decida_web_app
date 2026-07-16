import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ResultReport } from "@/components/onboarding/result-report";
import { enforceStepAccess } from "@/lib/onboarding/guard";
import { AutoRefresh } from "@/components/onboarding/auto-refresh";
import {
  ONBOARDING_STEPS,
  PHASE_ORDER,
  getStepBySlug,
  getStepProgress,
} from "@/lib/onboarding/steps";
import { STEP_COPY } from "@/lib/onboarding/copy";

const PHASE_LABELS = {
  gratis: "Gratis",
  pago: "Compromiso",
  diagnostico: "Diagnóstico",
} as const;

export default async function ResultadoPage() {
  const assessment = await enforceStepAccess("resultado");
  if (!assessment) return null;

  const shouldAutoRefresh = 
    assessment.asmt_status === "in_progress" && 
    !assessment.assessment_report;

  const step = getStepBySlug("resultado");
  const copy = STEP_COPY["resultado"];
  const progress = getStepProgress("resultado");

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 via-background to-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Decida
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/mis-evaluaciones"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              data-testid="resultado-mis-evaluaciones"
            >
              Mis evaluaciones
            </Link>
            <span className="text-xs text-muted-foreground">
              Paso {step.order} de {ONBOARDING_STEPS.length}
            </span>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6 lg:px-8">
          <div className="mb-2 flex gap-2">
            {PHASE_ORDER.map((phase) => (
              <span
                key={phase}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  step.phase === phase
                    ? "bg-primary text-primary-foreground"
                    : ONBOARDING_STEPS.find((s) => s.slug === "resultado")!
                        .order >
                      ONBOARDING_STEPS.find((s) => s.phase === phase)!.order
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {copy.subtitle}
          </p>
          {copy.reassurance && (
            <p className="text-sm text-[#6baed6]">{copy.reassurance}</p>
          )}
        </div>
        {shouldAutoRefresh && <AutoRefresh />}
        <ResultReport assessment={assessment} />
      </main>
    </div>
  );
}
