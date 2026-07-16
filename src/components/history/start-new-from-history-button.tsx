"use client";

import { useTransition } from "react";
import { startNewAssessmentFromHistory } from "@/app/mis-evaluaciones/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function StartNewFromHistoryButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      data-testid="history-analyze-new"
      onClick={() => {
        startTransition(() => {
          void startNewAssessmentFromHistory();
        });
      }}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Preparando…
        </>
      ) : (
        <>
          <Sparkles className="size-4" aria-hidden />
          Analizar nueva idea
        </>
      )}
    </Button>
  );
}
