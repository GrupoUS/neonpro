/**
 * NeonPro Audit Statistics API
 *
 * API para consulta de estatísticas e métricas do sistema de auditoria.
 * Fornece dados agregados para dashboards e análises.
 *
 * Endpoints:
 * - GET /api/audit/statistics - Estatísticas gerais
 * - GET /api/audit/statistics/trends - Tendências temporais
 * - GET /api/audit/statistics/summary - Resumo executivo
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

import type { NextRequest } from "next/server";

// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================

const StatisticsQuerySchema = z.object({
  period: z.enum(["24h", "7d", "30d", "90d", "1y"]).default("30d"),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
  event_types: z.array(z.string()).optional(),
  severity_levels: z.array(z.nativeEnum(AuditSeverity)).optional(),
  include_trends: z.boolean().default(false),
});

const TrendsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
  metric: z.enum(["events", "users", "alerts", "errors"]).default("events"),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("x-vercel-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || remoteAddr || "unknown";
}

async function validateStatisticsAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, permissions")
      .eq("user_id", userId)
      .single();

    if (!profile) return false;

    const hasStatsAccess =
      profile.role === "admin" ||
      profile.role === "security_admin" ||
      profile.role === "compliance_officer" ||
      profile.permissions?.includes("audit.statistics");

    return hasStatsAccess;
  } catch (error) {
    console.error("Erro ao validar acesso de estatísticas:", error);
    return false;
  }
}

function getPeriodDates(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

async function getEventStatistics(supabase: any, filters: any) {
  const { startDate, endDate } = getPeriodDates(filters.period);

  // Estatísticas básicas
  let baseQuery = supabase
    .from("audit_logs")
    .select("event_type, severity, created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (filters.event_types?.length > 0) {
    baseQuery = baseQuery.in("event_type", filters.event_types);
  }

  if (filters.severity_levels?.length > 0) {
    baseQuery = baseQuery.in("severity", filters.severity_levels);
  }

  const { data: events, error } = await baseQuery;

  if (error) {
    throw error;
  }

  // Processar estatísticas
  const stats = {
    total_events: events?.length || 0,
    by_severity: {} as Record<string, number>,
    by_event_type: {} as Record<string, number>,
    by_hour: {} as Record<string, number>,
  };

  events?.forEach((event) => {
    // Por severidade
    stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;

    // Por tipo de evento
    stats.by_event_type[event.event_type] = (stats.by_event_type[event.event_type] || 0) + 1;

    // Por hora (últimas 24h)
    if (filters.period === "24h") {
      const hour = new Date(event.created_at).getHours();
      stats.by_hour[hour] = (stats.by_hour[hour] || 0) + 1;
    }
  });

  return stats;
}

async function getSecurityStatistics(supabase: any, filters: any) {
  const { startDate, endDate } = getPeriodDates(filters.period);

  // Alertas de segurança
  const { data: alerts, error: alertsError } = await supabase
    .from("security_alerts")
    .select("severity, status, created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (alertsError) {
    throw alertsError;
  }

  // Usuários únicos
  const { data: uniqueUsers, error: usersError } = await supabase
    .from("audit_logs")
    .select("user_id")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .not("user_id", "is", null);

  if (usersError) {
    throw usersError;
  }

  const uniqueUserIds = new Set(uniqueUsers?.map((u) => u.user_id) || []);

  return {
    total_alerts: alerts?.length || 0,
    open_alerts: alerts?.filter((a) => a.status === "open").length || 0,
    resolved_alerts: alerts?.filter((a) => a.status === "resolved").length || 0,
    unique_users: uniqueUserIds.size,
    alerts_by_severity:
      alerts?.reduce(
        (acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ) || {},
  };
}

async function getTrendData(supabase: any, filters: any) {
  const { startDate, endDate } = getPeriodDates(filters.period);

  let dateFormat: string;
  let _interval: string;

  switch (filters.granularity) {
    case "hour":
      dateFormat = "YYYY-MM-DD HH24:00:00";
      _interval = "1 hour";
      break;
    case "day":
      dateFormat = "YYYY-MM-DD";
      _interval = "1 day";
      break;
    case "week":
      dateFormat = 'YYYY-"W"WW';
      _interval = "1 week";
      break;
    case "month":
      dateFormat = "YYYY-MM";
      _interval = "1 month";
      break;
    default:
      dateFormat = "YYYY-MM-DD";
      _interval = "1 day";
  }

  let query: string;

  switch (filters.metric) {
    case "events":
      query = `
        SELECT 
          to_char(date_trunc('${filters.granularity}', created_at), '${dateFormat}') as period,
          count(*) as value
        FROM audit_logs 
        WHERE created_at >= '${startDate.toISOString()}' 
          AND created_at <= '${endDate.toISOString()}'
        GROUP BY date_trunc('${filters.granularity}', created_at)
        ORDER BY period
      `;
      break;
    case "users":
      query = `
        SELECT 
          to_char(date_trunc('${filters.granularity}', created_at), '${dateFormat}') as period,
          count(DISTINCT user_id) as value
        FROM audit_logs 
        WHERE created_at >= '${startDate.toISOString()}' 
          AND created_at <= '${endDate.toISOString()}'
          AND user_id IS NOT NULL
        GROUP BY date_trunc('${filters.granularity}', created_at)
        ORDER BY period
      `;
      break;
    case "alerts":
      query = `
        SELECT 
          to_char(date_trunc('${filters.granularity}', created_at), '${dateFormat}') as period,
          count(*) as value
        FROM security_alerts 
        WHERE created_at >= '${startDate.toISOString()}' 
          AND created_at <= '${endDate.toISOString()}'
        GROUP BY date_trunc('${filters.granularity}', created_at)
        ORDER BY period
      `;
      break;
    case "errors":
      query = `
        SELECT 
          to_char(date_trunc('${filters.granularity}', created_at), '${dateFormat}') as period,
          count(*) as value
        FROM audit_logs 
        WHERE created_at >= '${startDate.toISOString()}' 
          AND created_at <= '${endDate.toISOString()}'
          AND severity IN ('high', 'critical')
        GROUP BY date_trunc('${filters.granularity}', created_at)
        ORDER BY period
      `;
      break;
    default:
      throw new Error("Invalid metric type");
  }

  const { data, error } = await supabase.rpc("execute_sql", { query });

  if (error) {
    throw error;
  }

  return data || [];
}

// =====================================================
// GET: ESTATÍSTICAS GERAIS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimit({
      key: `audit-stats-${clientIP}`,
      limit: 120,
      window: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Autenticação
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validação de permissões
    const hasAccess = await validateStatisticsAccess(supabase, user.id);
    if (!hasAccess) {
      await logSecurityEvent({
        type: "insufficient_permissions",
        severity: "medium",
        description: "Usuário sem permissões para acessar estatísticas de auditoria",
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse da URL para determinar o tipo de estatística
    const { pathname, searchParams } = new URL(request.url);

    if (pathname.endsWith("/trends")) {
      // Tendências temporais
      const rawFilters = {
        period: searchParams.get("period") || "30d",
        granularity: searchParams.get("granularity") || "day",
        metric: searchParams.get("metric") || "events",
      };

      const validationResult = TrendsQuerySchema.safeParse(rawFilters);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: validationResult.error.errors,
          },
          { status: 400 },
        );
      }

      const filters = validationResult.data;
      const trendData = await getTrendData(supabase, filters);

      return NextResponse.json({
        success: true,
        data: {
          metric: filters.metric,
          period: filters.period,
          granularity: filters.granularity,
          trends: trendData,
        },
      });
    } else if (pathname.endsWith("/summary")) {
      // Resumo executivo
      const { startDate: start30d } = getPeriodDates("30d");
      const { startDate: start7d } = getPeriodDates("7d");

      // Estatísticas dos últimos 30 dias
      const [events30d, security30d] = await Promise.all([
        getEventStatistics(supabase, { period: "30d" }),
        getSecurityStatistics(supabase, { period: "30d" }),
      ]);

      // Estatísticas dos últimos 7 dias para comparação
      const [events7d, security7d] = await Promise.all([
        getEventStatistics(supabase, { period: "7d" }),
        getSecurityStatistics(supabase, { period: "7d" }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            total_events_30d: events30d.total_events,
            total_events_7d: events7d.total_events,
            total_alerts_30d: security30d.total_alerts,
            total_alerts_7d: security7d.total_alerts,
            unique_users_30d: security30d.unique_users,
            open_alerts: security30d.open_alerts,
          },
          trends: {
            events_change: events7d.total_events - events30d.total_events / 4.3, // média semanal
            alerts_change: security7d.total_alerts - security30d.total_alerts / 4.3,
          },
        },
      });
    } else {
      // Estatísticas gerais
      const rawFilters = {
        period: searchParams.get("period") || "30d",
        granularity: searchParams.get("granularity") || "day",
        event_types: searchParams.get("event_types")?.split(","),
        severity_levels: searchParams.get("severity_levels")?.split(","),
        include_trends: searchParams.get("include_trends") === "true",
      };

      const validationResult = StatisticsQuerySchema.safeParse(rawFilters);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: validationResult.error.errors,
          },
          { status: 400 },
        );
      }

      const filters = validationResult.data;

      // Buscar estatísticas
      const [eventStats, securityStats] = await Promise.all([
        getEventStatistics(supabase, filters),
        getSecurityStatistics(supabase, filters),
      ]);

      let trendData = null;
      if (filters.include_trends) {
        trendData = await getTrendData(supabase, {
          period: filters.period,
          granularity: filters.granularity,
          metric: "events",
        });
      }

      // Log da consulta
      await logAuditEvent({
        event_type: AuditEventType.STATISTICS_ACCESS,
        severity: AuditSeverity.LOW,
        description: "Consulta de estatísticas de auditoria realizada",
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || undefined,
        metadata: {
          filters_applied: filters,
          period: filters.period,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          period: filters.period,
          events: eventStats,
          security: securityStats,
          trends: trendData,
        },
      });
    }
  } catch (error) {
    console.error("Erro na consulta de estatísticas:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =====================================================
// OPTIONS: CORS
// =====================================================

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
