"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/account/plan-card";
import { BackButton } from "@/components/onboarding/step-navigation";
import { savePayment, continueFree, saveAndContinueLater } from "@/app/analizar/actions";
import { PAYMENT_ANCHOR_COPY, PAYMENT_CANCEL_COPY, PAYMENT_FREE_FEATURES } from "@/lib/onboarding/copy";
import { getRemainingMinutes } from "@/lib/onboarding/steps";
import type { ActionState } from "@/lib/onboarding/schemas";
import { PLANS } from "@/lib/credits/plans";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const initialState: ActionState = { success: false };

export function PaymentStep() {
  const [state, action, pending] = useActionState(savePayment, initialState);
  const remaining = getRemainingMinutes("pago");
  // Solo el plan elegido muestra «Procesando…»; los demás quedan quietos.
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <BackButton currentSlug="pago" />

      <p className="text-sm text-muted-foreground">{PAYMENT_ANCHOR_COPY}</p>

      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <form key={plan.id} action={action} className="contents">
            <input type="hidden" name="planId" value={plan.id} />
            <PlanCard
              plan={plan}
              footer={
                <Button
                  type="submit"
                  disabled={pending}
                  size="lg"
                  variant={plan.highlighted ? "default" : "outline"}
                  className={
                    plan.highlighted
                      ? "w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "w-full"
                  }
                  data-testid={`payment-plan-${plan.id}`}
                  onClick={() => {
                    setSelected(plan.id);
                    track(ANALYTICS_EVENTS.subscribeClicked, {
                      location: "onboarding_plan",
                      plan_id: plan.id,
                    });
                  }}
                >
                  {pending && selected === plan.id
                    ? "Procesando..."
                    : `Elegir ${plan.name} — $${plan.priceMxn}/mes`}
                </Button>
              }
            />
          </form>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#6baed6]" aria-hidden />
          {PAYMENT_CANCEL_COPY}
        </p>
        <p className="flex items-center gap-2">
          <CreditCard className="size-4 text-[#6baed6]" aria-hidden />
          Pago seguro con Stripe
        </p>
      </div>

      <div className="rounded-xl border border-border/80 bg-card px-5 py-4">
        <p className="text-sm font-medium text-foreground">¿Prefieres probar primero? Es gratis</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {PAYMENT_FREE_FEATURES.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Te faltan ~{remaining} min de preguntas. La prueba no incluye investigación de mercado;
          desbloqueas el reporte completo con los créditos de un plan.
        </p>
        <form action={continueFree} className="mt-4">
          <Button type="submit" variant="outline" size="lg" className="w-full sm:w-auto" data-testid="payment-free">
            Continuar gratis
          </Button>
        </form>
      </div>

      <form action={saveAndContinueLater}>
        <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
          Guardar y continuar después
        </Button>
      </form>
    </div>
  );
}
