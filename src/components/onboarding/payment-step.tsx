"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ValueChecklist } from "@/components/onboarding/value-checklist";
import { savePayment, saveAndContinueLater } from "@/app/analizar/actions";
import {
  PAYMENT_ANCHOR_COPY,
  PAYMENT_GUARANTEE_COPY,
} from "@/lib/onboarding/copy";
import { PAYMENT_PLANS } from "@/lib/onboarding/options";
import { getRemainingMinutes } from "@/lib/onboarding/steps";
import type { ActionState } from "@/lib/onboarding/schemas";
import { ShieldCheck, CreditCard } from "lucide-react";

const initialState: ActionState = { success: false };

export function PaymentStep() {
  const [state, action, pending] = useActionState(savePayment, initialState);
  const remaining = getRemainingMinutes("pago");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#6baed6]/30 bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-primary">Modo beta</span> — pago
        simulado. Tu progreso está guardado.
      </div>

      <ValueChecklist />

      <p className="text-sm text-muted-foreground">{PAYMENT_ANCHOR_COPY}</p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="planId" value="starter" />

        <Card className="border-primary/30 shadow-lg shadow-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Starter</CardTitle>
              <Badge variant="secondary">Recomendado</Badge>
            </div>
            <CardDescription>Diagnóstico inmediato y reporte completo</CardDescription>
            <p className="pt-2 text-4xl font-semibold text-primary">
              $99{" "}
              <span className="text-lg font-medium text-muted-foreground">MXN</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#6baed6]" aria-hidden />
              {PAYMENT_GUARANTEE_COPY}
            </p>
            <p className="flex items-center gap-2">
              <CreditCard className="size-4 text-[#6baed6]" aria-hidden />
              Mercado Pago y tarjeta (próximamente)
            </p>
            <p>Te faltan ~{remaining} min de preguntas para tu diagnóstico completo.</p>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={pending}
              size="lg"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {pending
                ? "Procesando..."
                : "Continuar y obtener mi análisis — $99 MXN"}
            </Button>
          </CardFooter>
        </Card>

        {state.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_PLANS.filter((p) => !p.available).map((plan) => (
            <Card key={plan.id} className="opacity-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">
                  ${plan.price} {plan.currency}
                </p>
                <Badge variant="outline" className="mt-2">
                  Próximamente
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </form>

      <form action={saveAndContinueLater}>
        <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
          Guardar y continuar después
        </Button>
      </form>
    </div>
  );
}
