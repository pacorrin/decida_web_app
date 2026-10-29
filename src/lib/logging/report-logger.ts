import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error" | "critical";

type LogContext = {
  assessmentId?: string;
  userId?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
  /**
   * Marca el fallo como «la IA falló y el sistema siguió con un respaldo» (el
   * reporte sale, pero degradado). Es lo que alimenta la alerta de Sentry: sin
   * esta marca estos fallos pasan desapercibidos porque nadie ve un error.
   */
  aiFallback?: { feature: AiFallbackFeature; model?: string };
};

export type AiFallbackFeature =
  | "scoring_interpretation"
  | "report_review"
  | "report_review_rewrite"
  | "strengths_risks"
  | "validation_plan"
  | "research"
  | "target_market";

/**
 * Clasifica el error para agrupar en Sentry: un modelo dado de baja (HTTP 404),
 * una clave inválida (401) o un límite (429) son un solo problema que se repite en
 * cada reporte, no cientos de incidencias distintas.
 */
export function classifyAiError(error: unknown): string {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === "number") return `http-${status}`;
  if (error instanceof Error) return error.name;
  return "unknown";
}

function formatLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const parts = [
    `[${timestamp}]`,
    `[${level.toUpperCase()}]`,
    message,
  ];

  if (context?.assessmentId) {
    parts.push(`[Assessment: ${context.assessmentId}]`);
  }

  if (context?.userId) {
    parts.push(`[User: ${context.userId}]`);
  }

  return parts.join(" ");
}

export function logReportGenerationError(
  message: string,
  context: LogContext
): void {
  const logMessage = formatLogMessage("error", message, context);
  console.error(logMessage);

  if (context.error) {
    if (context.error instanceof Error) {
      console.error("Error details:", {
        message: context.error.message,
        stack: context.error.stack,
        name: context.error.name,
      });
    } else {
      console.error("Error details:", context.error);
    }
  }

  if (context.metadata) {
    console.error("Additional metadata:", context.metadata);
  }

  sendAlertToTeam(logMessage, context);
  captureInSentry(message, context);
}

export function logReportGenerationRetry(
  message: string,
  context: LogContext
): void {
  const logMessage = formatLogMessage("warn", message, context);
  console.warn(logMessage);

  if (context.metadata) {
    console.warn("Retry metadata:", context.metadata);
  }
}

export function logReportGenerationSuccess(
  message: string,
  context: LogContext
): void {
  const logMessage = formatLogMessage("info", message, context);
  console.log(logMessage);
}

function sendAlertToTeam(message: string, context: LogContext): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    console.error(
      "🚨 ALERT: Report generation failure - Team notification required",
      {
        message,
        assessmentId: context.assessmentId,
        timestamp: new Date().toISOString(),
      }
    );
  }
}

/**
 * Los reportes fallidos llegan a Sentry como error, agrupados por la etiqueta
 * `area:report-generation`. Se omite el correo del usuario: el assessmentId
 * basta para encontrar el caso. Sin DSN configurado Sentry no envía nada.
 */
function captureInSentry(message: string, context: LogContext): void {
  const { email: _email, ...safeMetadata } = (context.metadata ?? {}) as Record<
    string,
    unknown
  >;
  void _email;

  const fallback = context.aiFallback;

  Sentry.captureException(
    context.error instanceof Error ? context.error : new Error(message),
    {
      level: "error",
      tags: {
        area: "report-generation",
        ...(fallback
          ? {
              ai_fallback: fallback.feature,
              ai_error: classifyAiError(context.error),
              ...(fallback.model ? { ai_model: fallback.model } : {}),
            }
          : {}),
      },
      ...(fallback
        ? { fingerprint: ["ai-fallback", fallback.feature, classifyAiError(context.error)] }
        : {}),
      extra: {
        message,
        assessmentId: context.assessmentId,
        userId: context.userId,
        ...safeMetadata,
        ...(context.error && !(context.error instanceof Error)
          ? { rawError: String(context.error) }
          : {}),
      },
    }
  );
}
