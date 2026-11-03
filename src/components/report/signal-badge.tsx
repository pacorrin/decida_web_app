import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SignalLevel } from "@/lib/example-report-data";
import { SIGNAL_LABELS } from "@/lib/example-report-data";

const signalStyles: Record<SignalLevel, string> = {
  green: "border-transparent bg-[#81c784]/30 text-foreground",
  yellow: "border-transparent bg-[#ffb74d]/30 text-foreground",
  red: "border-transparent bg-[#ff7043]/25 text-foreground",
};

const signalDots: Record<SignalLevel, string> = {
  green: "bg-[#81c784]",
  yellow: "bg-[#ffb74d]",
  red: "bg-[#ff7043]",
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
