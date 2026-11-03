"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Al cambiar de página vuelve al inicio. Next omite ese salto cuando el primer elemento
 * visible de la página nueva (después del navbar fijo) ya está en pantalla.
 * Las rutas con ancla (#precio) las resuelve el navegador.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
