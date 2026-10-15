"use client";

import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsProps } from "./events";

/** Envía un evento desde el navegador. No hace nada si PostHog no está configurado. */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {
    // La analítica nunca debe romper la app.
  }
}

/** Liga las visitas anónimas con la cuenta. Solo el id: nunca correo ni nombre. */
export function identify(userId: string): void {
  try {
    if (posthog.__loaded && posthog.get_distinct_id() !== userId) {
      posthog.identify(userId);
    }
  } catch {
    // ver arriba
  }
}

export function resetAnalytics(): void {
  try {
    if (posthog.__loaded) posthog.reset();
  } catch {
    // ver arriba
  }
}
