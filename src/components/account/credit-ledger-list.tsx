import type { credit_ledger } from "@/generated/prisma/client";
import { formatCredits } from "@/lib/credits/costs";

const TYPE_LABEL: Record<credit_ledger["cled_type"], string> = {
  purchase: "Compra",
  welcome_bonus: "Bienvenida",
  subscription_grant: "Renovación del plan",
  expire: "Créditos vencidos",
  spend: "Gasto",
  refund: "Reembolso",
  adjustment: "Ajuste",
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function CreditLedgerList({ entries }: { entries: credit_ledger[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="credits-ledger-empty">
        Aún no hay movimientos. Cuando compres o uses créditos, aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/80" data-testid="credits-ledger">
      {entries.map((entry) => {
        const positive = entry.cled_amount >= 0;
        return (
          <li
            key={entry.cled_id}
            className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
          >
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">
                {TYPE_LABEL[entry.cled_type]}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatWhen(entry.cled_created_at)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={
                  positive
                    ? "font-semibold text-secondary"
                    : "font-semibold text-foreground"
                }
              >
                {positive ? "+" : ""}
                {formatCredits(entry.cled_amount)} créditos
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo: {formatCredits(entry.cled_balance_after)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
