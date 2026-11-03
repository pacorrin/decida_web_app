"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Mic, PencilLine } from "lucide-react";
import { categoryColor } from "@/lib/cifra/colors";
import { cn } from "@/lib/utils";

type Mode = "foto" | "voz" | "texto";

type Sample = {
  label: string;
  icon: typeof Camera;
  /** Lo que la persona aporta. */
  input: React.ReactNode;
  /** Lo que Cifra propone. */
  amount: string;
  category: { code: string; label: string };
  date: string;
  note: string;
};

const SAMPLES: Record<Mode, Sample> = {
  foto: {
    label: "Foto",
    icon: Camera,
    input: (
      <div className="mx-auto w-full max-w-[12rem] bg-[#f6f6f1] px-4 py-4 text-[13px] leading-5 text-[#3d5c50]">
        <p className="text-center font-semibold text-[#05422c]">GAS EXPRESS</p>
        <p className="text-center">Recarga gas estacionario</p>
        <p className="mt-2 flex justify-between"><span>Gas LP 190 L</span><span>$650.00</span></p>
        <p className="mt-1 flex justify-between font-semibold text-[#05422c]"><span>TOTAL</span><span>$650.00</span></p>
        <p className="mt-2 text-center">28/10/2026</p>
      </div>
    ),
    amount: "$650.00",
    category: { code: "servicios", label: "Servicios" },
    date: "28/10/2026",
    note: "Gas Express, recarga de gas",
  },
  voz: {
    label: "Voz",
    icon: Mic,
    input: (
      <p className="mx-auto max-w-[15rem] text-center text-lg leading-snug text-[#05422c]">
        «Pagué cuatrocientos ochenta de gasolina en la Pemex»
      </p>
    ),
    amount: "$480.00",
    category: { code: "transporte", label: "Transporte" },
    date: "29/10/2026",
    note: "Gasolina, Pemex",
  },
  texto: {
    label: "Texto",
    icon: PencilLine,
    input: <p className="mx-auto max-w-[15rem] text-center text-lg leading-snug text-[#05422c]">súper Walmart 847.50</p>,
    amount: "$847.50",
    category: { code: "alimentos", label: "Alimentos" },
    date: "29/10/2026",
    note: "Súper Walmart",
  },
};

const ORDER: Mode[] = ["foto", "voz", "texto"];

/**
 * La demostración de Cifra: eliges cómo capturar y ves cómo se llena el movimiento propuesto.
 * Sin script se ve ya lleno con el primer ejemplo.
 */
export function TicketDemo() {
  const [mode, setMode] = useState<Mode>("foto");
  const [reading, setReading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sample = SAMPLES[mode];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function choose(next: Mode) {
    if (next === mode) return;
    if (timer.current) clearTimeout(timer.current);
    setMode(next);
    setReading(true);
    timer.current = setTimeout(() => setReading(false), 650);
  }

  return (
    <div data-ui className="w-full max-w-[30rem] rounded-xl bg-white p-4 text-[#05422c] sm:p-5" aria-label="Demostración de la captura inteligente">
      <div role="group" aria-label="Cómo capturar" className="grid grid-cols-3 gap-1 rounded-lg bg-[#f0f5f3] p-1">
        {ORDER.map((m) => {
          const Icon = SAMPLES[m].icon;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => choose(m)}
              className={cn(
                "flex min-h-11 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === m ? "bg-[#05422c] text-white" : "text-[#3d5c50] hover:bg-white",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {SAMPLES[m].label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex min-h-[10.5rem] items-center justify-center rounded-lg bg-[#e8f4fa] px-3 py-4">{sample.input}</div>

      <div className="mt-4 space-y-3" aria-live="polite">
        <p className="text-[13px] font-medium text-[#3d5c50]">{reading ? "Cifra está leyendo…" : "Cifra propone"}</p>
        <div className={cn("grid grid-cols-2 gap-2 transition-opacity duration-300", reading && "opacity-30")}>
          <div className="rounded-lg border border-[#dce8e2] px-3 py-2">
            <p className="text-[13px] text-[#3d5c50]">Monto</p>
            <p className="text-base font-semibold tabular-nums">{sample.amount}</p>
          </div>
          <div className="rounded-lg border border-[#dce8e2] px-3 py-2">
            <p className="text-[13px] text-[#3d5c50]">Fecha</p>
            <p className="text-base font-semibold tabular-nums">{sample.date}</p>
          </div>
          <div className="col-span-2 flex items-center justify-between gap-3 rounded-lg border border-[#dce8e2] px-3 py-2">
            <div className="min-w-0">
              <p className="text-[13px] text-[#3d5c50]">Egreso · nota</p>
              <p className="truncate text-sm font-medium">{sample.note}</p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium", categoryColor("expense", sample.category.code))}>
              {sample.category.label}
            </span>
          </div>
        </div>
        <p className="rounded-lg bg-[#05422c] px-3 py-2.5 text-center text-sm font-medium text-white">Confirmar y registrar</p>
      </div>
      <p className="mt-3 text-[13px] text-[#3d5c50]">Ejemplo ilustrativo</p>
    </div>
  );
}
