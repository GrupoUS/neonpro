// Healthcare Monitoring API Endpoints - Real-time System Health & Compliance Monitoring
// RESTful API for comprehensive healthcare platform monitoring

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HealthcareMonitoringService } from '../../../../../packages/ai/src/services/healthcare-monitoring-service';
import type { CacheService, LoggerService, MetricsService } from '@neonpro/core-services';

// Validation Schemas
const AlertFiltersSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  category: z.enum(['patient_safety', 'ai_performance', 'business', 'system', 'compliance', 'security']).optional(),
  limit: z.number().min(1).max(100).default(20),
});

const AlertActionSchema = z.object({
  action: z.enum(['acknowledge', 'resolve']),
  performed_by: z.string().min(1),
  resolution: z.string().optional(),
});

const MetricsQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format').optional(),
  metrics: z.array(z.string()).optional(),
  granularity: z.enum(['minute', 'hour', 'day']).default('hour'),
});

// Initialize services
const mockCache: CacheService = {
  get: async () => null,
  set: async () => true,
  delete: async () => true,
  clear: async () => true
};

const mockLogger: LoggerService = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta),
  debug: (message: string, meta?: any) => console.debug(`[DEBUG] ${message}`, meta)
};

const mockMetrics: MetricsService = {
  increment: async () => {},
  histogram: async () => {},
  gauge: async () => {},
  timer: async () => ({ end: () => {} })
};

// Initialize Healthcare Monitoring Service
const healthcareMonitoringService = new HealthcareMonitoringService(
  mockCache,
  mockLogger,
  mockMetrics
);

// Create Hono app for healthcare monitoring endpoints
export const healthcareMonitoringRoutes = new Hono();

// Middleware for performance monitoring
healthcareMonitoringRoutes.use('*', async (c, next) => {
  const startTime = performance.now();
  const path = c.req.path;
  const method = c.req.method;

  await next();

  const processingTime = performance.now() - startTime;
  const responseStatus = c.res.status;

  console.log(`[MONITORING-API] ${method} ${path} - ${responseStatus} - ${processingTime.toFixed(2)}ms`);

  // Log slow requests (>1000ms for monitoring endpoints)
  if (processingTime > 1000) {
    console.warn(`[MONITORING-API-SLOW] ${method} ${path} took ${processingTime.toFixed(2)}ms`);
  }
});

// Health check endpoint for the monitoring service itself
healthcareMonitoringRoutes.get('/health', async (c) => {
  const health = {
    service: 'healthcare-monitoring-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    monitoring_status: {
      metrics_collection: 'active',
      alert_evaluation: 'active',
      dashboard_updates: 'active',
      notification_channels: 'configured'
    },
    memory_usage: {
      used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    }
  };

  return c.json(health);
});

// Get current system metrics
healthcareMonitoringRoutes.get('/metrics/current', async (c) => {
  const startTime = performance.now();

  try {
    const metrics = await healthcareMonitoringService.getCurrentMetrics();
    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      metrics: metrics,
      collected_at: new Date().toISOString(),
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[METRICS-CURRENT-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get current metrics',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Get comprehensive dashboard data
healthcareMonitoringRoutes.get('/dashboard', async (c) => {
  const startTime = performance.now();

  try {
    const dashboardData = await healthcareMonitoringService.getDashboardData();
    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      dashboard: dashboardData,
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[DASHBOARD-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dashboard data',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Get active alerts with filtering
healthcareMonitoringRoutes.get('/alerts',
  zValidator('query', AlertFiltersSchema),
  async (c) => {
    const startTime = performance.now();

    try {
      const query = c.req.valid('query');
      
      const alerts = await healthcareMonitoringService.getActiveAlerts({
        severity: query.severity,
        category: query.category,
        limit: query.limit
      });

      const processingTime = performance.now() - startTime;

      return c.json({
        success: true,
        alerts: alerts,
        count: alerts.length,
        filters_applied: {
          severity: query.severity,
          category: query.category,
          limit: query.limit
        },
        processing_time_ms: Math.round(processingTime)
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('[ALERTS-LIST-ERROR]', error);

      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get alerts',
        processing_time_ms: Math.round(processingTime)
      }, 500);
    }
  }
);

// Get specific alert by ID
healthcareMonitoringRoutes.get('/alerts/:alertId', async (c) => {
  const startTime = performance.now();

  try {
    const alertId = c.req.param('alertId');

    if (!alertId) {
      return c.json({
        success: false,
        error: 'Alert ID is required'
      }, 400);
    }

    // Get all alerts and find the specific one
    const allAlerts = await healthcareMonitoringService.getActiveAlerts({ limit: 1000 });
    const alert = allAlerts.find(a => a.id === alertId);

    if (!alert) {
      return c.json({
        success: false,
        error: 'Alert not found'
      }, 404);
    }

    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      alert: alert,
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[ALERT-GET-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get alert',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Acknowledge or resolve an alert
healthcareMonitoringRoutes.post('/alerts/:alertId/action',
  zValidator('json', AlertActionSchema),
  async (c) => {
    const startTime = performance.now();

    try {
      const alertId = c.req.param('alertId');
      const body = c.req.valid('json');

      if (!alertId) {
        return c.json({
          success: false,
          error: 'Alert ID is required'
        }, 400);
      }

      let result: boolean;
      let message: string;

      if (body.action === 'acknowledge') {
        result = await healthcareMonitoringService.acknowledgeAlert(alertId, body.performed_by);
        message = result ? 'Alert acknowledged successfully' : 'Failed to acknowledge alert or alert not found';
      } else if (body.action === 'resolve') {
        if (!body.resolution) {
          return c.json({
            success: false,
            error: 'Resolution description is required for resolve action'
          }, 400);
        }
        result = await healthcareMonitoringService.resolveAlert(alertId, body.performed_by, body.resolution);
        message = result ? 'Alert resolved successfully' : 'Failed to resolve alert or alert not found';
      } else {
        return c.json({
          success: false,
          error: 'Invalid action. Must be "acknowledge" or "resolve"'
        }, 400);
      }

      const processingTime = performance.now() - startTime;

      return c.json({
        success: result,
        message: message,
        alert_id: alertId,
        action: body.action,
        performed_by: body.performed_by,
        processing_time_ms: Math.round(processingTime)
      }, result ? 200 : 404);

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('[ALERT-ACTION-ERROR]', error);

      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform alert action',
        processing_time_ms: Math.round(processingTime)
      }, 500);
    }
  }
);

// Get system status summary
healthcareMonitoringRoutes.get('/status', async (c) => {
  const startTime = performance.now();

  try {
    const dashboardData = await healthcareMonitoringService.getDashboardData();
    
    const statusSummary = {
      system_status: dashboardData.system_status,
      overall_health_score: dashboardData.overall_health_score,
      last_updated: dashboardData.last_updated,
      critical_alerts: dashboardData.active_alerts.filter(a => a.severity === 'critical').length,
      high_alerts: dashboardData.active_alerts.filter(a => a.severity === 'high').length,
      total_active_alerts: dashboardData.active_alerts.length,
      sla_status: dashboardData.sla_status,
      key_metrics: {
        patient_safety_score: Math.round((dashboardData.current_metrics.patient_safety.critical_data_availability_percentage / 100) * 100),
        ai_accuracy: Math.round(dashboardData.current_metrics.ai_performance.ai_accuracy_percentage),
        api_response_time: Math.round(dashboardData.current_metrics.system_performance.api_response_time_ms),
        compliance_score: Math.round((
          dashboardData.current_metrics.compliance_status.lgpd_compliance_score +
          dashboardData.current_metrics.compliance_status.anvisa_compliance_score +
          dashboardData.current_metrics.compliance_status.cfm_compliance_score
        ) / 3)
      }
    };

    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      status: statusSummary,
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[STATUS-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get system status',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Get historical metrics data
healthcareMonitoringRoutes.get('/metrics/history',
  zValidator('query', MetricsQuerySchema),
  async (c) => {
    const startTime = performance.now();

    try {
      const query = c.req.valid('query');
      
      // In production, this would query stored historical data
      // For now, return simulated historical data
      const endTime = query.end_date ? new Date(query.end_date).getTime() : Date.now();
      const startTimeQuery = query.start_date ? new Date(query.start_date).getTime() : endTime - (24 * 60 * 60 * 1000); // 24h ago

      const historicalData = {
        time_range: {
          start: new Date(startTimeQuery).toISOString(),
          end: new Date(endTime).toISOString(),
          granularity: query.granularity
        },
        metrics: {
          'patient_safety.emergency_access_response_time_ms': generateHistoricalMetric(startTimeQuery, endTime, query.granularity, 2000, 3500),
          'ai_performance.ai_accuracy_percentage': generateHistoricalMetric(startTimeQuery, endTime, query.granularity, 96, 99),
          'system_performance.api_response_time_ms': generateHistoricalMetric(startTimeQuery, endTime, query.granularity, 150, 400),
          'compliance_status.lgpd_compliance_score': generateHistoricalMetric(startTimeQuery, endTime, query.granularity, 95, 99),
          'business_metrics.roi_monthly': generateHistoricalMetric(startTimeQuery, endTime, query.granularity, 60000, 120000)
        }
      };

      const processingTime = performance.now() - startTime;

      return c.json({
        success: true,
        historical_data: historicalData,
        processing_time_ms: Math.round(processingTime)
      });

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('[METRICS-HISTORY-ERROR]', error);

      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get historical metrics',
        processing_time_ms: Math.round(processingTime)
      }, 500);
    }
  }
);

// Get compliance report
healthcareMonitoringRoutes.get('/compliance/report', async (c) => {
  const startTime = performance.now();

  try {
    const metrics = await healthcareMonitoringService.getCurrentMetrics();
    const alerts = await healthcareMonitoringService.getActiveAlerts({
      category: 'compliance',
      limit: 50
    });

    const complianceReport = {
      generated_at: new Date().toISOString(),
      overall_status: 'compliant', // Would be calculated based on scores
      compliance_scores: {
        lgpd: {
          score: metrics.compliance_status.lgpd_compliance_score,
          status: metrics.compliance_status.lgpd_compliance_score >= 95 ? 'compliant' : 'non_compliant',
          violations: metrics.compliance_status.data_retention_violations + metrics.compliance_status.access_control_violations,
          last_audit: '2024-01-15T10:00:00Z' // Simulated
        },
        anvisa: {
          score: metrics.compliance_status.anvisa_compliance_score,
          status: metrics.compliance_status.anvisa_compliance_score >= 95 ? 'compliant' : 'non_compliant',
          medical_data_protection: 'compliant',
          last_inspection: '2024-02-01T14:00:00Z' // Simulated
        },
        cfm: {
          score: metrics.compliance_status.cfm_compliance_score,
          status: metrics.compliance_status.cfm_compliance_score >= 95 ? 'compliant' : 'non_compliant',
          professional_standards: 'compliant',
          last_review: '2024-01-20T16:00:00Z' // Simulated
        }
      },
      active_compliance_issues: alerts.length,
      compliance_alerts: alerts,
      audit_log_completeness: metrics.compliance_status.audit_log_completeness,
      data_retention_status: {
        violations: metrics.compliance_status.data_retention_violations,
        policy_adherence: metrics.compliance_status.data_retention_violations === 0 ? 'compliant' : 'issues_detected'
      },
      access_control_status: {
        violations: metrics.compliance_status.access_control_violations,
        policy_adherence: metrics.compliance_status.access_control_violations === 0 ? 'compliant' : 'issues_detected'
      },
      recommendations: generateComplianceRecommendations(metrics.compliance_status, alerts)
    };

    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      compliance_report: complianceReport,
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[COMPLIANCE-REPORT-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate compliance report',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Performance analytics endpoint
healthcareMonitoringRoutes.get('/analytics/performance', async (c) => {
  const startTime = performance.now();

  try {
    const metrics = await healthcareMonitoringService.getCurrentMetrics();
    const dashboardData = await healthcareMonitoringService.getDashboardData();

    const performanceAnalytics = {
      generated_at: new Date().toISOString(),
      overall_performance_score: dashboardData.overall_health_score,
      system_status: dashboardData.system_status,
      
      response_times: {
        api_current: metrics.system_performance.api_response_time_ms,
        api_target: 500,
        api_status: metrics.system_performance.api_response_time_ms <= 500 ? 'meeting_target' : 'below_target',
        
        database_current: metrics.system_performance.database_query_time_ms,
        database_target: 100,
        database_status: metrics.system_performance.database_query_time_ms <= 100 ? 'meeting_target' : 'below_target',
        
        emergency_access_current: metrics.patient_safety.emergency_access_response_time_ms,
        emergency_access_target: 5000,
        emergency_access_status: metrics.patient_safety.emergency_access_response_time_ms <= 5000 ? 'meeting_target' : 'critical'
      },
      
      resource_utilization: {
        memory: {
          current: metrics.system_performance.memory_usage_percentage,
          threshold: 80,
          status: metrics.system_performance.memory_usage_percentage <= 80 ? 'normal' : 'high'
        },
        cpu: {
          current: metrics.system_performance.cpu_usage_percentage,
          threshold: 70,
          status: metrics.system_performance.cpu_usage_percentage <= 70 ? 'normal' : 'high'
        },
        cache_efficiency: {
          hit_rate: metrics.system_performance.cache_hit_rate_percentage,
          target: 85,
          status: metrics.system_performance.cache_hit_rate_percentage >= 85 ? 'good' : 'needs_improvement'
        }
      },
      
      ai_performance: {
        accuracy: metrics.ai_performance.ai_accuracy_percentage,
        latency: metrics.ai_performance.streaming_latency_ms,
        confidence: metrics.ai_performance.prediction_confidence_avg,
        error_rate: metrics.ai_performance.error_rate_percentage,
        model_drift: metrics.ai_performance.model_drift_score
      },
      
      trends: dashboardData.trends,
      
      recommendations: generatePerformanceRecommendations(metrics, dashboardData.active_alerts)
    };

    const processingTime = performance.now() - startTime;

    return c.json({
      success: true,
      performance_analytics: performanceAnalytics,
      processing_time_ms: Math.round(processingTime)
    });

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('[PERFORMANCE-ANALYTICS-ERROR]', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate performance analytics',
      processing_time_ms: Math.round(processingTime)
    }, 500);
  }
});

// Utility functions for generating simulated data and recommendations

function generateHistoricalMetric(
  startTime: number,
  endTime: number,
  granularity: 'minute' | 'hour' | 'day',
  minValue: number,
  maxValue: number
): Array<{ timestamp: string; value: number }> {
  const data: Array<{ timestamp: string; value: number }> = [];
  const intervals = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  };
  
  const interval = intervals[granularity];
  const valueRange = maxValue - minValue;
  
  for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
    const value = minValue + (Math.random() * valueRange);
    data.push({
      timestamp: new Date(timestamp).toISOString(),
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
}

function generateComplianceRecommendations(
  complianceStatus: any,
  alerts: any[]
): string[] {
  const recommendations: string[] = [];

  if (complianceStatus.lgpd_compliance_score < 95) {
    recommendations.push('Review LGPD data processing policies and ensure proper consent management');
  }

  if (complianceStatus.anvisa_compliance_score < 95) {
    recommendations.push('Update ANVISA compliance documentation and medical data handling procedures');
  }

  if (complianceStatus.cfm_compliance_score < 95) {
    recommendations.push('Ensure CFM professional standards are met for all healthcare-related AI features');
  }

  if (complianceStatus.data_retention_violations > 0) {
    recommendations.push('Implement automated data retention policies to prevent future violations');
  }

  if (complianceStatus.access_control_violations > 0) {
    recommendations.push('Strengthen access control policies and implement additional security measures');
  }

  if (alerts.length > 5) {
    recommendations.push('Address active compliance alerts to maintain regulatory standing');
  }

  return recommendations;
}

function generatePerformanceRecommendations(
  metrics: any,
  alerts: any[]
): string[] {
  const recommendations: string[] = [];

  if (metrics.system_performance.memory_usage_percentage > 75) {
    recommendations.push('Consider scaling resources or optimizing memory usage to prevent performance issues');
  }

  if (metrics.system_performance.api_response_time_ms > 400) {
    recommendations.push('Optimize API endpoints and consider implementing additional caching strategies');
  }

  if (metrics.ai_performance.error_rate_percentage > 1.5) {
    recommendations.push('Review AI model performance and consider retraining or model updates');
  }

  if (metrics.system_performance.cache_hit_rate_percentage < 85) {
    recommendations.push('Review caching strategies and consider cache warming for frequently accessed data');
  }

  if (metrics.patient_safety.emergency_access_response_time_ms > 4000) {
    recommendations.push('Critical: Optimize emergency access systems to ensure patient safety compliance');
  }

  return recommendations;
}

export default healthcareMonitoringRoutes;