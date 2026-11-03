import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pastilla «Potenciado con IA», hermana de la de Beta. */
export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      data-testid="ai-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#6baed6]/40 bg-[#e8f4fa] px-2.5 py-1 text-xs font-medium text-primary",
        className,
      )}
    >
      <Sparkles className="size-3.5" aria-hidden />
      Potenciado con IA
    </span>
  );
}
