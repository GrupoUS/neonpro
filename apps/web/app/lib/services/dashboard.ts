import { createClient } from '@/app/utils/supabase/server';

export class DashboardService {
  private async getSupabase() {
    return await createClient();
  }

  // Add new methods for dashboard API

  async getAllMetrics(period = '30d') {
    const supabase = await this.getSupabase();
    const periodDays = this.parsePeriodToDays(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const { data: performanceLogs, error } = await supabase
      .from('dashboard_performance_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return performanceLogs || [];
  }

  async getMetricData(metric: string, period = '30d') {
    const supabase = await this.getSupabase();
    const periodDays = this.parsePeriodToDays(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const { data: logs, error } = await supabase
      .from('dashboard_performance_logs')
      .select('*')
      .eq('metric_type', metric)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return logs || [];
  }

  async recordMetric(
    userId: string,
    metric: string,
    value: number,
    metadata?: any
  ) {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('dashboard_performance_logs')
      .insert([
        {
          metric_type: metric,
          value,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private parsePeriodToDays(period: string): number {
    const periodMap: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    return periodMap[period] || 30;
  }
  async createDashboardConfig(
    userId: string,
    data: {
      layout_config: any;
      widget_preferences: any;
      update_frequency?: number;
      is_default?: boolean;
    }
  ) {
    const supabase = await this.getSupabase();
    const { data: config, error } = await supabase
      .from('dashboard_configurations')
      .insert({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return config;
  }

  async getDashboardConfig(userId: string, configId?: string) {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('dashboard_configurations')
      .select(`
        *,
        dashboard_widgets (
          *
        )
      `)
      .eq('user_id', userId);

    if (configId) {
      query = query.eq('id', configId);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }

  async updateDashboardConfig(configId: string, data: any) {
    const supabase = await this.getSupabase();
    const { data: config, error } = await supabase
      .from('dashboard_configurations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) throw error;
    return config;
  }

  async deleteDashboardConfig(configId: string) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('dashboard_configurations')
      .delete()
      .eq('id', configId);

    if (error) throw error;
    return { success: true };
  }

  // Widget Management
  async createWidget(data: {
    config_id: string;
    widget_type: string;
    widget_name: string;
    data_source: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    configuration: any;
    is_visible?: boolean;
  }) {
    const supabase = await this.getSupabase();
    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return widget;
  }

  async getWidgets(configId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('config_id', configId)
      .order('position_y')
      .order('position_x');

    if (error) throw error;
    return data;
  }

  async updateWidget(widgetId: string, data: any) {
    const supabase = await this.getSupabase();
    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', widgetId)
      .select()
      .single();

    if (error) throw error;
    return widget;
  }

  async deleteWidget(widgetId: string) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId);

    if (error) throw error;
    return { success: true };
  }

  // KPI Metrics
  async calculateKPIMetrics(clinicId?: string, period = 'daily', date?: Date) {
    const calculationDate = date || new Date();
    const startDate = this.getDateRange(calculationDate, period).start;
    const endDate = this.getDateRange(calculationDate, period).end;

    // Revenue Metrics
    const revenueMetrics = await this.calculateRevenueMetrics(
      clinicId,
      startDate,
      endDate
    );

    // Patient Metrics
    const patientMetrics = await this.calculatePatientMetrics(
      clinicId,
      startDate,
      endDate
    );

    // Appointment Metrics
    const appointmentMetrics = await this.calculateAppointmentMetrics(
      clinicId,
      startDate,
      endDate
    );

    // Efficiency Metrics
    const efficiencyMetrics = await this.calculateEfficiencyMetrics(
      clinicId,
      startDate,
      endDate
    );

    return {
      revenue: revenueMetrics,
      patients: patientMetrics,
      appointments: appointmentMetrics,
      efficiency: efficiencyMetrics,
      calculation_date: calculationDate.toISOString(),
      period,
    };
  }

  private async calculateRevenueMetrics(
    clinicId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('appointments')
      .select(`
        total_amount,
        paid_amount,
        appointment_date,
        status,
        services (
          name,
          price
        )
      `)
      .eq('status', 'completed');

    if (clinicId) query = query.eq('clinic_id', clinicId);
    if (startDate)
      query = query.gte('appointment_date', startDate.toISOString());
    if (endDate) query = query.lte('appointment_date', endDate.toISOString());

    const { data: appointments, error } = await query;
    if (error) throw error;

    const totalRevenue =
      appointments?.reduce(
        (sum: number, apt: any) => sum + (apt.paid_amount || 0),
        0
      ) || 0;
    const averageTransaction = appointments?.length
      ? totalRevenue / appointments.length
      : 0;

    // Revenue by service
    const serviceRevenue =
      appointments?.reduce((acc: any, apt: any) => {
        if (apt.services) {
          const serviceName = apt.services.name;
          if (!acc[serviceName]) {
            acc[serviceName] = { revenue: 0, count: 0 };
          }
          acc[serviceName].revenue += apt.paid_amount || 0;
          acc[serviceName].count += 1;
        }
        return acc;
      }, {}) || {};

    const revenueByService = Object.entries(serviceRevenue).map(
      ([service, data]: [string, any]) => ({
        service_name: service,
        revenue: data.revenue,
        count: data.count,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      })
    );

    return {
      daily_revenue: totalRevenue,
      weekly_revenue: totalRevenue,
      monthly_revenue: totalRevenue,
      revenue_growth: 0, // TODO: Calculate growth
      average_transaction: averageTransaction,
      revenue_by_service: revenueByService,
      revenue_trend: [], // TODO: Implement trend calculation
      revenue_forecast: [], // TODO: Implement forecast
    };
  }

  private async calculatePatientMetrics(
    clinicId?: string,
    startDate?: Date,
    _endDate?: Date
  ) {
    const supabase = await this.getSupabase();
    let query = supabase.from('profiles').select('*');

    if (clinicId) query = query.eq('clinic_id', clinicId);
    if (startDate) query = query.gte('created_at', startDate.toISOString());

    const { data: patients, error } = await query;
    if (error) throw error;

    const totalPatients = patients?.length || 0;
    const newPatients =
      patients?.filter(
        (p: any) => new Date(p.created_at) >= (startDate || new Date(0))
      ).length || 0;

    return {
      new_patients: newPatients,
      returning_patients: totalPatients - newPatients,
      total_patients: totalPatients,
      patient_growth: 0, // TODO: Calculate growth
      retention_rate: 0, // TODO: Calculate retention
      lifetime_value: 0, // TODO: Calculate LTV
      patient_segmentation: [],
      acquisition_sources: [],
    };
  }

  private async calculateAppointmentMetrics(
    clinicId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const supabase = await this.getSupabase();
    let query = supabase.from('appointments').select('*');

    if (clinicId) query = query.eq('clinic_id', clinicId);
    if (startDate)
      query = query.gte('appointment_date', startDate.toISOString());
    if (endDate) query = query.lte('appointment_date', endDate.toISOString());

    const { data: appointments, error } = await query;
    if (error) throw error;

    const totalAppointments = appointments?.length || 0;
    const completedAppointments =
      appointments?.filter((a: any) => a.status === 'completed').length || 0;
    const cancelledAppointments =
      appointments?.filter((a: any) => a.status === 'cancelled').length || 0;
    const noShowAppointments =
      appointments?.filter((a: any) => a.status === 'no_show').length || 0;

    const bookingRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;
    const cancellationRate =
      totalAppointments > 0
        ? (cancelledAppointments / totalAppointments) * 100
        : 0;
    const noShowRate =
      totalAppointments > 0
        ? (noShowAppointments / totalAppointments) * 100
        : 0;

    return {
      total_appointments: totalAppointments,
      booking_rate: bookingRate,
      cancellation_rate: cancellationRate,
      no_show_rate: noShowRate,
      utilization_rate: 0, // TODO: Calculate utilization
      average_booking_lead_time: 0, // TODO: Calculate lead time
      appointment_types: [],
      time_slot_analysis: [],
    };
  }

  private async calculateEfficiencyMetrics(
    _clinicId?: string,
    _startDate?: Date,
    _endDate?: Date
  ) {
    // TODO: Implement efficiency calculations based on appointments, resources, and staff
    return {
      staff_productivity: 0,
      resource_utilization: 0,
      treatment_efficiency: 0,
      wait_time_average: 0,
      service_completion_rate: 0,
      cost_per_patient: 0,
      profit_margin: 0,
      operational_efficiency: 0,
    };
  }

  // Alert Management
  async createAlert(
    userId: string,
    data: {
      alert_type: string;
      metric_name: string;
      threshold_value: number;
      threshold_operator?: string;
      notification_method?: string;
    }
  ) {
    const supabase = await this.getSupabase();
    const { data: alert, error } = await supabase
      .from('dashboard_alerts')
      .insert({
        user_id: userId,
        ...data,
        is_active: true,
        trigger_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  async getAlerts(userId: string, clinicId?: string) {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('dashboard_alerts')
      .select('*')
      .eq('user_id', userId);

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateAlert(alertId: string, data: any) {
    const supabase = await this.getSupabase();
    const { data: alert, error } = await supabase
      .from('dashboard_alerts')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  async deleteAlert(alertId: string) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('dashboard_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
    return { success: true };
  }

  // Performance Logging
  async logPerformance(
    userId: string,
    data: {
      dashboard_load_time: number;
      data_fetch_time: number;
      widget_count: number;
      error_count?: number;
    }
  ) {
    const supabase = await this.getSupabase();
    const { data: log, error } = await supabase
      .from('dashboard_performance_logs')
      .insert({
        user_id: userId,
        ...data,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  async getPerformanceLogs(userId: string, limit = 100) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('dashboard_performance_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Cache Management
  async getCachedData(cacheKey: string, clinicId?: string) {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('dashboard_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString());

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query.single();
    if (error) return null;
    return data?.cache_data;
  }

  async setCachedData(
    cacheKey: string,
    data: any,
    expiresInMinutes = 30,
    clinicId?: string
  ) {
    const supabase = await this.getSupabase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const { error } = await supabase.from('dashboard_cache').upsert({
      cache_key: cacheKey,
      cache_data: data,
      expires_at: expiresAt.toISOString(),
      clinic_id: clinicId,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  }

  // Utility Methods
  private getDateRange(date: Date, period: string) {
    const start = new Date(date);
    const end = new Date(date);

    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly': {
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }

  // Dashboard Summary
  async getDashboardSummary(userId: string, clinicId?: string) {
    const cacheKey = `dashboard_summary_${userId}_${clinicId || 'all'}`;
    const cached = await this.getCachedData(cacheKey, clinicId);

    if (cached) {
      return cached;
    }

    const metrics = await this.calculateKPIMetrics(clinicId);
    const alerts = await this.getAlerts(userId, clinicId);

    const summary = {
      total_revenue: metrics.revenue.daily_revenue,
      total_patients: metrics.patients.total_patients,
      total_appointments: metrics.appointments.total_appointments,
      efficiency_score: metrics.efficiency.operational_efficiency,
      growth_rate: metrics.revenue.revenue_growth,
      alert_count: alerts?.filter((a: any) => a.is_active).length || 0,
      last_updated: new Date().toISOString(),
      performance_score: 100, // TODO: Calculate performance score
    };

    // Cache for 5 minutes
    await this.setCachedData(cacheKey, summary, 5, clinicId);

    return summary;
  }

  // Real-time data updates
  async getWidgetData(widgetId: string, query?: any) {
    const supabase = await this.getSupabase();
    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('id', widgetId)
      .single();

    if (error) throw error;

    // Generate data based on widget configuration and data source
    const data = await this.generateWidgetData(widget, query);

    return {
      widget_id: widgetId,
      data,
      metadata: {
        last_updated: new Date().toISOString(),
        data_points: Array.isArray(data) ? data.length : 1,
        calculation_time: 0,
      },
    };
  }

  private async generateWidgetData(widget: any, query?: any) {
    // TODO: Implement data generation based on widget type and data source
    const { data_source, configuration } = widget;

    switch (data_source) {
      case 'revenue':
        return await this.getRevenueData(configuration, query);
      case 'patients':
        return await this.getPatientData(configuration, query);
      case 'appointments':
        return await this.getAppointmentData(configuration, query);
      default:
        return [];
    }
  }

  private async getRevenueData(_config: any, _query?: any) {
    // TODO: Implement revenue data generation
    return {
      total: 0,
      trend: [],
      breakdown: [],
    };
  }

  private async getPatientData(_config: any, _query?: any) {
    // TODO: Implement patient data generation
    return {
      total: 0,
      new: 0,
      returning: 0,
      segments: [],
    };
  }

  private async getAppointmentData(_config: any, _query?: any) {
    // TODO: Implement appointment data generation
    return {
      total: 0,
      completed: 0,
      cancelled: 0,
      upcoming: 0,
    };
  }
}
