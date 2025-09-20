/**
 * Dashboard Data Service
 * Service for aggregating multiple data sources into unified dashboard views
 */

import { supabase } from '@/integrations/supabase/client';
import { FinancialMetricsService } from './financial-metrics';
import type { FinancialMetric, MetricsCalculationOptions } from './financial-metrics';

export interface DashboardData {
  id: string;
  clinicId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  timestamp: Date;
  financialMetrics: FinancialMetric[];
  aggregates: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    patientCount: number;
    appointmentCount: number;
    averageTransactionValue: number;
  };
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    patientGrowth: number;
  };
  insights: DashboardInsight[];
  realTimeData: RealTimeMetrics;
}

export interface DashboardInsight {
  id: string;
  type: 'positive' | 'warning' | 'negative' | 'info';
  title: string;
  description: string;
  value?: number;
  formattedValue?: string;
  trend?: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations?: string[];
}

export interface RealTimeMetrics {
  todayRevenue: number;
  todayAppointments: number;
  onlinePatients: number;
  pendingPayments: number;
  urgentTasks: number;
  lastUpdated: Date;
}
export interface DashboardFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  clinicId: string;
  includeComparisons?: boolean;
  includeRealTime?: boolean;
  metricCategories?: ('revenue' | 'expenses' | 'profit' | 'patients' | 'appointments')[];
}

export class DashboardDataService {
  /**
   * Get comprehensive dashboard data for a clinic
   */
  static async getDashboardData(
    filters: DashboardFilters,
  ): Promise<DashboardData> {
    try {
      // Parallel data fetching for performance
      const [financialMetrics, aggregates, insights, realTimeData] = await Promise.all([
        this.getFinancialMetrics(filters),
        this.getAggregates(filters),
        this.getInsights(filters),
        this.getRealTimeMetrics(filters.clinicId),
      ]);

      const trends = await this.calculateTrends(filters);

      return {
        id: crypto.randomUUID(),
        clinicId: filters.clinicId,
        period: filters.period,
        timestamp: new Date(),
        financialMetrics,
        aggregates,
        trends,
        insights,
        realTimeData,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  /**
   * Get dashboard summary for quick overview
   */
  static async getDashboardSummary(
    clinicId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
  ): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    activePatients: number;
    completedAppointments: number;
    pendingTasks: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate date range based on period
      switch (period) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .rpc('get_dashboard_summary', {
          p_clinic_id: clinicId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
          p_period: period,
        });

      if (error) throw error;

      return data || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        activePatients: 0,
        completedAppointments: 0,
        pendingTasks: 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  } /**
   * Get real-time metrics for live dashboard updates
   */

  static async getRealTimeMetrics(clinicId: string): Promise<RealTimeMetrics> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .rpc('get_realtime_metrics', {
          p_clinic_id: clinicId,
          p_date: today.toISOString(),
        });

      if (error) throw error;

      return {
        todayRevenue: data?.today_revenue || 0,
        todayAppointments: data?.today_appointments || 0,
        onlinePatients: data?.online_patients || 0,
        pendingPayments: data?.pending_payments || 0,
        urgentTasks: data?.urgent_tasks || 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw new Error('Failed to fetch real-time metrics');
    }
  }

  /**
   * Private helper methods
   */
  private static async getFinancialMetrics(
    filters: DashboardFilters,
  ): Promise<FinancialMetric[]> {
    const options: MetricsCalculationOptions = {
      period: filters.period,
      startDate: filters.startDate,
      endDate: filters.endDate,
      categories: filters.metricCategories,
      includeComparisons: filters.includeComparisons,
    };

    return FinancialMetricsService.calculateMetrics(options);
  }

  private static async getAggregates(filters: DashboardFilters) {
    const options: MetricsCalculationOptions = {
      period: filters.period,
      startDate: filters.startDate,
      endDate: filters.endDate,
      includeComparisons: filters.includeComparisons,
    };

    return FinancialMetricsService.aggregateData(options);
  }

  private static async getInsights(
    filters: DashboardFilters,
  ): Promise<DashboardInsight[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_insights', {
          p_clinic_id: filters.clinicId,
          p_start_date: filters.startDate.toISOString(),
          p_end_date: filters.endDate.toISOString(),
          p_period: filters.period,
        });

      if (error) throw error;

      return (data || []).map((insight: any) => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        value: insight.value,
        formattedValue: insight.formatted_value,
        trend: insight.trend,
        priority: insight.priority,
        actionable: insight.actionable,
        recommendations: insight.recommendations || [],
      }));
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }

  private static async calculateTrends(filters: DashboardFilters) {
    try {
      // Calculate previous period for comparison
      const periodDiff = filters.endDate.getTime() - filters.startDate.getTime();
      const previousStartDate = new Date(filters.startDate.getTime() - periodDiff);
      const previousEndDate = new Date(filters.startDate.getTime());

      const [currentAggregates, previousAggregates] = await Promise.all([
        this.getAggregates(filters),
        this.getAggregates({
          ...filters,
          startDate: previousStartDate,
          endDate: previousEndDate,
        }),
      ]);

      return {
        revenueGrowth: this.calculateGrowthRate(
          currentAggregates.totalRevenue,
          previousAggregates.totalRevenue,
        ),
        expenseGrowth: this.calculateGrowthRate(
          currentAggregates.totalExpenses,
          previousAggregates.totalExpenses,
        ),
        profitGrowth: this.calculateGrowthRate(
          currentAggregates.netProfit,
          previousAggregates.netProfit,
        ),
        patientGrowth: this.calculateGrowthRate(
          currentAggregates.patientCount,
          previousAggregates.patientCount,
        ),
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0,
        patientGrowth: 0,
      };
    }
  }

  private static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
