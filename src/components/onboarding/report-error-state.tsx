"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { retryReportGeneration } from "@/app/analizar/actions";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ReportErrorStateProps = {
  assessmentId: string;
};

export function ReportErrorState({ assessmentId }: ReportErrorStateProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    retryReportGeneration,
    { success: false }
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-red-600" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-base font-semibold text-red-900">
                  Error al generar tu reporte
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Lo sentimos, hubo un problema al generar tu diagnóstico. 
                  Esto no debería suceder, pero estamos aquí para ayudarte.
                </p>
              </div>

              <div className="rounded-lg border border-red-200 bg-white/50 p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  Garantía de reembolso
                </p>
                <p className="text-sm text-red-800">
                  Si no puedes obtener tu reporte después de reintentar, te 
                  reembolsamos tu pago completo. Por favor, contacta a nuestro 
                  equipo de soporte con el código:{" "}
                  <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
                    {assessmentId}
                  </code>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <form action={formAction} className="flex-1">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                    variant="default"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                        Reintentando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        Reintentar generación
                      </>
                    )}
                  </Button>
                </form>

                <a
                  href={`mailto:soporte@decida.app?subject=Error%20generando%20reporte&body=Código%20de%20evaluación:%20${assessmentId}`}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground w-full sm:w-auto"
                >
                  Contactar soporte
                </a>
              </div>

              {state.message && !state.success && (
                <div className="rounded-md bg-red-100 px-3 py-2">
                  <p className="text-sm text-red-800">{state.message}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            ¿Qué pasó?
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              El proceso de generación de reportes utiliza inteligencia artificial
              para analizar tu información. Ocasionalmente, este proceso puede 
              fallar por razones técnicas fuera de nuestro control.
            </p>
            <p>
              Nuestro equipo técnico ha sido notificado automáticamente y 
              revisará el problema. Mientras tanto, puedes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Hacer clic en "Reintentar generación" (recomendado)</li>
              <li>Esperar unos minutos y recargar la página</li>
              <li>Contactar a soporte si el problema persiste</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
