"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const KEY = "decida:cuenta:cifra-aviso-cerrado";
const EVENT = "decida:cifra-aviso";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** El almacenamiento puede no estar disponible (ventana privada, datos bloqueados): en ese caso el aviso se ve y se cierra solo en esta visita. */
function readClosed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return closedThisVisit;
  }
}

let closedThisVisit = false;

/** Aviso de Cifra en la pantalla principal; se puede cerrar y no vuelve a salir en este navegador. */
export function CifraNotice() {
  const closed = useSyncExternalStore(subscribe, readClosed, () => true);
  if (closed) return null;

  function close() {
    closedThisVisit = true;
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // sin almacenamiento: queda cerrado hasta recargar
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <aside aria-labelledby="cifra-heading" data-cifra-notice className="relative space-y-3 rounded-2xl bg-accent p-5 pr-12">
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar aviso de Cifra"
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <X className="size-4" aria-hidden />
      </button>
      <h2 id="cifra-heading" className="text-lg font-semibold tracking-tight text-primary">
        Cifra
      </h2>
      <p className="text-base text-foreground">Tus finanzas personales: gastos, tarjetas y pagos del mes.</p>
      <Link href="/cuenta/cifra" className={buttonVariants({ size: "sm" })}>
        Abrir Cifra
      </Link>
    </aside>
  );
}
