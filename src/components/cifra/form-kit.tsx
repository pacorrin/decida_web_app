"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type CifraActionResult = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const ErrorsContext = createContext<Record<string, string[]>>({});

/** Diálogo con formulario: llama a la server action, muestra errores por campo y avisa con un toast. */
export function FormDialog({
  triggerLabel,
  triggerVariant = "outline",
  triggerSize = "sm",
  title,
  description,
  action,
  submitLabel = "Guardar",
  testId,
  children,
}: {
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerSize?: "default" | "sm" | "xs";
  title: string;
  description?: string;
  action: (formData: FormData) => Promise<CifraActionResult>;
  submitLabel?: string;
  testId?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result.success) {
          toast.success("Guardado");
          setOpen(false);
          setErrors({});
          setMessage(null);
        } else {
          setErrors(result.fieldErrors ?? {});
          setMessage(result.message ?? "No pudimos guardar los cambios.");
        }
      } catch {
        setMessage("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setErrors({});
          setMessage(null);
        }
      }}
    >
      <DialogTrigger
        render={<Button variant={triggerVariant} size={triggerSize} data-testid={testId} />}
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <ErrorsContext.Provider value={errors}>{children}</ErrorsContext.Provider>
          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Guardando…
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Etiqueta + campo + error del campo (el error viene del contexto del formulario). */
export function FormRow({
  name,
  label,
  hint,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const errors = useContext(ErrorsContext)[name];
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {hint && !errors && <FieldDescription>{hint}</FieldDescription>}
      {errors && <FieldError>{errors[0]}</FieldError>}
    </Field>
  );
}

/** Select nativo: funciona con FormData y es accesible sin más piezas. */
export function NativeSelect({
  name,
  options,
  defaultValue,
  value,
  onChange,
  className,
}: {
  name: string;
  options: readonly { code: string; label: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      id={name}
      name={name}
      defaultValue={value === undefined ? (defaultValue ?? options[0]?.code) : undefined}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Botón que ejecuta una acción del servidor ya enlazada (pagar, borrar), con confirmación opcional. */
export function ActionButton({
  action,
  label,
  confirmText,
  successMessage = "Listo",
  variant = "outline",
  size = "xs",
  testId,
}: {
  action: () => Promise<CifraActionResult>;
  label: string;
  confirmText?: string;
  successMessage?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "xs";
  testId?: string;
}) {
  const [pending, startTransition] = useTransition();

  function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) toast.success(successMessage);
        else toast.error(result.message ?? "No pudimos completar la acción.");
      } catch {
        toast.error("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={run}
      data-testid={testId}
    >
      {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
      {label}
    </Button>
  );
}
