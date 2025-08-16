import { createClient } from '@/utils/supabase/server';

export interface HealthcareMonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category:
    | 'patient_safety'
    | 'quality_indicators'
    | 'compliance'
    | 'operational';
  threshold: {
    min?: number;
    max?: number;
    target?: number;
  };
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface HealthcareAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'patient_safety' | 'regulatory' | 'operational' | 'security';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredBy: string;
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  actions?: Array<{
    type: string;
    description: string;
    completedAt?: Date;
    completedBy?: string;
  }>;
}

export interface ComplianceCheck {
  id: string;
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  lastChecked: Date;
  nextCheck: Date;
  evidence?: string[];
  findings?: string[];
  corrective_actions?: Array<{
    description: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo?: string;
  }>;
}

export class HealthcareMonitoringService {
  private supabase = createClient();

  // Metrics Management
  async getMetrics(filters?: {
    category?: string[];
    status?: string[];
    timeRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<HealthcareMonitoringMetric[]> {
    try {
      let query = this.supabase
        .from('healthcare_metrics')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.timeRange) {
        query = query
          .gte('timestamp', filters.timeRange.start.toISOString())
          .lte('timestamp', filters.timeRange.end.toISOString());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((metric) => ({
          ...metric,
          timestamp: new Date(metric.timestamp),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching healthcare metrics:', error);
      return [];
    }
  }

  async recordMetric(
    metric: Omit<HealthcareMonitoringMetric, 'id' | 'timestamp'>,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('healthcare_metrics').insert({
        ...metric,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording healthcare metric:', error);
      return false;
    }
  }

  // Alerts Management
  async getAlerts(filters?: {
    severity?: string[];
    category?: string[];
    status?: string[];
    assignedTo?: string;
    limit?: number;
  }): Promise<HealthcareAlert[]> {
    try {
      let query = this.supabase
        .from('healthcare_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.severity?.length) {
        query = query.in('severity', filters.severity);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((alert) => ({
          ...alert,
          createdAt: new Date(alert.created_at),
          resolvedAt: alert.resolved_at
            ? new Date(alert.resolved_at)
            : undefined,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching healthcare alerts:', error);
      return [];
    }
  }

  async createAlert(
    alert: Omit<HealthcareAlert, 'id' | 'createdAt'>,
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('healthcare_alerts')
        .insert({
          ...alert,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating healthcare alert:', error);
      return null;
    }
  }

  async updateAlertStatus(
    id: string,
    status: HealthcareAlert['status'],
    assignedTo?: string,
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
      if (assignedTo) {
        updateData.assigned_to = assignedTo;
      }

      const { error } = await this.supabase
        .from('healthcare_alerts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  // Compliance Management
  async getComplianceChecks(filters?: {
    regulation?: string;
    status?: string[];
    overdue?: boolean;
    limit?: number;
  }): Promise<ComplianceCheck[]> {
    try {
      let query = this.supabase
        .from('compliance_checks')
        .select('*')
        .order('next_check', { ascending: true });

      if (filters?.regulation) {
        query = query.eq('regulation', filters.regulation);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.overdue) {
        query = query.lt('next_check', new Date().toISOString());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((check) => ({
          ...check,
          lastChecked: new Date(check.last_checked),
          nextCheck: new Date(check.next_check),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching compliance checks:', error);
      return [];
    }
  }

  async updateComplianceStatus(
    id: string,
    status: ComplianceCheck['status'],
    findings?: string[],
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('compliance_checks')
        .update({
          status,
          last_checked: new Date().toISOString(),
          findings: findings || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating compliance status:', error);
      return false;
    }
  }

  // Dashboard Analytics
  async getDashboardSummary(): Promise<{
    metrics: {
      total: number;
      critical: number;
      warning: number;
      normal: number;
    };
    alerts: {
      total: number;
      active: number;
      critical: number;
      overdue: number;
    };
    compliance: {
      total: number;
      compliant: number;
      nonCompliant: number;
      overdue: number;
    };
  }> {
    try {
      // Get metrics summary
      const { data: metricsData } = await this.supabase
        .from('healthcare_metrics')
        .select('status')
        .gte(
          'timestamp',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      // Get alerts summary
      const { data: alertsData } = await this.supabase
        .from('healthcare_alerts')
        .select('status, severity, created_at')
        .eq('status', 'active');

      // Get compliance summary
      const { data: complianceData } = await this.supabase
        .from('compliance_checks')
        .select('status, next_check');

      const metrics = {
        total: metricsData?.length || 0,
        critical:
          metricsData?.filter((m) => m.status === 'critical').length || 0,
        warning: metricsData?.filter((m) => m.status === 'warning').length || 0,
        normal: metricsData?.filter((m) => m.status === 'normal').length || 0,
      };

      const alerts = {
        total: alertsData?.length || 0,
        active: alertsData?.filter((a) => a.status === 'active').length || 0,
        critical:
          alertsData?.filter((a) => a.severity === 'critical').length || 0,
        overdue:
          alertsData?.filter(
            (a) =>
              new Date(a.created_at) <
              new Date(Date.now() - 24 * 60 * 60 * 1000),
          ).length || 0,
      };

      const compliance = {
        total: complianceData?.length || 0,
        compliant:
          complianceData?.filter((c) => c.status === 'compliant').length || 0,
        nonCompliant:
          complianceData?.filter((c) => c.status === 'non_compliant').length ||
          0,
        overdue:
          complianceData?.filter((c) => new Date(c.next_check) < new Date())
            .length || 0,
      };

      return { metrics, alerts, compliance };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {
        metrics: { total: 0, critical: 0, warning: 0, normal: 0 },
        alerts: { total: 0, active: 0, critical: 0, overdue: 0 },
        compliance: { total: 0, compliant: 0, nonCompliant: 0, overdue: 0 },
      };
    }
  }
}

// Export singleton instance
export const healthcareMonitoringService = new HealthcareMonitoringService();

// Export utility functions
export const getHealthcareMetrics = (
  filters?: Parameters<HealthcareMonitoringService['getMetrics']>[0],
) => healthcareMonitoringService.getMetrics(filters);

export const recordHealthcareMetric = (
  metric: Parameters<HealthcareMonitoringService['recordMetric']>[0],
) => healthcareMonitoringService.recordMetric(metric);

export const getHealthcareAlerts = (
  filters?: Parameters<HealthcareMonitoringService['getAlerts']>[0],
) => healthcareMonitoringService.getAlerts(filters);

export const createHealthcareAlert = (
  alert: Parameters<HealthcareMonitoringService['createAlert']>[0],
) => healthcareMonitoringService.createAlert(alert);

export const updateHealthcareAlertStatus = (
  id: string,
  status: HealthcareAlert['status'],
  assignedTo?: string,
) => healthcareMonitoringService.updateAlertStatus(id, status, assignedTo);

export const getComplianceChecks = (
  filters?: Parameters<HealthcareMonitoringService['getComplianceChecks']>[0],
) => healthcareMonitoringService.getComplianceChecks(filters);

export const updateComplianceStatus = (
  id: string,
  status: ComplianceCheck['status'],
  findings?: string[],
) => healthcareMonitoringService.updateComplianceStatus(id, status, findings);

export const getHealthcareDashboardSummary = () =>
  healthcareMonitoringService.getDashboardSummary();
