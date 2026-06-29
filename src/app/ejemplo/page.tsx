import type { Metadata } from "next";
import { ReportHeader } from "@/components/report/report-header";
import { ReportToc } from "@/components/report/report-toc";
import { ReportSection } from "@/components/report/report-section";
import {
  SignalBadge,
  SignalDot,
  formatCurrency,
} from "@/components/report/signal-badge";
import { PrimaryCtaButton } from "@/components/landing/cta-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DIMENSION_WEIGHTS,
  EXAMPLE_REPORT,
  RECOMMENDATION_LABELS,
} from "@/lib/example-report-data";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ejemplo de reporte | Decida",
  description:
    "Reporte de ejemplo: servicio de detailing móvil. Diagnóstico completo con semáforos, métricas financieras, riesgos y plan de validación.",
};

export default function ExampleReportPage() {
  const report = EXAMPLE_REPORT;

  return (
    <>
      <a
        href="#reporte-contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido del reporte
      </a>
      <ReportHeader />

      <main id="reporte-contenido" className="flex-1">
        {/* Cover */}
        <div className="border-b border-border/60 bg-gradient-to-b from-accent/25 to-background">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-[#6baed6]/40 bg-accent/50 text-primary">
                Reporte de ejemplo
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {report.meta.scoringVersion}
              </Badge>
            </div>
            <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-primary sm:text-3xl md:text-4xl">
              {report.cover.businessIdea}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Business Viability Assessment · {report.meta.analyzedAt}
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-background/80 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Objetivo
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {report.cover.userGoal}
                </dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/80 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Situación
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {report.cover.userSituation}
                </dd>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/80 p-4 sm:col-span-2 lg:col-span-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recomendación
                </dt>
                <dd className="mt-2">
                  <SignalBadge signal="yellow" />
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {RECOMMENDATION_LABELS[report.executiveSummary.recommendation]}
                  </p>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              {report.cover.disclaimer}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <ReportToc />
              </div>
            </aside>

            <div className="min-w-0 pb-16">
              <div className="lg:hidden">
                <ReportToc className="mb-8" />
              </div>

              {/* Executive Summary */}
              <ReportSection
                id="resumen"
                title="Resumen ejecutivo"
                description="Diagnóstico de alto nivel para decidir si avanzar, validar o pausar."
              >
                <Card className="border-primary/15 bg-primary/[0.03]">
                  <CardContent className="space-y-5 pt-6">
                    <p className="text-base leading-relaxed text-foreground">
                      {report.executiveSummary.diagnosis}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                          <CheckCircle2 className="size-4" aria-hidden />
                          Fortaleza principal
                        </p>
                        <p className="mt-2 text-sm text-emerald-800">
                          {report.executiveSummary.mainStrength}
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
                          <AlertTriangle className="size-4" aria-hidden />
                          Riesgo principal
                        </p>
                        <p className="mt-2 text-sm text-amber-800">
                          {report.executiveSummary.mainRisk}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>

              {/* Viability Snapshot */}
              <ReportSection
                id="viabilidad"
                title="Semáforos de viabilidad"
                description="Seis dimensiones evaluadas por el motor de scoring, con pesos según el Business Viability Framework."
              >
                <div className="mb-6 overflow-x-auto rounded-xl border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dimensión</TableHead>
                        <TableHead className="w-20 text-right">Peso</TableHead>
                        <TableHead className="w-24 text-right">Score</TableHead>
                        <TableHead>Señal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.viabilitySnapshot.map((dim) => {
                        const weight = DIMENSION_WEIGHTS.find(
                          (w) => w.key === dim.key
                        )?.weight;
                        return (
                          <TableRow key={dim.key}>
                            <TableCell className="font-medium">
                              {dim.label}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {weight}%
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {dim.score}
                            </TableCell>
                            <TableCell>
                              <SignalBadge signal={dim.signal} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {report.viabilitySnapshot.map((dim) => (
                    <Card key={dim.key} className="border-border/70">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-medium">
                            {dim.label}
                          </CardTitle>
                          <SignalDot signal={dim.signal} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={dim.score} className="h-2 flex-1" />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {dim.score}/100
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {dim.summary}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {report.redFlags.length > 0 ? (
                  <Card className="mt-6 border-red-200/60 bg-red-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base text-red-900">
                        <Flag className="size-4" aria-hidden />
                        Banderas rojas detectadas
                      </CardTitle>
                      <CardDescription>
                        Señales que activan validación obligatoria antes de invertir más.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.redFlags.map((flag) => (
                          <li
                            key={flag}
                            className="flex items-start gap-2 text-sm text-red-900/90"
                          >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}
              </ReportSection>

              {/* Business Understanding */}
              <ReportSection
                id="negocio"
                title="Entendimiento del negocio"
                description="Cómo interpretamos tu idea y los supuestos clave detrás del análisis."
              >
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-foreground">
                    {report.businessUnderstanding.summary}
                  </p>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/70 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Cliente objetivo
                      </dt>
                      <dd className="mt-1 text-sm">
                        {report.businessUnderstanding.targetCustomer}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border/70 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Problema que resuelve
                      </dt>
                      <dd className="mt-1 text-sm">
                        {report.businessUnderstanding.problemSolved}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-border/70 p-4 sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Por qué pagarían
                      </dt>
                      <dd className="mt-1 text-sm">
                        {report.businessUnderstanding.whyWouldPay}
                      </dd>
                    </div>
                  </dl>
                  <div>
                    <p className="mb-3 text-sm font-medium text-primary">
                      Supuestos del análisis
                    </p>
                    <ul className="space-y-2">
                      {report.businessUnderstanding.assumptions.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Lightbulb
                            className="mt-0.5 size-4 shrink-0 text-[#6baed6]"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ReportSection>

              {/* Financial */}
              <ReportSection
                id="financiero"
                title="Análisis financiero"
                description="Métricas calculadas por el scoring engine a partir de tus inputs."
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: "Margen bruto por venta",
                      value: formatCurrency(
                        report.financialSnapshot.metrics.grossMarginPerSale,
                        report.financialSnapshot.currency
                      ),
                    },
                    {
                      label: "Margen bruto %",
                      value: `${report.financialSnapshot.metrics.grossMarginPercentage}%`,
                    },
                    {
                      label: "Utilidad neta mensual est.",
                      value: formatCurrency(
                        report.financialSnapshot.metrics.monthlyNetProfit,
                        report.financialSnapshot.currency
                      ),
                    },
                    {
                      label: "Recuperación estimada",
                      value: `${report.financialSnapshot.metrics.paybackMonths} meses`,
                    },
                  ].map((metric) => (
                    <Card key={metric.label} className="border-border/70">
                      <CardContent className="pt-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold tabular-nums text-primary">
                          {metric.value}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 border-border/70">
                  <CardHeader>
                    <CardTitle className="text-base">Inputs y cálculos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Capital disponible
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.capitalAvailable,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Inversión inicial estimada
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.initialInvestment,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Precio por venta
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.pricePerSale,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Costo variable por venta
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.variableCostPerSale,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Ventas mensuales estimadas
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {report.financialSnapshot.estimatedMonthlySales}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Costos fijos mensuales
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.fixedMonthlyCosts,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Punto de equilibrio (ventas/mes)
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {report.financialSnapshot.metrics.breakEvenSales}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground">
                              Pérdida aceptable declarada
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatCurrency(
                                report.financialSnapshot.acceptableLoss,
                                report.financialSnapshot.currency
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <p className="mt-6 text-sm leading-relaxed text-foreground">
                  {report.financialSnapshot.interpretation}
                </p>
                <ul className="mt-4 space-y-2">
                  {report.financialSnapshot.warnings.map((warning) => (
                    <li
                      key={warning}
                      className="flex items-start gap-2 text-sm text-amber-900"
                    >
                      <AlertTriangle
                        className="mt-0.5 size-4 shrink-0 text-amber-600"
                        aria-hidden
                      />
                      {warning}
                    </li>
                  ))}
                </ul>
              </ReportSection>

              {/* Strengths */}
              <ReportSection id="fortalezas" title="Fortalezas de la idea">
                <div className="grid gap-4 sm:grid-cols-2">
                  {report.strengths.map((item) => (
                    <Card
                      key={item.title}
                      className="border-emerald-200/50 bg-emerald-50/20"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start gap-2 text-base text-emerald-900">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden
                          />
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-emerald-900/80">
                          {item.whyItMatters}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ReportSection>

              {/* Risks */}
              <ReportSection
                id="riesgos"
                title="Riesgos y cómo reducirlos"
                description="Riesgos priorizados con acciones concretas de mitigación."
              >
                <div className="space-y-4">
                  {report.risks.map((risk) => (
                    <Card key={risk.title} className="border-amber-200/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start gap-2 text-base text-amber-950">
                          <AlertTriangle
                            className="mt-0.5 size-4 shrink-0 text-amber-600"
                            aria-hidden
                          />
                          {risk.title}
                        </CardTitle>
                        <CardDescription className="text-amber-900/70">
                          {risk.whyItMatters}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          <span className="font-medium text-primary">
                            Cómo reducirlo:{" "}
                          </span>
                          <span className="text-muted-foreground">
                            {risk.howToReduce}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-8" />

                <p className="mb-4 text-sm font-medium text-primary">
                  Categorías de riesgo evaluadas
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {report.riskCategories.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-start gap-3 rounded-lg border border-border/70 p-4"
                    >
                      <SignalDot signal={cat.level} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">{cat.category}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {cat.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ReportSection>

              {/* Personal Fit */}
              <ReportSection
                id="personal"
                title="Compatibilidad personal"
                description="Dimensión con 20% de peso en el scoring engine."
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="mb-3 text-sm font-medium text-emerald-900">
                      Encaja contigo
                    </p>
                    <ul className="space-y-2">
                      {report.personalFit.fits.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-emerald-600"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-amber-900">
                      Posibles fricciones
                    </p>
                    <ul className="space-y-2">
                      {report.personalFit.frictions.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <AlertTriangle
                            className="mt-0.5 size-4 shrink-0 text-amber-600"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-6 rounded-lg border border-border/70 bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                  {report.personalFit.consideration}
                </p>
              </ReportSection>

              {/* Time & Operation */}
              <ReportSection id="tiempo" title="Tiempo y operación">
                <dl className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: "Horas semanales estimadas",
                      value: report.timeAndOperation.hoursPerWeek,
                    },
                    {
                      label: "Horario propuesto",
                      value: report.timeAndOperation.schedule,
                    },
                    {
                      label: "Carga operativa",
                      value: report.timeAndOperation.operationalLoad,
                    },
                    {
                      label: "Compatibilidad con empleo",
                      value: report.timeAndOperation.employmentCompatibility,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-lg border border-border/70 p-4"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {report.timeAndOperation.analysis}
                </p>
              </ReportSection>

              {/* Scalability */}
              <ReportSection id="escalabilidad" title="Escalabilidad">
                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="size-4 text-[#6baed6]" aria-hidden />
                      {report.scalability.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {report.scalability.analysis}
                    </p>
                    <dl className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-muted/40 p-3">
                        <dt className="text-xs text-muted-foreground">
                          Potencial de delegar
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {report.scalability.signals.delegatePotential}
                        </dd>
                      </div>
                      <div className="rounded-md bg-muted/40 p-3">
                        <dt className="text-xs text-muted-foreground">
                          Potencial de sistematizar
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {report.scalability.signals.systematizePotential}
                        </dd>
                      </div>
                      <div className="rounded-md bg-muted/40 p-3">
                        <dt className="text-xs text-muted-foreground">
                          Dependencia de tu tiempo
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {report.scalability.signals.personalTimeDependency}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </ReportSection>

              {/* Validation Plan */}
              <ReportSection
                id="validacion"
                title="Plan de validación (4 semanas)"
                description="Próximos pasos concretos antes de invertir más capital."
              >
                <ol className="relative space-y-0 border-l border-border pl-6">
                  {report.validationPlan.map((week, index) => (
                    <li key={week.week} className="relative pb-8 last:pb-0">
                      <span
                        className="absolute -left-[1.6rem] flex size-7 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-semibold text-primary"
                        aria-hidden
                      >
                        {week.week}
                      </span>
                      <div className="rounded-xl border border-border/70 p-4">
                        <p className="text-sm font-semibold text-primary">
                          Semana {week.week}: {week.title}
                        </p>
                        <ul className="mt-3 space-y-2">
                          {week.tasks.map((task) => (
                            <li
                              key={task}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <Target
                                className="mt-0.5 size-4 shrink-0 text-[#6baed6]"
                                aria-hidden
                              />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {index < report.validationPlan.length - 1 ? (
                        <span className="sr-only">Siguiente semana</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </ReportSection>

              {/* Final Recommendation */}
              <ReportSection
                id="recomendacion"
                title="Recomendación final"
                className="border-b-0"
              >
                <Card className="border-[#6baed6]/30 bg-accent/20">
                  <CardHeader>
                    <CardTitle className="text-primary">
                      {RECOMMENDATION_LABELS[report.executiveSummary.recommendation]}
                    </CardTitle>
                    <CardDescription>
                      Basado en el scoring engine y las banderas rojas detectadas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">
                      {report.executiveSummary.recommendationText}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <PrimaryCtaButton href="/analizar">
                        Analizar mi idea por $99 MXN
                      </PrimaryCtaButton>
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-muted/20 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>
            Reporte de ejemplo generado con {report.meta.scoringVersion} ·{" "}
            {report.meta.brandName}
          </p>
          <p className="mt-2">{report.cover.disclaimer}</p>
        </div>
      </footer>
    </>
  );
}
