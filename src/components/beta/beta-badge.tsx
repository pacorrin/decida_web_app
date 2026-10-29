import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pastilla «Beta»: coral suave, visible pero sin competir con el CTA. */
export function BetaBadge({
  children = "Beta",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      data-testid="beta-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-secondary/50 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-primary",
        className,
      )}
    >
      <FlaskConical className="size-3.5 text-secondary" aria-hidden />
      {children}
    </span>
  );
}
