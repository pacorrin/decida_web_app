import { ArrowRight, Mic, ScanLine } from "lucide-react";
import { categoryColor, debtKindColor } from "@/lib/cifra/colors";
import { cn } from "@/lib/utils";

/**
 * Maquetas ilustrativas de la herramienta, armadas con los mismos colores y etiquetas que la
 * app real. Los datos son de ejemplo y se anuncian como tales.
 */

const FIGURE = "rounded-xl border border-border/80 bg-card p-5 sm:p-6";

function Caption({ children = "Ejemplo ilustrativo" }: { children?: string }) {
  return <figcaption className="mt-4 text-xs text-muted-foreground">{children}</figcaption>;
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>{children}</span>;
}

export function SummaryMock() {
  return (
    <figure className={FIGURE} aria-label="Ejemplo ilustrativo del resumen de Cifra">
      <p className="text-sm font-medium text-muted-foreground">Resumen del mes</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Ingresos", "$18,500.00", "text-primary"],
          ["Egresos", "$11,240.50", "text-primary"],
          ["Balance", "$7,259.50", "text-primary"],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border border-border/70 bg-accent/30 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("mt-0.5 text-sm font-semibold tabular-nums sm:text-base", tone)}>{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">Próximos pagos</p>
      <ul className="mt-2 space-y-2">
        {[
          ["Tarjeta Azul", "credit_card", "Tarjeta de crédito", "Vence en 3 días", "$1,850.00"],
          ["Renta", "other", "Gasto fijo", "Vence en 5 días", "$6,500.00"],
        ].map(([name, kind, type, when, amount]) => (
          <li key={name} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Chip className={debtKindColor(kind)}>{type}</Chip>
                <span className="text-xs text-muted-foreground">{when}</span>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{amount}</p>
          </li>
        ))}
      </ul>
      <Caption />
    </figure>
  );
}

function Receipt() {
  return (
    <div className="mx-auto w-full max-w-[13rem] rounded-md border border-dashed border-border bg-background px-4 py-4 text-[11px] leading-5 text-muted-foreground" aria-hidden>
      <p className="text-center font-semibold text-foreground">GAS EXPRESS</p>
      <p className="text-center">Recarga gas estacionario</p>
      <div className="my-2 border-t border-dashed border-border" />
      <div className="flex justify-between"><span>Gas LP 190 L</span><span>$650.00</span></div>
      <div className="flex justify-between"><span>IVA incluido</span><span>—</span></div>
      <div className="my-2 border-t border-dashed border-border" />
      <div className="flex justify-between font-semibold text-foreground"><span>TOTAL</span><span>$650.00</span></div>
      <p className="mt-2 text-center">28/10/2026</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm">{children}</div>
    </div>
  );
}

export function CaptureMock() {
  return (
    <figure className={FIGURE} aria-label="Ejemplo ilustrativo: de un ticket a un movimiento propuesto">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1.15fr]">
        <div className="space-y-3">
          <Receipt />
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary" aria-hidden>
            <Mic className="size-3.5" /> «Fue el gas de la casa»
          </div>
        </div>
        <ArrowRight className="mx-auto size-5 rotate-90 text-muted-foreground md:rotate-0" aria-hidden />
        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/40 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <ScanLine className="size-3.5" aria-hidden /> Cifra propone
          </p>
          <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium" aria-hidden>
            <span className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground">Egreso</span>
            <span className="px-2.5 py-1 text-muted-foreground">Ingreso</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Monto"><span className="tabular-nums">$650.00</span></Field>
            <Field label="Fecha">28/10/2026</Field>
          </div>
          <Field label="Categoría">
            <Chip className={categoryColor("expense", "servicios")}>Servicios</Chip>
          </Field>
          <Field label="Nota">Gas Express, recarga de gas</Field>
          <div className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground" aria-hidden>
            Confirmar y registrar
          </div>
        </div>
      </div>
      <Caption />
    </figure>
  );
}

export function BreakdownMock() {
  const rows: [string, string, number, string][] = [
    ["vivienda", "Vivienda", 58, "$6,500.00"],
    ["alimentos", "Alimentos", 22, "$2,480.00"],
    ["transporte", "Transporte", 12, "$1,350.00"],
    ["servicios", "Servicios", 8, "$910.50"],
  ];
  return (
    <figure className={FIGURE} aria-label="Ejemplo ilustrativo de egresos por categoría">
      <p className="text-sm font-medium text-muted-foreground">Egresos por categoría</p>
      <ul className="mt-4 space-y-3">
        {rows.map(([code, label, pct, amount]) => (
          <li key={code} className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <Chip className={categoryColor("expense", code)}>{label}</Chip>
              <span className="tabular-nums">
                <span className="font-medium">{amount}</span>
                <span className="ml-2 text-xs text-muted-foreground">{pct}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <Caption />
    </figure>
  );
}

export function PaymentsMock() {
  const rows: [string, string, string, string, string, string][] = [
    ["Tarjeta Azul", "credit_card", "Tarjeta de crédito", "Vencido hace 1 día", "$1,850.00", "text-amber-800"],
    ["Préstamo del auto", "vehicle", "Automóvil", "Vence en 6 días", "$3,200.00", "text-muted-foreground"],
    ["Tarjeta Oro", "credit_card", "Tarjeta de crédito", "Por confirmar", "—", "text-muted-foreground"],
    ["Internet", "other", "Gasto fijo", "Vence en 12 días", "$599.00", "text-muted-foreground"],
  ];
  return (
    <figure className={FIGURE} aria-label="Ejemplo ilustrativo del reporte de pagos">
      <p className="text-sm font-medium text-muted-foreground">¿Qué tengo que pagar? · próximos 30 días</p>
      <ul className="mt-3 space-y-2">
        {rows.map(([name, kind, type, when, amount, whenTone]) => (
          <li key={name} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Chip className={debtKindColor(kind)}>{type}</Chip>
                <span className={cn("text-xs", whenTone)}>{when}</span>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{amount}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
        {[
          ["Por pagar", "$5,649.00"],
          ["En tus cuentas", "$8,300.00"],
          ["Te sobra", "$2,651.00"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-primary">{v}</dd>
          </div>
        ))}
      </dl>
      <Caption />
    </figure>
  );
}
