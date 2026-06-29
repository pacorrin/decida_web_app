import { CtaLink } from "@/components/landing/cta-link";
import { REPORT_INCLUDES } from "@/components/landing/landing-content";
import { SectionShell } from "@/components/landing/section-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function ExampleResultSection() {
  return (
    <SectionShell
      id="ejemplo"
      title="Recibe claridad, no teoría"
      description="Tu reporte incluye un diagnóstico accionable, no promesas vacías."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-primary">Qué incluye tu reporte</CardTitle>
            <CardDescription>
              Entregables diseñados para ayudarte a decidir mejor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {REPORT_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-[#6baed6]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-[#6baed6]/30 bg-accent/20">
          <CardHeader>
            <p className="text-sm font-medium text-muted-foreground">
              Ejemplo de resultado
            </p>
            <CardTitle className="text-primary">
              Idea evaluada: Servicio de detailing móvil
            </CardTitle>
            <CardDescription>
              Resultado:{" "}
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                Validar antes de invertir
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-relaxed">
            <div>
              <p className="mb-2 font-medium text-primary">Fortalezas</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Puede iniciar como actividad secundaria.</li>
                <li>• No requiere local al inicio.</li>
                <li>• Tiene potencial de prueba con bajo presupuesto.</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1 font-medium text-primary">
                <AlertTriangle className="size-4 text-amber-600" aria-hidden />
                Riesgos
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Canal de adquisición poco claro.</li>
                <li>• Dependencia del tiempo personal.</li>
                <li>• Margen real aún no validado.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border/70 bg-background p-4">
              <p className="font-medium text-primary">Recomendación</p>
              <p className="mt-2 text-muted-foreground">
                Antes de invertir más de $10,000 MXN, habla con 10 clientes
                potenciales, cotiza costos reales y realiza 3 servicios piloto.
              </p>
            </div>
            <CtaLink href="/ejemplo" variant="outline" className="w-full">
              Ver reporte completo de ejemplo
            </CtaLink>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}
