"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { saveCard } from "@/app/cuenta/(dashboard)/cifra/actions";
import { NativeSelect } from "./form-kit";

export type CardOption = { id: string; name: string };
export type CardOptions = { cards: CardOption[]; lastCardId: string | null };

const NONE = "";
const NEW = "__new__";

/**
 * «¿Con qué tarjeta?» de un egreso: opcional, sugiere la última usada y deja dar de alta una
 * tarjeta al vuelo (solo el nombre; el resto se completa después en Mis cuentas).
 */
export function CardSelect({ cards, lastCardId }: CardOptions) {
  const [extra, setExtra] = useState<CardOption[]>([]);
  const [value, setValue] = useState(lastCardId ?? NONE);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const all = [...cards, ...extra.filter((e) => !cards.some((c) => c.id === e.id))];
  const options = [
    { code: NONE, label: "Sin tarjeta" },
    ...all.map((c) => ({ code: c.id, label: c.name })),
    { code: NEW, label: "Agregar tarjeta…" },
  ];

  function onChange(next: string) {
    if (next === NEW) {
      setAdding(true);
      return;
    }
    setAdding(false);
    setValue(next);
  }

  function create() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Escribe el nombre de la tarjeta.");
      return;
    }
    const data = new FormData();
    data.set("name", trimmed);
    startTransition(async () => {
      try {
        const r = await saveCard(data);
        if (r.success && r.id) {
          setExtra((list) => [...list, { id: r.id!, name: trimmed }]);
          setValue(r.id);
          setAdding(false);
          setName("");
          setError(null);
          toast.success("Tarjeta agregada. Completa sus fechas en Mis cuentas.");
        } else {
          setError(r.fieldErrors?.name?.[0] ?? r.message ?? "No pudimos agregar la tarjeta.");
        }
      } catch {
        setError("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor="cardId">¿Con qué tarjeta? (opcional)</FieldLabel>
      <NativeSelect name="cardId" options={options} value={adding ? NEW : value} onChange={onChange} />
      {adding && (
        <div className="mt-2 flex gap-2">
          <Input
            aria-label="Nombre de la tarjeta"
            value={name}
            maxLength={60}
            placeholder="Ej. Tarjeta Banco X"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
          />
          <Button type="button" size="sm" onClick={create} disabled={pending} data-testid="cifra-card-add">
            Agregar
          </Button>
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
