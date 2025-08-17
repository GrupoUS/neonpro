// Migrated from src/services/monitoring.ts
import { supabase } from '@/lib/supabase';

export interface SystemMetric {
  id?: string;
  tenant_id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  category: 'performance' | 'security' | 'compliance' | 'business' | 'system';
  tags?: Record<string, string>;
  timestamp: string;
  created_at?: string;
}

export interface PerformanceMetrics {
  response_time: number;
  throughput: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  active_users: number;
}

export interface SecurityEvent {
  id?: string;
  tenant_id: string;
  event_type:
    | 'login_attempt'
    | 'data_access'
    | 'permission_change'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, unknown>;
  timestamp: string;
  resolved?: boolean;
  created_at?: string;
}

export interface ComplianceAlert {
  id?: string;
  tenant_id: string;
  alert_type:
    | 'lgpd_violation'
    | 'anvisa_violation'
    | 'cfm_violation'
    | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_records?: number;
  action_required: string;
  due_date?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  created_at?: string;
  resolved_at?: string;
}

export class MonitoringService {
  async recordMetric(
    metric: Omit<SystemMetric, 'id' | 'created_at'>,
  ): Promise<{ metric?: SystemMetric; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .insert({
          ...metric,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { metric: data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to record metric',
      };
    }
  }

  async getMetrics(
    tenantId: string,
    filters?: {
      category?: SystemMetric['category'];
      metricName?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    },
  ): Promise<{ metrics?: SystemMetric[]; error?: string }> {
    try {
      let query = supabase
        .from('system_metrics')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('timestamp', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.metricName) {
        query = query.eq('metric_name', filters.metricName);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { metrics: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to get metrics',
      };
    }
  }

  async recordSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'created_at'>,
  ): Promise<{ event?: SecurityEvent; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .insert({
          ...event,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Check if this is a high/critical security event that needs immediate attention
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.triggerSecurityAlert(data);
      }

      return { event: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record security event',
      };
    }
  }

  async getSecurityEvents(
    tenantId: string,
    filters?: {
      eventType?: SecurityEvent['event_type'];
      severity?: SecurityEvent['severity'];
      userId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    },
  ): Promise<{ events?: SecurityEvent[]; error?: string }> {
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('timestamp', { ascending: false });

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { events: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get security events',
      };
    }
  }

  async createComplianceAlert(
    alert: Omit<ComplianceAlert, 'id' | 'created_at'>,
  ): Promise<{ alert?: ComplianceAlert; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('compliance_alerts')
        .insert({
          ...alert,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Send notification for high/critical compliance alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        await this.triggerComplianceNotification(data);
      }

      return { alert: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create compliance alert',
      };
    }
  }

  async getComplianceAlerts(
    tenantId: string,
    filters?: {
      alertType?: ComplianceAlert['alert_type'];
      severity?: ComplianceAlert['severity'];
      status?: ComplianceAlert['status'];
      limit?: number;
    },
  ): Promise<{ alerts?: ComplianceAlert[]; error?: string }> {
    try {
      let query = supabase
        .from('compliance_alerts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (filters?.alertType) {
        query = query.eq('alert_type', filters.alertType);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { alerts: data };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get compliance alerts',
      };
    }
  }

  async getPerformanceMetrics(
    tenantId: string,
  ): Promise<{ metrics?: PerformanceMetrics; error?: string }> {
    try {
      const currentTime = new Date();
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

      // Get recent performance metrics
      const { data, error } = await supabase
        .from('system_metrics')
        .select('metric_name, metric_value')
        .eq('tenant_id', tenantId)
        .eq('category', 'performance')
        .gte('timestamp', oneHourAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        return { error: error.message };
      }

      // Aggregate metrics
      const metricsMap = new Map<string, number[]>();
      data?.forEach((metric) => {
        if (!metricsMap.has(metric.metric_name)) {
          metricsMap.set(metric.metric_name, []);
        }
        metricsMap.get(metric.metric_name)?.push(metric.metric_value);
      });

      const getAverage = (values: number[]) =>
        values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : 0;

      const metrics: PerformanceMetrics = {
        response_time: getAverage(metricsMap.get('response_time') || []),
        throughput: getAverage(metricsMap.get('throughput') || []),
        error_rate: getAverage(metricsMap.get('error_rate') || []),
        cpu_usage: getAverage(metricsMap.get('cpu_usage') || []),
        memory_usage: getAverage(metricsMap.get('memory_usage') || []),
        active_users: getAverage(metricsMap.get('active_users') || []),
      };

      return { metrics };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get performance metrics',
      };
    }
  }

  async recordHealthcareEvent(
    tenantId: string,
    eventType: string,
    patientId?: string,
    details?: Record<string, unknown>,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const securityEvent: Omit<SecurityEvent, 'id' | 'created_at'> = {
        tenant_id: tenantId,
        event_type: 'data_access',
        severity: 'low',
        user_id: patientId,
        details: {
          event_type: eventType,
          ...details,
        },
        timestamp: new Date().toISOString(),
      };

      const { error } = await this.recordSecurityEvent(securityEvent);

      if (error) {
        return { error };
      }

      return { success: true };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record healthcare event',
      };
    }
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for triggering security alerts
    // This could send notifications, create incidents, etc.
    console.log('Security alert triggered:', event);
  }

  private async triggerComplianceNotification(
    alert: ComplianceAlert,
  ): Promise<void> {
    // Implementation for triggering compliance notifications
    // This could send emails, create tasks, etc.
    console.log('Compliance notification triggered:', alert);
  }

  async generateMonitoringReport(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ report?: Record<string, unknown>; error?: string }> {
    try {
      const [performanceResult, securityResult, complianceResult] =
        await Promise.all([
          this.getPerformanceMetrics(tenantId),
          this.getSecurityEvents(tenantId, { startDate, endDate }),
          this.getComplianceAlerts(tenantId, { status: 'open' }),
        ]);

      const report = {
        period: { start: startDate, end: endDate },
        performance: performanceResult.metrics,
        security: {
          total_events: securityResult.events?.length || 0,
          high_severity_events:
            securityResult.events?.filter(
              (e) => e.severity === 'high' || e.severity === 'critical',
            ).length || 0,
        },
        compliance: {
          open_alerts: complianceResult.alerts?.length || 0,
          critical_alerts:
            complianceResult.alerts?.filter((a) => a.severity === 'critical')
              .length || 0,
        },
        generated_at: new Date().toISOString(),
      };

      return { report };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate monitoring report',
      };
    }
  }
}

export const monitoringService = new MonitoringService();
