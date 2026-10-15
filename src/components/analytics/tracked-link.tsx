"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/client";
import type { AnalyticsEvent, AnalyticsProps } from "@/lib/analytics/events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event: AnalyticsEvent;
  eventProps?: AnalyticsProps;
};

/** Link que registra un evento al hacer clic, sin dejar de ser un Link. */
export function TrackedLink({
  event,
  eventProps,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
    />
  );
}
