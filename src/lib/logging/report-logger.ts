import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error" | "critical";

type LogContext = {
  assessmentId?: string;
  userId?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
};

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

  Sentry.captureException(
    context.error instanceof Error ? context.error : new Error(message),
    {
      level: "error",
      tags: { area: "report-generation" },
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
