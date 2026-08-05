import { HERO_JUDGMENT } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

const toneClass = {
  ok: "bg-[#81c784]/25 text-primary",
  caution: "bg-amber-100 text-amber-950",
  watch: "bg-[#6baed6]/20 text-primary",
} as const;

/**
 * Single static proof artifact for the hero — one sample result, not a carousel.
 */
export function HeroJudgmentCard({ className }: { className?: string }) {
  const j = HERO_JUDGMENT;

  return (
    <aside
      className={cn(
        "rounded-xl border border-border/80 bg-card p-5 sm:p-6",
        className
      )}
      aria-label="Ejemplo de resultado del diagnóstico"
    >
      <p className="text-xs font-medium text-muted-foreground">{j.ideaLabel}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-primary sm:text-xl">
        {j.ideaTitle}
      </h2>
      <p className="mt-3 text-sm font-medium text-primary">{j.recommendation}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {j.constraintNote}
      </p>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Señales de ejemplo">
        {j.signals.map((s) => (
          <li
            key={s.label}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium",
              toneClass[s.tone]
            )}
          >
            {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-border/70 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6baed6]">
          Siguiente paso
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {j.nextStep}
        </p>
      </div>
    </aside>
  );
}
