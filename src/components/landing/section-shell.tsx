import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  titleId?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary";
};

export function SectionShell({
  id,
  titleId,
  title,
  description,
  children,
  className,
  variant = "default",
}: SectionShellProps) {
  const headingId = titleId ?? (id ? `${id}-heading` : undefined);

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "py-16 md:py-24",
        variant === "muted" && "bg-muted/60",
        variant === "primary" && "bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <h2
            id={headingId}
            className={cn(
              "text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl",
              variant === "primary" && "text-primary-foreground"
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mt-4 text-pretty text-base leading-relaxed sm:text-lg",
                variant === "primary"
                  ? "text-primary-foreground/85"
                  : "text-muted-foreground"
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
