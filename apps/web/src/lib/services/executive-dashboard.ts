import { createClient } from '@/utils/supabase/server';

export interface ExecutiveDashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'operational' | 'compliance' | 'security';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ExecutiveDashboardKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: 'financial' | 'operational' | 'patient' | 'compliance';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastUpdated: Date;
}

export interface ExecutiveDashboardReport {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'operational' | 'compliance' | 'performance';
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  data: Record<string, any>;
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: any[];
  }>;
}

export class ExecutiveDashboardService {
  private supabase = createClient();

  // Alerts Management
  async getAlerts(filters?: {
    severity?: string[];
    category?: string[];
    status?: string[];
    limit?: number;
  }): Promise<ExecutiveDashboardAlert[]> {
    try {
      let query = this.supabase
        .from('executive_alerts')
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
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((alert) => ({
          ...alert,
          createdAt: new Date(alert.created_at),
          updatedAt: new Date(alert.updated_at),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  async getAlert(id: string): Promise<ExecutiveDashboardAlert | null> {
    try {
      const { data, error } = await this.supabase
        .from('executive_alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data
        ? {
            ...data,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          }
        : null;
    } catch (error) {
      console.error('Error fetching alert:', error);
      return null;
    }
  }

  async updateAlertStatus(
    id: string,
    status: ExecutiveDashboardAlert['status'],
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('executive_alerts')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  // KPIs Management
  async getKPIs(category?: string): Promise<ExecutiveDashboardKPI[]> {
    try {
      let query = this.supabase
        .from('executive_kpis')
        .select('*')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((kpi) => ({
          ...kpi,
          lastUpdated: new Date(kpi.last_updated),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return [];
    }
  }

  async compareKPIs(
    kpiIds: string[],
    period: string,
  ): Promise<{
    kpis: ExecutiveDashboardKPI[];
    comparison: Record<string, any>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('executive_kpis')
        .select('*')
        .in('id', kpiIds);

      if (error) throw error;

      const kpis =
        data?.map((kpi) => ({
          ...kpi,
          lastUpdated: new Date(kpi.last_updated),
        })) || [];

      // Generate comparison data (simplified)
      const comparison = kpis.reduce(
        (acc, kpi) => {
          acc[kpi.id] = {
            current: kpi.value,
            target: kpi.target,
            performance: (kpi.value / kpi.target) * 100,
            trend: kpi.trend,
          };
          return acc;
        },
        {} as Record<string, any>,
      );

      return { kpis, comparison };
    } catch (error) {
      console.error('Error comparing KPIs:', error);
      return { kpis: [], comparison: {} };
    }
  }

  // Reports Management
  async getReports(filters?: {
    type?: string[];
    status?: string[];
    limit?: number;
  }): Promise<ExecutiveDashboardReport[]> {
    try {
      let query = this.supabase
        .from('executive_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((report) => ({
          ...report,
          createdAt: new Date(report.created_at),
          updatedAt: new Date(report.updated_at),
        })) || []
      );
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  async generateReport(
    type: string,
    parameters: Record<string, any>,
  ): Promise<ExecutiveDashboardReport | null> {
    try {
      // This would typically involve complex data aggregation
      // For now, we'll create a basic report structure
      const reportData = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: `Generated ${type} report`,
        type,
        status: 'draft' as const,
        data: parameters,
        charts: [],
      };

      const { data, error } = await this.supabase
        .from('executive_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;

      return data
        ? {
            ...data,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          }
        : null;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }
}

// Export singleton instance
export const executiveDashboardService = new ExecutiveDashboardService();

// Export utility functions
export const getExecutiveAlerts = (
  filters?: Parameters<ExecutiveDashboardService['getAlerts']>[0],
) => executiveDashboardService.getAlerts(filters);

export const getExecutiveAlert = (id: string) =>
  executiveDashboardService.getAlert(id);

export const updateExecutiveAlertStatus = (
  id: string,
  status: ExecutiveDashboardAlert['status'],
) => executiveDashboardService.updateAlertStatus(id, status);

export const getExecutiveKPIs = (category?: string) =>
  executiveDashboardService.getKPIs(category);

export const compareExecutiveKPIs = (kpiIds: string[], period: string) =>
  executiveDashboardService.compareKPIs(kpiIds, period);

export const getExecutiveReports = (
  filters?: Parameters<ExecutiveDashboardService['getReports']>[0],
) => executiveDashboardService.getReports(filters);

export const generateExecutiveReport = (
  type: string,
  parameters: Record<string, any>,
) => executiveDashboardService.generateReport(type, parameters);
