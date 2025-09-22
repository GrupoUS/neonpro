// @ts-nocheck
/**
 * Service Analytics Service
 * Service layer for analytics, reporting, and statistics
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  AnalyticsDashboard,
  AnalyticsExportRequest,
  AnalyticsFilters,
  ProfessionalPerformance,
  RevenueAnalytics,
  ServiceAnalytics,
  UsageStatistics,
} from '@/types/service-analytics';

export class ServiceAnalyticsService {
  private static sb: any = supabase;
  /**
   * Get comprehensive service analytics for a clinic
   */
  static async getServiceAnalytics(
    clinicId: string,
    filters?: AnalyticsFilters,
  ): Promise<ServiceAnalytics[]> {
    const { data, error } = await (this.sb as any).rpc(
      'get_service_analytics',
      {
        p_clinic_id: clinicId,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
        p_service_ids: filters?.service_ids,
        p_category_ids: filters?.category_ids,
        p_professional_ids: filters?.professional_ids,
        p_appointment_status: filters?.appointment_status,
      },
    );

    if (error) {
      console.error('Error fetching service analytics:', error);
      throw new Error(`Failed to fetch service analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get revenue analytics and trends
   */
  static async getRevenueAnalytics(
    clinicId: string,
    filters?: AnalyticsFilters,
  ): Promise<RevenueAnalytics> {
    const { data, error } = await (this.sb as any).rpc(
      'get_revenue_analytics',
      {
        p_clinic_id: clinicId,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
        p_comparison_period: filters?.comparison_period,
      },
    );

    if (error) {
      console.error('Error fetching revenue analytics:', error);
      throw new Error(`Failed to fetch revenue analytics: ${error.message}`);
    }

    return (
      data || {
        clinic_id: clinicId,
        total_revenue: 0,
        total_appointments: 0,
        average_appointment_value: 0,
        current_period_revenue: 0,
        previous_period_revenue: 0,
        revenue_growth_rate: 0,
        revenue_by_category: [],
        revenue_by_professional: [],
        top_services: [],
        daily_revenue: [],
        monthly_revenue: [],
      }
    );
  }

  /**
   * Get usage statistics and patterns
   */
  static async getUsageStatistics(
    clinicId: string,
    filters?: AnalyticsFilters,
  ): Promise<UsageStatistics> {
    const { data, error } = await (this.sb as any).rpc('get_usage_statistics', {
      p_clinic_id: clinicId,
      p_start_date: filters?.start_date,
      p_end_date: filters?.end_date,
    });

    if (error) {
      console.error('Error fetching usage statistics:', error);
      throw new Error(`Failed to fetch usage statistics: ${error.message}`);
    }

    return (
      data || {
        clinic_id: clinicId,
        total_services: 0,
        active_services: 0,
        total_appointments: 0,
        most_popular_services: [],
        least_popular_services: [],
        category_performance: [],
        peak_hours: [],
        peak_days: [],
        seasonal_trends: [],
      }
    );
  }

  /**
   * Get professional performance metrics
   */
  static async getProfessionalPerformance(
    clinicId: string,
    professionalId?: string,
    filters?: AnalyticsFilters,
  ): Promise<ProfessionalPerformance[]> {
    const { data, error } = await (this.sb as any).rpc(
      'get_professional_performance',
      {
        p_clinic_id: clinicId,
        p_professional_id: professionalId,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
      },
    );

    if (error) {
      console.error('Error fetching professional performance:', error);
      throw new Error(
        `Failed to fetch professional performance: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Get complete analytics dashboard data
   */
  static async getAnalyticsDashboard(
    clinicId: string,
    filters?: AnalyticsFilters,
  ): Promise<AnalyticsDashboard> {
    const { data, error } = await (this.sb as any).rpc(
      'get_analytics_dashboard',
      {
        p_clinic_id: clinicId,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
        p_comparison_period: filters?.comparison_period,
      },
    );

    if (error) {
      console.error('Error fetching analytics dashboard:', error);
      throw new Error(`Failed to fetch analytics dashboard: ${error.message}`);
    }

    return (
      data || {
        clinic_id: clinicId,
        period: {
          start_date: filters?.start_date || new Date().toISOString(),
          end_date: filters?.end_date || new Date().toISOString(),
          label: 'Custom Period',
        },
        kpis: {
          total_revenue: 0,
          total_appointments: 0,
          average_appointment_value: 0,
          completion_rate: 0,
          growth_rate: 0,
          client_satisfaction: null,
        },
        revenue_trend: [],
        service_performance: [],
        category_breakdown: [],
        professional_performance: [],
        insights: [],
      }
    );
  }

  /**
   * Get service performance comparison
   */
  static async getServiceComparison(
    clinicId: string,
    serviceIds: string[],
    filters?: AnalyticsFilters,
  ): Promise<ServiceAnalytics[]> {
    const { data, error } = await (this.sb as any).rpc(
      'get_service_comparison',
      {
        p_clinic_id: clinicId,
        p_service_ids: serviceIds,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
      },
    );

    if (error) {
      console.error('Error fetching service comparison:', error);
      throw new Error(`Failed to fetch service comparison: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get revenue trends over time
   */
  static async getRevenueTrends(
    clinicId: string,
    granularity: 'daily' | 'weekly' | 'monthly' = 'daily',
    filters?: AnalyticsFilters,
  ): Promise<{ date: string; revenue: number; appointments: number }[]> {
    const { data, error } = await (this.sb as any).rpc('get_revenue_trends', {
      p_clinic_id: clinicId,
      p_granularity: granularity,
      p_start_date: filters?.start_date,
      p_end_date: filters?.end_date,
    });

    if (error) {
      console.error('Error fetching revenue trends:', error);
      throw new Error(`Failed to fetch revenue trends: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(_request: AnalyticsExportRequest): Promise<Blob> {
    const { data, error } = await (this.sb as any).rpc('export_analytics', {
      p_clinic_id: request.clinic_id,
      p_report_type: request.report_type,
      p_filters: request.filters,
      p_format: request.format,
      p_include_charts: request.include_charts || false,
    });

    if (error) {
      console.error('Error exporting analytics:', error);
      throw new Error(`Failed to export analytics: ${error.message}`);
    }

    // Convert base64 data to blob
    const binaryString = atob((data as any).file_data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const mimeType = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    }[request.format];

    return new Blob([bytes], { type: mimeType });
  }

  /**
   * Get analytics insights and recommendations
   */
  static async getAnalyticsInsights(
    clinicId: string,
    filters?: AnalyticsFilters,
  ): Promise<AnalyticsDashboard['insights']> {
    const { data, error } = await (this.sb as any).rpc(
      'get_analytics_insights',
      {
        p_clinic_id: clinicId,
        p_start_date: filters?.start_date,
        p_end_date: filters?.end_date,
      },
    );

    if (error) {
      console.error('Error fetching analytics insights:', error);
      throw new Error(`Failed to fetch analytics insights: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get real-time analytics summary
   */
  static async getRealTimeAnalytics(clinicId: string): Promise<{
    today_revenue: number;
    today_appointments: number;
    active_appointments: number;
    pending_appointments: number;
    completion_rate_today: number;
  }> {
    const { data, error } = await (this.sb as any).rpc(
      'get_realtime_analytics',
      {
        p_clinic_id: clinicId,
      },
    );

    if (error) {
      console.error('Error fetching real-time analytics:', error);
      throw new Error(`Failed to fetch real-time analytics: ${error.message}`);
    }

    return (
      data || {
        today_revenue: 0,
        today_appointments: 0,
        active_appointments: 0,
        pending_appointments: 0,
        completion_rate_today: 0,
      }
    );
  }
}

export const serviceAnalyticsService = ServiceAnalyticsService;
