"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  subscribe,
  type SubscribeState,
} from "@/app/cuenta/(dashboard)/suscripcion/actions";

const initial: SubscribeState = { success: false };

export function SubscribeButton({ label }: { label: string }) {
  const [state, action, pending] = useActionState(subscribe, initial);

  return (
    <form action={action} className="space-y-2">
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        data-testid="subscribe-submit"
      >
        {pending ? "Procesando..." : label}
      </Button>
      {state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
