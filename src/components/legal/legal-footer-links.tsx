import Link from "next/link";
import { LEGAL_LINKS } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

type LegalFooterLinksProps = {
  className?: string;
};

export function LegalFooterLinks({ className }: LegalFooterLinksProps) {
  return (
    <nav
      aria-label="Enlaces legales"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2",
        className,
      )}
    >
      {LEGAL_LINKS.map((link, index) => (
        <span key={link.href} className="inline-flex items-center gap-6">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
          ) : null}
          <Link
            href={link.href}
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
