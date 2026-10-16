"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CheckoutReturn } from "@/lib/subscription/checkout-return";

/** Reintenta la lectura mientras el pago aún no se refleja (webhook tardío). */
function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 10) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}

const TOASTS = {
  activated: () => toast.success("¡Pago recibido! Tu suscripción está activa."),
  cancelled: () =>
    toast.info("Cancelaste el pago; no se hizo ningún cargo. Puedes intentarlo de nuevo cuando quieras."),
  invalid: () =>
    toast.warning(
      "No pudimos verificar ese pago. Si se te cobró, tu suscripción se activará sola en unos minutos.",
    ),
} as const;

/**
 * Avisa con un toast el resultado del regreso de Stripe Checkout y limpia
 * `?checkout=…&session_id=…` de la URL: si se quedaran, cualquier recarga o
 * acción posterior (como cancelar) volvería a interpretar el regreso y
 * repetiría el aviso.
 */
function ReturnToast({ state }: { state: keyof typeof TOASTS }) {
  const pathname = usePathname();
  useEffect(() => {
    TOASTS[state]();
    window.history.replaceState(null, "", pathname);
  }, [state, pathname]);
  return null;
}

export function CheckoutNotice({ state }: { state: CheckoutReturn }) {
  if (state === "pending") {
    return (
      <div
        role="status"
        data-testid="checkout-pending"
        className="rounded-xl border border-[#6baed6]/30 bg-accent/50 px-4 py-3 text-sm text-foreground"
      >
        <AutoRefresh />
        Pago recibido, activando tu suscripción… Esto toma unos segundos; esta
        página se actualiza sola.
      </div>
    );
  }
  if (state === "activated" || state === "cancelled" || state === "invalid") {
    return <ReturnToast state={state} />;
  }
  return null;
}
