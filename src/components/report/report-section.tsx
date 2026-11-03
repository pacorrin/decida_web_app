import { cn } from "@/lib/utils";

type ReportSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** hero: banda verde de la marca; muted: panel verde pálido; accent: panel azul pálido; plain: sin panel, sobre el fondo blanco. */
  tone?: "hero" | "muted" | "accent" | "plain";
};

const TONES = {
  hero: "rounded-3xl bg-primary p-6 text-white sm:p-8 lg:p-10",
  muted: "rounded-3xl bg-muted p-6 sm:p-8 lg:p-10",
  accent: "rounded-3xl bg-accent p-6 sm:p-8 lg:p-10",
  plain: "px-1 py-4 sm:py-6 lg:py-8",
} as const;

export function ReportSection({
  id,
  title,
  description,
  children,
  className,
  tone = "plain",
}: ReportSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24", TONES[tone], className)}
    >
      <div className="mb-6 md:mb-8">
        <h2
          id={headingId}
          className={cn(
            "text-2xl font-semibold tracking-tight sm:text-3xl",
            tone === "hero" ? "text-white" : "text-primary",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-3xl text-sm leading-relaxed sm:text-base",
              tone === "hero" ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
