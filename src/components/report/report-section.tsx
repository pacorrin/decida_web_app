import { cn } from "@/lib/utils";

type ReportSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ReportSection({
  id,
  title,
  description,
  children,
  className,
}: ReportSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 border-b border-border/60 py-10 md:py-14", className)}
    >
      <div className="mb-6 md:mb-8">
        <h2
          id={headingId}
          className="text-xl font-semibold tracking-tight text-primary sm:text-2xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
