// =====================================================================================
// EQUIPMENT MAINTENANCE MANAGEMENT SERVICE
// Epic 6 - Story 6.4: Equipment maintenance scheduling and alerts service
// =====================================================================================

import type {
    Equipment,
    MaintenanceAlert,
    MaintenanceSchedule
} from '@/app/types/maintenance';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Equipment Maintenance Management Service
 * Provides comprehensive equipment maintenance management functionality
 */
export class EquipmentMaintenanceService {
  private async getSupabase() {
    return await createClient();
  }

  // =====================================================================================
  // EQUIPMENT MANAGEMENT
  // =====================================================================================

  /**
   * Create new equipment record
   */
  async createEquipment(data: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Equipment> {
    const supabase = await this.getSupabase();
    
    const equipmentData = {
      ...data,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: equipment, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create equipment: ${error.message}`);
    return equipment;
  }

  /**
   * Get equipment by ID
   */
  async getEquipment(id: string): Promise<Equipment | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        maintenance_schedules(*),
        active_alerts:maintenance_alerts!inner(
          id,
          alert_type,
          severity,
          title,
          created_at
        )
      `)
      .eq('id', id)
      .eq('active_alerts.is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get equipment: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all equipment for a clinic with filters
   */
  async getClinicEquipment(
    clinicId: string,
    filters?: {
      equipment_type?: string[];
      status?: string[];
      criticality_level?: string[];
      department?: string[];
      location?: string[];
      requires_maintenance?: boolean;
      warranty_expiring?: boolean;
      search?: string;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{ equipment: Equipment[]; total: number }> {
    const supabase = await this.getSupabase();
    
    let query = supabase
      .from('equipment')
      .select(`
        *,
        active_schedules:maintenance_schedules!inner(
          id,
          maintenance_type,
          next_due_date
        ),
        active_alerts:maintenance_alerts!inner(
          id,
          alert_type,
          severity
        )
      `, { count: 'exact' })
      .eq('clinic_id', clinicId)
      .eq('active_schedules.is_active', true)
      .eq('active_alerts.is_active', true);

    // Apply filters
    if (filters) {
      if (filters.equipment_type?.length) {
        query = query.in('equipment_type', filters.equipment_type);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.criticality_level?.length) {
        query = query.in('criticality_level', filters.criticality_level);
      }
      if (filters.department?.length) {
        query = query.in('department', filters.department);
      }
      if (filters.location?.length) {
        query = query.in('location', filters.location);
      }
      if (filters.warranty_expiring === true) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        query = query.lte('warranty_end_date', futureDate.toISOString().split('T')[0]);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
      }
    }

    // Apply pagination
    if (pagination) {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query.order('name');

    if (error) throw new Error(`Failed to get clinic equipment: ${error.message}`);

    return {
      equipment: data || [],
      total: count || 0
    };
  }

  /**
   * Update equipment information
   */
  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
    const supabase = await this.getSupabase();
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update equipment: ${error.message}`);
    return data;
  }

  // =====================================================================================
  // MAINTENANCE SCHEDULE MANAGEMENT
  // =====================================================================================

  /**
   * Create maintenance schedule
   */
  async createMaintenanceSchedule(data: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at' | 'next_due_date' | 'is_active'>): Promise<MaintenanceSchedule> {
    const supabase = await this.getSupabase();
    
    // Calculate next due date based on frequency
    const nextDueDate = this.calculateNextDueDate(data);

    const scheduleData = {
      ...data,
      next_due_date: nextDueDate,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: schedule, error } = await supabase
      .from('maintenance_schedules')
      .insert(scheduleData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create maintenance schedule: ${error.message}`);

    // Create initial alert if needed
    if (schedule.alert_days_before > 0) {
      await this.createMaintenanceAlert({
        equipment_id: schedule.equipment_id,
        schedule_id: schedule.id,
        clinic_id: schedule.clinic_id,
        alert_type: 'scheduled_maintenance',
        severity: 'medium',
        title: `Manutenção agendada: ${schedule.schedule_name}`,
        message: `Manutenção programada para o equipamento está se aproximando`,
        trigger_date: this.calculateAlertDate(nextDueDate, schedule.alert_days_before),
        due_date: nextDueDate,
        notification_recipients: schedule.notification_recipients,
        delivery_methods: ['dashboard'],
        updated_at: new Date().toISOString(),
        notification_sent: false
      });
    }

    return schedule;
  }

  /**
   * Get maintenance schedules for equipment
   */
  async getEquipmentSchedules(equipmentId: string): Promise<MaintenanceSchedule[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('equipment_id', equipmentId)
      .eq('is_active', true)
      .order('next_due_date');

    if (error) throw new Error(`Failed to get equipment schedules: ${error.message}`);
    return data || [];
  }

  /**
   * Update maintenance schedule and recalculate due dates
   */
  async updateMaintenanceSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const supabase = await this.getSupabase();
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // If frequency changed, recalculate next due date
    if (updates.frequency_days || updates.frequency_hours || updates.frequency_cycles) {
      const { data: currentSchedule } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (currentSchedule) {
        updateData.next_due_date = this.calculateNextDueDate({
          ...currentSchedule,
          ...updates
        } as MaintenanceSchedule);
      }
    }

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update maintenance schedule: ${error.message}`);
    return data;
  }

  // =====================================================================================
  // ALERT MANAGEMENT
  // =====================================================================================

  /**
   * Create maintenance alert
   */
  async createMaintenanceAlert(data: Omit<MaintenanceAlert, 'id' | 'created_at' | 'is_active' | 'is_acknowledged' | 'is_resolved'>): Promise<MaintenanceAlert> {
    const supabase = await this.getSupabase();
    
    const alertData = {
      ...data,
      is_active: true,
      is_acknowledged: false,
      is_resolved: false,
      created_at: new Date().toISOString()
    };

    const { data: alert, error } = await supabase
      .from('maintenance_alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create maintenance alert: ${error.message}`);
    return alert;
  }

  /**
   * Get active alerts for clinic
   */
  async getActiveAlerts(
    clinicId: string,
    filters?: {
      equipment_id?: string;
      alert_type?: string[];
      severity?: string[];
      is_acknowledged?: boolean;
    }
  ): Promise<MaintenanceAlert[]> {
    const supabase = await this.getSupabase();
    
    let query = supabase
      .from('maintenance_alerts')
      .select(`
        *,
        equipment:equipment!inner(
          id,
          name,
          location,
          department
        )
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .eq('is_resolved', false);

    if (filters) {
      if (filters.equipment_id) {
        query = query.eq('equipment_id', filters.equipment_id);
      }
      if (filters.alert_type?.length) {
        query = query.in('alert_type', filters.alert_type);
      }
      if (filters.severity?.length) {
        query = query.in('severity', filters.severity);
      }
      if (filters.is_acknowledged !== undefined) {
        query = query.eq('is_acknowledged', filters.is_acknowledged);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get active alerts: ${error.message}`);
    return data || [];
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): Promise<MaintenanceAlert> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('maintenance_alerts')
      .update({
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: acknowledgedBy,
        acknowledgment_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw new Error(`Failed to acknowledge alert: ${error.message}`);
    return data;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy: string, notes: string): Promise<MaintenanceAlert> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('maintenance_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        resolution_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw new Error(`Failed to resolve alert: ${error.message}`);
    return data;
  }

  // =====================================================================================
  // ANALYTICS AND REPORTING
  // =====================================================================================

  /**
   * Get maintenance summary for clinic dashboard
   */
  async getMaintenanceSummary(clinicId: string): Promise<{
    totalEquipment: number;
    activeAlerts: number;
    overdueMaintenances: number;
    upcomingMaintenances: number;
    equipmentByStatus: Record<string, number>;
    alertsBySeverity: Record<string, number>;
  }> {
    const supabase = await this.getSupabase();
    
    // Get total equipment count
    const { count: totalEquipment } = await supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    // Get active alerts count
    const { count: activeAlerts } = await supabase
      .from('maintenance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .eq('is_resolved', false);

    // Get overdue maintenances
    const today = new Date().toISOString().split('T')[0];
    const { count: overdueMaintenances } = await supabase
      .from('maintenance_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .lt('next_due_date', today);

    // Get upcoming maintenances (next 30 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const { count: upcomingMaintenances } = await supabase
      .from('maintenance_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .gte('next_due_date', today)
      .lte('next_due_date', futureDate.toISOString().split('T')[0]);

    // Get equipment by status
    const { data: equipmentStatusData } = await supabase
      .from('equipment')
      .select('status')
      .eq('clinic_id', clinicId);

    const equipmentByStatus = (equipmentStatusData || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Get alerts by severity
    const { data: alertSeverityData } = await supabase
      .from('maintenance_alerts')
      .select('severity')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    const alertsBySeverity = (alertSeverityData || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEquipment: totalEquipment || 0,
      activeAlerts: activeAlerts || 0,
      overdueMaintenances: overdueMaintenances || 0,
      upcomingMaintenances: upcomingMaintenances || 0,
      equipmentByStatus,
      alertsBySeverity
    };
  }

  // =====================================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================================

  private calculateNextDueDate(schedule: Partial<MaintenanceSchedule>): string {
    const now = new Date();
    
    if (schedule.frequency_type === 'fixed_interval' && schedule.frequency_days) {
      now.setDate(now.getDate() + schedule.frequency_days);
    } else if (schedule.frequency_type === 'usage_based') {
      // For usage-based, we'll need to calculate based on current usage
      // For now, default to 30 days
      now.setDate(now.getDate() + 30);
    } else {
      // Default to 30 days for condition-based
      now.setDate(now.getDate() + 30);
    }

    return now.toISOString().split('T')[0];
  }

  private calculateAlertDate(dueDate: string, daysBefore: number): string {
    const date = new Date(dueDate);
    date.setDate(date.getDate() - daysBefore);
    return date.toISOString().split('T')[0];
  }
}

// Export singleton instance
export const equipmentMaintenanceService = new EquipmentMaintenanceService();
