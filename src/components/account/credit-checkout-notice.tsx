"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CreditCheckoutReturn } from "@/lib/credits/checkout-return";

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
  credited: () => toast.success("¡Pago recibido! Tus créditos ya están en tu cuenta."),
  cancelled: () =>
    toast.info(
      "Cancelaste el pago; no se hizo ningún cargo. Puedes intentarlo de nuevo cuando quieras.",
    ),
  invalid: () =>
    toast.warning(
      "No pudimos verificar ese pago. Si se te cobró, tus créditos se acreditarán solos en unos minutos.",
    ),
} as const;

function ReturnToast({ state }: { state: keyof typeof TOASTS }) {
  const pathname = usePathname();
  useEffect(() => {
    TOASTS[state]();
    window.history.replaceState(null, "", pathname);
  }, [state, pathname]);
  return null;
}

export function CreditCheckoutNotice({ state }: { state: CreditCheckoutReturn }) {
  if (state === "pending") {
    return (
      <div
        role="status"
        data-testid="credits-checkout-pending"
        className="rounded-xl border border-[#6baed6]/30 bg-accent/50 px-4 py-3 text-sm text-foreground"
      >
        <AutoRefresh />
        Pago recibido, acreditando tus créditos… Esto toma unos segundos; esta
        página se actualiza sola.
      </div>
    );
  }
  if (state === "credited" || state === "cancelled" || state === "invalid") {
    return <ReturnToast state={state} />;
  }
  return null;
}
