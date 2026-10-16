"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runActionWithToast } from "@/lib/ui/toast-action";
import { cancelSubscription } from "@/app/cuenta/(dashboard)/perfil/actions";

export function CancelSubscription({ accessUntil }: { accessUntil: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
        Cancelar suscripción
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await runActionWithToast(() => cancelSubscription({ success: false }), {
            loading: "Cancelando tu suscripción…",
            success: accessUntil
              ? `Suscripción cancelada. Conservas el acceso completo hasta el ${accessUntil}.`
              : "Suscripción cancelada. Conservas el acceso hasta el fin de tu periodo.",
          });
        });
      }}
      className="space-y-3 rounded-lg border border-border bg-muted/40 p-4"
    >
      <p className="text-sm font-medium text-foreground">
        ¿Seguro que quieres cancelar?
      </p>
      <p className="text-sm text-muted-foreground">
        No hay reembolso por el periodo ya pagado. Conservas el acceso completo
        {accessUntil ? ` hasta el ${accessUntil}` : " hasta que termine tu periodo"}
        ; después tu cuenta pasa a la vista gratuita.
      </p>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Cancelando…" : "Sí, cancelar suscripción"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Mantener suscripción
        </Button>
      </div>
    </form>
  );
}
