import { LogCategory, logger, LogLevel } from "@/lib/logger";
import type { PerformanceCategory, PerformanceMetric } from "@/lib/performance-monitor";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface PerformanceMetricPayload extends PerformanceMetric {
  sessionId: string;
  userId?: string;
  clinicId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

interface PerformanceBatchPayload {
  metrics: PerformanceMetricPayload[];
  sessionInfo: {
    sessionId: string;
    userId?: string;
    clinicId?: string;
    userAgent: string;
    startTime: string;
  };
}

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number; }>();
const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 60_000, // 1 minute
};

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query parameters that might contain sensitive data
    const sensitiveParams = ["token", "key", "id", "patient", "cpf", "cns"];

    for (const param of sensitiveParams) {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, "[REDACTED]");
      }
    }

    return urlObj.toString();
  } catch {
    return "[INVALID_URL]";
  }
}

function validateMetric(metric: PerformanceMetricPayload): boolean {
  // Basic validation
  if (!metric.name || typeof metric.value !== "number") {
    return false;
  }

  // Validate timestamp
  const timestamp = new Date(metric.timestamp);
  if (isNaN(timestamp.getTime())) {
    return false;
  }

  // Check if timestamp is not too old (max 1 hour)
  const hourAgo = Date.now() - 3_600_000;
  if (timestamp.getTime() < hourAgo) {
    return false;
  }

  // Validate metric values are reasonable
  if (metric.value < 0 || metric.value > 300_000) { // Max 5 minutes
    return false;
  }

  return true;
}

function categorizeMetricSeverity(
  metric: PerformanceMetricPayload,
): "low" | "medium" | "high" | "critical" {
  const { name, value, metadata } = metric;

  // Critical thresholds for healthcare operations
  if (metadata?.isHealthcareOperation) {
    if (name === "patient_data_access" && value > 5000) return "critical"; // > 5s
    if (name === "database_query" && value > 3000) return "high"; // > 3s
  }

  // Web Vitals thresholds
  switch (name) {
    case "CLS":
      if (value > 0.25) return "critical";
      if (value > 0.1) return "high";
      if (value > 0.05) return "medium";
      break;
    case "FID":
    case "INP":
      if (value > 300) return "critical";
      if (value > 200) return "high";
      if (value > 100) return "medium";
      break;
    case "LCP":
      if (value > 4000) return "critical";
      if (value > 2500) return "high";
      if (value > 1500) return "medium";
      break;
    case "FCP":
      if (value > 3000) return "critical";
      if (value > 1800) return "high";
      if (value > 900) return "medium";
      break;
    case "TTFB":
      if (value > 1500) return "critical";
      if (value > 800) return "high";
      if (value > 400) return "medium";
      break;
    default:
      if (value > 10_000) return "critical";
      if (value > 5000) return "high";
      if (value > 2000) return "medium";
  }

  return "low";
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for")
      || request.headers.get("x-real-ip")
      || "unknown";

    if (!checkRateLimit(clientIp)) {
      logger.log(LogLevel.WARN, "Performance API rate limit exceeded", {
        category: LogCategory.SECURITY,
        clientIp,
        endpoint: "/api/performance",
      });

      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const supabase = createClient();
    const body: PerformanceBatchPayload = await request.json();

    // Validate request structure
    if (!body.metrics || !Array.isArray(body.metrics)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // Validate and sanitize metrics
    const validMetrics: PerformanceMetricPayload[] = [];
    const errors: string[] = [];

    for (const metric of body.metrics) {
      if (!validateMetric(metric)) {
        errors.push(`Invalid metric: ${metric.name}`);
        continue;
      }

      // Sanitize URL
      metric.url = sanitizeUrl(metric.url);

      validMetrics.push(metric);
    }

    if (validMetrics.length === 0) {
      logger.log(LogLevel.WARN, "No valid performance metrics received", {
        category: LogCategory.SYSTEM,
        errors,
        totalMetrics: body.metrics.length,
      });

      return NextResponse.json(
        { error: "No valid metrics provided", details: errors },
        { status: 400 },
      );
    }

    // Process metrics in batches
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < validMetrics.length; i += batchSize) {
      batches.push(validMetrics.slice(i, i + batchSize));
    }

    let totalInserted = 0;
    const criticalMetrics: PerformanceMetricPayload[] = [];

    for (const batch of batches) {
      try {
        // Prepare data for database insertion
        const performanceRecords = batch.map(metric => ({
          session_id: metric.sessionId,
          user_id: metric.userId || null,
          clinic_id: metric.clinicId || null,
          metric_name: metric.name,
          metric_value: metric.value,
          metric_unit: metric.unit || "ms",
          category: metric.metadata?.category || "performance",
          severity: categorizeMetricSeverity(metric),
          url: metric.url,
          user_agent: metric.userAgent,
          metadata: {
            ...metric.metadata,
            originalTimestamp: metric.timestamp,
          },
          created_at: new Date().toISOString(),
        }));

        // Insert into database
        const { data, error } = await supabase
          .from("performance_metrics")
          .insert(performanceRecords)
          .select();

        if (error) {
          logger.log(LogLevel.ERROR, "Failed to insert performance metrics", {
            category: LogCategory.DATABASE,
            error: error.message,
            batchSize: batch.length,
          });
          continue;
        }

        totalInserted += data?.length || 0;

        // Check for critical metrics
        batch.forEach(metric => {
          const severity = categorizeMetricSeverity(metric);
          if (severity === "critical" || severity === "high") {
            criticalMetrics.push(metric);
          }
        });
      } catch (batchError) {
        logger.log(LogLevel.ERROR, "Error processing performance metrics batch", {
          category: LogCategory.SYSTEM,
          error: batchError instanceof Error ? batchError.message : "Unknown error",
          batchSize: batch.length,
        });
      }
    }

    // Log critical metrics for immediate attention
    if (criticalMetrics.length > 0) {
      logger.log(LogLevel.WARN, "Critical performance metrics detected", {
        category: LogCategory.PERFORMANCE,
        criticalCount: criticalMetrics.length,
        metrics: criticalMetrics.map(m => ({
          name: m.name,
          value: m.value,
          severity: categorizeMetricSeverity(m),
          isHealthcare: m.metadata?.isHealthcareOperation,
        })),
        clinicId: body.sessionInfo.clinicId,
        userId: body.sessionInfo.userId,
      });
    }

    // Log successful processing
    logger.log(LogLevel.INFO, "Performance metrics processed successfully", {
      category: LogCategory.PERFORMANCE,
      totalReceived: body.metrics.length,
      totalValidated: validMetrics.length,
      totalInserted,
      criticalMetrics: criticalMetrics.length,
      sessionId: body.sessionInfo.sessionId,
      clinicId: body.sessionInfo.clinicId,
    });

    // Return response
    const response = {
      success: true,
      processed: {
        received: body.metrics.length,
        validated: validMetrics.length,
        inserted: totalInserted,
        critical: criticalMetrics.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.log(LogLevel.ERROR, "Unexpected error in performance API", {
      category: LogCategory.SYSTEM,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Health check endpoint for monitoring
export async function GET() {
  try {
    const supabase = createClient();

    // Test database connectivity
    const { data, error } = await supabase
      .from("performance_metrics")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: "Database connectivity issue",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "healthy",
      service: "performance-api",
      timestamp: new Date().toISOString(),
      rateLimit: {
        window: `${RATE_LIMIT.windowMs}ms`,
        maxRequests: RATE_LIMIT.maxRequests,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Service error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
