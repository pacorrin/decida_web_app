"use client";

import { cn } from "@/lib/utils";

export type OptionCardItem = {
  value: string;
  label: string;
  hint?: string;
};

type OptionCardGroupProps = {
  name: string;
  options: OptionCardItem[];
  variant?: "radio" | "checkbox";
  defaultValue?: string;
  defaultValues?: string[];
  required?: boolean;
  columns?: 1 | 2 | 3 | 5;
  ariaLabel?: string;
  layout?: "grid" | "stack";
};

const columnClasses: Record<1 | 2 | 3 | 5, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  5: "grid-cols-5",
};

export function OptionCardGroup({
  name,
  options,
  variant = "radio",
  defaultValue,
  defaultValues = [],
  required = false,
  columns = 2,
  ariaLabel,
  layout = "grid",
}: OptionCardGroupProps) {
  const inputType = variant === "checkbox" ? "checkbox" : "radio";

  return (
    <div
      className={cn(
        layout === "stack" ? "flex flex-col gap-2" : cn("grid gap-2", columnClasses[columns])
      )}
      role={variant === "radio" ? "radiogroup" : "group"}
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isChecked =
          variant === "checkbox"
            ? defaultValues.includes(option.value)
            : defaultValue === option.value;

        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer rounded-lg border border-border/70 transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5",
              layout === "stack"
                ? "items-center gap-3 px-4 py-3 text-sm"
                : columns === 5
                  ? "min-w-[3.25rem] flex-col items-center px-3 py-2 text-center"
                  : "items-center gap-2 px-3 py-2 text-sm"
            )}
          >
            <input
              type={inputType}
              name={name}
              value={option.value}
              defaultChecked={isChecked}
              required={variant === "radio" ? required : undefined}
              className={cn(
                variant === "radio" && columns === 5 ? "sr-only" : "size-4 shrink-0 rounded border-input",
                variant === "checkbox" && "rounded border-input"
              )}
              data-testid={`option-card-${name}-${option.value}`}
              aria-label={option.hint ? `${option.label} — ${option.hint}` : option.label}
            />
            <span
              className={cn(
                columns === 5 ? "text-base font-semibold text-primary" : "font-medium"
              )}
            >
              {option.label}
            </span>
            {option.hint && (
              <span
                className={cn(
                  "text-muted-foreground",
                  columns === 5
                    ? "mt-0.5 text-[0.65rem] leading-tight"
                    : "text-xs"
                )}
              >
                {option.hint}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
