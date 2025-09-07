/**
 * Global Error Reporting API Endpoint
 * Receives global errors and unhandled promise rejections from client
 */

import { LogCategory, logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface GlobalErrorReport {
  type: "error" | "unhandledRejection";
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
  url: string;
  userAgent: string;
  source?: string;
  line?: number;
  column?: number;
}

// Rate limiting specifically for global errors
const globalErrorRateMap = new Map<string, { count: number; resetTime: number; }>();
const GLOBAL_ERROR_WINDOW = 60 * 1000; // 1 minute
const MAX_GLOBAL_ERRORS = 30; // Lower limit for global errors

function isGlobalErrorRateLimited(clientId: string): boolean {
  const now = Date.now();
  const client = globalErrorRateMap.get(clientId);

  if (!client || now > client.resetTime) {
    globalErrorRateMap.set(clientId, { count: 1, resetTime: now + GLOBAL_ERROR_WINDOW });
    return false;
  }

  if (client.count >= MAX_GLOBAL_ERRORS) {
    return true;
  }

  client.count++;
  return false;
}

function getClientId(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]
    || request.headers.get("x-real-ip") || "unknown";
  return `global-${ip}`;
}

function categorizeGlobalError(report: GlobalErrorReport): "critical" | "high" | "medium" | "low" {
  const errorMessage = report.error.message.toLowerCase();
  const errorName = report.error.name.toLowerCase();

  // Critical global errors
  if (
    errorName.includes("security")
    || errorMessage.includes("script")
    || errorMessage.includes("cors")
    || report.type === "unhandledRejection" && errorMessage.includes("patient")
  ) {
    return "critical";
  }

  // High priority global errors
  if (
    errorName.includes("network")
    || errorName.includes("fetch")
    || errorMessage.includes("authentication")
    || report.type === "unhandledRejection"
  ) {
    return "high";
  }

  // Medium priority
  if (
    errorName.includes("type")
    || errorName.includes("reference")
  ) {
    return "medium";
  }

  return "low";
}

async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (isGlobalErrorRateLimited(clientId)) {
      return NextResponse.json(
        { error: "Global error rate limit exceeded" },
        { status: 429 },
      );
    }

    // Parse global error report
    let report: GlobalErrorReport;
    try {
      report = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid global error report format" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!report.error || !report.timestamp || !report.type) {
      return NextResponse.json(
        { error: "Missing required global error fields" },
        { status: 400 },
      );
    }

    // Categorize error severity
    const severity = categorizeGlobalError(report);

    // Generate error ID for tracking
    const errorId = `global-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Log the global error
    const logLevel = severity === "critical"
      ? "fatal"
      : severity === "high"
      ? "error"
      : severity === "medium"
      ? "warn"
      : "info";

    logger[logLevel](LogCategory.SYSTEM, `Global ${report.type}: ${report.error.name}`, {
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack,
      },
      metadata: {
        errorId,
        clientId,
        globalErrorType: report.type,
        url: report.url,
        userAgent: report.userAgent,
        source: report.source,
        line: report.line,
        column: report.column,
        severity,
      },
    });

    // Special handling for critical global errors
    if (severity === "critical") {
      logger.fatal(LogCategory.SECURITY, `Critical global error detected: ${errorId}`, {
        metadata: {
          errorId,
          globalErrorType: report.type,
        },
        compliance: {
          lgpdCategory: "processing",
          dataSubject: "system",
        },
      });
    }

    // If too many global errors from same client, log warning
    const clientStats = globalErrorRateMap.get(clientId);
    if (clientStats && clientStats.count > 10) {
      logger.warn(LogCategory.SYSTEM, `High global error rate from client: ${clientId}`, {
        metadata: {
          clientId,
          errorCount: clientStats.count,
          windowMinutes: GLOBAL_ERROR_WINDOW / 60_000,
        },
      });
    }

    return NextResponse.json({
      success: true,
      errorId,
      severity,
      type: report.type,
      message: "Global error report received",
    });
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      `Failed to process global error report: ${
        error instanceof Error ? error.message : String(error)
      }`,
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
      { error: "Failed to process global error report" },
      { status: 500 },
    );
  }
}

// Health check for global error reporting
async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "global-error-reporting",
    timestamp: new Date().toISOString(),
    rateLimit: {
      window: GLOBAL_ERROR_WINDOW,
      maxErrors: MAX_GLOBAL_ERRORS,
      activeClients: globalErrorRateMap.size,
    },
  });
}

export { GET, POST };
export const dynamic = "force-dynamic";
