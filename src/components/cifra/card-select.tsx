"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { saveCard } from "@/app/cuenta/(dashboard)/cifra/actions";
import { NativeSelect } from "./form-kit";

export type CardOption = { id: string; name: string };
export type CardOptions = {
  cards: CardOption[];
  accounts: CardOption[];
  lastCardId: string | null;
};

const NONE = "";
const NEW = "__new__";
const CARD = "c:";
const ACCOUNT = "a:";

/**
 * «¿Con qué pagaste?» (egreso) o «¿A qué cuenta entró?» (ingreso): opcional. Reúne las cuentas
 * (débito, banco, efectivo…) y las tarjetas de crédito; las cuentas suben o bajan su saldo y las
 * tarjetas suben lo que se debe. Deja dar de alta una tarjeta al vuelo (solo el nombre).
 */
export function CardSelect({
  flow = "expense",
  cards,
  accounts,
  lastCardId,
  initialAccountId = null,
}: CardOptions & { flow?: "income" | "expense"; initialAccountId?: string | null }) {
  const isExpense = flow === "expense";
  const [extra, setExtra] = useState<CardOption[]>([]);
  const [value, setValue] = useState(
    initialAccountId && accounts.some((a) => a.id === initialAccountId)
      ? `${ACCOUNT}${initialAccountId}`
      : isExpense && lastCardId
        ? `${CARD}${lastCardId}`
        : NONE,
  );
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isExpense && accounts.length === 0) return null;

  const allCards = [...cards, ...extra.filter((e) => !cards.some((c) => c.id === e.id))];
  const options = [
    { code: NONE, label: "Sin especificar" },
    ...accounts.map((a) => ({ code: `${ACCOUNT}${a.id}`, label: a.name, group: "Cuentas" })),
    ...(isExpense
      ? [
          ...allCards.map((c) => ({ code: `${CARD}${c.id}`, label: c.name, group: "Tarjetas de crédito" })),
          { code: NEW, label: "Agregar tarjeta…", group: "Tarjetas de crédito" },
        ]
      : []),
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
          setValue(`${CARD}${r.id}`);
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
      <FieldLabel htmlFor="paymentMethod">
        {isExpense ? "¿Con qué pagaste? (opcional)" : "¿A qué cuenta entró? (opcional)"}
      </FieldLabel>
      <input type="hidden" name="cardId" value={value.startsWith(CARD) ? value.slice(CARD.length) : ""} />
      <input type="hidden" name="accountId" value={value.startsWith(ACCOUNT) ? value.slice(ACCOUNT.length) : ""} />
      <NativeSelect
        name="paymentMethod"
        options={options}
        value={adding ? NEW : value}
        onChange={onChange}
      />
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
