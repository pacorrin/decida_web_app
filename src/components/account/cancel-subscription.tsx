"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cancelSubscription,
  type CancelSubscriptionState,
} from "@/app/cuenta/(dashboard)/perfil/actions";

const initial: CancelSubscriptionState = { success: false };

export function CancelSubscription({ accessUntil }: { accessUntil: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(cancelSubscription, initial);

  if (!confirming) {
    return (
      <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
        Cancelar suscripción
      </Button>
    );
  }

  return (
    <form
      action={action}
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
      {state.message && !state.success && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
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
