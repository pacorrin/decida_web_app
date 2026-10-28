"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { runActionWithToast } from "@/lib/ui/toast-action";
import { subscribe } from "@/app/cuenta/(dashboard)/suscripcion/actions";
import type { PlanId } from "@/lib/credits/plans";

export function SubscribeButton({
  planId,
  label,
  highlighted = false,
  mode = "subscribe",
}: {
  planId: PlanId;
  label: string;
  highlighted?: boolean;
  /** `reactivate`: la cuenta ya pagó este periodo y no hay cobro. */
  mode?: "subscribe" | "reactivate";
}) {
  const [pending, startTransition] = useTransition();
  const reactivate = mode === "reactivate";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        track(ANALYTICS_EVENTS.subscribeClicked, {
          location: "cuenta_suscripcion",
          plan_id: planId,
        });
        startTransition(async () => {
          const fd = new FormData();
          fd.set("planId", planId);
          await runActionWithToast(() => subscribe({ success: false }, fd), {
            loading: reactivate ? "Reactivando tu plan…" : "Procesando tu suscripción…",
            success: reactivate
              ? "Plan reactivado. No se te cobró ahora."
              : "¡Listo! Tu plan está activo y tus créditos ya están disponibles.",
            keepLoadingOnRedirect: true,
          });
        });
      }}
    >
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        variant={highlighted ? "default" : "outline"}
        className={
          highlighted
            ? "w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            : "w-full"
        }
        data-testid={`subscribe-${planId}`}
      >
        {pending ? "Procesando..." : label}
      </Button>
    </form>
  );
}
