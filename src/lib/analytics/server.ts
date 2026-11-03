import "server-only";

import { after } from "next/server";
import { cookies } from "next/headers";
import { PostHog } from "posthog-node";
import type { AnalyticsEvent, AnalyticsProps } from "./events";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
// En desarrollo no se manda nada a PostHog (ni eventos, ni trazas de IA, ni flags).
const DISABLED = process.env.NODE_ENV === "development";

let client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (DISABLED || !KEY || !HOST) return null;
  client ??= new PostHog(KEY, {
    host: HOST,
    flushAt: 1,
    flushInterval: 0,
    // Los prompts y respuestas de la IA contienen la idea del usuario: no se
    // guardan en PostHog. Solo se registran modelo, latencia, tokens y costo.
    privacyMode: true,
  });
  return client;
}

/**
 * Evento desde el servidor (server actions). El distinct_id es el id de la
 * cuenta, el mismo que el navegador usa en `identify`, así el embudo une las
 * visitas anónimas con lo que pasa ya dentro de la cuenta. Nunca lanza.
 */
export async function trackServer(
  userId: string | null | undefined,
  event: AnalyticsEvent,
  props?: AnalyticsProps,
): Promise<void> {
  const ph = getPostHogClient();
  if (!ph || !userId) return;
  try {
    await ph.captureImmediate({ distinctId: userId, event, properties: props });
  } catch {
    // La analítica nunca debe romper la app.
  }
}

/**
 * Evento de alguien que todavía no tiene cuenta (registro, captcha, verificación).
 * Toma el id anónimo de la cookie de PostHog del navegador, así el evento queda en
 * la misma visita que las páginas vistas y, al crearse la cuenta, se une a ella.
 * Sin cookie (bloqueada) no manda nada. Nunca lanza.
 */
export async function trackAnonymous(
  event: AnalyticsEvent,
  props?: AnalyticsProps,
): Promise<void> {
  if (DISABLED || !KEY) return;
  try {
    const raw = (await cookies()).get(`ph_${KEY}_posthog`)?.value;
    if (!raw) return;
    const distinctId = (JSON.parse(decodeURIComponent(raw)) as { distinct_id?: string })
      .distinct_id;
    if (!distinctId) return;
    runAfterResponse(() => trackServer(distinctId, event, props));
  } catch {
    // La analítica nunca debe romper la app.
  }
}

/** Evento de una cuenta, enviado después de responder para no retrasar la pantalla. */
export function trackServerDeferred(
  userId: string | null | undefined,
  event: AnalyticsEvent,
  props?: AnalyticsProps,
): void {
  if (!userId) return;
  runAfterResponse(() => trackServer(userId, event, props));
}

function runAfterResponse(task: () => Promise<void>): void {
  try {
    after(task);
  } catch {
    // Fuera de una petición (pruebas, scripts) no hay «después»: se envía directo.
    void task();
  }
}
