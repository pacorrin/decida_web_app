import { CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_PLAN_INCLUDES, FREE_PLAN_LOCKED } from "@/lib/onboarding/copy";

/** Plan gratuito: qué da y qué se queda bloqueado en el reporte. */
export function FreePlanCard({ isCurrent }: { isCurrent: boolean }) {
  return (
    <Card data-testid="plan-free">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">Gratis</CardTitle>
          {isCurrent && <Badge variant="outline">Tu plan</Badge>}
        </div>
        <CardDescription>Para probar con tu primera idea, sin tarjeta</CardDescription>
        <p className="pt-2 text-4xl font-semibold text-primary">
          $0 <span className="text-base font-normal text-muted-foreground">MXN</span>
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Lo que incluye</p>
          <ul className="space-y-2.5 text-sm">
            {FREE_PLAN_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Se desbloquea con un plan</p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {FREE_PLAN_LOCKED.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
