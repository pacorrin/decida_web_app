import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrimaryCtaButton } from "@/components/landing/cta-link";

export function ReportHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Inicio</span>
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label="Decida, inicio"
          >
            <Image src="/logo.svg" alt="" width={24} height={24} aria-hidden />
            <span className="text-sm font-semibold text-primary">Decida</span>
          </Link>
        </div>
        <PrimaryCtaButton href="/analizar" className="text-sm">
          Analizar mi idea
        </PrimaryCtaButton>
      </div>
    </header>
  );
}
