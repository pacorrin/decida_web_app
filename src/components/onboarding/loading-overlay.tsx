"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export type LoadingMessage = {
  progress: number;
  message: string;
  duration: number;
};

type LoadingOverlayProps = {
  isLoading: boolean;
  onTimeout?: () => void;
  timeoutMs?: number;
  title?: string;
  messages?: LoadingMessage[];
  footerHint?: string;
};

const REPORT_MESSAGES: LoadingMessage[] = [
  { progress: 0, message: "Analizando tus números...", duration: 3000 },
  { progress: 25, message: "Evaluando viabilidad financiera...", duration: 4000 },
  { progress: 50, message: "Generando tu diagnóstico...", duration: 5000 },
  { progress: 75, message: "Preparando recomendaciones...", duration: 4000 },
  { progress: 90, message: "Finalizando reporte...", duration: 2000 },
];

export const IDEA_LOADING_MESSAGES: LoadingMessage[] = [
  { progress: 0, message: "Leyendo tu idea...", duration: 2500 },
  { progress: 35, message: "Identificando supuestos...", duration: 3500 },
  { progress: 70, message: "Preparando resumen...", duration: 3500 },
  { progress: 90, message: "Casi listo...", duration: 2000 },
];

function LoadingContent({
  onTimeout,
  timeoutMs,
  title,
  messages,
  footerHint,
}: {
  onTimeout?: () => void;
  timeoutMs: number;
  title: string;
  messages: LoadingMessage[];
  footerHint: string;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let messageTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const updateMessage = () => {
      setMessageIndex((prev) => {
        const nextIndex = Math.min(prev + 1, messages.length - 1);
        const currentMessage = messages[nextIndex];

        setProgress(currentMessage.progress);

        if (nextIndex < messages.length - 1) {
          messageTimer = setTimeout(updateMessage, currentMessage.duration);
        }

        return nextIndex;
      });
    };

    messageTimer = setTimeout(updateMessage, messages[0].duration);

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
  }, [onTimeout, timeoutMs, messages]);

  const currentMessage = messages[messageIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      data-testid="loading-overlay"
    >
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
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
              Está tomando más tiempo del esperado. Por favor, espera un momento
              más...
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">{footerHint}</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  isLoading,
  onTimeout,
  timeoutMs = 60000,
  title = "Generando tu diagnóstico",
  messages = REPORT_MESSAGES,
  footerHint = "Esto puede tomar entre 15-30 segundos. Por favor no cierres esta ventana.",
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <LoadingContent
      key="loading"
      onTimeout={onTimeout}
      timeoutMs={timeoutMs}
      title={title}
      messages={messages}
      footerHint={footerHint}
    />
  );
}
