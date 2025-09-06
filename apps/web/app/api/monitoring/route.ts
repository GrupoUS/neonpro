import { LogCategory, logger, LogLevel } from "@/lib/logger";
import { alertSystem, type MonitoringDashboard } from "@/lib/monitoring/alert-system";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

    let responseData: any;

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
    logger.log(LogLevel.ERROR, "Monitoring API error", {
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

    const body = await request.json();
    const { action, ...data } = body;

    let result: any;

    switch (action) {
      case "acknowledge_alert":
        result = await acknowledgeAlert(data.alertId, user.id);
        break;

      case "resolve_alert":
        result = await resolveAlert(data.alertId, user.id, data.resolution);
        break;

      case "create_alert_rule":
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
    logger.log(LogLevel.ERROR, "Monitoring API POST error", {
      category: LogCategory.SYSTEM,
      error: error instanceof Error ? error.message : "Unknown error",
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

    logger.log(LogLevel.INFO, "Dashboard data retrieved", {
      category: LogCategory.SYSTEM,
      activeAlerts: dashboard.activeAlerts.length,
      systemHealth: dashboard.systemHealth.overall,
    });

    return dashboard;
  } catch (error) {
    logger.log(LogLevel.ERROR, "Failed to get dashboard data", {
      category: LogCategory.SYSTEM,
      error: error instanceof Error ? error.message : "Unknown error",
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
    const limit = parseInt(searchParams.get("limit") || "50");

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
    logger.log(LogLevel.ERROR, "Failed to get alerts", {
      category: LogCategory.DATABASE,
      error: error instanceof Error ? error.message : "Unknown error",
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
    logger.log(LogLevel.ERROR, "Failed to get health status", {
      category: LogCategory.SYSTEM,
      error: error instanceof Error ? error.message : "Unknown error",
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
    const metrics = data || [];
    const processedData = processMetricsData(metrics, type);

    return {
      metrics: processedData,
      timeRange,
      fromTime: fromTime.toISOString(),
      toTime: now.toISOString(),
      count: metrics.length,
    };
  } catch (error) {
    logger.log(LogLevel.ERROR, "Failed to get metrics", {
      category: LogCategory.DATABASE,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return { metrics: [], error: "Failed to fetch metrics" };
  }
}

async function acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
  try {
    const result = await alertSystem.acknowledgeAlert(alertId, userId);

    if (result) {
      logger.log(LogLevel.INFO, "Alert acknowledged via API", {
        category: LogCategory.SYSTEM,
        alertId,
        userId,
      });
    }

    return result;
  } catch (error) {
    logger.log(LogLevel.ERROR, "Failed to acknowledge alert", {
      category: LogCategory.SYSTEM,
      alertId,
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
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
      logger.log(LogLevel.INFO, "Alert resolved via API", {
        category: LogCategory.SYSTEM,
        alertId,
        userId,
        resolution,
      });
    }

    return result;
  } catch (error) {
    logger.log(LogLevel.ERROR, "Failed to resolve alert", {
      category: LogCategory.SYSTEM,
      alertId,
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return false;
  }
}

async function createAlertRule(rule: any, userId: string): Promise<string | null> {
  try {
    const ruleId = await alertSystem.addAlertRule(rule);

    logger.log(LogLevel.INFO, "Alert rule created via API", {
      category: LogCategory.SYSTEM,
      ruleId,
      ruleName: rule.name,
      userId,
    });

    return ruleId;
  } catch (error) {
    logger.log(LogLevel.ERROR, "Failed to create alert rule", {
      category: LogCategory.SYSTEM,
      ruleName: rule?.name,
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return null;
  }
}

function processMetricsData(metrics: any[], type: string) {
  // Group metrics by time buckets for charting
  const buckets = new Map<string, any[]>();

  metrics.forEach(metric => {
    const bucket = new Date(metric.created_at).toISOString().slice(0, 16); // Minute precision
    if (!buckets.has(bucket)) {
      buckets.set(bucket, []);
    }
    buckets.get(bucket)?.push(metric);
  });

  // Convert to time series data
  const timeSeries = Array.from(buckets.entries())
    .map(([time, bucketMetrics]) => {
      const avgValue = bucketMetrics.reduce((sum, m) => sum + Number(m.metric_value), 0)
        / bucketMetrics.length;
      const maxValue = Math.max(...bucketMetrics.map(m => Number(m.metric_value)));
      const minValue = Math.min(...bucketMetrics.map(m => Number(m.metric_value)));

      return {
        timestamp: time,
        avg: Math.round(avgValue),
        max: maxValue,
        min: minValue,
        count: bucketMetrics.length,
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    timeSeries,
    summary: {
      totalDataPoints: metrics.length,
      avgResponseTime: Math.round(
        metrics.reduce((sum, m) => sum + Number(m.metric_value), 0) / metrics.length,
      ),
      maxResponseTime: Math.max(...metrics.map(m => Number(m.metric_value))),
      minResponseTime: Math.min(...metrics.map(m => Number(m.metric_value))),
    },
  };
}
