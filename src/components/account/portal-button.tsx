"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runActionWithToast } from "@/lib/ui/toast-action";
import { openBillingPortal } from "@/app/cuenta/(dashboard)/suscripcion/actions";

export function PortalButton() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await runActionWithToast(() => openBillingPortal({ success: false }), {
            loading: "Abriendo el portal de pagos…",
            success: "Abriendo el portal de pagos…",
            keepLoadingOnRedirect: true,
          });
        });
      }}
    >
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Abriendo…" : "Administrar método de pago"}
      </Button>
    </form>
  );
}
