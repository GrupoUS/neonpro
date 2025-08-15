/**
 * Executive Dashboard Service
 * Provides comprehensive business intelligence and KPI data for clinic executives
 */

import { createClient } from '@/app/utils/supabase/server';
import { AnalyticsService } from '@/lib/analytics/service';
import { getCurrentUser } from '@/lib/auth/server';
import { logger } from '@/lib/logger';

export interface DashboardKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'number' | 'percentage';
  category: 'financial' | 'operational' | 'patient' | 'staff';
}

export interface DashboardMetrics {
  kpis: DashboardKPI[];
  charts: {
    revenue: {
      labels: string[];
      data: number[];
      previousData: number[];
    };
    appointments: {
      labels: string[];
      data: number[];
      previousData: number[];
    };
    patients: {
      labels: string[];
      data: number[];
      previousData: number[];
    };
  };
  alerts: DashboardAlert[];
  lastUpdated: string;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
  category: string;
}

export interface PeriodComparison {
  current: {
    start: string;
    end: string;
    metrics: Record<string, number>;
  };
  previous: {
    start: string;
    end: string;
    metrics: Record<string, number>;
  };
  changes: Record<
    string,
    {
      absolute: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    }
  >;
}

export interface ExecutiveDashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  clinicIds?: string[];
  departmentIds?: string[];
  categories?: string[];
  comparison?: 'previous_period' | 'previous_year' | 'custom';
}

export class ExecutiveDashboardService {
  private readonly supabase;

  constructor() {
    this.supabase = createClient();
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get comprehensive dashboard metrics for executive view
   */
  async getDashboardMetrics(
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardMetrics> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user has executive access
      await this.verifyExecutiveAccess(user.id);

      const [kpis, charts, alerts] = await Promise.all([
        this.getKPIs(filters),
        this.getChartData(filters),
        this.getAlerts(filters),
      ]);

      return {
        kpis,
        charts,
        alerts,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get Key Performance Indicators
   */
  async getKPIs(filters: ExecutiveDashboardFilters): Promise<DashboardKPI[]> {
    try {
      const { data: metricsData, error } = await this.supabase
        .from('executive_dashboard_metrics')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Calculate KPIs from raw data
      const kpis: DashboardKPI[] = [
        await this.calculateRevenueKPI(metricsData, filters),
        await this.calculatePatientsKPI(metricsData, filters),
        await this.calculateAppointmentsKPI(metricsData, filters),
        await this.calculateEfficiencyKPI(metricsData, filters),
        await this.calculateProfitabilityKPI(metricsData, filters),
        await this.calculateSatisfactionKPI(metricsData, filters),
      ];

      return kpis;
    } catch (error) {
      logger.error('Error calculating KPIs:', error);
      throw error;
    }
  }

  /**
   * Get chart data for visualizations
   */
  async getChartData(filters: ExecutiveDashboardFilters) {
    try {
      const { data: chartData, error } = await this.supabase
        .from('executive_dashboard_charts')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return {
        revenue: this.processRevenueChart(chartData),
        appointments: this.processAppointmentsChart(chartData),
        patients: this.processPatientsChart(chartData),
      };
    } catch (error) {
      logger.error('Error fetching chart data:', error);
      throw error;
    }
  }

  /**
   * Get dashboard alerts
   */
  async getAlerts(
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardAlert[]> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('executive_dashboard_alerts')
        .select('*')
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return alerts.map((alert) => ({
        id: alert.id,
        type: alert.alert_type,
        title: alert.title,
        description: alert.description,
        priority: alert.priority,
        createdAt: alert.created_at,
        isRead: alert.is_read,
        actionRequired: alert.action_required,
        category: alert.category,
      }));
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Compare metrics between two periods
   */
  async comparePeriods(
    currentPeriod: { start: string; end: string },
    previousPeriod: { start: string; end: string }
  ): Promise<PeriodComparison> {
    try {
      const [currentMetrics, previousMetrics] = await Promise.all([
        this.getPeriodMetrics(currentPeriod),
        this.getPeriodMetrics(previousPeriod),
      ]);

      const changes: Record<string, any> = {};

      Object.keys(currentMetrics).forEach((key) => {
        const current = currentMetrics[key] || 0;
        const previous = previousMetrics[key] || 0;
        const absolute = current - previous;
        const percentage = previous === 0 ? 0 : (absolute / previous) * 100;

        changes[key] = {
          absolute,
          percentage,
          trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable',
        };
      });

      return {
        current: {
          start: currentPeriod.start,
          end: currentPeriod.end,
          metrics: currentMetrics,
        },
        previous: {
          start: previousPeriod.start,
          end: previousPeriod.end,
          metrics: previousMetrics,
        },
        changes,
      };
    } catch (error) {
      logger.error('Error comparing periods:', error);
      throw error;
    }
  }

  /**
   * Export dashboard data to various formats
   */
  async exportDashboard(
    filters: ExecutiveDashboardFilters,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<{ url: string; filename: string }> {
    try {
      const _metrics = await this.getDashboardMetrics(filters);

      // Implementation would depend on export library choice
      // For now, returning a placeholder
      return {
        url: `/api/exports/dashboard-${Date.now()}.${format}`,
        filename: `executive-dashboard-${new Date().toISOString().split('T')[0]}.${format}`,
      };
    } catch (error) {
      logger.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  // Private helper methods

  private async verifyExecutiveAccess(userId: string): Promise<void> {
    const { data: profile, error } = await this.supabase
      .from('professionals')
      .select('role, permissions')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      throw new Error('User profile not found');
    }

    const hasExecutiveAccess =
      profile.role === 'admin' ||
      profile.role === 'owner' ||
      profile.permissions?.includes('executive_dashboard');

    if (!hasExecutiveAccess) {
      throw new Error('Insufficient permissions for executive dashboard');
    }
  }

  private async calculateRevenueKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const currentRevenue = data.reduce(
      (sum, item) => sum + (item.revenue || 0),
      0
    );
    const previousRevenue = await this.getPreviousPeriodValue(
      'revenue',
      filters
    );

    return {
      id: 'revenue',
      name: 'Receita Total',
      value: currentRevenue,
      previousValue: previousRevenue,
      changePercent:
        previousRevenue === 0
          ? 0
          : ((currentRevenue - previousRevenue) / previousRevenue) * 100,
      trend:
        currentRevenue > previousRevenue
          ? 'up'
          : currentRevenue < previousRevenue
            ? 'down'
            : 'stable',
      format: 'currency',
      category: 'financial',
    };
  }

  private async calculatePatientsKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const currentPatients = data.reduce(
      (sum, item) => sum + (item.new_patients || 0),
      0
    );
    const previousPatients = await this.getPreviousPeriodValue(
      'new_patients',
      filters
    );

    return {
      id: 'patients',
      name: 'Novos Pacientes',
      value: currentPatients,
      previousValue: previousPatients,
      changePercent:
        previousPatients === 0
          ? 0
          : ((currentPatients - previousPatients) / previousPatients) * 100,
      trend:
        currentPatients > previousPatients
          ? 'up'
          : currentPatients < previousPatients
            ? 'down'
            : 'stable',
      format: 'number',
      category: 'patient',
    };
  }

  private async calculateAppointmentsKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const currentAppointments = data.reduce(
      (sum, item) => sum + (item.appointments || 0),
      0
    );
    const previousAppointments = await this.getPreviousPeriodValue(
      'appointments',
      filters
    );

    return {
      id: 'appointments',
      name: 'Consultas Realizadas',
      value: currentAppointments,
      previousValue: previousAppointments,
      changePercent:
        previousAppointments === 0
          ? 0
          : ((currentAppointments - previousAppointments) /
              previousAppointments) *
            100,
      trend:
        currentAppointments > previousAppointments
          ? 'up'
          : currentAppointments < previousAppointments
            ? 'down'
            : 'stable',
      format: 'number',
      category: 'operational',
    };
  }

  private async calculateEfficiencyKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const totalAppointments = data.reduce(
      (sum, item) => sum + (item.appointments || 0),
      0
    );
    const completedAppointments = data.reduce(
      (sum, item) => sum + (item.completed_appointments || 0),
      0
    );
    const currentEfficiency =
      totalAppointments === 0
        ? 0
        : (completedAppointments / totalAppointments) * 100;
    const previousEfficiency = await this.getPreviousPeriodValue(
      'efficiency',
      filters
    );

    return {
      id: 'efficiency',
      name: 'Taxa de Eficiência',
      value: currentEfficiency,
      previousValue: previousEfficiency,
      changePercent:
        previousEfficiency === 0
          ? 0
          : ((currentEfficiency - previousEfficiency) / previousEfficiency) *
            100,
      trend:
        currentEfficiency > previousEfficiency
          ? 'up'
          : currentEfficiency < previousEfficiency
            ? 'down'
            : 'stable',
      format: 'percentage',
      category: 'operational',
    };
  }

  private async calculateProfitabilityKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const revenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const costs = data.reduce((sum, item) => sum + (item.costs || 0), 0);
    const currentProfitability =
      revenue === 0 ? 0 : ((revenue - costs) / revenue) * 100;
    const previousProfitability = await this.getPreviousPeriodValue(
      'profitability',
      filters
    );

    return {
      id: 'profitability',
      name: 'Margem de Lucro',
      value: currentProfitability,
      previousValue: previousProfitability,
      changePercent:
        previousProfitability === 0
          ? 0
          : ((currentProfitability - previousProfitability) /
              previousProfitability) *
            100,
      trend:
        currentProfitability > previousProfitability
          ? 'up'
          : currentProfitability < previousProfitability
            ? 'down'
            : 'stable',
      format: 'percentage',
      category: 'financial',
    };
  }

  private async calculateSatisfactionKPI(
    data: any[],
    filters: ExecutiveDashboardFilters
  ): Promise<DashboardKPI> {
    const totalRatings = data.reduce(
      (sum, item) => sum + (item.satisfaction_count || 0),
      0
    );
    const satisfactionSum = data.reduce(
      (sum, item) => sum + (item.satisfaction_sum || 0),
      0
    );
    const currentSatisfaction =
      totalRatings === 0 ? 0 : satisfactionSum / totalRatings;
    const previousSatisfaction = await this.getPreviousPeriodValue(
      'satisfaction',
      filters
    );

    return {
      id: 'satisfaction',
      name: 'Satisfação do Cliente',
      value: currentSatisfaction,
      previousValue: previousSatisfaction,
      changePercent:
        previousSatisfaction === 0
          ? 0
          : ((currentSatisfaction - previousSatisfaction) /
              previousSatisfaction) *
            100,
      trend:
        currentSatisfaction > previousSatisfaction
          ? 'up'
          : currentSatisfaction < previousSatisfaction
            ? 'down'
            : 'stable',
      format: 'number',
      category: 'patient',
    };
  }

  private async getPreviousPeriodValue(
    metric: string,
    filters: ExecutiveDashboardFilters
  ): Promise<number> {
    // Calculate previous period based on current date range
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    const previousEndDate = new Date(endDate);
    previousEndDate.setDate(previousEndDate.getDate() - periodDays);

    const { data, error } = await this.supabase
      .from('executive_dashboard_metrics')
      .select('*')
      .gte('date', previousStartDate.toISOString().split('T')[0])
      .lte('date', previousEndDate.toISOString().split('T')[0]);

    if (error || !data) {
      return 0;
    }

    switch (metric) {
      case 'revenue':
        return data.reduce((sum, item) => sum + (item.revenue || 0), 0);
      case 'new_patients':
        return data.reduce((sum, item) => sum + (item.new_patients || 0), 0);
      case 'appointments':
        return data.reduce((sum, item) => sum + (item.appointments || 0), 0);
      case 'efficiency': {
        const totalAppts = data.reduce(
          (sum, item) => sum + (item.appointments || 0),
          0
        );
        const completedAppts = data.reduce(
          (sum, item) => sum + (item.completed_appointments || 0),
          0
        );
        return totalAppts === 0 ? 0 : (completedAppts / totalAppts) * 100;
      }
      case 'profitability': {
        const rev = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const costs = data.reduce((sum, item) => sum + (item.costs || 0), 0);
        return rev === 0 ? 0 : ((rev - costs) / rev) * 100;
      }
      case 'satisfaction': {
        const totalRatings = data.reduce(
          (sum, item) => sum + (item.satisfaction_count || 0),
          0
        );
        const satisfactionSum = data.reduce(
          (sum, item) => sum + (item.satisfaction_sum || 0),
          0
        );
        return totalRatings === 0 ? 0 : satisfactionSum / totalRatings;
      }
      default:
        return 0;
    }
  }

  private processRevenueChart(data: any[]) {
    const labels = data.map((item) => item.date);
    const revenue = data.map((item) => item.revenue || 0);

    // Get previous period data for comparison
    const previousData = data.map((_, index) => {
      const previousIndex = index - Math.floor(data.length / 2);
      return previousIndex >= 0 ? data[previousIndex]?.revenue || 0 : 0;
    });

    return {
      labels,
      data: revenue,
      previousData,
    };
  }

  private processAppointmentsChart(data: any[]) {
    const labels = data.map((item) => item.date);
    const appointments = data.map((item) => item.appointments || 0);

    const previousData = data.map((_, index) => {
      const previousIndex = index - Math.floor(data.length / 2);
      return previousIndex >= 0 ? data[previousIndex]?.appointments || 0 : 0;
    });

    return {
      labels,
      data: appointments,
      previousData,
    };
  }

  private processPatientsChart(data: any[]) {
    const labels = data.map((item) => item.date);
    const patients = data.map((item) => item.new_patients || 0);

    const previousData = data.map((_, index) => {
      const previousIndex = index - Math.floor(data.length / 2);
      return previousIndex >= 0 ? data[previousIndex]?.new_patients || 0 : 0;
    });

    return {
      labels,
      data: patients,
      previousData,
    };
  }

  private async getPeriodMetrics(period: {
    start: string;
    end: string;
  }): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('executive_dashboard_metrics')
      .select('*')
      .gte('date', period.start)
      .lte('date', period.end);

    if (error || !data) {
      return {};
    }

    return {
      revenue: data.reduce((sum, item) => sum + (item.revenue || 0), 0),
      new_patients: data.reduce(
        (sum, item) => sum + (item.new_patients || 0),
        0
      ),
      appointments: data.reduce(
        (sum, item) => sum + (item.appointments || 0),
        0
      ),
      costs: data.reduce((sum, item) => sum + (item.costs || 0), 0),
      satisfaction_average:
        data.length > 0
          ? data.reduce((sum, item) => sum + (item.satisfaction_sum || 0), 0) /
            data.reduce((sum, item) => sum + (item.satisfaction_count || 1), 0)
          : 0,
    };
  }
}

export const executiveDashboardService = new ExecutiveDashboardService();
