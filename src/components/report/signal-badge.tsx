import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SignalLevel } from "@/lib/example-report-data";
import { SIGNAL_LABELS } from "@/lib/example-report-data";

const signalStyles: Record<SignalLevel, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  yellow: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
};

const signalDots: Record<SignalLevel, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

type SignalBadgeProps = {
  signal: SignalLevel;
  className?: string;
};

export function SignalBadge({ signal, className }: SignalBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", signalStyles[signal], className)}
    >
      <span
        className={cn("mr-1.5 size-2 rounded-full", signalDots[signal])}
        aria-hidden
      />
      {SIGNAL_LABELS[signal]}
    </Badge>
  );
}

type SignalIconProps = {
  signal: SignalLevel;
  className?: string;
};

export function SignalDot({ signal, className }: SignalIconProps) {
  return (
    <span
      className={cn("inline-block size-3 shrink-0 rounded-full", signalDots[signal], className)}
      aria-hidden
    />
  );
}

export function formatCurrency(amount: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
