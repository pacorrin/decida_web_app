import { ActionButton } from "@/components/cifra/form-kit";
import { AccountDialog, DebtDialog, FixedExpenseDialog } from "@/components/cifra/dialogs";
import { getCifraAccess } from "@/lib/cifra/access";
import {
  ACCOUNT_KINDS,
  categoryLabel,
  DEBT_KINDS,
} from "@/lib/cifra/constants";
import { formatMxn } from "@/lib/cifra/money";
import { getAccountsData } from "@/lib/cifra/queries";
import { deleteAccount, deleteDebt, deleteFixedExpense } from "../actions";

const label = (list: readonly { code: string; label: string }[], code: string) =>
  list.find((i) => i.code === code)?.label ?? code;

function Section({
  title,
  description,
  add,
  empty,
  children,
}: {
  title: string;
  description: string;
  add: React.ReactNode;
  empty?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {add}
      </div>
      {empty ? (
        <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border/80 rounded-2xl border border-border/80">{children}</ul>
      )}
    </section>
  );
}

function Row({
  title,
  detail,
  amount,
  actions,
}: {
  title: string;
  detail: string;
  amount: string;
  actions: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium tabular-nums">{amount}</span>
        {actions}
      </div>
    </li>
  );
}

export default async function CifraCuentasPage() {
  const access = await getCifraAccess();
  if (!access.ok) return null;
  const { accounts, debts, fixedExpenses } = await getAccountsData(access.userId);

  return (
    <div className="space-y-10">
      <Section
        title="Saldos"
        description="Lo que tienes hoy en cuentas y efectivo."
        add={<AccountDialog />}
        empty={accounts.length === 0 ? "Aún no agregas ningún saldo." : undefined}
      >
        {accounts.map((a) => (
          <Row
            key={a.id}
            title={a.name}
            detail={label(ACCOUNT_KINDS, a.kind)}
            amount={formatMxn(a.balanceCents)}
            actions={
              <>
                <AccountDialog item={a} />
                <ActionButton action={deleteAccount.bind(null, a.id)} label="Borrar" variant="ghost" confirmText={`¿Borrar «${a.name}»?`} successMessage="Saldo borrado" />
              </>
            }
          />
        ))}
      </Section>

      <Section
        title="Deudas"
        description="Lo que debes, con su pago mensual y sus fechas."
        add={<DebtDialog />}
        empty={debts.length === 0 ? "Aún no agregas ninguna deuda." : undefined}
      >
        {debts.map((d) => (
          <Row
            key={d.id}
            title={d.paidOff ? `${d.name} (liquidada)` : d.name}
            detail={`${label(DEBT_KINDS, d.kind)} · paga ${formatMxn(d.monthlyPaymentCents)} el día ${d.dueDay}${d.cutDay ? ` · corte el ${d.cutDay}` : ""}${d.annualRatePct != null ? ` · ${d.annualRatePct}% anual` : ""}`}
            amount={formatMxn(d.balanceCents)}
            actions={
              <>
                <DebtDialog item={d} />
                <ActionButton action={deleteDebt.bind(null, d.id)} label="Borrar" variant="ghost" confirmText={`¿Borrar «${d.name}»?`} successMessage="Deuda borrada" />
              </>
            }
          />
        ))}
      </Section>

      <Section
        title="Gastos fijos"
        description="Lo que pagas cada mes, como renta, servicios o suscripciones."
        add={<FixedExpenseDialog />}
        empty={fixedExpenses.length === 0 ? "Aún no agregas ningún gasto fijo." : undefined}
      >
        {fixedExpenses.map((f) => (
          <Row
            key={f.id}
            title={f.name}
            detail={`${categoryLabel("expense", f.category)} · día ${f.dueDay}`}
            amount={formatMxn(f.amountCents)}
            actions={
              <>
                <FixedExpenseDialog item={f} />
                <ActionButton action={deleteFixedExpense.bind(null, f.id)} label="Borrar" variant="ghost" confirmText={`¿Borrar «${f.name}»?`} successMessage="Gasto borrado" />
              </>
            }
          />
        ))}
      </Section>
    </div>
  );
}
