import { Banknote, Trash2, Landmark, PiggyBank, NotebookPen, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { accountKindColor, debtKindColor, expenseCategoryColor } from "@/lib/cifra/colors";
import { ActionButton } from "@/components/cifra/form-kit";
import { AccountDialog, DebtDialog, FixedExpenseDialog } from "@/components/cifra/dialogs";
import { getCifraAccess } from "@/lib/cifra/access";
import { ACCOUNT_KINDS, categoryLabel, DEBT_KINDS } from "@/lib/cifra/constants";
import { type CalendarDate, formatDayMonth, formatMonthYear, toDateOnly, todayInMexico } from "@/lib/cifra/dates";
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

const KIND_ICONS = { cash: Banknote, bank: Landmark, savings: PiggyBank, other: Wallet } as const;

function daysUntil(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toDateOnly(to).getTime() - toDateOnly(from).getTime()) / 86_400_000);
}

function dueChip(days: number): { text: string; tone: string } {
  if (days < 0) return { text: days === -1 ? "Venció ayer" : `Venció hace ${-days} días`, tone: "bg-destructive/10 text-destructive" };
  if (days === 0) return { text: "Vence hoy", tone: "bg-secondary/15 text-foreground" };
  if (days === 1) return { text: "Mañana", tone: "bg-secondary/15 text-foreground" };
  if (days <= 7) return { text: `En ${days} días`, tone: "bg-secondary/15 text-foreground" };
  return { text: `En ${days} días`, tone: "bg-muted text-muted-foreground" };
}

function Section({
  title,
  description,
  total,
  add,
  empty,
  children,
}: {
  title: string;
  description: string;
  total?: string;
  add: React.ReactNode;
  empty?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {title}
            {total && <span className="ml-2 font-normal text-muted-foreground tabular-nums">{total}</span>}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {add}
      </div>
      {empty ? (
        <p className="rounded-2xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">{children}</ul>
      )}
    </section>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={cn("flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 text-sm", className)}>
      {children}
    </li>
  );
}

/** Editar y borrar, siempre en la parte de arriba de la tarjeta, junto al nombre. */
function CardActions({ children }: { children: React.ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1.5">{children}</div>;
}

const deleteButton = {
  variant: "outline" as const,
  icon: <Trash2 aria-hidden />,
  className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
};

function Notes({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <NotebookPen className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-label="Observación" />
      <p className="whitespace-pre-line break-words">{text}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export default async function CifraCuentasPage() {
  const access = await getCifraAccess();
  if (!access.ok) return null;
  const today = todayInMexico();
  const { accounts, debts, fixedExpenses } = await getAccountsData(access.userId, today);

  const have = accounts.reduce((sum, a) => sum + a.balanceCents, 0);
  const owe = debts.filter((d) => !d.paidOff).reduce((sum, d) => sum + d.balanceCents, 0);
  const fixedMonthly = fixedExpenses
    .filter((f) => f.active && f.recurring && f.amountCents != null)
    .reduce((sum, f) => sum + (f.amountCents ?? 0), 0);

  return (
    <div className="space-y-10">
      <div className="grid gap-6 rounded-2xl bg-muted/40 p-5 sm:grid-cols-3">
        <Stat label="Tienes en cuentas" value={formatMxn(have)} />
        <Stat label="Debes en total" value={formatMxn(owe)} />
        <Stat label="Gastos fijos al mes" value={formatMxn(fixedMonthly)} />
      </div>

      <Section
        title="Saldos"
        description="Lo que tienes hoy en cuentas y efectivo."
        add={<AccountDialog />}
        empty={accounts.length === 0 ? "Aún no agregas ningún saldo." : undefined}
      >
        {accounts.map((a) => {
          const Icon = KIND_ICONS[a.kind as keyof typeof KIND_ICONS] ?? Wallet;
          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.name}</p>
                    <Chip className={cn("mt-1 inline-block", accountKindColor(a.kind))}>{label(ACCOUNT_KINDS, a.kind)}</Chip>
                  </div>
                </div>
                <CardActions>
                  <AccountDialog item={a} />
                  <ActionButton action={deleteAccount.bind(null, a.id)} label="Borrar" {...deleteButton} confirmText={`¿Borrar «${a.name}»?`} successMessage="Saldo borrado" />
                </CardActions>
              </div>
              <p className="text-2xl font-semibold tabular-nums">{formatMxn(a.balanceCents)}</p>
              <Notes text={a.notes} />
            </Card>
          );
        })}
      </Section>

      <Section
        title="Deudas"
        description="Lo que debes, con tu próximo pago y sus fechas."
        total={debts.length > 0 ? formatMxn(owe) : undefined}
        add={<DebtDialog />}
        empty={debts.length === 0 ? "Aún no agregas ninguna deuda." : undefined}
      >
        {debts.map((d) => {
          const usage = creditUtilizationPct(d.balanceCents, d.creditLimitCents);
          const chip = d.nextDueOn ? dueChip(daysUntil(today, d.nextDueOn)) : null;
          const payoff = payoffText(d.payoff);
          return (
            <Card key={d.id} className={cn(d.paidOff && "opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-medium">{d.paidOff ? `${d.name} (liquidada)` : d.name}</p>
                <CardActions>
                  <DebtDialog item={d} />
                  <ActionButton action={deleteDebt.bind(null, d.id)} label="Borrar" {...deleteButton} confirmText={`¿Borrar «${d.name}»?`} successMessage="Deuda borrada" />
                </CardActions>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <Chip className={debtKindColor(d.kind)}>{label(DEBT_KINDS, d.kind)}</Chip>
                  {d.annualRatePct != null && <Chip>{d.annualRatePct}% anual</Chip>}
                  {!d.recurring && <Chip>Pago único</Chip>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-xl font-semibold tabular-nums">{formatMxn(d.balanceCents)}</p>
                </div>
              </div>

              {d.nextDueOn ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Próximo pago · {formatDayMonth(d.nextDueOn)}</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {d.nextPaymentCents != null ? formatMxn(d.nextPaymentCents) : "Por confirmar"}
                    </p>
                    {d.minPaymentCents != null && (
                      <p className="text-xs text-muted-foreground">Mínimo {formatMxn(d.minPaymentCents)}</p>
                    )}
                  </div>
                  {chip && (
                    <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", chip.tone)}>
                      {chip.text}
                    </span>
                  )}
                </div>
              ) : (
                !d.paidOff && <p className="rounded-xl bg-muted/40 px-4 py-3 text-muted-foreground">Sin pago pendiente</p>
              )}

              {usage != null && d.creditLimitCents != null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usas {usage}% de tu límite</span>
                    <span className="tabular-nums">
                      {formatMxn(Math.max(0, d.creditLimitCents - d.balanceCents))} disponibles
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Uso del límite: ${usage}%`}>
                    <div
                      className={cn("h-full rounded-full", usage >= 70 ? "bg-destructive" : usage >= 30 ? "bg-secondary" : "bg-primary")}
                      style={{ width: `${Math.min(100, usage)}%` }}
                    />
                  </div>
                </div>
              )}

              {(d.nextCutOn || payoff) && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {d.nextCutOn && <p>Próximo corte: {formatDayMonth(d.nextCutOn)}</p>}
                  {payoff && <p>{payoff}</p>}
                </div>
              )}

              <Notes text={d.notes} />
            </Card>
          );
        })}
      </Section>

      <Section
        title="Gastos fijos"
        description="Lo que pagas con regularidad, como renta, servicios, salarios o suscripciones."
        total={fixedExpenses.length > 0 ? `${formatMxn(fixedMonthly)} al mes` : undefined}
        add={<FixedExpenseDialog />}
        empty={fixedExpenses.length === 0 ? "Aún no agregas ningún gasto fijo." : undefined}
      >
        {fixedExpenses.map((f) => {
          const chip = f.nextDueOn ? dueChip(daysUntil(today, f.nextDueOn)) : null;
          return (
            <Card key={f.id} className={cn(!f.active && "opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-medium">{f.active ? f.name : `${f.name} (pagado)`}</p>
                <CardActions>
                  <FixedExpenseDialog item={f} />
                  <ActionButton action={deleteFixedExpense.bind(null, f.id)} label="Borrar" {...deleteButton} confirmText={`¿Borrar «${f.name}»?`} successMessage="Gasto borrado" />
                </CardActions>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <Chip className={expenseCategoryColor(f.category)}>{categoryLabel("expense", f.category)}</Chip>
                  <Chip>{f.recurring ? "Cada mes" : "Pago único"}</Chip>
                </div>
                <p className="text-xl font-semibold tabular-nums">
                  {f.amountCents != null ? formatMxn(f.amountCents) : "Por confirmar"}
                </p>
              </div>
              <Notes text={f.notes} />
              {f.nextDueOn && chip && (
                <div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-medium", chip.tone)}>
                    {formatDayMonth(f.nextDueOn)} · {chip.text.toLowerCase()}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </Section>
    </div>
  );
}
