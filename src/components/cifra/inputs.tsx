"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMoneyInput, formatPercentInput } from "@/lib/cifra/money";

/** Cuántos dígitos y puntos hay antes de `pos`; sirve para devolver el cursor a su lugar al dar formato. */
function significantBefore(text: string, pos: number): number {
  return text.slice(0, pos).replace(/[^\d.]/g, "").length;
}

function positionAfter(text: string, count: number): number {
  if (count === 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/[\d.]/.test(text[i])) seen += 1;
    if (seen === count) return i + 1;
  }
  return text.length;
}

function FormattedInput({
  id,
  name,
  defaultValue,
  placeholder,
  invalid,
  format,
  prefix,
  suffix,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  format: (raw: string) => string;
  prefix?: string;
  suffix?: string;
}) {
  const [value, setValue] = useState(() => format(defaultValue ?? ""));
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caret.current !== null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });

  return (
    <div className="relative">
      {prefix && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        ref={ref}
        id={id}
        name={name}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={prefix ? "pl-6" : suffix ? "pr-7" : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          const before = significantBefore(raw, e.target.selectionStart ?? raw.length);
          const next = format(raw);
          setValue(next);
          caret.current = positionAfter(next, before);
        }}
      />
      {suffix && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** Importe en pesos: solo acepta números y se muestra con formato mientras se escribe ($1,234.50). */
export function MoneyInput(props: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
}) {
  return <FormattedInput {...props} format={formatMoneyInput} prefix="$" placeholder={props.placeholder ?? "0.00"} />;
}

/** Porcentaje: solo números, hasta dos decimales. */
export function PercentInput(props: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
}) {
  return <FormattedInput {...props} format={formatPercentInput} suffix="%" placeholder={props.placeholder ?? "0"} />;
}

/** Casilla simple; el formulario manda «on» solo si está marcada. */
export function CheckboxField({
  name,
  label,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
        {...(checked === undefined ? { defaultChecked } : { checked })}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
      />
      <span>{label}</span>
    </label>
  );
}
