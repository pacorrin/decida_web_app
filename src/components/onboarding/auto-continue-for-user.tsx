"use client";

import { useEffect, useTransition } from "react";
import { startAssessmentForCurrentUser } from "@/app/analizar/actions";
import { Loader2 } from "lucide-react";

/**
 * Shown instead of the contact form when a logged-in user lands directly on
 * "/analizar/contacto" (e.g. an old bookmark) — we already know who they
 * are, so it kicks off the same Server Action the "/cuenta" entry point
 * uses and continues straight into the flow.
 */
export function AutoContinueForUser() {
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      void startAssessmentForCurrentUser();
    });
  }, [startTransition]);

  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Continuando con tu cuenta…
    </div>
  );
}
