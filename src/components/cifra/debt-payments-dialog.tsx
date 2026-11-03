"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/cifra/dates";
import { formatMxn } from "@/lib/cifra/money";
import type { DebtPayment } from "@/lib/cifra/queries";

/** Historial de pagos y transferencias hechos a una deuda o tarjeta, del más reciente al más antiguo. */
export function DebtPaymentsDialog({
  id,
  name,
  payments,
}: {
  id: string;
  name: string;
  payments: DebtPayment[];
}) {
  const totalPaid = payments.reduce((n, p) => n + p.amountCents, 0);
  const totalApplied = payments.reduce((n, p) => n + p.appliedCents, 0);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="xs" data-testid={`cifra-payments-${id}`} />}>
        <History aria-hidden />
        Ver pagos
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogTitle>Pagos a {name}</DialogTitle>
        <DialogDescription>Todo lo que has pagado a esta deuda, del más reciente al más antiguo.</DialogDescription>
        {payments.length === 0 ? (
          <p className="rounded-xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground" data-testid="cifra-payments-empty">
            Aún no registras pagos a esta deuda. Cuando marques uno como pagado aparecerá aquí.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-500/15 px-4 py-3">
                <p className="text-xs text-muted-foreground">Has pagado</p>
                <p className="text-lg font-semibold tabular-nums" data-testid="cifra-payments-total">{formatMxn(totalPaid)}</p>
              </div>
              <div className="rounded-xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Bajó tu saldo</p>
                <p className="text-lg font-semibold tabular-nums">{formatMxn(totalApplied)}</p>
              </div>
            </div>
            <ul className="divide-y divide-border/80 rounded-2xl border border-border/80" data-testid="cifra-payments-list">
              {payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{formatFullDate(p.date)}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                      {p.isTransfer && <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">Transferencia</span>}
                      {p.interestCents > 0 && <span>Intereses {formatMxn(p.interestCents)}</span>}
                      {p.untrackedCents > 0 && <span>Compras sin detalle {formatMxn(p.untrackedCents)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatMxn(p.amountCents)}</p>
                    {p.appliedCents !== p.amountCents && (
                      <p className="text-xs text-muted-foreground tabular-nums">Bajó el saldo {formatMxn(p.appliedCents)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
