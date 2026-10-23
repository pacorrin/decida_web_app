"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/onboarding/step-navigation";
import {
  savePayment,
  continueFree,
  saveAndContinueLater,
} from "@/app/analizar/actions";
import {
  PAYMENT_ANCHOR_COPY,
  PAYMENT_CANCEL_COPY,
  PAYMENT_FREE_FEATURES,
  PAYMENT_PAID_FEATURES,
} from "@/lib/onboarding/copy";
import { getRemainingMinutes } from "@/lib/onboarding/steps";
import type { ActionState } from "@/lib/onboarding/schemas";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { track } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import { cn } from "@/lib/utils";

const initialState: ActionState = { success: false };

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-secondary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PaymentStep({
  subscriptionsEnabled = false,
}: {
  subscriptionsEnabled?: boolean;
}) {
  const [state, action, pending] = useActionState(savePayment, initialState);
  const remaining = getRemainingMinutes("pago");
  useEffect(() => {
    if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <BackButton currentSlug="pago" />

      <p className="text-sm text-muted-foreground">
        {subscriptionsEnabled
          ? PAYMENT_ANCHOR_COPY
          : "Continúa gratis con una vista previa, o compra créditos para el reporte completo y más ideas."}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Gratis</CardTitle>
            <CardDescription>Para probar con tu primera idea</CardDescription>
            <p className="pt-2 text-4xl font-semibold text-primary">$0</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <FeatureList items={PAYMENT_FREE_FEATURES} />
            <p className="text-sm text-muted-foreground">
              Te faltan ~{remaining} min de preguntas. La prueba no incluye
              investigación de mercado; desbloqueas el reporte completo con
              créditos.
            </p>
          </CardContent>
          <CardFooter>
            <form action={continueFree} className="w-full">
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full"
                data-testid="payment-free"
              >
                Continuar gratis
              </Button>
            </form>
          </CardFooter>
        </Card>

        {subscriptionsEnabled ? (
          <form action={action} className="contents">
            <input type="hidden" name="planId" value="monthly" />
            <Card className="border-primary/30 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Suscripción</CardTitle>
                  <Badge variant="secondary">Recomendado</Badge>
                </div>
                <CardDescription>
                  Reporte completo, sin límite de ideas
                </CardDescription>
                <p className="pt-2 text-4xl font-semibold text-primary">
                  $99{" "}
                  <span className="text-lg font-medium text-muted-foreground">
                    MXN / mes
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureList items={PAYMENT_PAID_FEATURES} />
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4 text-[#6baed6]" aria-hidden />
                  {PAYMENT_CANCEL_COPY}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="size-4 text-[#6baed6]" aria-hidden />
                  Pago seguro con Stripe
                </p>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button
                  type="submit"
                  disabled={pending}
                  size="lg"
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  data-testid="payment-submit"
                  onClick={() =>
                    track(ANALYTICS_EVENTS.subscribeClicked, {
                      location: "onboarding_plan",
                    })
                  }
                >
                  {pending ? "Procesando..." : "Suscribirme — $99 MXN/mes"}
                </Button>
                {state.message && (
                  <p className="text-sm text-destructive">{state.message}</p>
                )}
              </CardFooter>
            </Card>
          </form>
        ) : (
          <Card className="border-primary/30 shadow-lg shadow-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Créditos</CardTitle>
                <Badge variant="secondary">Desde $59</Badge>
              </div>
              <CardDescription>
                Desbloquea reportes y analiza más ideas
              </CardDescription>
              <p className="pt-2 text-4xl font-semibold text-primary">
                0.5–1.5{" "}
                <span className="text-lg font-medium text-muted-foreground">
                  créditos / análisis
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <FeatureList
                items={[
                  "Reporte completo desbloqueado",
                  "Investigación de mercado opcional",
                  "Los créditos no caducan",
                  "Paquetes de 1, 3 o 10 créditos",
                ]}
              />
            </CardContent>
            <CardFooter>
              <Link
                href={CREDITS_PACKAGES_PATH}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-secondary text-secondary-foreground hover:bg-secondary/90",
                )}
                data-testid="payment-credits"
              >
                Ver paquetes de créditos
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>

      <form action={saveAndContinueLater}>
        <Button
          type="submit"
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          Guardar y continuar después
        </Button>
      </form>
    </div>
  );
}
