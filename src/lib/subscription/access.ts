import type { users } from "@/generated/prisma/client";

type SubscriptionFields = Pick<
  users,
  "user_subscription_status" | "user_subscription_period_end"
>;

export function hasFullAccess(
  user: SubscriptionFields | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!user) return false;

  const { user_subscription_status: status, user_subscription_period_end: end } =
    user;

  if (status === "active") return !end || end > now;
  if (status === "canceled") return !!end && end > now;
  return false; // none y past_due
}
