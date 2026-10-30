import Link from "next/link";
import { PaymentList } from "@/components/cifra/payment-list";
import { getCifraAccess } from "@/lib/cifra/access";
import { todayInMexico } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { getOverview } from "@/lib/cifra/queries";
import { cn } from "@/lib/utils";

const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" });

function Stat({ label, value, tone, testId }: { label: string; value: string; tone?: "positive" | "negative"; testId: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-4" data-testid={testId}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "positive" && "text-secondary",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default async function CifraResumenPage() {
  const access = await getCifraAccess();
  if (!access.ok) return null; // el layout ya muestra el aviso
  const today = todayInMexico();
  const o = await getOverview(access.userId, today);
  const monthLabel = monthName.format(new Date(Date.UTC(today.year, today.month - 1, 1)));
  const empty = o.upcoming.length === 0;

  return (
    <div className="space-y-8">
      <section aria-labelledby="mes" className="space-y-3">
        <h2 id="mes" className="text-sm font-medium text-muted-foreground first-letter:uppercase">
          {monthLabel}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Ingresos" value={formatMxn(o.incomeCents)} tone={o.incomeCents > 0 ? "positive" : undefined} testId="cifra-income" />
          <Stat label="Egresos" value={formatMxn(o.expenseCents)} testId="cifra-expense" />
          <Stat
            label="Balance del mes"
            value={formatMxn(o.balanceCents)}
            tone={o.balanceCents < 0 ? "negative" : o.balanceCents > 0 ? "positive" : undefined}
            testId="cifra-balance"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Lo que debes" value={formatMxn(o.debtTotalCents)} testId="cifra-debt-total" />
          <Stat label="Saldo en tus cuentas" value={formatMxn(o.accountsTotalCents)} testId="cifra-accounts-total" />
        </div>
      </section>

      <section aria-labelledby="proximos" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="proximos" className="text-lg font-semibold tracking-tight">
            Próximos pagos (30 días)
          </h2>
          <Link href="/cuenta/cifra/pagos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Ver reporte de pagos
          </Link>
        </div>
        {empty ? (
          <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-pending-empty">
            No tienes pagos en los próximos 30 días. Si aún no registras tus deudas y gastos fijos,{" "}
            <Link href="/cuenta/cifra/cuentas" className="font-medium text-primary underline-offset-4 hover:underline">
              agrégalos en Mis cuentas
            </Link>
            .
          </p>
        ) : (
          <PaymentList payments={o.upcoming} today={today} />
        )}
      </section>
    </div>
  );
}
