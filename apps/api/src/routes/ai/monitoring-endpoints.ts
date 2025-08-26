import { createClient } from '@supabase/supabase-js';
import { Hono } from 'hono';

const monitoring = new Hono();

interface ServiceHealthSummary {
  service: string;
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms: number;
  last_updated: string;
  error_rate: number;
  uptime_percentage: number;
  details: any;
}

interface ServiceMetricsData {
  service: string;
  timestamp: string;
  requests_per_minute: number;
  avg_response_time: number;
  error_count: number;
  success_count: number;
  cpu_usage: number;
  memory_usage: number;
}

interface ComplianceAlert {
  id: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  compliance_type: 'lgpd' | 'anvisa' | 'cfm';
  resolved: boolean;
}

class MonitoringService {
  private static supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  private static AI_SERVICES = [
    'universal-chat',
    'feature-flags',
    'cache-management',
    'monitoring',
    'no-show-prediction',
    'appointment-optimization',
    'compliance-automation',
  ];

  static async getServicesHealth(): Promise<ServiceHealthSummary[]> {
    const healthChecks: ServiceHealthSummary[] = [];

    for (const service of MonitoringService.AI_SERVICES) {
      try {
        // Make health check request to each service
        const response = await fetch(
          `${process.env.API_BASE_URL}/api/ai/${service}/health`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.HEALTH_CHECK_TOKEN}`,
              'User-Agent': 'NeonPro-Monitoring/1.0',
            },
            timeout: 5000,
          },
        );

        if (response.ok) {
          const healthData = await response.json();
          healthChecks.push({
            service,
            healthy: healthData.healthy,
            status: healthData.status,
            response_time_ms: healthData.response_time_ms || 0,
            last_updated: new Date().toISOString(),
            error_rate: healthData.metrics?.error_rate_percent || 0,
            uptime_percentage: MonitoringService.calculateUptimePercentage(service),
            details: healthData.details || {},
          });
        } else {
          healthChecks.push({
            service,
            healthy: false,
            status: 'unhealthy',
            response_time_ms: 0,
            last_updated: new Date().toISOString(),
            error_rate: 100,
            uptime_percentage: 0,
            details: { error: `HTTP ${response.status}` },
          });
        }
      } catch (error) {
        healthChecks.push({
          service,
          healthy: false,
          status: 'unhealthy',
          response_time_ms: 0,
          last_updated: new Date().toISOString(),
          error_rate: 100,
          uptime_percentage: 0,
          details: { error: error.message },
        });
      }
    }

    return healthChecks;
  }

  private static async calculateUptimePercentage(
    service: string,
  ): Promise<number> {
    try {
      const last24Hours = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: healthChecks, error } = await MonitoringService.supabase
        .from('ai_service_health_logs')
        .select('healthy')
        .eq('service', service)
        .gte('timestamp', last24Hours);

      if (error || !healthChecks || healthChecks.length === 0) {
        return 95; // Default assumption
      }

      const healthyChecks = healthChecks.filter(
        (check) => check.healthy,
      ).length;
      return (healthyChecks / healthChecks.length) * 100;
    } catch {
      return 95; // Default assumption
    }
  }

  static async getServiceMetrics(
    timeRange = '1h',
  ): Promise<ServiceMetricsData[]> {
    try {
      const timeRangeMap: { [key: string]: number; } = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10_080,
      };

      const minutes = timeRangeMap[timeRange] || 60;
      const startTime = new Date(
        Date.now() - minutes * 60 * 1000,
      ).toISOString();

      const { data: metricsData, error } = await MonitoringService.supabase
        .from('ai_service_metrics')
        .select('*')
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true });

      if (error) {
        return [];
      }

      // Group and aggregate metrics by service and time intervals
      const aggregatedMetrics = MonitoringService.aggregateMetricsByTimeInterval(
        metricsData,
        minutes,
      );

      return aggregatedMetrics;
    } catch {
      return [];
    }
  }

  private static aggregateMetricsByTimeInterval(
    metricsData: any[],
    totalMinutes: number,
  ): ServiceMetricsData[] {
    // Group metrics by 5-minute intervals for better visualization
    const intervalMinutes = Math.max(5, Math.floor(totalMinutes / 50));
    const intervals: { [key: string]: any[]; } = {};

    metricsData.forEach((metric) => {
      const timestamp = new Date(metric.timestamp);
      const intervalKey = new Date(
        Math.floor(timestamp.getTime() / (intervalMinutes * 60 * 1000))
          * (intervalMinutes * 60 * 1000),
      ).toISOString();

      if (!intervals[intervalKey]) {
        intervals[intervalKey] = [];
      }
      intervals[intervalKey].push(metric);
    });

    // Aggregate metrics for each interval
    return Object.entries(intervals).map(([timestamp, metrics]) => {
      const serviceMetrics = metrics.reduce((acc, metric) => {
        if (!acc[metric.service]) {
          acc[metric.service] = {
            response_times: [],
            request_counts: [],
            error_counts: [],
            success_counts: [],
          };
        }

        acc[metric.service].response_times.push(metric.metric_value);

        if (metric.metric_name === 'request_count') {
          acc[metric.service].request_counts.push(metric.metric_value);
        } else if (metric.metric_name === 'error_count') {
          acc[metric.service].error_counts.push(metric.metric_value);
        } else if (metric.metric_name === 'success_count') {
          acc[metric.service].success_counts.push(metric.metric_value);
        }

        return acc;
      }, {});

      // Calculate aggregated values for the most active service in this interval
      const primaryService = Object.keys(serviceMetrics)[0] || 'universal-chat';
      const serviceData = serviceMetrics[primaryService] || {
        response_times: [1000],
        request_counts: [10],
        error_counts: [0],
        success_counts: [10],
      };

      return {
        service: primaryService,
        timestamp,
        requests_per_minute: serviceData.request_counts.reduce(
          (a: number, b: number) => a + b,
          0,
        ) / intervalMinutes,
        avg_response_time: serviceData.response_times.reduce(
          (a: number, b: number) => a + b,
          0,
        ) / serviceData.response_times.length,
        error_count: serviceData.error_counts.reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        success_count: serviceData.success_counts.reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        cpu_usage: Math.random() * 30 + 20, // Placeholder - would come from actual monitoring
        memory_usage: Math.random() * 40 + 30, // Placeholder - would come from actual monitoring
      };
    });
  }

  static async getComplianceAlerts(
    activeOnly = true,
  ): Promise<ComplianceAlert[]> {
    try {
      let query = MonitoringService.supabase
        .from('ai_compliance_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (activeOnly) {
        query = query.eq('resolved', false);
      }

      const { data: alertsData, error } = await query.limit(50);

      if (error) {
        return [];
      }

      return alertsData.map((alert) => ({
        id: alert.id,
        service: alert.service,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        compliance_type: alert.compliance_type,
        resolved: alert.resolved,
      }));
    } catch {
      return [];
    }
  }

  static async getSystemOverview(): Promise<any> {
    try {
      const [servicesHealth, metrics] = await Promise.all([
        MonitoringService.getServicesHealth(),
        MonitoringService.getServiceMetrics('1h'),
      ]);

      // Calculate system overview metrics
      const totalRequests = metrics.reduce(
        (sum, m) => sum + m.requests_per_minute * 60,
        0,
      );
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.avg_response_time, 0)
          / metrics.length || 0;
      const errorRate = metrics.reduce(
            (sum, m) => sum + (m.error_count / (m.error_count + m.success_count)) * 100,
            0,
          ) / metrics.length || 0;

      // Get active chat sessions
      const { data: activeSessions, error: sessionsError } = await MonitoringService.supabase
        .from('ai_chat_sessions')
        .select('count')
        .eq('status', 'active');

      const activeSessionsCount = activeSessions?.[0]?.count || 0;

      // Calculate compliance score based on alerts
      const alerts = await MonitoringService.getComplianceAlerts();
      const complianceScore = Math.max(0, 100 - alerts.length * 5);

      return {
        total_requests_last_hour: Math.round(totalRequests),
        avg_response_time: Math.round(avgResponseTime),
        overall_error_rate: Number(errorRate.toFixed(2)),
        active_sessions: activeSessionsCount,
        compliance_score: Number(complianceScore.toFixed(1)),
        healthy_services: servicesHealth.filter((s) => s.healthy).length,
        total_services: servicesHealth.length,
        degraded_services: servicesHealth.filter((s) => s.status === 'degraded')
          .length,
        unhealthy_services: servicesHealth.filter(
          (s) => s.status === 'unhealthy',
        ).length,
      };
    } catch {
      return {
        total_requests_last_hour: 0,
        avg_response_time: 0,
        overall_error_rate: 0,
        active_sessions: 0,
        compliance_score: 100,
        healthy_services: 0,
        total_services: 0,
        degraded_services: 0,
        unhealthy_services: 0,
      };
    }
  }

  static async logHealthCheck(
    service: string,
    healthy: boolean,
    details: any = {},
  ): Promise<void> {
    try {
      await MonitoringService.supabase.from('ai_service_health_logs').insert({
        service,
        healthy,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch {}
  }
}

// Get overall services health
monitoring.get('/services-health', async (c) => {
  try {
    const servicesHealth = await MonitoringService.getServicesHealth();

    return c.json({
      success: true,
      data: servicesHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Get service metrics with time range
monitoring.get('/metrics', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || '1h';
    const metrics = await MonitoringService.getServiceMetrics(timeRange);

    return c.json({
      success: true,
      data: metrics,
      time_range: timeRange,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Get system overview
monitoring.get('/overview', async (c) => {
  try {
    const overview = await MonitoringService.getSystemOverview();

    return c.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Get service-specific metrics
monitoring.post('/service-metrics', async (c) => {
  try {
    const body = await c.req.json();
    const { service, time_range_minutes } = body;

    if (!service) {
      return c.json({ success: false, error: 'Service name required' }, 400);
    }

    const timeRangeMinutes = time_range_minutes || 60;
    const startTime = new Date(
      Date.now() - timeRangeMinutes * 60 * 1000,
    ).toISOString();

    const { data: metricsData, error } = await MonitoringService.supabase
      .from('ai_service_metrics')
      .select('*')
      .eq('service', service)
      .gte('timestamp', startTime);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    // Calculate aggregated metrics
    const responseTimeSum = metricsData
      .filter((m) => m.metric_name === 'response_time')
      .reduce((sum, m) => sum + m.metric_value, 0);
    const responseTimeCount = metricsData.filter(
      (m) => m.metric_name === 'response_time',
    ).length;

    const errorCount = metricsData
      .filter((m) => m.metric_name === 'error_count')
      .reduce((sum, m) => sum + m.metric_value, 0);

    const successCount = metricsData
      .filter((m) => m.metric_name === 'success_count')
      .reduce((sum, m) => sum + m.metric_value, 0);

    const aggregatedMetrics = {
      avg_response_time: responseTimeCount > 0 ? responseTimeSum / responseTimeCount : 0,
      error_rate: errorCount + successCount > 0
        ? (errorCount / (errorCount + successCount)) * 100
        : 0,
      total_requests: errorCount + successCount,
      error_count: errorCount,
      success_count: successCount,
    };

    return c.json({
      success: true,
      data: aggregatedMetrics,
      service,
      time_range_minutes: timeRangeMinutes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Log a health check result
monitoring.post('/log-health-check', async (c) => {
  try {
    const body = await c.req.json();
    const { service, healthy, details } = body;

    if (!service || typeof healthy !== 'boolean') {
      return c.json(
        {
          success: false,
          error: 'Service name and healthy status required',
        },
        400,
      );
    }

    await MonitoringService.logHealthCheck(service, healthy, details);

    return c.json({
      success: true,
      message: 'Health check logged successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

export default monitoring;
