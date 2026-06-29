import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SIGNAL_DIMENSIONS } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

const signalStyles = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  yellow: "bg-amber-100 text-amber-900 border-amber-200",
  red: "bg-red-100 text-red-800 border-red-200",
} as const;

const signalLabels = {
  green: "Favorable",
  yellow: "Atención",
  red: "Riesgo",
} as const;

export function AssessmentPreviewCard() {
  return (
    <Card className="border-[#6baed6]/30 bg-white shadow-lg shadow-[#05422c]/5">
      <CardHeader className="border-b border-border/60 pb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#6baed6]">
          Vista previa del diagnóstico
        </p>
        <CardTitle className="text-lg text-primary">
          Servicio de detailing móvil
        </CardTitle>
        <CardDescription>
          Recomendación:{" "}
          <span className="font-medium text-primary">
            Validar antes de invertir
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {SIGNAL_DIMENSIONS.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
            >
              <span className="text-xs font-medium text-foreground/90">
                {item.label}
              </span>
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px]", signalStyles[item.signal])}
              >
                {signalLabels[item.signal]}
              </Badge>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-accent/80 p-3 text-sm leading-relaxed text-accent-foreground">
          <p className="font-medium">Próximo paso sugerido</p>
          <p className="mt-1 text-muted-foreground">
            Habla con 10 clientes potenciales y realiza 3 servicios piloto antes
            de invertir más de $10,000 MXN.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
