/**
 * Error Reporting API Endpoint
 * Receives and processes client-side error reports with healthcare compliance
 */

import { serverEnv } from "@/lib/env";
import { LogCategory, logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rate limiting for error reports
const errorRateLimitMap = new Map<string, { count: number; resetTime: number; }>();
const ERROR_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ERRORS_PER_MINUTE = 50; // Generous limit for error scenarios

interface ErrorReport {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: {
    componentStack: string;
  };
  errorId: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  clinicId?: string;
  sessionId?: string;
  breadcrumbs?: {
    timestamp: string;
    message: string;
    category: string;
    data?: any;
  }[];
}

function isErrorRateLimited(clientId: string): boolean {
  const now = Date.now();
  const client = errorRateLimitMap.get(clientId);

  if (!client || now > client.resetTime) {
    errorRateLimitMap.set(clientId, { count: 1, resetTime: now + ERROR_RATE_LIMIT_WINDOW });
    return false;
  }

  if (client.count >= MAX_ERRORS_PER_MINUTE) {
    return true;
  }

  client.count++;
  return false;
}

function getErrorClientId(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]
    || request.headers.get("x-real-ip")
    || "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 50) || "unknown";
  return `${ip}-${userAgent}`;
}

function sanitizeErrorReport(report: ErrorReport): ErrorReport {
  // Sanitize sensitive healthcare data from error reports
  const sanitizedReport = { ...report };

  // Sanitize error message and stack
  if (sanitizedReport.error.message) {
    sanitizedReport.error.message = sanitizeText(sanitizedReport.error.message);
  }

  if (sanitizedReport.error.stack) {
    sanitizedReport.error.stack = sanitizeText(sanitizedReport.error.stack);
  }

  // Sanitize component stack
  if (sanitizedReport.errorInfo?.componentStack) {
    sanitizedReport.errorInfo.componentStack = sanitizeText(
      sanitizedReport.errorInfo.componentStack,
    );
  }

  return sanitizedReport;
}

function sanitizeText(text: string): string {
  return text
    // Brazilian healthcare data patterns
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF-REDACTED]")
    .replace(/\b\d{3}\s?\d{9}\b/g, "[CNS-REDACTED]")
    .replace(/\b\d{11,15}\b/g, "[PHONE-REDACTED]")
    .replace(/@[\w.-]+\.\w+/g, "[EMAIL-REDACTED]")
    .replace(/\b\d{5}-?\d{3}\b/g, "[CEP-REDACTED]")
    // Generic PII patterns
    .replace(/password[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, "password=[REDACTED]")
    .replace(/token[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, "token=[REDACTED]")
    .replace(/key[^a-zA-Z0-9]*[a-zA-Z0-9]+/gi, "key=[REDACTED]");
}

function categorizeError(report: ErrorReport): "critical" | "high" | "medium" | "low" {
  const errorMessage = report.error.message.toLowerCase();
  const errorName = report.error.name.toLowerCase();

  // Critical errors that might affect patient safety
  if (
    errorMessage.includes("patient")
    || errorMessage.includes("medical")
    || errorMessage.includes("prescription")
    || errorName.includes("security")
    || errorMessage.includes("data loss")
  ) {
    return "critical";
  }

  // High priority errors
  if (
    errorName.includes("chunk")
    || errorMessage.includes("network")
    || errorMessage.includes("authentication")
    || errorMessage.includes("database")
  ) {
    return "high";
  }

  // Medium priority errors
  if (
    errorName.includes("type")
    || errorName.includes("reference")
    || errorMessage.includes("ui")
    || errorMessage.includes("render")
  ) {
    return "medium";
  }

  return "low";
}

async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getErrorClientId(request);
    if (isErrorRateLimited(clientId)) {
      return NextResponse.json(
        { error: "Error reporting rate limit exceeded" },
        { status: 429 },
      );
    }

    // Parse error report
    let report: ErrorReport;
    try {
      report = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid error report format" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!report.error || !report.errorId || !report.timestamp) {
      return NextResponse.json(
        { error: "Missing required error report fields" },
        { status: 400 },
      );
    }

    // Sanitize sensitive data
    const sanitizedReport = sanitizeErrorReport(report);

    // Categorize error severity
    const severity = categorizeError(sanitizedReport);

    // Log the error
    const logLevel = severity === "critical"
      ? "fatal"
      : severity === "high"
      ? "error"
      : severity === "medium"
      ? "warn"
      : "info";

    logger[logLevel](LogCategory.SYSTEM, `Client error report: ${sanitizedReport.error.name}`, {
      error: {
        name: sanitizedReport.error.name,
        message: sanitizedReport.error.message,
        stack: sanitizedReport.error.stack,
      },
      metadata: {
        errorId: sanitizedReport.errorId,
        clientId,
        url: sanitizedReport.url,
        userAgent: sanitizedReport.userAgent,
        userId: sanitizedReport.userId,
        clinicId: sanitizedReport.clinicId,
        sessionId: sanitizedReport.sessionId,
        severity,
        componentStack: sanitizedReport.errorInfo?.componentStack,
      },
    });

    // In production, forward to external crash reporting service
    if (process.env.NODE_ENV === "production" && serverEnv.monitoring.sentryDsn) {
      await forwardToExternalService(sanitizedReport, severity);
    }

    // Healthcare-specific error handling
    if (severity === "critical") {
      logger.fatal(
        LogCategory.SECURITY,
        `Critical healthcare error detected: ${sanitizedReport.errorId}`,
        {
          metadata: {
            errorId: sanitizedReport.errorId,
          },
          compliance: {
            lgpdCategory: "processing",
            dataSubject: "patient",
          },
        },
      );
    }

    return NextResponse.json({
      success: true,
      errorId: sanitizedReport.errorId,
      severity,
      message: "Error report received and processed",
    });
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      `Failed to process error report: ${error instanceof Error ? error.message : String(error)}`,
      {
        error: error instanceof Error
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
          : undefined,
      },
    );

    return NextResponse.json(
      { error: "Failed to process error report" },
      { status: 500 },
    );
  }
}

async function forwardToExternalService(report: ErrorReport, severity: string): Promise<void> {
  try {
    // Integrate with Sentry or other monitoring service
    // This is a placeholder - implement actual integration based on your service

    if (serverEnv.monitoring.sentryDsn) {
      // Example Sentry integration
      const sentryPayload = {
        message: report.error.message,
        exception: {
          type: report.error.name,
          value: report.error.message,
          stacktrace: report.error.stack,
        },
        tags: {
          severity,
          errorId: report.errorId,
          environment: process.env.NODE_ENV,
        },
        extra: {
          url: report.url,
          userAgent: report.userAgent,
          componentStack: report.errorInfo?.componentStack,
        },
      };

      // In a real implementation, use the Sentry SDK
      console.log("Would forward to Sentry:", sentryPayload);
    }
  } catch (error) {
    logger.warn(
      LogCategory.SYSTEM,
      `Failed to forward error to external service: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Health check for error reporting service
async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "error-reporting",
    timestamp: new Date().toISOString(),
    rateLimit: {
      window: ERROR_RATE_LIMIT_WINDOW,
      maxErrors: MAX_ERRORS_PER_MINUTE,
      activeClients: errorRateLimitMap.size,
    },
  });
}

export { GET, POST };
export const dynamic = "force-dynamic";
