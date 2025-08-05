// Intelligent Threshold Management Service
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { DemandForecast, ReorderAlert, ReorderThreshold, ThresholdOptimization } from '@/app/types/reorder-alerts';
import { Database } from '@/app/types/supabase';
import { createClient } from '@/lib/supabase/server';

type Tables = Database['public']['Tables'];
type ReorderThresholdRow = Tables['reorder_thresholds']['Row'];
type ReorderAlertRow = Tables['reorder_alerts']['Row'];
type DemandForecastRow = Tables['demand_forecasts']['Row'];

export class IntelligentThresholdService {
  private async getSupabaseClient() {
    const supabase = await createClient();
    return await createClient();
  }

  // Core threshold management
  async createThreshold(threshold: Omit<ReorderThreshold, 'id' | 'created_at' | 'updated_at'>): Promise<ReorderThreshold> {

    // Calculate intelligent thresholds
    const calculatedThreshold = await this.calculateIntelligentThresholds(
      threshold.item_id,
      threshold.clinic_id,
      {
        reorder_point: threshold.reorder_point,
        safety_stock: threshold.safety_stock,
        demand_forecast_weekly: threshold.demand_forecast_weekly || 0,
        lead_time_days: threshold.lead_time_days || 7
      }
    );

    const { data, error } = await supabase
      .from('reorder_thresholds')
      .insert({
        ...threshold,
        ...calculatedThreshold,
        last_calculation_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ReorderThreshold;
  }

  async updateThreshold(id: string, updates: Partial<ReorderThreshold>): Promise<ReorderThreshold> {

    // Recalculate if key parameters changed
    let calculatedUpdates = {};
    if (updates.reorder_point || updates.safety_stock || updates.demand_forecast_weekly || updates.lead_time_days) {
      const existing = await this.getThreshold(id);
      if (existing) {
        calculatedUpdates = await this.calculateIntelligentThresholds(
          existing.item_id,
          existing.clinic_id,
          {
            reorder_point: updates.reorder_point || existing.reorder_point,
            safety_stock: updates.safety_stock || existing.safety_stock,
            demand_forecast_weekly: updates.demand_forecast_weekly || existing.demand_forecast_weekly || 0,
            lead_time_days: updates.lead_time_days || existing.lead_time_days || 7
          }
        );
      }
    }

    const { data, error } = await supabase
      .from('reorder_thresholds')
      .update({
        ...updates,
        ...calculatedUpdates,
        last_calculation_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ReorderThreshold;
  }

  async getThreshold(id: string): Promise<ReorderThreshold | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reorder_thresholds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as ReorderThreshold;
  }

  async getThresholdsByClinic(clinicId: string, filters?: {
    item_category?: string[];
    auto_reorder_enabled?: boolean;
    needs_optimization?: boolean;
  }): Promise<ReorderThreshold[]> {

    let query = supabase
      .from('reorder_thresholds')
      .select(`
        *,
        inventory_items!inner(
          id,
          name,
          sku,
          category,
          unit,
          current_stock
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (filters?.item_category?.length) {
      query = query.in('inventory_items.category', filters.item_category);
    }

    if (filters?.auto_reorder_enabled !== undefined) {
      query = query.eq('auto_reorder_enabled', filters.auto_reorder_enabled);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data as any[];
  }

  // Intelligent threshold calculation
  async calculateIntelligentThresholds(
    itemId: string,
    clinicId: string,
    baseParams: {
      reorder_point: number;
      safety_stock: number;
      demand_forecast_weekly: number;
      lead_time_days: number;
    }
  ): Promise<{
    calculated_reorder_point: number;
    calculated_safety_stock: number;
    seasonal_adjustment_factor: number;
  }> {
    // Get historical demand data
    const demandHistory = await this.getHistoricalDemand(itemId, clinicId, 90); // Last 90 days
    
    // Calculate demand statistics
    const demandStats = this.calculateDemandStatistics(demandHistory);
    
    // Get seasonal factors
    const seasonalFactor = await this.calculateSeasonalAdjustment(itemId, clinicId);
    
    // Calculate lead time variability
    const leadTimeVariability = await this.getLeadTimeVariability(itemId);
    
    // Calculate intelligent reorder point
    const avgDailyDemand = baseParams.demand_forecast_weekly / 7;
    const demandDuringLeadTime = avgDailyDemand * baseParams.lead_time_days;
    
    // Apply variability and seasonal factors
    const variabilityFactor = Math.sqrt(
      (demandStats.variance * baseParams.lead_time_days) + 
      (Math.pow(avgDailyDemand, 2) * leadTimeVariability)
    );
    
    // Service level of 95% (z-score = 1.645)
    const serviceLevel = 1.645;
    const calculatedSafetyStock = Math.ceil(serviceLevel * variabilityFactor * seasonalFactor);
    const calculatedReorderPoint = Math.ceil(demandDuringLeadTime * seasonalFactor + calculatedSafetyStock);

    return {
      calculated_reorder_point: Math.max(calculatedReorderPoint, baseParams.reorder_point),
      calculated_safety_stock: Math.max(calculatedSafetyStock, baseParams.safety_stock),
      seasonal_adjustment_factor: seasonalFactor,
    };
  }

  // Predictive analytics and forecasting
  async generateDemandForecast(
    itemId: string,
    clinicId: string,
    forecastPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    forecastDate: Date
  ): Promise<DemandForecast> {

    // Get historical data for analysis
    const historicalData = await this.getHistoricalDemand(itemId, clinicId, 365);
    
    // Calculate base forecast
    const forecast = await this.calculatePredictiveForecast(
      historicalData,
      forecastPeriod,
      forecastDate
    );
    
    // Apply seasonal adjustments
    const seasonalFactor = await this.calculateSeasonalAdjustment(itemId, clinicId, forecastDate);
    const adjustedDemand = forecast.predicted_demand * seasonalFactor;
    
    // Get appointment-based demand if applicable
    const appointmentDemand = await this.getAppointmentBasedDemand(itemId, clinicId, forecastDate);
    
    const demandForecast: Omit<DemandForecast, 'id' | 'created_at'> = {
      item_id: itemId,
      clinic_id: clinicId,
      forecast_date: forecastDate.toISOString().split('T')[0],
      forecast_period: forecastPeriod,
      predicted_demand: adjustedDemand + appointmentDemand,
      confidence_interval: forecast.confidence_interval,
      seasonal_factor: seasonalFactor,
      trend_factor: forecast.trend_factor,
      historical_average: forecast.historical_average,
      variance: forecast.variance,
      standard_deviation: forecast.standard_deviation,
      appointment_based_demand: appointmentDemand,
      calculated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('demand_forecasts')
      .upsert(demandForecast, {
        onConflict: 'item_id,clinic_id,forecast_date,forecast_period'
      })
      .select()
      .single();

    if (error) throw error;
    return data as DemandForecast;
  }

  // Alert management
  async createAlert(alert: Omit<ReorderAlert, 'id' | 'created_at' | 'updated_at'>): Promise<ReorderAlert> {

    // Calculate delivery time estimate
    const deliveryTime = this.estimateNotificationDeliveryTime(alert.notification_channels || ['dashboard']);
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reorder_alerts')
      .insert({
        ...alert,
        delivery_time_ms: deliveryTime,
        notification_sent: false,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    
    // Trigger notification delivery
    await this.deliverNotification(data as ReorderAlert);
    
    return data as ReorderAlert;
  }

  async updateAlert(id: string, updates: Partial<ReorderAlert>): Promise<ReorderAlert> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reorder_alerts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ReorderAlert;
  }

  async acknowledgeAlert(id: string, userId: string, notes?: string): Promise<ReorderAlert> {
    return this.updateAlert(id, {
      status: 'acknowledged',
      acknowledged_by: userId,
      acknowledged_at: new Date().toISOString(),
      resolution_notes: notes,
    });
  }

  async resolveAlert(id: string, userId: string, notes?: string): Promise<ReorderAlert> {
    return this.updateAlert(id, {
      status: 'resolved',
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes,
    });
  }

  async escalateAlert(id: string, escalateTo: string, level: number): Promise<ReorderAlert> {
    return this.updateAlert(id, {
      status: 'escalated',
      escalated_to: escalateTo,
      escalated_at: new Date().toISOString(),
      escalation_level: level,
    });
  }

  // Analytics and optimization
  async analyzeThresholdOptimization(clinicId: string): Promise<ThresholdOptimization[]> {

    // Get all active thresholds
    const thresholds = await this.getThresholdsByClinic(clinicId);
    const optimizations: ThresholdOptimization[] = [];
    
    for (const threshold of thresholds) {
      // Calculate optimal thresholds based on recent performance
      const optimal = await this.calculateOptimalThresholds(threshold);
      
      if (optimal.needs_optimization) {
        optimizations.push({
          item_id: threshold.item_id,
          item_name: (threshold as any).inventory_items.name,
          current_reorder_point: threshold.reorder_point,
          recommended_reorder_point: optimal.optimal_reorder_point,
          current_safety_stock: threshold.safety_stock,
          recommended_safety_stock: optimal.optimal_safety_stock,
          optimization_reason: optimal.reason,
          potential_savings: optimal.savings,
          confidence_score: optimal.confidence,
          implementation_priority: optimal.priority,
        });
      }
    }
    
    return optimizations.sort((a, b) => b.potential_savings - a.potential_savings);
  }

  async getAlertStats(clinicId: string, dateRange?: { start: Date; end: Date }) {
    const supabase = await createClient();

    let query = supabase
      .from('reorder_alerts')
      .select('*')
      .eq('clinic_id', clinicId);
    
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }
    
    const { data: alerts, error } = await query;
    if (error) throw error;
    
    const stats = {
      total_alerts: alerts.length,
      pending_alerts: alerts.filter(a => a.status === 'pending').length,
      critical_alerts: alerts.filter(a => a.priority === 'critical' || a.priority === 'emergency').length,
      emergency_alerts: alerts.filter(a => a.priority === 'emergency').length,
      resolved_today: alerts.filter(a => 
        a.status === 'resolved' && 
        new Date(a.resolved_at!).toDateString() === new Date().toDateString()
      ).length,
      average_resolution_time_hours: this.calculateAverageResolutionTime(alerts),
      alerts_by_type: this.groupBy(alerts, 'alert_type'),
      alerts_by_priority: this.groupBy(alerts, 'priority'),
    };
    
    return stats;
  }

  // Private helper methods
  private async getHistoricalDemand(itemId: string, clinicId: string, days: number) {
    const supabase = await createClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // This would typically come from inventory movements/usage history
    // For now, return sample data structure
    return [];
  }

  private calculateDemandStatistics(demandHistory: any[]) {
    if (demandHistory.length === 0) {
      return { average: 0, variance: 0, standardDeviation: 0 };
    }
    
    const values = demandHistory.map(d => d.quantity);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return { average, variance, standardDeviation };
  }

  private async calculateSeasonalAdjustment(itemId: string, clinicId: string, date?: Date): Promise<number> {
    // Calculate seasonal factors based on historical patterns
    // This would analyze usage patterns by month/season
    const currentDate = date || new Date();
    const month = currentDate.getMonth();
    
    // Basic seasonal adjustment (would be enhanced with ML in production)
    const seasonalFactors = [
      1.0, 1.0, 1.1, 1.1, 1.0, 0.9, // Jan-Jun
      0.8, 0.8, 0.9, 1.0, 1.1, 1.2  // Jul-Dec
    ];
    
    return seasonalFactors[month] || 1.0;
  }

  private async getLeadTimeVariability(itemId: string): Promise<number> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('supplier_lead_times')
      .select('*')
      .eq('item_id', itemId);
    
    if (error || !data.length) return 0.5; // Default variability
    
    const leadTimes = data.map(d => d.average_lead_time_days);
    const avg = leadTimes.reduce((sum, val) => sum + val, 0) / leadTimes.length;
    const variance = leadTimes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / leadTimes.length;
    
    return variance / Math.pow(avg, 2); // Coefficient of variation
  }

  private async calculatePredictiveForecast(
    historicalData: any[],
    period: string,
    date: Date
  ) {
    const supabase = await createClient();
    // Simple moving average with trend (would be enhanced with ML models)
    const recentData = historicalData.slice(-30); // Last 30 data points
    const average = recentData.length > 0 
      ? recentData.reduce((sum, d) => sum + d.quantity, 0) / recentData.length 
      : 0;
    
    return {
      predicted_demand: average,
      confidence_interval: 0.85,
      trend_factor: 1.0,
      historical_average: average,
      variance: 0,
      standard_deviation: 0,
    };
  }

  private async getAppointmentBasedDemand(itemId: string, clinicId: string, date: Date): Promise<number> {
    // Calculate demand based on scheduled appointments
    // This would integrate with appointment system
    return 0;
  }

  private estimateNotificationDeliveryTime(channels: string[]): number {
    // Estimate delivery time based on channels
    if (channels.includes('sms') || channels.includes('push')) return 5000; // 5 seconds
    if (channels.includes('email')) return 30000; // 30 seconds
    return 1000; // Dashboard only - 1 second
  }

  private async deliverNotification(alert: ReorderAlert): Promise<void> {
    // Implement actual notification delivery
    // This would integrate with notification services
    const startTime = Date.now();
    
    // Simulate notification delivery
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const deliveryTime = Date.now() - startTime;
    
    // Update delivery status
    await this.updateAlert(alert.id, {
      notification_sent: true,
      delivery_time_ms: deliveryTime,
    });
  }

  private async calculateOptimalThresholds(threshold: any) {
    const supabase = await createClient();
    // Analyze threshold performance and calculate optimal values
    // This would use historical alert frequency, stockout incidents, etc.
    
    return {
      needs_optimization: false,
      optimal_reorder_point: threshold.reorder_point,
      optimal_safety_stock: threshold.safety_stock,
      reason: 'Current thresholds are optimal',
      savings: 0,
      confidence: 0.95,
      priority: 'low' as const,
    };
  }

  private calculateAverageResolutionTime(alerts: any[]): number {
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolved_at);
    if (resolvedAlerts.length === 0) return 0;
    
    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      const created = new Date(alert.created_at).getTime();
      const resolved = new Date(alert.resolved_at).getTime();
      return sum + (resolved - created);
    }, 0);
    
    return totalTime / resolvedAlerts.length / (1000 * 60 * 60); // Convert to hours
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}


