"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ACCOUNT_KINDS,
  DEBT_KINDS,
  EXPENSE_CATEGORIES,
} from "@/lib/cifra/constants";
import { type CalendarDate, formatDateInput } from "@/lib/cifra/dates";
import { centsToInputValue } from "@/lib/cifra/money";
import {
  markPaid,
  saveAccount,
  saveDebt,
  saveFixedExpense,
  setPendingAmount,
} from "@/app/cuenta/(dashboard)/cifra/actions";
import { FormDialog, FormGrid, FormRow, FullRow, NativeSelect } from "./form-kit";
import { CheckboxField, MoneyInput, PercentInput } from "./inputs";

type AccountItem = { id: string; name: string; kind: string; balanceCents: number };
export type DebtItem = {
  id: string;
  name: string;
  kind: string;
  balanceCents: number;
  creditLimitCents: number | null;
  annualRatePct: number | null;
  nextDueOn: CalendarDate | null;
  dueLastDay: boolean;
  nextCutOn: CalendarDate | null;
  cutLastDay: boolean;
  nextPaymentCents: number | null;
  minPaymentCents: number | null;
  variablePayment: boolean;
  recurring: boolean;
  endsOn: CalendarDate | null;
};
export type FixedItem = {
  id: string;
  name: string;
  category: string;
  amountCents: number | null;
  variable: boolean;
  nextDueOn: CalendarDate | null;
  dueLastDay: boolean;
  recurring: boolean;
};

const money = (cents: number | null | undefined) =>
  cents == null ? "" : centsToInputValue(cents);
const dateValue = (d: CalendarDate | null | undefined) => (d ? formatDateInput(d) : "");

export function AccountDialog({ item }: { item?: AccountItem }) {
  return (
    <FormDialog
      triggerLabel={item ? "Editar" : "Agregar saldo"}
      triggerVariant={item ? "ghost" : "outline"}
      triggerSize="xs"
      title={item ? "Editar saldo" : "Agregar saldo"}
      description="El dinero que tienes hoy en una cuenta o en efectivo."
      action={saveAccount}
      testId={item ? undefined : "cifra-add-account"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormRow name="name" label="Nombre">
        <Input id="name" name="name" defaultValue={item?.name} placeholder="Ej. Cuenta de nómina" />
      </FormRow>
      <FormRow name="kind" label="Tipo">
        <NativeSelect name="kind" options={ACCOUNT_KINDS} defaultValue={item?.kind} />
      </FormRow>
      <FormRow name="balance" label="Saldo actual">
        <MoneyInput id="balance" name="balance" defaultValue={money(item?.balanceCents)} />
      </FormRow>
    </FormDialog>
  );
}

export function DebtDialog({ item }: { item?: DebtItem }) {
  const [kind, setKind] = useState(item?.kind ?? "credit_card");
  const isCard = kind === "credit_card";

  return (
    <FormDialog
      triggerLabel={item ? "Editar" : "Agregar deuda"}
      triggerVariant={item ? "ghost" : "outline"}
      triggerSize="xs"
      title={item ? "Editar deuda" : "Agregar deuda"}
      description="Captura tu próximo pago y nosotros calculamos el resto."
      wide
      action={saveDebt}
      testId={item ? undefined : "cifra-add-debt"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormGrid>
        <FormRow name="name" label="Nombre">
          <Input id="name" name="name" defaultValue={item?.name} placeholder="Ej. Tarjeta Banco X" />
        </FormRow>
        <FormRow name="kind" label="Tipo">
          <NativeSelect name="kind" options={DEBT_KINDS} value={kind} onChange={setKind} />
        </FormRow>
        <FormRow name="balance" label="Saldo actual" hint="Lo que debes hoy.">
          <MoneyInput id="balance" name="balance" defaultValue={money(item?.balanceCents)} />
        </FormRow>
        {isCard ? (
          <FormRow name="creditLimit" label="Límite de crédito" hint="Opcional. Calcula cuánto usas.">
            <MoneyInput id="creditLimit" name="creditLimit" defaultValue={money(item?.creditLimitCents)} />
          </FormRow>
        ) : (
          <FormRow name="annualRate" label="Tasa anual" hint="Opcional. Mejora el cálculo de pagos.">
            <PercentInput id="annualRate" name="annualRate" defaultValue={item?.annualRatePct != null ? String(item.annualRatePct) : ""} />
          </FormRow>
        )}

        {isCard && (
          <div className="space-y-2">
            <FormRow name="nextCut" label="Próxima fecha de corte">
              <Input id="nextCut" name="nextCut" type="date" defaultValue={dateValue(item?.nextCutOn)} />
            </FormRow>
            <CheckboxField name="cutLastDay" label="Siempre el último día del mes" defaultChecked={item?.cutLastDay} />
          </div>
        )}
        <div className="space-y-2">
          <FormRow name="nextDue" label={isCard ? "Fecha límite de pago" : "Próxima fecha de pago"}>
            <Input id="nextDue" name="nextDue" type="date" defaultValue={dateValue(item?.nextDueOn)} />
          </FormRow>
          <CheckboxField name="dueLastDay" label="Siempre el último día del mes" defaultChecked={item?.dueLastDay} />
        </div>

        <FormRow
          name="nextPayment"
          label={isCard ? "Pago para no generar intereses" : "Monto de tu pago"}
          hint={isCard ? "Del estado de cuenta; vacío si aún no lo sabes." : undefined}
        >
          <MoneyInput id="nextPayment" name="nextPayment" defaultValue={money(item?.nextPaymentCents)} />
        </FormRow>
        {isCard ? (
          <FormRow name="minPayment" label="Pago mínimo" hint="Opcional.">
            <MoneyInput id="minPayment" name="minPayment" defaultValue={money(item?.minPaymentCents)} />
          </FormRow>
        ) : (
          <FormRow name="endsOn" label="Vigencia" hint="Opcional. Cuándo termina; calcula tus pagos restantes.">
            <Input id="endsOn" name="endsOn" type="date" defaultValue={dateValue(item?.endsOn)} />
          </FormRow>
        )}
        {isCard && (
          <FormRow name="annualRate" label="Tasa anual" hint="Opcional. Mejora el cálculo de pagos.">
            <PercentInput id="annualRate" name="annualRate" defaultValue={item?.annualRatePct != null ? String(item.annualRatePct) : ""} />
          </FormRow>
        )}

        <FullRow className="flex flex-wrap gap-x-6 gap-y-2">
          <CheckboxField
            key={kind}
            name="variablePayment"
            label="El monto cambia cada mes"
            defaultChecked={item ? item.variablePayment : isCard}
          />
          <CheckboxField name="recurring" label="Pago recurrente (cada mes)" defaultChecked={item ? item.recurring : true} />
        </FullRow>
      </FormGrid>
    </FormDialog>
  );
}

export function FixedExpenseDialog({ item }: { item?: FixedItem }) {
  return (
    <FormDialog
      triggerLabel={item ? "Editar" : "Agregar gasto fijo"}
      triggerVariant={item ? "ghost" : "outline"}
      triggerSize="xs"
      title={item ? "Editar gasto fijo" : "Agregar gasto fijo"}
      description="Un gasto que se repite, como la renta, el internet o los salarios."
      wide
      action={saveFixedExpense}
      testId={item ? undefined : "cifra-add-fixed"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormGrid>
        <FormRow name="name" label="Nombre">
          <Input id="name" name="name" defaultValue={item?.name} placeholder="Ej. Renta" />
        </FormRow>
        <FormRow name="category" label="Categoría">
          <NativeSelect name="category" options={EXPENSE_CATEGORIES} defaultValue={item?.category} />
        </FormRow>
        <FormRow name="amount" label="Monto" hint="Vacío si cambia cada mes.">
          <MoneyInput id="amount" name="amount" defaultValue={money(item?.amountCents)} />
        </FormRow>
        <div className="space-y-2">
          <FormRow name="nextDue" label="Próxima fecha de pago">
            <Input id="nextDue" name="nextDue" type="date" defaultValue={dateValue(item?.nextDueOn)} />
          </FormRow>
          <CheckboxField name="dueLastDay" label="Siempre el último día del mes" defaultChecked={item?.dueLastDay} />
        </div>
        <FullRow className="flex flex-wrap gap-x-6 gap-y-2">
          <CheckboxField name="variable" label="El monto cambia cada mes" defaultChecked={item?.variable} />
          <CheckboxField name="recurring" label="Pago recurrente (cada mes)" defaultChecked={item ? item.recurring : true} />
        </FullRow>
      </FormGrid>
    </FormDialog>
  );
}

/** Marcar un pago como pagado, con el monto y la fecha reales. */
export function PayDialog({
  kind,
  id,
  name,
  suggestedCents,
  editable = false,
  today,
}: {
  kind: "debt" | "fixed";
  id: string;
  name: string;
  suggestedCents: number | null;
  /** El monto cambia cada mes: el botón invita a revisarlo antes de pagar. */
  editable?: boolean;
  today: string;
}) {
  return (
    <FormDialog
      triggerLabel={editable ? "Editar y pagar" : "Marcar como pagado"}
      triggerSize="xs"
      title={`Pagar ${name}`}
      wide
      description="Confirma cuánto pagaste y cuándo. Puede ser distinto a lo esperado."
      action={markPaid.bind(null, kind, id)}
      submitLabel="Registrar pago"
      testId={`cifra-pay-${id}`}
    >
      <FormGrid>
        <FormRow name="amount" label="Monto pagado">
          <MoneyInput id="amount" name="amount" defaultValue={money(suggestedCents)} />
        </FormRow>
        <FormRow name="date" label="Fecha de pago">
          <Input id="date" name="date" type="date" defaultValue={today} />
        </FormRow>
      </FormGrid>
    </FormDialog>
  );
}

/** Capturar el monto de un pago que estaba por confirmar. */
export function AmountDialog({
  kind,
  id,
  name,
}: {
  kind: "debt" | "fixed";
  id: string;
  name: string;
}) {
  const isDebt = kind === "debt";
  return (
    <FormDialog
      triggerLabel="Capturar monto"
      triggerVariant="secondary"
      triggerSize="xs"
      title={isDebt ? `Estado de cuenta de ${name}` : `Monto de ${name}`}
      description={isDebt ? "Captura lo que dice tu estado de cuenta." : "Captura lo que dice tu recibo."}
      action={setPendingAmount.bind(null, kind, id)}
      testId={`cifra-capture-${id}`}
    >
      <FormRow name="amount" label={isDebt ? "Pago para no generar intereses" : "Monto"}>
        <MoneyInput id="amount" name="amount" />
      </FormRow>
      {isDebt && (
        <>
          <FormRow name="minPayment" label="Pago mínimo" hint="Opcional.">
            <MoneyInput id="minPayment" name="minPayment" />
          </FormRow>
          <FormRow name="balance" label="Saldo actual" hint="Opcional. Actualízalo si cambió.">
            <MoneyInput id="balance" name="balance" />
          </FormRow>
        </>
      )}
    </FormDialog>
  );
}
