"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  MEXICO_PHONE_PREFIX,
  formatMexicoPhone,
  mexicoPhoneCursor,
} from "@/lib/onboarding/phone";

type MexicoPhoneInputProps = {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
};

export function MexicoPhoneInput({
  id,
  name,
  defaultValue = "",
  required,
  "aria-invalid": ariaInvalid,
}: MexicoPhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState(() => formatMexicoPhone(defaultValue));

  function placeCaret(formatted: string, digitsBefore: number) {
    const position = mexicoPhoneCursor(formatted, digitsBefore);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(position, position);
    });
  }

  function keepPrefix() {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start >= MEXICO_PHONE_PREFIX.length && end >= MEXICO_PHONE_PREFIX.length) {
      return;
    }
    const nextStart = Math.max(start, MEXICO_PHONE_PREFIX.length);
    const nextEnd = Math.max(end, MEXICO_PHONE_PREFIX.length);
    input.setSelectionRange(nextStart, nextEnd);
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      value={phone}
      required={required}
      aria-invalid={ariaInvalid}
      onChange={(event) => {
        const next = formatMexicoPhone(event.target.value);
        const digitsBefore = event.target.value
          .slice(0, event.target.selectionStart ?? event.target.value.length)
          .replace(/\D/g, "").length;
        setPhone(next);
        placeCaret(next, digitsBefore);
      }}
      onSelect={keepPrefix}
      onClick={keepPrefix}
      onKeyDown={(event) => {
        const input = event.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const prefix = MEXICO_PHONE_PREFIX.length;
        const removingPrefix =
          (event.key === "Backspace" && start <= prefix && end <= prefix) ||
          (event.key === "Delete" && start < prefix);
        if (removingPrefix) event.preventDefault();
      }}
    />
  );
}
