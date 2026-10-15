"use client";

import { useEffect } from "react";
import { identify } from "@/lib/analytics/client";

export function AnalyticsIdentify({ userId }: { userId: string }) {
  useEffect(() => {
    identify(userId);
  }, [userId]);
  return null;
}
