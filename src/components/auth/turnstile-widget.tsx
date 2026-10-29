"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_FIELD } from "@/lib/captcha/constants";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      language?: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar Turnstile"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type TurnstileWidgetProps = {
  siteKey: string;
  /**
   * Cambia después de cada envío (p. ej. el estado de la acción): el token de
   * Turnstile sirve una sola vez, así que se pide uno nuevo.
   */
  resetSignal?: unknown;
};

/** Widget de Cloudflare Turnstile; agrega el token al formulario como campo oculto. */
export function TurnstileWidget({ siteKey, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const firstSignal = useRef(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          language: "es",
          // Decida solo tiene tema claro; "auto" seguiría el modo oscuro del sistema.
          theme: "light",
          size: "flexible",
          callback: setToken,
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => setToken(""));
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (firstSignal.current) {
      firstSignal.current = false;
      return;
    }
    setToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return (
    <>
      <div ref={containerRef} data-testid="turnstile-widget" />
      <input type="hidden" name={TURNSTILE_FIELD} value={token} readOnly />
    </>
  );
}
