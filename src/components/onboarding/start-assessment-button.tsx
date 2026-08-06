"use client";

import { useTransition } from "react";
import { startAssessmentForCurrentUser } from "@/app/analizar/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function StartAssessmentButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void startAssessmentForCurrentUser();
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
          Analizar una idea
        </>
      )}
    </Button>
  );
}
