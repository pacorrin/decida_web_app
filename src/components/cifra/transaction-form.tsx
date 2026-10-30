"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { categoriesFor, type CifraFlow } from "@/lib/cifra/constants";
import { addTransaction } from "@/app/cuenta/(dashboard)/cifra/actions";
import { NativeSelect } from "./form-kit";
import { cn } from "@/lib/utils";

const FLOWS: { code: CifraFlow; label: string }[] = [
  { code: "expense", label: "Egreso" },
  { code: "income", label: "Ingreso" },
];

/** Alta rápida de un ingreso o egreso; al guardar se limpia y queda listo para el siguiente. */
export function TransactionForm({ today }: { today: string }) {
  const [flow, setFlow] = useState<CifraFlow>("expense");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    startTransition(async () => {
      try {
        const result = await addTransaction(formData);
        if (result.success) {
          toast.success(flow === "income" ? "Ingreso registrado" : "Egreso registrado");
          setErrors({});
          setMessage(null);
          formRef.current?.reset();
        } else {
          setErrors(result.fieldErrors ?? {});
          setMessage(result.message ?? "No pudimos guardar el movimiento.");
        }
      } catch {
        setMessage("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  const err = (name: string) => errors[name]?.[0];

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-border/80 p-4 sm:p-5"
      data-testid="cifra-transaction-form"
    >
      <div role="group" aria-label="Tipo de movimiento" className="inline-flex rounded-lg border border-border p-0.5">
        {FLOWS.map((f) => (
          <button
            key={f.code}
            type="button"
            aria-pressed={flow === f.code}
            data-testid={`cifra-flow-${f.code}`}
            onClick={() => setFlow(f.code)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              flow === f.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field data-invalid={err("amount") ? true : undefined}>
          <FieldLabel htmlFor="amount">Monto (MXN)</FieldLabel>
          <Input id="amount" name="amount" inputMode="decimal" placeholder="0.00" aria-invalid={!!err("amount")} />
          {err("amount") && <FieldError>{err("amount")}</FieldError>}
        </Field>
        <Field data-invalid={err("category") ? true : undefined}>
          <FieldLabel htmlFor="category">Categoría</FieldLabel>
          {/* La clave fuerza a recrear el select al cambiar de tipo, para tomar su primera categoría. */}
          <NativeSelect key={flow} name="category" options={categoriesFor(flow)} />
          {err("category") && <FieldError>{err("category")}</FieldError>}
        </Field>
        <Field data-invalid={err("date") ? true : undefined}>
          <FieldLabel htmlFor="date">Fecha</FieldLabel>
          <Input id="date" name="date" type="date" defaultValue={today} aria-invalid={!!err("date")} />
          {err("date") && <FieldError>{err("date")}</FieldError>}
        </Field>
        <Field data-invalid={err("description") ? true : undefined}>
          <FieldLabel htmlFor="description">Nota (opcional)</FieldLabel>
          <Input id="description" name="description" maxLength={120} placeholder="Ej. Súper" />
          {err("description") && <FieldError>{err("description")}</FieldError>}
        </Field>
      </div>

      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
        data-testid="cifra-transaction-submit"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Guardando…
          </>
        ) : (
          "Registrar"
        )}
      </Button>
    </form>
  );
}
