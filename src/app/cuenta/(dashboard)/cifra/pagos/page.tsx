import Link from "next/link";
import { PaymentList } from "@/components/cifra/payment-list";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCifraAccess } from "@/lib/cifra/access";
import {
  addDays,
  compareDates,
  formatDateInput,
  formatFullDate,
  parseDateInput,
  todayInMexico,
} from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import { getPaymentsReport } from "@/lib/cifra/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pagos | Cifra | Decida" };

const PRESETS = [7, 15, 30, 60, 90] as const;
const MAX_RANGE_DAYS = 366;

export default async function CifraPagosPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; desde?: string; hasta?: string }>;
}) {
  const access = await getCifraAccess();
  if (!access.ok) return null;

  const today = todayInMexico();
  const q = await searchParams;

  const customFrom = q.desde ? parseDateInput(q.desde) : null;
  const customTo = q.hasta ? parseDateInput(q.hasta) : null;
  const custom =
    customFrom && customTo && compareDates(customFrom, customTo) <= 0 &&
    compareDates(customTo, addDays(customFrom, MAX_RANGE_DAYS)) <= 0;

  const presetDays = (PRESETS as readonly number[]).includes(Number(q.dias)) ? Number(q.dias) : 30;
  const from = custom ? customFrom! : today;
  const to = custom ? customTo! : addDays(today, presetDays);

  const { payments, totals } = await getPaymentsReport(access.userId, { today, from, to });
  const short = totals.differenceCents < 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">¿Qué tengo que pagar?</h2>
        <p className="text-sm text-muted-foreground">
          Del {formatFullDate(from)} al {formatFullDate(to)}. Los vencidos siempre aparecen primero.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Periodo">
        {PRESETS.map((n) => (
          <Link
            key={n}
            href={`/cuenta/cifra/pagos?dias=${n}`}
            aria-current={!custom && presetDays === n ? "true" : undefined}
            className={cn(
              buttonVariants({ variant: !custom && presetDays === n ? "default" : "outline", size: "sm" }),
            )}
          >
            {n} días
          </Link>
        ))}
      </div>

      <form action="/cuenta/cifra/pagos" className="flex flex-wrap items-end gap-3" data-testid="cifra-range-form">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Desde</span>
          <Input type="date" name="desde" defaultValue={formatDateInput(from)} className="w-40" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Hasta</span>
          <Input type="date" name="hasta" defaultValue={formatDateInput(to)} className="w-40" />
        </label>
        <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Ver periodo
        </button>
      </form>
      {(q.desde || q.hasta) && !custom && (
        <p role="alert" className="text-sm text-destructive">
          Revisa las fechas: «Desde» debe ser anterior a «Hasta» y el periodo no puede pasar de un año.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3" data-testid="cifra-report-totals">
        <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-4">
          <p className="text-sm text-muted-foreground">Total por pagar</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatMxn(totals.knownCents)}</p>
          {totals.unknownCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              + {totals.unknownCount} {totals.unknownCount === 1 ? "pago por confirmar" : "pagos por confirmar"}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-4">
          <p className="text-sm text-muted-foreground">Saldo en tus cuentas</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatMxn(totals.accountsCents)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-accent/30 px-5 py-4">
          <p className="text-sm text-muted-foreground">{short ? "Te faltan" : "Te sobran"}</p>
          <p className={cn("mt-1 text-2xl font-semibold tracking-tight", short ? "text-destructive" : "text-secondary")}>
            {formatMxn(Math.abs(totals.differenceCents))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Solo con los montos que ya conoces.</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="rounded-xl border border-border/80 px-4 py-4 text-sm text-muted-foreground" data-testid="cifra-pending-empty">
          No hay pagos en este periodo.
        </p>
      ) : (
        <PaymentList payments={payments} today={today} />
      )}
      <p className="text-xs text-muted-foreground">
        Los pagos «proyectados» son los siguientes meses de un pago recurrente. Si el monto cambia cada mes,
        quedan por confirmar hasta que captures tu estado de cuenta o tu recibo.
      </p>
    </div>
  );
}
