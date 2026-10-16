"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { runActionWithToast } from "@/lib/ui/toast-action";
import { subscribe } from "@/app/cuenta/(dashboard)/suscripcion/actions";

export function SubscribeButton({
  label,
  mode = "subscribe",
}: {
  label: string;
  /** `reactivate`: la cuenta ya pagó este periodo y no hay cobro. */
  mode?: "subscribe" | "reactivate";
}) {
  const [pending, startTransition] = useTransition();
  const reactivate = mode === "reactivate";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        track(ANALYTICS_EVENTS.subscribeClicked, { location: "cuenta_suscripcion" });
        startTransition(async () => {
          await runActionWithToast(() => subscribe({ success: false }), {
            loading: reactivate ? "Reactivando tu suscripción…" : "Procesando tu suscripción…",
            success: reactivate
              ? "Suscripción reactivada. No se te cobró ahora."
              : "¡Listo! Tu suscripción está activa.",
            keepLoadingOnRedirect: true,
          });
        });
      }}
    >
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        data-testid="subscribe-submit"
      >
        {pending ? "Procesando..." : label}
      </Button>
    </form>
  );
}
