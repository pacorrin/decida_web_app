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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  triggerIcon,
  title,
  description,
  action,
  submitLabel = "Guardar",
  testId,
  wide,
  children,
}: {
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerSize?: "default" | "sm" | "xs";
  triggerIcon?: React.ReactNode;
  title: string;
  description?: string;
  action: (formData: FormData) => Promise<CifraActionResult>;
  submitLabel?: string;
  testId?: string;
  /** Formulario largo: diálogo más ancho para repartir los campos en dos columnas. */
  wide?: boolean;
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
        {triggerIcon}
        {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          wide && "sm:max-w-2xl",
        )}
      >
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

/** Rejilla de dos columnas (una en móvil) para repartir los campos de un formulario largo. */
export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">{children}</div>;
}

/** Ocupa las dos columnas de la rejilla (casillas, textos largos). */
export function FullRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("sm:col-span-2", className)}>{children}</div>;
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
/** Agrupa opciones consecutivas con el mismo `group`; las que no tienen quedan sueltas. */
function groupOptions<T extends { group?: string }>(options: readonly T[]) {
  const groups: { label?: string; items: T[] }[] = [];
  for (const o of options) {
    const last = groups[groups.length - 1];
    if (last && last.label === o.group) last.items.push(o);
    else groups.push({ label: o.group, items: [o] });
  }
  return groups;
}

export function NativeSelect({
  name,
  options,
  defaultValue,
  value,
  onChange,
  className,
}: {
  name: string;
  options: readonly { code: string; label: string; group?: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.code ?? "");
  const current = value ?? inner;
  return (
    <>
      {/* El valor vacío («Sin tarjeta») no viaja bien por el select, así que el formulario lee este campo. */}
      <input type="hidden" name={name} value={current} />
      <Select
        items={options.map((o) => ({ value: o.code, label: o.label }))}
        value={current}
        onValueChange={(next) => {
          if (next === null) return;
          setInner(next);
          onChange?.(next);
        }}
      >
        <SelectTrigger id={name} className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {groupOptions(options).map((g) =>
            g.label ? (
              <SelectGroup key={g.label}>
                <SelectLabel>{g.label}</SelectLabel>
                {g.items.map((o) => (
                  <SelectItem key={o.code} value={o.code}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              g.items.map((o) => (
                <SelectItem key={o.code} value={o.code}>
                  {o.label}
                </SelectItem>
              ))
            ),
          )}
        </SelectContent>
      </Select>
    </>
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
  icon,
  className,
  testId,
}: {
  action: () => Promise<CifraActionResult>;
  label: string;
  confirmText?: string;
  successMessage?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "xs";
  icon?: React.ReactNode;
  className?: string;
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
      className={className}
      data-testid={testId}
    >
      {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : icon}
      {label}
    </Button>
  );
}
