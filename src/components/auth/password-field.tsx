"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@/lib/auth/password-strength";

const BAR_COLORS = {
  1: "bg-destructive",
  2: "bg-amber-500",
  3: "bg-[#6baed6]",
  4: "bg-emerald-600",
} as const;

const TEXT_COLORS = {
  1: "text-destructive",
  2: "text-amber-700",
  3: "text-[#2f7fb0]",
  4: "text-emerald-700",
} as const;

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "defaultValue">;

/** Campo de contraseña nueva con una barra que muestra qué tan segura es. */
export function PasswordField(props: PasswordFieldProps) {
  const [value, setValue] = useState("");
  const strength = passwordStrength(value);

  return (
    <div className="space-y-2">
      <Input
        {...props}
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
      />
      {strength.level > 0 && (
        <div data-testid="password-strength">
          <div className="flex gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  segment <= strength.level
                    ? BAR_COLORS[strength.level as 1 | 2 | 3 | 4]
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
            <span className={`font-medium ${TEXT_COLORS[strength.level as 1 | 2 | 3 | 4]}`}>
              Contraseña {strength.label.toLowerCase()}
            </span>
            {strength.hint && <span> · {strength.hint}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
