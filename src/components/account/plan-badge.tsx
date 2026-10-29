import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { getPlan, PLANS, type PlanId } from "@/lib/credits/plans";
import { hasFullAccess } from "@/lib/subscription/access";
import { cn } from "@/lib/utils";

export type PlanBadgeTier = "free" | PlanId;

export type PlanBadgeState = {
  tier: PlanBadgeTier;
  label: string;
  /** Nota corta junto al nombre (cancelado, cobro pendiente). */
  note: string | null;
  /** Nivel de énfasis visual 0 (gratis) a 3 (el plan más caro). */
  emphasis: 0 | 1 | 2 | 3;
};

type PlanBadgeUser = {
  user_subscription_status: string;
  user_subscription_plan: string | null;
  user_subscription_period_end: Date | null;
};

/**
 * Qué mostrar según la cuenta. Pura. Un plan vencido o inexistente cuenta como
 * gratis; el énfasis sube con el precio del plan.
 */
export function describePlanBadge(user: PlanBadgeUser, now: Date = new Date()): PlanBadgeState {
  const plan = getPlan(user.user_subscription_plan);
  const status = user.user_subscription_status;

  if (status === "past_due" && plan) {
    return { tier: plan.id, label: plan.name, note: "cobro pendiente", emphasis: emphasisOf(plan.id) };
  }
  const active = hasFullAccess(
    {
      user_subscription_status: user.user_subscription_status as never,
      user_subscription_period_end: user.user_subscription_period_end,
    },
    now,
  );
  if (!active || !plan) {
    return { tier: "free", label: "Gratis", note: null, emphasis: 0 };
  }
  return {
    tier: plan.id,
    label: plan.name,
    note: status === "canceled" ? "cancelado" : null,
    emphasis: emphasisOf(plan.id),
  };
}

function emphasisOf(id: PlanId): 1 | 2 | 3 {
  const index = PLANS.findIndex((p) => p.id === id);
  return (Math.min(Math.max(index, 0), 2) + 1) as 1 | 2 | 3;
}

const STYLES: Record<PlanBadgeTier, string> = {
  // Gratis: discreto, solo contorno.
  free: "border-border bg-transparent text-muted-foreground",
  // Explora: tinte suave del verde de marca.
  explora: "border-border bg-muted text-primary",
  // Valida: azul guía, más presente.
  valida: "border-[#6baed6] bg-[#e8f4fa] text-primary shadow-[0_0_0_1px_rgba(107,174,214,0.35)]",
  // Escala: verde de marca sólido, el más resaltado.
  escala: "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25",
};

export function PlanBadge({ user }: { user: PlanBadgeUser }) {
  const state = describePlanBadge(user);
  const Icon = state.tier === "escala" ? Crown : state.tier === "valida" ? Sparkles : null;
  const title =
    state.tier === "free"
      ? "Plan gratuito: ver planes"
      : `Plan ${state.label}${state.note ? ` (${state.note})` : ""}: ver detalles`;

  return (
    <Link
      href="/cuenta/suscripcion"
      title={title}
      data-testid="plan-badge"
      data-tier={state.tier}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs outline-none transition-colors hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50",
        state.emphasis >= 2 ? "font-semibold" : "font-medium",
        STYLES[state.tier],
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      <span>{state.label}</span>
      {state.note && <span className="font-normal opacity-80">· {state.note}</span>}
    </Link>
  );
}
