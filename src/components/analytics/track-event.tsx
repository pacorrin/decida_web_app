"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import type { AnalyticsEvent, AnalyticsProps } from "@/lib/analytics/events";

/** Dispara un evento una vez al montarse. */
export function TrackEvent({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
}) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
