"use client";

import * as React from "react";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SignalLevel } from "@/lib/example-report-data";
import { RECOMMENDATION_LABELS } from "@/lib/example-report-data";

const CARD_HEIGHT = "h-[400px]";

const signalStyles: Record<SignalLevel, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  yellow: "bg-amber-100 text-amber-900 border-amber-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

const signalLabels: Record<SignalLevel, string> = {
  green: "Favorable",
  yellow: "Atención",
  red: "Riesgo",
};

type PreviewSlide = {
  id: string;
  feature: string;
  icon: React.ComponentType<{ className?: string }>;
  businessIdea: string;
  subtitle: string;
};

const SLIDES: PreviewSlide[] = [
  {
    id: "semaforos",
    feature: "Semáforos de viabilidad",
    icon: Target,
    businessIdea: "Cafetería de especialidad",
    subtitle: "6 dimensiones evaluadas con señales claras",
  },
  {
    id: "financiero",
    feature: "Análisis financiero",
    icon: BarChart3,
    businessIdea: "SaaS de agenda dental",
    subtitle: "Márgenes, punto de equilibrio y recuperación",
  },
  {
    id: "idea-ia",
    feature: "Entendimiento con IA",
    icon: BrainCircuit,
    businessIdea: "Consultoría de marketing",
    subtitle: "Tu idea estructurada antes del diagnóstico",
  },
  {
    id: "validacion",
    feature: "Plan de validación",
    icon: ClipboardList,
    businessIdea: "Ropa sustentable en línea",
    subtitle: "Pasos concretos semana a semana",
  },
  {
    id: "personal",
    feature: "Compatibilidad personal",
    icon: UserRound,
    businessIdea: "Academia online de música",
    subtitle: "Encaje entre tu perfil y el tipo de negocio",
  },
  {
    id: "recomendacion",
    feature: "Recomendación final",
    icon: TrendingUp,
    businessIdea: "Meal-prep saludable",
    subtitle: "Decisión accionable basada en tu análisis",
  },
];

function PreviewCardShell({
  slide,
  children,
}: {
  slide: PreviewSlide;
  children: React.ReactNode;
}) {
  const Icon = slide.icon;

  return (
    <Card
      className={cn(
        "flex flex-col border-[#6baed6]/30 bg-white shadow-lg shadow-[#05422c]/5",
        CARD_HEIGHT
      )}
    >
      <CardHeader className="shrink-0 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-[#6baed6]">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6baed6]">
            {slide.feature}
          </p>
        </div>
        <CardTitle className="text-lg text-primary">{slide.businessIdea}</CardTitle>
        <CardDescription>{slide.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-4">{children}</CardContent>
    </Card>
  );
}

function SignalsSlide({ slide }: { slide: PreviewSlide }) {
  const dimensions: Array<{ label: string; signal: SignalLevel; score: number }> = [
    { label: "Compatibilidad personal", signal: "green", score: 78 },
    { label: "Viabilidad financiera", signal: "yellow", score: 62 },
    { label: "Viabilidad comercial", signal: "red", score: 38 },
    { label: "Nivel de riesgo", signal: "yellow", score: 55 },
    { label: "Tiempo y operación", signal: "green", score: 82 },
    { label: "Escalabilidad", signal: "yellow", score: 48 },
  ];

  return (
    <PreviewCardShell slide={slide}>
      <div className="grid flex-1 gap-2 sm:grid-cols-2">
        {dimensions.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground/90">
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.score}/100</p>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[10px]", signalStyles[item.signal])}
            >
              {signalLabels[item.signal]}
            </Badge>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-lg bg-accent/80 p-3 text-sm leading-relaxed">
        <p className="font-medium text-primary">Recomendación</p>
        <p className="mt-1 text-muted-foreground">
          {RECOMMENDATION_LABELS.validate_first}
        </p>
      </div>
    </PreviewCardShell>
  );
}

function FinancialSlide({ slide }: { slide: PreviewSlide }) {
  const metrics = [
    { label: "Margen bruto", value: 68, display: "68%" },
    { label: "Utilidad neta/mes", value: 72, display: "$24,500" },
    { label: "Recuperación", value: 45, display: "4.2 meses" },
    { label: "Punto de equilibrio", value: 58, display: "12 clientes" },
  ];

  return (
    <PreviewCardShell slide={slide}>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col justify-between rounded-lg border border-border/70 bg-muted/30 p-3"
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              {metric.label}
            </p>
            <p className="text-lg font-semibold tabular-nums text-primary">
              {metric.display}
            </p>
            <Progress value={metric.value} className="mt-2 h-1.5" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-end gap-1 pt-4" aria-hidden>
        {[42, 58, 72, 65, 80, 74, 88].map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#05422c]/20 to-[#6baed6]"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Proyección de utilidad mensual (6 meses)
      </p>
    </PreviewCardShell>
  );
}

function IdeaAiSlide({ slide }: { slide: PreviewSlide }) {
  const fields = [
    { label: "Qué ofreces", value: "Gestión de campañas y estrategia digital" },
    { label: "Cliente objetivo", value: "PYMEs locales sin equipo de marketing" },
    { label: "Propuesta de valor", value: "Más ventas sin contratar agencia completa" },
    { label: "Cómo operas", value: "Remoto, 2–3 clientes por mes al inicio" },
  ];

  return (
    <PreviewCardShell slide={slide}>
      <div className="flex items-center gap-2 text-primary">
        <Lightbulb className="size-4" aria-hidden />
        <p className="text-sm font-medium">Nuestro entendimiento</p>
        <Badge className="bg-[#6baed6]/15 text-primary">
          <Sparkles className="mr-1 size-3" aria-hidden />
          IA
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        Ofreces consultoría de marketing digital a pequeños negocios que quieren
        vender más en redes, con enfoque en resultados medibles y bajo riesgo inicial.
      </p>
      <div className="mt-4 grid flex-1 gap-2 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#6baed6]">
              {field.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </PreviewCardShell>
  );
}

function ValidationSlide({ slide }: { slide: PreviewSlide }) {
  const weeks = [
    {
      title: "Semana 1",
      tasks: [
        "Hablar con 10 clientes potenciales",
        "Investigar precios de competidores",
        "Confirmar disposición de pago",
      ],
    },
    {
      title: "Semana 2",
      tasks: [
        "Cotizar costos reales de producción",
        "Lanzar prueba piloto con 5 unidades",
        "Medir conversión del canal elegido",
      ],
    },
  ];

  return (
    <PreviewCardShell slide={slide}>
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        {weeks.map((week) => (
          <div
            key={week.title}
            className="flex flex-col rounded-lg border border-border/70 bg-muted/20 p-3"
          >
            <p className="text-sm font-semibold text-primary">{week.title}</p>
            <ul className="mt-2 flex flex-1 flex-col gap-2">
              {week.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs leading-snug">
                  <CheckCircle2
                    className="mt-0.5 size-3.5 shrink-0 text-[#6baed6]"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-lg border border-[#6baed6]/20 bg-accent/60 p-3 text-xs text-muted-foreground">
        Prioriza validar demanda y números reales antes de escalar inversión o
        inventario.
      </div>
    </PreviewCardShell>
  );
}

function PersonalFitSlide({ slide }: { slide: PreviewSlide }) {
  const dimensions = [
    { label: "Venta y prospección", value: 72 },
    { label: "Trabajo creativo", value: 88 },
    { label: "Tolerancia a incertidumbre", value: 64 },
    { label: "Horas disponibles", value: 55 },
    { label: "Encaje con el modelo", value: 79 },
  ];

  return (
    <PreviewCardShell slide={slide}>
      <p className="text-sm text-muted-foreground">
        Tu perfil encaja mejor con negocios digitales que puedas operar en horarios
        flexibles y escalar con contenido.
      </p>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        {dimensions.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground/90">{item.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {item.value}%
              </span>
            </div>
            <Progress value={item.value} className="h-2" />
          </div>
        ))}
      </div>
    </PreviewCardShell>
  );
}

function RecommendationSlide({ slide }: { slide: PreviewSlide }) {
  return (
    <PreviewCardShell slide={slide}>
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6baed6]">
            Recomendación final
          </p>
          <p className="mt-2 text-xl font-semibold text-primary">
            {RECOMMENDATION_LABELS.validate_first}
          </p>
        </div>
        <blockquote className="border-l-2 border-[#6baed6] pl-4 text-sm leading-relaxed text-muted-foreground">
          La idea muestra señales positivas en margen y encaje personal, pero aún
          depende de supuestos no comprobados sobre demanda y logística. Valida con
          clientes reales antes de invertir más capital.
        </blockquote>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Fortalezas", value: "4" },
            { label: "Riesgos", value: "3" },
            { label: "Semáforos", value: "6" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 bg-muted/30 px-2 py-3"
            >
              <p className="text-lg font-semibold text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PreviewCardShell>
  );
}

function SlideContent({ slide }: { slide: PreviewSlide }) {
  switch (slide.id) {
    case "semaforos":
      return <SignalsSlide slide={slide} />;
    case "financiero":
      return <FinancialSlide slide={slide} />;
    case "idea-ia":
      return <IdeaAiSlide slide={slide} />;
    case "validacion":
      return <ValidationSlide slide={slide} />;
    case "personal":
      return <PersonalFitSlide slide={slide} />;
    case "recomendacion":
      return <RecommendationSlide slide={slide} />;
    default:
      return null;
  }
}

const AUTOPLAY_MS = 10_000;

export function AssessmentPreviewCard() {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: "start" }}
      className="w-full"
      aria-label="Vista previa de funcionalidades del diagnóstico"
    >
      <CarouselContent className="-ml-0">
        {SLIDES.map((slide) => (
          <CarouselItem key={slide.id} className="pl-0">
            <div className="px-2 py-3">
              <SlideContent slide={slide} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
