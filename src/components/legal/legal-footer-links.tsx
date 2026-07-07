import Link from "next/link";
import { LEGAL_LINKS } from "@/components/landing/landing-content";

type LegalFooterLinksProps = {
  className?: string;
};

export function LegalFooterLinks({ className }: LegalFooterLinksProps) {
  return (
    <nav
      aria-label="Enlaces legales"
      className={className ?? "flex flex-wrap justify-center gap-x-4 gap-y-1"}
    >
      {LEGAL_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
