"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ir a planes de pago cuenta como «clic en suscribirse» (legado + créditos). */
function eventForHref(href: string) {
  return href.startsWith("/cuenta/suscripcion") ||
    href.startsWith("/cuenta/creditos")
    ? ANALYTICS_EVENTS.subscribeClicked
    : ANALYTICS_EVENTS.ctaClicked;
}

type CtaLinkProps = {
  href: string;
  /** Dónde está el botón (hero, header, pricing…): sin esto no se sabe cuál convierte. */
  location: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
};

export function CtaLink({
  href,
  location,
  children,
  variant = "primary",
  className,
}: CtaLinkProps) {
  return (
    <TrackedLink
      href={href}
      event={eventForHref(href)}
      eventProps={{ href, location }}
      className={cn(
        buttonVariants({
          variant: variant === "outline" ? "outline" : "secondary",
          size: "lg",
        }),
        "min-h-11 w-full px-6 text-base sm:w-auto",
        variant === "primary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        variant === "secondary" &&
          "border-primary bg-transparent text-primary hover:bg-muted",
        className
      )}
    >
      {children}
    </TrackedLink>
  );
}

export function PrimaryCtaButton({
  href,
  location,
  children,
  className,
}: {
  href: string;
  location: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      render={
        <TrackedLink
          href={href}
          event={eventForHref(href)}
          eventProps={{ href, location }}
        />
      }
      nativeButton={false}
      className={cn(
        "min-h-11 w-full bg-secondary px-6 text-base text-secondary-foreground hover:bg-secondary/90 sm:w-auto",
        className
      )}
      size="lg"
    >
      {children}
    </Button>
  );
}
