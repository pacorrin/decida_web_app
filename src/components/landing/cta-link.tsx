import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: CtaLinkProps) {
  return (
    <Link
      href={href}
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
    </Link>
  );
}

export function PrimaryCtaButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      render={<Link href={href} />}
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
