import { ActionButton } from "@/components/cifra/form-kit";
import { AccountDialog, DebtDialog, FixedExpenseDialog } from "@/components/cifra/dialogs";
import { getCifraAccess } from "@/lib/cifra/access";
import { ACCOUNT_KINDS, categoryLabel, DEBT_KINDS } from "@/lib/cifra/constants";
import { formatDayMonth, formatMonthYear, todayInMexico } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { creditUtilizationPct, type PayoffEstimate } from "@/lib/cifra/payoff";
import { getAccountsData } from "@/lib/cifra/queries";
import { deleteAccount, deleteDebt, deleteFixedExpense } from "../actions";

const label = (list: readonly { code: string; label: string }[], code: string) =>
  list.find((i) => i.code === code)?.label ?? code;

const BASIS = {
  vigencia: "según tu vigencia",
  promedio: "según el promedio de tus pagos",
  pago: "según tu pago actual",
} as const;

function payoffText(payoff: PayoffEstimate): string | null {
  if (!payoff) return null;
  if (payoff.kind === "never") {
    return "Con ese pago no alcanzas a cubrir los intereses; sube tu pago para poder liquidarla.";
  }
  const when = payoff.endsOn ? ` (≈ ${formatMonthYear(payoff.endsOn)})` : "";
  const n = payoff.payments;
  return `Estimado: ${n === 1 ? "te falta 1 pago" : `te faltan ~${n} pagos`}${when}, ${BASIS[payoff.basis]}.`;
}

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
  lines,
  amount,
  actions,
}: {
  title: string;
  lines: (string | null)[];
  amount: string;
  actions: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0 space-y-0.5">
        <p className="truncate font-medium">{title}</p>
        {lines.filter(Boolean).map((line, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            {line}
          </p>
        ))}
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
  const { accounts, debts, fixedExpenses } = await getAccountsData(access.userId, todayInMexico());

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
            lines={[label(ACCOUNT_KINDS, a.kind)]}
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
        description="Lo que debes, con tu próximo pago y sus fechas."
        add={<DebtDialog />}
        empty={debts.length === 0 ? "Aún no agregas ninguna deuda." : undefined}
      >
        {debts.map((d) => {
          const usage = creditUtilizationPct(d.balanceCents, d.creditLimitCents);
          const payment =
            d.nextPaymentCents != null ? formatMxn(d.nextPaymentCents) : "por confirmar";
          return (
            <Row
              key={d.id}
              title={d.paidOff ? `${d.name} (liquidada)` : d.name}
              lines={[
                label(DEBT_KINDS, d.kind) +
                  (d.annualRatePct != null ? ` · ${d.annualRatePct}% anual` : "") +
                  (d.recurring ? "" : " · pago único"),
                d.nextDueOn
                  ? `Próximo pago: ${formatDayMonth(d.nextDueOn)} · ${payment}${d.minPaymentCents != null ? ` (mínimo ${formatMxn(d.minPaymentCents)})` : ""}`
                  : d.paidOff
                    ? null
                    : "Sin pago pendiente",
                d.nextCutOn ? `Próximo corte: ${formatDayMonth(d.nextCutOn)}` : null,
                usage != null && d.creditLimitCents != null
                  ? `Usas ${usage}% de tu límite (te quedan ${formatMxn(Math.max(0, d.creditLimitCents - d.balanceCents))} disponibles)`
                  : null,
                payoffText(d.payoff),
              ]}
              amount={formatMxn(d.balanceCents)}
              actions={
                <>
                  <DebtDialog item={d} />
                  <ActionButton action={deleteDebt.bind(null, d.id)} label="Borrar" variant="ghost" confirmText={`¿Borrar «${d.name}»?`} successMessage="Deuda borrada" />
                </>
              }
            />
          );
        })}
      </Section>

      <Section
        title="Gastos fijos"
        description="Lo que pagas con regularidad, como renta, servicios, salarios o suscripciones."
        add={<FixedExpenseDialog />}
        empty={fixedExpenses.length === 0 ? "Aún no agregas ningún gasto fijo." : undefined}
      >
        {fixedExpenses.map((f) => (
          <Row
            key={f.id}
            title={f.active ? f.name : `${f.name} (pagado)`}
            lines={[
              categoryLabel("expense", f.category) + (f.recurring ? " · cada mes" : " · pago único"),
              f.nextDueOn ? `Próximo pago: ${formatDayMonth(f.nextDueOn)}` : null,
            ]}
            amount={f.amountCents != null ? formatMxn(f.amountCents) : "Por confirmar"}
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
