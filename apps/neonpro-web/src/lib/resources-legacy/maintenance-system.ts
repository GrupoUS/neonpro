/**
 * Predictive Maintenance System
 * Story 2.4: Intelligent equipment maintenance scheduling and cost optimization
 * 
 * Features:
 * - Predictive maintenance scheduling
 * - Equipment usage tracking
 * - Automated alerts and notifications
 * - Cost optimization and ROI analysis
 * - Vendor integration
 * - Lifecycle management
 */

import { createClient } from '@supabase/supabase-js';
import { Resource, MaintenanceRecord, MaintenanceType, MaintenanceStatus } from './resource-manager';

// Maintenance system types
export interface MaintenanceSchedule {
  id: string;
  resource_id: string;
  maintenance_type: MaintenanceType;
  scheduled_date: Date;
  estimated_duration: number; // hours
  estimated_cost: number;
  priority: MaintenancePriority;
  vendor_id?: string;
  technician_id?: string;
  status: MaintenanceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentUsage {
  id: string;
  resource_id: string;
  date: Date;
  usage_hours: number;
  cycles_completed: number;
  performance_metrics: Record<string, number>;
  wear_indicators: Record<string, number>;
  efficiency_score: number;
}

export interface MaintenanceAlert {
  id: string;
  resource_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  recommended_action: string;
  due_date: Date;
  acknowledged: boolean;
  resolved: boolean;
  created_at: Date;
}

export interface MaintenanceCost {
  resource_id: string;
  period: string;
  preventive_cost: number;
  corrective_cost: number;
  emergency_cost: number;
  total_cost: number;
  downtime_cost: number;
  roi_score: number;
}

export interface VendorInfo {
  id: string;
  name: string;
  contact_info: Record<string, string>;
  specialties: string[];
  response_time: number; // hours
  cost_rating: number; // 1-5
  quality_rating: number; // 1-5
  availability: Record<string, boolean>; // day of week availability
}

export interface MaintenanceAnalytics {
  total_maintenance_cost: number;
  preventive_vs_corrective_ratio: number;
  average_downtime: number;
  equipment_reliability: number;
  cost_per_hour_saved: number;
  upcoming_maintenance: MaintenanceSchedule[];
  overdue_maintenance: MaintenanceSchedule[];
  cost_trends: Array<{ period: string; cost: number }>;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'usage_threshold' | 'performance_degradation' | 'scheduled_maintenance' | 'emergency' | 'calibration_due';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Predictive Maintenance System
 * Manages equipment maintenance with AI-powered predictions
 */
export class MaintenanceSystem {
  private supabase;
  private usageThresholds: Map<string, number> = new Map();
  private performanceBaselines: Map<string, Record<string, number>> = new Map();
  private alertSubscribers: Set<(alert: MaintenanceAlert) => void> = new Set();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.initializeThresholds();
    this.startMonitoring();
  }

  /**
   * Initialize usage thresholds for different equipment types
   */
  private initializeThresholds(): void {
    // Default thresholds (hours per month)
    this.usageThresholds.set('laser', 200);
    this.usageThresholds.set('ultrasound', 150);
    this.usageThresholds.set('surgical', 100);
    this.usageThresholds.set('diagnostic', 180);
    this.usageThresholds.set('default', 120);
  }

  /**
   * Start continuous monitoring for maintenance needs
   */
  private startMonitoring(): void {
    // Check for maintenance needs every hour
    setInterval(() => {
      this.checkMaintenanceNeeds();
    }, 60 * 60 * 1000);

    console.log('✅ Maintenance monitoring started');
  }

  /**
   * Record equipment usage
   */
  async recordUsage(usage: Omit<EquipmentUsage, 'id'>): Promise<EquipmentUsage> {
    try {
      const { data, error } = await this.supabase
        .from('equipment_usage')
        .insert([usage])
        .select()
        .single();

      if (error) throw error;

      // Check if usage triggers maintenance alerts
      await this.checkUsageThresholds(data.resource_id, usage.usage_hours);
      await this.checkPerformanceDegradation(data.resource_id, usage.performance_metrics);

      console.log(`✅ Usage recorded for resource: ${data.resource_id}`);
      return data;
    } catch (error) {
      console.error('❌ Error recording usage:', error);
      throw new Error('Failed to record equipment usage');
    }
  }

  /**
   * Schedule predictive maintenance
   */
  async scheduleMaintenance(
    resourceId: string,
    maintenanceType: MaintenanceType,
    scheduledDate: Date,
    options?: {
      estimatedDuration?: number;
      estimatedCost?: number;
      priority?: MaintenancePriority;
      vendorId?: string;
      technicianId?: string;
    }
  ): Promise<MaintenanceSchedule> {
    try {
      const schedule: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'> = {
        resource_id: resourceId,
        maintenance_type: maintenanceType,
        scheduled_date: scheduledDate,
        estimated_duration: options?.estimatedDuration || this.getDefaultDuration(maintenanceType),
        estimated_cost: options?.estimatedCost || await this.estimateMaintenanceCost(resourceId, maintenanceType),
        priority: options?.priority || 'medium',
        vendor_id: options?.vendorId,
        technician_id: options?.technicianId,
        status: 'scheduled'
      };

      const { data, error } = await this.supabase
        .from('maintenance_schedules')
        .insert([{
          ...schedule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create alert for upcoming maintenance
      await this.createMaintenanceAlert(
        resourceId,
        'scheduled_maintenance',
        'info',
        `${maintenanceType} maintenance scheduled for ${scheduledDate.toLocaleDateString()}`,
        'Prepare equipment and schedule downtime',
        scheduledDate
      );

      console.log(`✅ Maintenance scheduled: ${maintenanceType} for ${resourceId}`);
      return data;
    } catch (error) {
      console.error('❌ Error scheduling maintenance:', error);
      throw new Error('Failed to schedule maintenance');
    }
  }

  /**
   * Get maintenance schedule for resource
   */
  async getMaintenanceSchedule(
    resourceId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MaintenanceSchedule[]> {
    try {
      let query = this.supabase
        .from('maintenance_schedules')
        .select('*');

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      if (startDate) {
        query = query.gte('scheduled_date', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('scheduled_date', endDate.toISOString());
      }

      const { data, error } = await query.order('scheduled_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching maintenance schedule:', error);
      throw new Error('Failed to fetch maintenance schedule');
    }
  }

  /**
   * Update maintenance status
   */
  async updateMaintenanceStatus(
    scheduleId: string,
    status: MaintenanceStatus,
    actualCost?: number,
    notes?: string
  ): Promise<MaintenanceSchedule> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
        if (actualCost !== undefined) {
          updateData.actual_cost = actualCost;
        }
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await this.supabase
        .from('maintenance_schedules')
        .update(updateData)
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw error;

      // Create maintenance record if completed
      if (status === 'completed') {
        await this.createMaintenanceRecord(data);
      }

      console.log(`✅ Maintenance status updated: ${scheduleId} -> ${status}`);
      return data;
    } catch (error) {
      console.error('❌ Error updating maintenance status:', error);
      throw new Error('Failed to update maintenance status');
    }
  }

  /**
   * Get maintenance alerts
   */
  async getMaintenanceAlerts(
    resourceId?: string,
    severity?: AlertSeverity,
    unacknowledgedOnly: boolean = false
  ): Promise<MaintenanceAlert[]> {
    try {
      let query = this.supabase
        .from('maintenance_alerts')
        .select('*');

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (unacknowledgedOnly) {
        query = query.eq('acknowledged', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching maintenance alerts:', error);
      throw new Error('Failed to fetch maintenance alerts');
    }
  }

  /**
   * Acknowledge maintenance alert
   */
  async acknowledgeAlert(alertId: string): Promise<MaintenanceAlert> {
    try {
      const { data, error } = await this.supabase
        .from('maintenance_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Alert acknowledged: ${alertId}`);
      return data;
    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
      throw new Error('Failed to acknowledge alert');
    }
  }

  /**
   * Get maintenance cost analysis
   */
  async getMaintenanceCosts(
    resourceId?: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<MaintenanceCost[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_maintenance_costs', {
          resource_filter: resourceId,
          period_type: period
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching maintenance costs:', error);
      throw new Error('Failed to fetch maintenance costs');
    }
  }

  /**
   * Get maintenance analytics
   */
  async getMaintenanceAnalytics(days: number = 30): Promise<MaintenanceAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Get maintenance schedules
      const schedules = await this.getMaintenanceSchedule(undefined, startDate, endDate);
      
      // Get upcoming maintenance
      const upcoming = await this.getMaintenanceSchedule(
        undefined,
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );

      // Get overdue maintenance
      const overdue = schedules.filter(s => 
        new Date(s.scheduled_date) < new Date() && s.status !== 'completed'
      );

      // Calculate costs
      const costs = await this.getMaintenanceCosts();
      const totalCost = costs.reduce((sum, cost) => sum + cost.total_cost, 0);
      
      // Calculate ratios
      const preventiveCost = costs.reduce((sum, cost) => sum + cost.preventive_cost, 0);
      const correctiveCost = costs.reduce((sum, cost) => sum + cost.corrective_cost, 0);
      const preventiveRatio = totalCost > 0 ? preventiveCost / totalCost : 0;

      // Calculate reliability
      const completedMaintenance = schedules.filter(s => s.status === 'completed').length;
      const reliability = schedules.length > 0 ? completedMaintenance / schedules.length : 1;

      return {
        total_maintenance_cost: totalCost,
        preventive_vs_corrective_ratio: preventiveRatio,
        average_downtime: this.calculateAverageDowntime(schedules),
        equipment_reliability: reliability,
        cost_per_hour_saved: this.calculateCostPerHourSaved(costs),
        upcoming_maintenance: upcoming,
        overdue_maintenance: overdue,
        cost_trends: this.calculateCostTrends(costs)
      };
    } catch (error) {
      console.error('❌ Error getting maintenance analytics:', error);
      throw new Error('Failed to get maintenance analytics');
    }
  }

  /**
   * Predict maintenance needs using usage patterns
   */
  async predictMaintenanceNeeds(resourceId: string): Promise<{
    nextMaintenanceDate: Date;
    confidence: number;
    reasoning: string[];
    recommendedActions: string[];
  }> {
    try {
      // Get usage history
      const { data: usageHistory, error } = await this.supabase
        .from('equipment_usage')
        .select('*')
        .eq('resource_id', resourceId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (!usageHistory || usageHistory.length === 0) {
        return {
          nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          confidence: 0.5,
          reasoning: ['Insufficient usage data for accurate prediction'],
          recommendedActions: ['Establish baseline usage tracking']
        };
      }

      // Calculate usage trends
      const avgUsage = usageHistory.reduce((sum, usage) => sum + usage.usage_hours, 0) / usageHistory.length;
      const avgEfficiency = usageHistory.reduce((sum, usage) => sum + usage.efficiency_score, 0) / usageHistory.length;
      
      // Get resource info
      const { data: resource } = await this.supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      // Predict based on usage patterns
      const threshold = this.usageThresholds.get(resource?.equipment_type || 'default') || 120;
      const daysToThreshold = Math.ceil(threshold / (avgUsage * 30)); // Convert to days
      
      const nextMaintenanceDate = new Date(Date.now() + daysToThreshold * 24 * 60 * 60 * 1000);
      
      // Calculate confidence based on data quality
      let confidence = 0.7;
      if (usageHistory.length >= 30) confidence += 0.2;
      if (avgEfficiency > 0.8) confidence += 0.1;
      
      const reasoning: string[] = [];
      const recommendedActions: string[] = [];
      
      if (avgUsage > threshold * 0.8) {
        reasoning.push('High usage detected, maintenance needed soon');
        recommendedActions.push('Schedule preventive maintenance');
      }
      
      if (avgEfficiency < 0.7) {
        reasoning.push('Declining efficiency indicates wear');
        recommendedActions.push('Inspect for performance issues');
      }
      
      return {
        nextMaintenanceDate,
        confidence: Math.min(confidence, 1.0),
        reasoning,
        recommendedActions
      };
    } catch (error) {
      console.error('❌ Error predicting maintenance needs:', error);
      throw new Error('Failed to predict maintenance needs');
    }
  }

  /**
   * Check maintenance needs periodically
   */
  private async checkMaintenanceNeeds(): Promise<void> {
    try {
      // Get all equipment resources
      const { data: resources, error } = await this.supabase
        .from('resources')
        .select('*')
        .eq('type', 'equipment');

      if (error) throw error;

      for (const resource of resources || []) {
        // Check if maintenance is overdue
        const schedules = await this.getMaintenanceSchedule(resource.id);
        const overdue = schedules.filter(s => 
          new Date(s.scheduled_date) < new Date() && s.status !== 'completed'
        );

        if (overdue.length > 0) {
          await this.createMaintenanceAlert(
            resource.id,
            'scheduled_maintenance',
            'error',
            'Maintenance overdue',
            'Complete overdue maintenance immediately',
            new Date()
          );
        }

        // Predict future maintenance needs
        const prediction = await this.predictMaintenanceNeeds(resource.id);
        const daysUntilMaintenance = Math.ceil(
          (prediction.nextMaintenanceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilMaintenance <= 7) {
          await this.createMaintenanceAlert(
            resource.id,
            'usage_threshold',
            'warning',
            'Maintenance needed soon',
            'Schedule maintenance within the next week',
            prediction.nextMaintenanceDate
          );
        }
      }
    } catch (error) {
      console.error('❌ Error checking maintenance needs:', error);
    }
  }

  /**
   * Check usage thresholds
   */
  private async checkUsageThresholds(resourceId: string, usageHours: number): Promise<void> {
    try {
      const { data: resource } = await this.supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      const threshold = this.usageThresholds.get(resource?.equipment_type || 'default') || 120;
      
      if (usageHours > threshold * 0.9) {
        await this.createMaintenanceAlert(
          resourceId,
          'usage_threshold',
          'warning',
          'Usage threshold approaching',
          'Consider scheduling maintenance',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
      }
    } catch (error) {
      console.error('❌ Error checking usage thresholds:', error);
    }
  }

  /**
   * Check for performance degradation
   */
  private async checkPerformanceDegradation(
    resourceId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    try {
      const baseline = this.performanceBaselines.get(resourceId);
      
      if (!baseline) {
        // Set baseline if not exists
        this.performanceBaselines.set(resourceId, metrics);
        return;
      }

      // Check for significant degradation
      for (const [metric, value] of Object.entries(metrics)) {
        const baselineValue = baseline[metric];
        if (baselineValue && value < baselineValue * 0.8) {
          await this.createMaintenanceAlert(
            resourceId,
            'performance_degradation',
            'warning',
            `Performance degradation detected in ${metric}`,
            'Investigate and consider maintenance',
            new Date()
          );
        }
      }
    } catch (error) {
      console.error('❌ Error checking performance degradation:', error);
    }
  }

  /**
   * Create maintenance alert
   */
  private async createMaintenanceAlert(
    resourceId: string,
    alertType: AlertType,
    severity: AlertSeverity,
    message: string,
    recommendedAction: string,
    dueDate: Date
  ): Promise<MaintenanceAlert> {
    try {
      const alert: Omit<MaintenanceAlert, 'id'> = {
        resource_id: resourceId,
        alert_type: alertType,
        severity,
        message,
        recommended_action: recommendedAction,
        due_date: dueDate,
        acknowledged: false,
        resolved: false,
        created_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('maintenance_alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      // Notify subscribers
      this.alertSubscribers.forEach(callback => callback(data));

      console.log(`🚨 Maintenance alert created: ${message}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating maintenance alert:', error);
      throw new Error('Failed to create maintenance alert');
    }
  }

  /**
   * Create maintenance record after completion
   */
  private async createMaintenanceRecord(schedule: MaintenanceSchedule): Promise<MaintenanceRecord> {
    try {
      const record: Omit<MaintenanceRecord, 'id'> = {
        resource_id: schedule.resource_id,
        maintenance_type: schedule.maintenance_type,
        scheduled_date: new Date(schedule.scheduled_date),
        completed_date: new Date(),
        cost: (schedule as any).actual_cost || schedule.estimated_cost,
        notes: (schedule as any).notes,
        technician_id: schedule.technician_id,
        status: 'completed'
      };

      const { data, error } = await this.supabase
        .from('maintenance_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Maintenance record created: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating maintenance record:', error);
      throw new Error('Failed to create maintenance record');
    }
  }

  /**
   * Estimate maintenance cost
   */
  private async estimateMaintenanceCost(
    resourceId: string,
    maintenanceType: MaintenanceType
  ): Promise<number> {
    try {
      // Get historical costs for similar maintenance
      const { data: records, error } = await this.supabase
        .from('maintenance_records')
        .select('cost')
        .eq('resource_id', resourceId)
        .eq('maintenance_type', maintenanceType)
        .order('completed_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (records && records.length > 0) {
        const avgCost = records.reduce((sum, record) => sum + (record.cost || 0), 0) / records.length;
        return avgCost * 1.1; // Add 10% inflation buffer
      }

      // Default estimates by maintenance type
      const defaultCosts = {
        preventive: 500,
        corrective: 1200,
        emergency: 2000,
        calibration: 300,
        upgrade: 3000
      };

      return defaultCosts[maintenanceType] || 800;
    } catch (error) {
      console.error('❌ Error estimating maintenance cost:', error);
      return 800; // Default fallback
    }
  }

  /**
   * Get default duration for maintenance type
   */
  private getDefaultDuration(maintenanceType: MaintenanceType): number {
    const defaultDurations = {
      preventive: 2,
      corrective: 4,
      emergency: 6,
      calibration: 1,
      upgrade: 8
    };

    return defaultDurations[maintenanceType] || 3;
  }

  /**
   * Calculate average downtime
   */
  private calculateAverageDowntime(schedules: MaintenanceSchedule[]): number {
    const completed = schedules.filter(s => s.status === 'completed');
    if (completed.length === 0) return 0;

    const totalDowntime = completed.reduce((sum, schedule) => sum + schedule.estimated_duration, 0);
    return totalDowntime / completed.length;
  }

  /**
   * Calculate cost per hour saved
   */
  private calculateCostPerHourSaved(costs: MaintenanceCost[]): number {
    if (costs.length === 0) return 0;

    const totalCost = costs.reduce((sum, cost) => sum + cost.total_cost, 0);
    const totalDowntimeCost = costs.reduce((sum, cost) => sum + cost.downtime_cost, 0);
    
    return totalDowntimeCost > 0 ? totalCost / totalDowntimeCost : 0;
  }

  /**
   * Calculate cost trends
   */
  private calculateCostTrends(costs: MaintenanceCost[]): Array<{ period: string; cost: number }> {
    return costs.map(cost => ({
      period: cost.period,
      cost: cost.total_cost
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Subscribe to maintenance alerts
   */
  subscribeToAlerts(callback: (alert: MaintenanceAlert) => void): () => void {
    this.alertSubscribers.add(callback);
    
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }
}

export default MaintenanceSystem;