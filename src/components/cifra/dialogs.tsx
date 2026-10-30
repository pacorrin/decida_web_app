import { Input } from "@/components/ui/input";
import {
  ACCOUNT_KINDS,
  DEBT_KINDS,
  EXPENSE_CATEGORIES,
} from "@/lib/cifra/constants";
import { centsToInputValue } from "@/lib/cifra/money";
import {
  saveAccount,
  saveDebt,
  saveFixedExpense,
} from "@/app/cuenta/(dashboard)/cifra/actions";
import { FormDialog, FormRow, NativeSelect } from "./form-kit";

type AccountItem = { id: string; name: string; kind: string; balanceCents: number };
type DebtItem = {
  id: string;
  name: string;
  kind: string;
  balanceCents: number;
  monthlyPaymentCents: number;
  annualRatePct: number | null;
  creditLimitCents: number | null;
  cutDay: number | null;
  dueDay: number;
};
type FixedItem = { id: string; name: string; category: string; amountCents: number; dueDay: number };

const money = (cents: number | null | undefined) =>
  cents == null ? "" : centsToInputValue(cents);

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
      <FormRow name="balance" label="Saldo actual (MXN)">
        <Input id="balance" name="balance" inputMode="decimal" defaultValue={money(item?.balanceCents)} placeholder="0.00" />
      </FormRow>
    </FormDialog>
  );
}

export function DebtDialog({ item }: { item?: DebtItem }) {
  return (
    <FormDialog
      triggerLabel={item ? "Editar" : "Agregar deuda"}
      triggerVariant={item ? "ghost" : "outline"}
      triggerSize="xs"
      title={item ? "Editar deuda" : "Agregar deuda"}
      description="Lo que debes y cuándo toca pagarlo."
      action={saveDebt}
      testId={item ? undefined : "cifra-add-debt"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormRow name="name" label="Nombre">
        <Input id="name" name="name" defaultValue={item?.name} placeholder="Ej. Tarjeta Banco X" />
      </FormRow>
      <FormRow name="kind" label="Tipo">
        <NativeSelect name="kind" options={DEBT_KINDS} defaultValue={item?.kind} />
      </FormRow>
      <FormRow name="balance" label="Saldo que debes (MXN)">
        <Input id="balance" name="balance" inputMode="decimal" defaultValue={money(item?.balanceCents)} placeholder="0.00" />
      </FormRow>
      <FormRow name="monthlyPayment" label="Pago mensual (MXN)" hint="El pago mínimo o la mensualidad.">
        <Input id="monthlyPayment" name="monthlyPayment" inputMode="decimal" defaultValue={money(item?.monthlyPaymentCents)} placeholder="0.00" />
      </FormRow>
      <div className="grid grid-cols-2 gap-3">
        <FormRow name="dueDay" label="Día de pago">
          <Input id="dueDay" name="dueDay" inputMode="numeric" defaultValue={item?.dueDay} placeholder="1 a 31" />
        </FormRow>
        <FormRow name="cutDay" label="Día de corte" hint="Opcional.">
          <Input id="cutDay" name="cutDay" inputMode="numeric" defaultValue={item?.cutDay ?? ""} placeholder="1 a 31" />
        </FormRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormRow name="annualRate" label="Tasa anual (%)" hint="Opcional.">
          <Input id="annualRate" name="annualRate" inputMode="decimal" defaultValue={item?.annualRatePct ?? ""} placeholder="0" />
        </FormRow>
        <FormRow name="creditLimit" label="Límite de crédito" hint="Opcional.">
          <Input id="creditLimit" name="creditLimit" inputMode="decimal" defaultValue={money(item?.creditLimitCents)} placeholder="0.00" />
        </FormRow>
      </div>
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
      description="Un gasto que se repite cada mes, como la renta o el internet."
      action={saveFixedExpense}
      testId={item ? undefined : "cifra-add-fixed"}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormRow name="name" label="Nombre">
        <Input id="name" name="name" defaultValue={item?.name} placeholder="Ej. Renta" />
      </FormRow>
      <FormRow name="category" label="Categoría">
        <NativeSelect name="category" options={EXPENSE_CATEGORIES} defaultValue={item?.category} />
      </FormRow>
      <div className="grid grid-cols-2 gap-3">
        <FormRow name="amount" label="Monto (MXN)">
          <Input id="amount" name="amount" inputMode="decimal" defaultValue={money(item?.amountCents)} placeholder="0.00" />
        </FormRow>
        <FormRow name="dueDay" label="Día de pago">
          <Input id="dueDay" name="dueDay" inputMode="numeric" defaultValue={item?.dueDay} placeholder="1 a 31" />
        </FormRow>
      </div>
    </FormDialog>
  );
}
