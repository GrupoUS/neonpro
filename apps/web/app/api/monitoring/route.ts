import { LogCategory, logger, LogLevel } from "@/lib/logger";
import { alertSystem, type MonitoringDashboard } from "@/lib/monitoring/alert-system";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Type definitions for monitoring API
interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
  enabled?: boolean;
  tags?: string[];
}

// Canonicalized metric shapes
interface DbPerformanceMetric {
  id?: string;
  created_at: string; // ISO timestamp from DB
  metric_value: number | string;
  labels?: Record<string, string>;
  clinic_id?: string;
  user_id?: string;
}

interface ApiPerformanceMetric {
  id?: string;
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
  clinicId?: string;
  userId?: string;
}

interface MonitoringResult {
  success: boolean;
  data: unknown;
  timestamp: string;
}

interface MonitoringError {
  success: false;
  error: string;
  timestamp: string;
}

type MonitoringResponse = MonitoringResult | MonitoringError;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "dashboard";
    const clinicId = searchParams.get("clinic_id");

    // Check if user has access to monitoring (admin/manager roles)
    if (clinicId) {
      const { data: membership } = await supabase
        .from("clinic_members")
        .select("role")
        .eq("clinic_id", clinicId)
        .eq("user_id", user.id)
        .single();

      if (!membership || !["admin", "owner", "manager"].includes(membership.role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 },
        );
      }
    }

    let responseData: MonitoringDashboard | unknown[] | Record<string, unknown>;

    switch (action) {
      case "dashboard":
        responseData = await getDashboardData();
        break;

      case "alerts":
        responseData = await getAlerts(searchParams);
        break;

      case "health":
        responseData = await getHealthStatus();
        break;

      case "metrics":
        responseData = await getMetrics(searchParams);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Monitoring API error", {
      error: {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a valid object" },
        { status: 400 },
      );
    }

    const { action, ...data } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Action field is required and must be a string" },
        { status: 400 },
      );
    }

    // allow boolean (acknowledge/resolve), string (created rule id) or object responses
    let result: boolean | string | Record<string, unknown> | null = null;

    switch (action) {
      case "acknowledge_alert":
        if (!data?.alertId) {
          return NextResponse.json(
            { error: "alertId is required for acknowledge_alert action" },
            { status: 400 },
          );
        }
        result = await acknowledgeAlert(data.alertId, user.id);
        break;

      case "resolve_alert":
        if (!data?.alertId) {
          return NextResponse.json(
            { error: "alertId is required for resolve_alert action" },
            { status: 400 },
          );
        }
        result = await resolveAlert(data.alertId, user.id, data.resolution);
        break;

      case "create_alert_rule":
        if (!data?.rule) {
          return NextResponse.json(
            { error: "rule is required for create_alert_rule action" },
            { status: 400 },
          );
        }
        if (!user?.id) {
          return NextResponse.json(
            { error: "User ID is required" },
            { status: 401 },
          );
        }
        result = await createAlertRule(data.rule, user.id);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Monitoring API POST error", {
      error: {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper functions

async function getDashboardData(): Promise<MonitoringDashboard> {
  try {
    const dashboard = await alertSystem.getDashboard();

    logger.info(LogCategory.SYSTEM, "Dashboard data retrieved", {
      metadata: {
        activeAlerts: dashboard.activeAlerts.length,
        systemHealth: dashboard.systemHealth.overall,
      },
    });

    return dashboard;
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Failed to get dashboard data", {
      error: {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    throw error;
  }
}

async function getAlerts(searchParams: URLSearchParams) {
  try {
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");
    const clinicId = searchParams.get("clinic_id");

    // Safe limit parsing with validation
    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 50;
    const rawLimit = searchParams.get("limit")?.trim();
    let limit = DEFAULT_LIMIT;

    if (rawLimit) {
      const parsedLimit = parseInt(rawLimit, 10);
      if (!isNaN(parsedLimit)) {
        limit = Math.max(1, Math.min(parsedLimit, MAX_LIMIT));
      }
    }

    const supabase = createClient();

    let query = supabase
      .from("alerts")
      .select("*")
      .order("triggered_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    if (severity) {
      query = query.eq("severity", severity);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      alerts: data || [],
      total: data?.length || 0,
      filters: { status, severity, category, clinicId },
    };
  } catch (error) {
    logger.error(LogCategory.DATABASE, "Failed to get alerts", {
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return { alerts: [], total: 0, error: "Failed to fetch alerts" };
  }
}

async function getHealthStatus() {
  try {
    const dashboard = await alertSystem.getDashboard();

    return {
      systemHealth: dashboard.systemHealth,
      performanceMetrics: dashboard.performanceMetrics,
      complianceStatus: dashboard.complianceStatus,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Failed to get health status", {
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return {
      systemHealth: {
        overall: "unknown",
        database: { status: "unknown" },
        api: { status: "unknown" },
        storage: { status: "unknown" },
        external: { status: "unknown" },
        uptime: 0,
        lastCheck: new Date(),
      },
      error: "Failed to fetch health status",
    };
  }
}

async function getMetrics(searchParams: URLSearchParams) {
  try {
    const type = searchParams.get("type") || "performance";
    const timeRange = searchParams.get("range") || "1h";

    const supabase = createClient();

    // Calculate time range
    const now = new Date();
    let fromTime: Date;

    switch (timeRange) {
      case "15m":
        fromTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case "1h":
        fromTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        fromTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        fromTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from("performance_metrics")
      .select("*")
      .gte("created_at", fromTime.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    // Process metrics data
    const metrics = (data || []) as DbPerformanceMetric[];
    const processedData = processMetricsData(metrics, type);

    return {
      metrics: processedData,
      timeRange,
      fromTime: fromTime.toISOString(),
      toTime: now.toISOString(),
      count: metrics.length,
    };
  } catch (error) {
    logger.error(LogCategory.DATABASE, "Failed to get metrics", {
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return { metrics: [], error: "Failed to fetch metrics" };
  }
}

async function acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
  try {
    const result = await alertSystem.acknowledgeAlert(alertId, userId);

    if (result) {
      logger.info(LogCategory.SYSTEM, "Alert acknowledged via API", {
        metadata: {
          alertId,
          userId,
        },
      });
    }

    return result;
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Failed to acknowledge alert", {
      metadata: {
        alertId,
        userId,
      },
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return false;
  }
}

async function resolveAlert(
  alertId: string,
  userId: string,
  resolution?: string,
): Promise<boolean> {
  try {
    const result = await alertSystem.resolveAlert(alertId, userId, resolution);

    if (result) {
      logger.info(LogCategory.SYSTEM, "Alert resolved via API", {
        metadata: {
          alertId,
          userId,
          resolution,
        },
      });
    }

    return result;
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Failed to resolve alert", {
      metadata: {
        alertId,
        userId,
      },
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return false;
  }
}

async function createAlertRule(rule: AlertRule, userId: string): Promise<string | null> {
  try {
    // Map incoming rule to the alertSystem expected shape, providing sensible defaults
    const payload = {
      // preserve original fields
      name: rule.name,
      description: rule.description ?? "",
      severity: rule.severity,
      enabled: rule.enabled ?? true,
      tags: rule.tags ?? [],

      // legacy/compat fields kept for downstream systems
      condition: rule.condition,
      threshold: rule.threshold,

      // Required fields for alertSystem.AlertRule (defaults used when missing)
      category: (rule as unknown).category ?? "general",
      metadata: {
        createdBy: userId,
        createdAt: new Date().toISOString(),
        ...(rule as unknown).metadata,
      },
      conditions: (rule as unknown).conditions ?? [
        {
          expression: rule.condition ?? "",
          threshold: rule.threshold,
        },
      ],
      actions: (rule as unknown).actions ?? [
        // default action: notify via email (adjust if your system uses different action shapes)
        { type: "notify", channels: ["email"] },
      ],
    };

    // Cast to unknown to satisfy the alertSystem parameter shape without importing external types
    const ruleId = await alertSystem.addAlertRule(payload as unknown);

    logger.info(LogCategory.SYSTEM, "Alert rule created via API", {
      metadata: {
        ruleId,
        ruleName: rule.name,
        userId,
      },
    });

    return ruleId;
  } catch (error) {
    logger.error(LogCategory.SYSTEM, "Failed to create alert rule", {
      metadata: {
        ruleName: rule?.name,
        userId,
      },
      error: error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : {
          name: "UnknownError",
          message: "Unknown error",
        },
    });

    return null;
  }
}

function processMetricsData(metrics: DbPerformanceMetric[], type: string) {
  // handle empty metrics early
  if (!metrics || metrics.length === 0) {
    return {
      timeSeries: [],
      summary: {
        totalDataPoints: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
      },
    };
  }

  // Group metrics by time buckets for charting
  const buckets = new Map<string, unknown[]>();

  metrics.forEach(metric => {
    // use DB column created_at (ISO timestamp from DB)
    const ts = metric.created_at;
    if (!ts) return; // skip if no timestamp available

    const bucket = new Date(ts).toISOString().slice(0, 16); // Minute precision
    if (!buckets.has(bucket)) {
      buckets.set(bucket, []);
    }
    buckets.get(bucket)?.push(metric);
  });

  // Convert to time series data
  const timeSeries = Array.from(buckets.entries())
    .map(([time, bucketMetrics]) => {
      const values = bucketMetrics
        .map(m => Number(m.metric_value ?? m.value ?? 0))
        .filter(v => !Number.isNaN(v));

      const count = values.length;
      const avgValue = count > 0 ? values.reduce((sum, v) => sum + v, 0) / count : 0;
      const maxValue = count > 0 ? Math.max(...values) : 0;
      const minValue = count > 0 ? Math.min(...values) : 0;

      return {
        timestamp: time,
        avg: Math.round(avgValue),
        max: maxValue,
        min: minValue,
        count,
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const allValues = metrics
    .map(m => Number(m.metric_value ?? NaN))
    .filter(v => !Number.isNaN(v));

  const totalDataPoints = allValues.length;
  const avgResponseTime = totalDataPoints > 0
    ? Math.round(allValues.reduce((s, v) => s + v, 0) / totalDataPoints)
    : 0;
  const maxResponseTime = totalDataPoints > 0 ? Math.max(...allValues) : 0;
  const minResponseTime = totalDataPoints > 0 ? Math.min(...allValues) : 0;

  return {
    timeSeries,
    summary: {
      totalDataPoints,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
    },
  };
}
