import "server-only";

import { PostHog } from "posthog-node";
import type { AnalyticsEvent, AnalyticsProps } from "./events";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!KEY || !HOST) return null;
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
