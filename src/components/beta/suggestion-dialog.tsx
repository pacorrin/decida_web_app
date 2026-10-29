"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendSuggestion } from "@/app/cuenta/suggestion-actions";
import { SUGGESTION_MAX_LENGTH } from "@/lib/suggestions/schema";
import { toast } from "sonner";

/**
 * Modal para que la persona cuente qué función le gustaría ver. No pide ni
 * muestra datos de quien escribe: la cuenta se toma de la sesión en el servidor.
 */
export function SuggestionDialog({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("message", message);
      fd.set("page", pathname);
      try {
        const result = await sendSuggestion(fd);
        if (!result.success) {
          setError(result.message ?? "No pudimos enviar tu sugerencia.");
          return;
        }
        toast.success(result.message ?? "¡Gracias!");
        setMessage("");
        setOpen(false);
      } catch {
        setError("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        data-testid="suggestion-open"
        className="mt-2 inline-block text-left font-medium text-primary underline-offset-4 hover:underline"
      >
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>¿Qué función te gustaría ver?</DialogTitle>
        <DialogDescription>
          Cuéntanos tu idea o lo que te haría falta. Las leemos todas.
        </DialogDescription>
        <form onSubmit={submit} className="space-y-3">
          <Textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={SUGGESTION_MAX_LENGTH}
            rows={5}
            required
            placeholder="Por ejemplo: me gustaría comparar dos ideas lado a lado…"
            data-testid="suggestion-message"
            aria-label="Tu sugerencia"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{message.length}/{SUGGESTION_MAX_LENGTH}</span>
            {error && (
              <span role="alert" className="text-destructive" data-testid="suggestion-error">
                {error}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={pending || message.trim().length === 0}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            data-testid="suggestion-submit"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              "Enviar sugerencia"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
