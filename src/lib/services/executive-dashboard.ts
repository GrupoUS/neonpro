// Executive Dashboard Service Layer
// Story 7.1: Executive Dashboard Implementation

import { createClient } from '@/app/utils/supabase/server';
import { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface KPIValue {
  id: string;
  clinic_id: string;
  kpi_name: string;
  kpi_value: number;
  unit?: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  calculation_method?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface DashboardAlert {
  id: string;
  clinic_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold_value?: number;
  current_value?: number;
  kpi_name?: string;
  period_type?: string;
  period_start?: string;
  period_end?: string;
  is_active: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  clinic_id: string;
  user_id: string;
  widget_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  configuration?: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardReport {
  id: string;
  clinic_id: string;
  report_name: string;
  report_type: string;
  period_type: string;
  period_start: string;
  period_end: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  parameters?: Record<string, any>;
  error_message?: string;
  generated_at?: string;
  requested_by: string;
  created_at: string;
  updated_at: string;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ExecutiveDashboardData {
  kpis: KPIValue[];
  alerts: DashboardAlert[];
  widgets: DashboardWidget[];
  reports: DashboardReport[];
  periodComparisons: Record<string, PeriodComparison>;
}

class ExecutiveDashboardService {
  private supabase = createClient();

  // Get period dates based on type
  private getPeriodDates(periodType: string, customStart?: Date, customEnd?: Date) {
    const now = new Date();
    
    if (customStart && customEnd) {
      return { start: customStart, end: customEnd };
    }

    switch (periodType) {
      case 'daily':
        return { 
          start: startOfDay(now), 
          end: endOfDay(now) 
        };
      case 'weekly':
        return { 
          start: startOfWeek(now), 
          end: endOfWeek(now) 
        };
      case 'monthly':
        return { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        };
      case 'quarterly':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return { start: quarterStart, end: quarterEnd };
      case 'yearly':
        return { 
          start: startOfYear(now), 
          end: endOfYear(now) 
        };
      default:
        return { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        };
    }
  }

  // Get previous period dates for comparison
  private getPreviousPeriodDates(periodType: string, currentStart: Date, currentEnd: Date) {
    const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      start: subDays(currentStart, daysDiff),
      end: subDays(currentEnd, daysDiff)
    };
  }

  // Get user's clinic IDs
  private async getUserClinicIds(): Promise<string[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: professionals, error } = await this.supabase
      .from('professionals')
      .select('clinic_id')
      .eq('user_id', user.id);

    if (error) throw error;
    
    return professionals?.map(p => p.clinic_id) || [];
  }

  // Get KPI values for clinic and period
  async getKPIValues(
    clinicId: string,
    periodType: string = 'monthly',
    kpiNames?: string[],
    customStart?: Date,
    customEnd?: Date
  ): Promise<KPIValue[]> {
    const { start, end } = this.getPeriodDates(periodType, customStart, customEnd);
    
    let query = this.supabase
      .from('executive_kpi_values')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('period_type', periodType)
      .gte('period_start', start.toISOString().split('T')[0])
      .lte('period_end', end.toISOString().split('T')[0])
      .order('period_start', { ascending: false });

    if (kpiNames && kpiNames.length > 0) {
      query = query.in('kpi_name', kpiNames);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Calculate KPI period comparison
  async getKPIComparison(
    clinicId: string,
    kpiName: string,
    periodType: string = 'monthly'
  ): Promise<PeriodComparison> {
    const { start: currentStart, end: currentEnd } = this.getPeriodDates(periodType);
    const { start: previousStart, end: previousEnd } = this.getPreviousPeriodDates(periodType, currentStart, currentEnd);

    // Get current period value
    const { data: currentData } = await this.supabase
      .from('executive_kpi_values')
      .select('kpi_value')
      .eq('clinic_id', clinicId)
      .eq('kpi_name', kpiName)
      .eq('period_type', periodType)
      .gte('period_start', currentStart.toISOString().split('T')[0])
      .lte('period_end', currentEnd.toISOString().split('T')[0])
      .order('period_start', { ascending: false })
      .limit(1);

    // Get previous period value
    const { data: previousData } = await this.supabase
      .from('executive_kpi_values')
      .select('kpi_value')
      .eq('clinic_id', clinicId)
      .eq('kpi_name', kpiName)
      .eq('period_type', periodType)
      .gte('period_start', previousStart.toISOString().split('T')[0])
      .lte('period_end', previousEnd.toISOString().split('T')[0])
      .order('period_start', { ascending: false })
      .limit(1);

    const current = currentData?.[0]?.kpi_value || 0;
    const previous = previousData?.[0]?.kpi_value || 0;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend
    };
  }

  // Get active alerts for clinic
  async getDashboardAlerts(clinicId: string, severity?: string): Promise<DashboardAlert[]> {
    let query = this.supabase
      .from('executive_dashboard_alerts')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Get user's dashboard widgets
  async getDashboardWidgets(clinicId: string, userId: string): Promise<DashboardWidget[]> {
    const { data, error } = await this.supabase
      .from('executive_dashboard_widgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('user_id', userId)
      .eq('is_visible', true)
      .order('position_y')
      .order('position_x');

    if (error) throw error;

    return data || [];
  }

  // Update widget configuration
  async updateWidgetConfiguration(
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): Promise<DashboardWidget> {
    const { data, error } = await this.supabase
      .from('executive_dashboard_widgets')
      .update(updates)
      .eq('id', widgetId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Get dashboard reports
  async getDashboardReports(clinicId: string, limit: number = 10): Promise<DashboardReport[]> {
    const { data, error } = await this.supabase
      .from('executive_dashboard_reports')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  }

  // Request report generation
  async requestReport(
    clinicId: string,
    reportName: string,
    reportType: string,
    periodType: string,
    periodStart: Date,
    periodEnd: Date,
    format: 'pdf' | 'excel' | 'csv' = 'pdf',
    parameters?: Record<string, any>
  ): Promise<DashboardReport> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('executive_dashboard_reports')
      .insert({
        clinic_id: clinicId,
        report_name: reportName,
        report_type: reportType,
        period_type: periodType,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        format,
        parameters: parameters || {},
        requested_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Get comprehensive dashboard data
  async getDashboardData(
    clinicId: string,
    userId: string,
    periodType: string = 'monthly'
  ): Promise<ExecutiveDashboardData> {
    const [kpis, alerts, widgets, reports] = await Promise.all([
      this.getKPIValues(clinicId, periodType),
      this.getDashboardAlerts(clinicId),
      this.getDashboardWidgets(clinicId, userId),
      this.getDashboardReports(clinicId, 5)
    ]);

    // Get period comparisons for key KPIs
    const keyKPIs = ['total_revenue', 'total_appointments', 'new_patients', 'patient_satisfaction', 'staff_utilization'];
    const periodComparisons: Record<string, PeriodComparison> = {};

    for (const kpiName of keyKPIs) {
      try {
        periodComparisons[kpiName] = await this.getKPIComparison(clinicId, kpiName, periodType);
      } catch (error) {
        console.warn(`Failed to get comparison for KPI ${kpiName}:`, error);
        periodComparisons[kpiName] = {
          current: 0,
          previous: 0,
          change: 0,
          changePercent: 0,
          trend: 'stable'
        };
      }
    }

    return {
      kpis,
      alerts,
      widgets,
      reports,
      periodComparisons
    };
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string): Promise<DashboardAlert> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('executive_dashboard_alerts')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Resolve alert
  async resolveAlert(alertId: string): Promise<DashboardAlert> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('executive_dashboard_alerts')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        is_active: false
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // Create or update KPI value
  async upsertKPIValue(kpiData: Omit<KPIValue, 'id' | 'created_at' | 'updated_at'>): Promise<KPIValue> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if KPI already exists for this period
    const { data: existing } = await this.supabase
      .from('executive_kpi_values')
      .select('id')
      .eq('clinic_id', kpiData.clinic_id)
      .eq('kpi_name', kpiData.kpi_name)
      .eq('period_type', kpiData.period_type)
      .eq('period_start', kpiData.period_start)
      .single();

    if (existing) {
      // Update existing KPI
      const { data, error } = await this.supabase
        .from('executive_kpi_values')
        .update({
          ...kpiData,
          updated_by: user.id
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new KPI
      const { data, error } = await this.supabase
        .from('executive_kpi_values')
        .insert({
          ...kpiData,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
}

export const executiveDashboardService = new ExecutiveDashboardService();
export default executiveDashboardService;