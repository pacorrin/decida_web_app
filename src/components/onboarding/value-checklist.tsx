import { PRICING_INCLUDES } from "@/components/landing/landing-content";
import { CheckCircle2 } from "lucide-react";

export function ValueChecklist() {
  return (
    <ul className="space-y-2.5 rounded-xl border border-border/60 bg-muted/40 p-4">
      {PRICING_INCLUDES.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-secondary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
