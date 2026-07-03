"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type LoadingOverlayProps = {
  isLoading: boolean;
  onTimeout?: () => void;
  timeoutMs?: number;
};

const PROGRESS_MESSAGES = [
  { progress: 0, message: "Analizando tus números...", duration: 3000 },
  { progress: 25, message: "Evaluando viabilidad financiera...", duration: 4000 },
  { progress: 50, message: "Generando tu diagnóstico...", duration: 5000 },
  { progress: 75, message: "Preparando recomendaciones...", duration: 4000 },
  { progress: 90, message: "Finalizando reporte...", duration: 2000 },
];

export function LoadingOverlay({
  isLoading,
  onTimeout,
  timeoutMs = 60000,
}: LoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      setProgress(0);
      setHasTimedOut(false);
      return;
    }

    let messageTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const updateMessage = () => {
      setMessageIndex((prev) => {
        const nextIndex = Math.min(prev + 1, PROGRESS_MESSAGES.length - 1);
        const currentMessage = PROGRESS_MESSAGES[nextIndex];
        
        setProgress(currentMessage.progress);

        if (nextIndex < PROGRESS_MESSAGES.length - 1) {
          messageTimer = setTimeout(updateMessage, currentMessage.duration);
        }

        return nextIndex;
      });
    };

    messageTimer = setTimeout(updateMessage, PROGRESS_MESSAGES[0].duration);

    if (timeoutMs > 0) {
      timeoutTimer = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeoutMs);
    }

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, onTimeout, timeoutMs]);

  if (!isLoading) return null;

  const currentMessage = PROGRESS_MESSAGES[messageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Generando tu diagnóstico
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">
              {currentMessage.message}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {progress}% completado
          </p>
        </div>

        {hasTimedOut && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center">
            <p className="text-sm text-destructive">
              La generación está tomando más tiempo del esperado. Por favor, espera un momento más...
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Esto puede tomar entre 15-30 segundos. Por favor no cierres esta ventana.
        </p>
      </div>
    </div>
  );
}
