import { ANALYZES_ITEMS } from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import {
  BarChart3,
  Clock,
  Coins,
  HandCoins,
  LineChart,
  Megaphone,
  Scale,
  UserCheck,
} from "lucide-react";

const icons = [
  Coins,
  HandCoins,
  BarChart3,
  Clock,
  UserCheck,
  Scale,
  Megaphone,
  LineChart,
] as const;

export function AnalyzesSection() {
  return (
    <SectionShell
      id="analisis"
      title="¿Qué analiza la herramienta?"
      description="Evaluamos las dimensiones que más impactan tu decisión antes de invertir."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ANALYZES_ITEMS.map((item, index) => {
          const Icon = icons[index];
          return (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[#6baed6]"
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
              <span className="pt-2 text-sm font-medium leading-snug text-foreground">
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
