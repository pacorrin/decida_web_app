"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { saveProducts } from "@/app/analizar/actions";
import { type ActionState } from "@/lib/onboarding/schemas";
import { parseStoredProducts } from "@/lib/onboarding/products";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };
const MAX_PRODUCTS = 10;

type ProductRow = {
  id: string;
  name: string;
  kind: "producto" | "servicio";
  price: string;
  variableCost: string;
  monthlyUnits: string;
};

function emptyRow(): ProductRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    kind: "producto",
    price: "",
    variableCost: "",
    monthlyUnits: "",
  };
}

function initialRows(assessment: AssessmentWithRelations): ProductRow[] {
  const stored = parseStoredProducts(assessment.financial_inputs?.finp_products);
  if (stored.length === 0) return [emptyRow()];
  return stored.map((p) => ({
    id: crypto.randomUUID(),
    name: p.name,
    kind: p.kind,
    price: p.price ? String(p.price) : "",
    variableCost: p.variableCost ? String(p.variableCost) : "",
    monthlyUnits: p.monthlyUnits ? String(p.monthlyUnits) : "",
  }));
}

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function ProductsForm({
  assessment,
}: {
  assessment: AssessmentWithRelations;
}) {
  const [state, action, pending] = useActionState(saveProducts, initialState);
  const [rows, setRows] = useState<ProductRow[]>(() => initialRows(assessment));

  function update(id: string, patch: Partial<ProductRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function addRow() {
    setRows((prev) =>
      prev.length >= MAX_PRODUCTS ? prev : [...prev, emptyRow()]
    );
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  const productsJson = useMemo(
    () =>
      JSON.stringify(
        rows.map((r) => ({
          name: r.name.trim(),
          kind: r.kind,
          price: Number(r.price) || 0,
          variableCost: Number(r.variableCost) || 0,
          monthlyUnits: Math.trunc(Number(r.monthlyUnits)) || 0,
        }))
      ),
    [rows]
  );

  const totals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let units = 0;
    for (const r of rows) {
      const p = Number(r.price) || 0;
      const c = Number(r.variableCost) || 0;
      const u = Math.trunc(Number(r.monthlyUnits)) || 0;
      revenue += p * u;
      cost += c * u;
      units += u;
    }
    const marginPct = revenue > 0 ? ((revenue - cost) / revenue) * 100 : null;
    return { revenue, grossProfit: revenue - cost, units, marginPct };
  }, [rows]);

  const belowCost = rows.some(
    (r) =>
      Number(r.price) > 0 && Number(r.price) <= Number(r.variableCost)
  );

  return (
    <form action={action}>
      <input type="hidden" name="productsJson" value={productsJson} readOnly />

      <FieldGroup>
        <Field>
          <FieldLabel>¿Qué vas a vender?</FieldLabel>
          <FieldDescription>
            Agrega cada producto o servicio con su precio, su costo variable por
            unidad y cuántas unidades esperas vender al mes. Hasta {MAX_PRODUCTS} productos o
            servicios.
          </FieldDescription>
        </Field>

        <ul className="space-y-4">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Quitar el renglón ${index + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-6">
                <Field className="sm:col-span-4">
                  <FieldLabel htmlFor={`name-${row.id}`}>Nombre</FieldLabel>
                  <Input
                    id={`name-${row.id}`}
                    data-testid={`product-name-${index}`}
                    value={row.name}
                    onChange={(e) => update(row.id, { name: e.target.value })}
                    placeholder="Ej: Corte de cabello a domicilio"
                    maxLength={120}
                    required
                    disabled={pending}
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`kind-${row.id}`}>Tipo</FieldLabel>
                  <select
                    id={`kind-${row.id}`}
                    data-testid={`product-kind-${index}`}
                    value={row.kind}
                    onChange={(e) =>
                      update(row.id, {
                        kind: e.target.value as ProductRow["kind"],
                      })
                    }
                    disabled={pending}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`price-${row.id}`}>
                    Precio (MXN)
                  </FieldLabel>
                  <Input
                    id={`price-${row.id}`}
                    data-testid={`product-price-${index}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="10"
                    value={row.price}
                    onChange={(e) => update(row.id, { price: e.target.value })}
                    required
                    disabled={pending}
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`cost-${row.id}`}>
                    Costo variable (MXN)
                  </FieldLabel>
                  <Input
                    id={`cost-${row.id}`}
                    data-testid={`product-cost-${index}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="10"
                    value={row.variableCost}
                    onChange={(e) =>
                      update(row.id, { variableCost: e.target.value })
                    }
                    required
                    disabled={pending}
                  />
                  <FieldDescription>
                    Lo que te cuesta cada unidad (materiales, comisión, envío, traslados).
                  </FieldDescription>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`units-${row.id}`}>
                    Unidades / mes
                  </FieldLabel>
                  <Input
                    id={`units-${row.id}`}
                    data-testid={`product-units-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step="1"
                    value={row.monthlyUnits}
                    onChange={(e) =>
                      update(row.id, { monthlyUnits: e.target.value })
                    }
                    required
                    disabled={pending}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ul>

        {rows.length < MAX_PRODUCTS && (
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={pending}
            className="w-full sm:w-auto"
            data-testid="product-add"
          >
            <Plus className="size-4" aria-hidden />
            Agregar otro
          </Button>
        )}

        <div className="rounded-xl bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">Estimado mensual</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground sm:grid-cols-4">
            <div>
              <dt className="text-xs">Ingresos</dt>
              <dd className="text-foreground">
                {currency.format(totals.revenue)}
              </dd>
            </div>
            <div>
              <dt className="text-xs">Utilidad bruta</dt>
              <dd className="text-foreground">
                {currency.format(totals.grossProfit)}
              </dd>
            </div>
            <div>
              <dt className="text-xs">Margen</dt>
              <dd className="text-foreground">
                {totals.marginPct === null
                  ? "—"
                  : `${totals.marginPct.toFixed(0)}%`}
              </dd>
            </div>
            <div>
              <dt className="text-xs">Unidades</dt>
              <dd className="text-foreground">{totals.units}</dd>
            </div>
          </dl>
          {belowCost && (
            <p className="mt-3 text-sm text-destructive">
              Hay al menos un renglón cuyo precio es igual o menor a su costo
              variable — lo venderías con pérdida.
            </p>
          )}
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
      </FieldGroup>

      <StepNavigation currentSlug="productos" isPending={pending} />
    </form>
  );
}
