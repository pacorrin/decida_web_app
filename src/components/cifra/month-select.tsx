"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Elige cualquier mes del año que se está viendo; `period` es «AAAA-MM». */
export function MonthSelect({ period }: { period: string }) {
  const router = useRouter();
  const year = period.slice(0, 4);
  const options = MONTHS.map((label, i) => ({
    code: `${year}-${String(i + 1).padStart(2, "0")}`,
    label: `${label} de ${year}`,
  }));

  return (
    <h2 id="movs" className="text-lg font-semibold tracking-tight">
      <Select
        items={options.map((o) => ({ value: o.code, label: o.label }))}
        value={period}
        onValueChange={(next) => next && router.push(`/cuenta/cifra/movimientos?mes=${next}`)}
      >
        <SelectTrigger
          aria-label={`Mes de ${year}`}
          className="h-auto cursor-pointer gap-2 border-0 px-2 py-1 text-lg font-semibold tracking-tight hover:bg-muted dark:bg-transparent dark:hover:bg-muted"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start" className="min-w-52">
          {options.map((o) => (
            <SelectItem key={o.code} value={o.code}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </h2>
  );
}
