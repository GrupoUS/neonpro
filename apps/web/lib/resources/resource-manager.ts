// =====================================================
// NeonPro Resource Management Core Service
// Story 2.4: Smart Resource Management
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// =====================================================
// Types and Interfaces
// =====================================================

export type ResourceType = 'room' | 'equipment' | 'staff';
export type ResourceStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
export type AllocationStatus = 'pending' | 'confirmed' | 'in_use' | 'completed' | 'cancelled';
export type AllocationType = 'appointment' | 'maintenance' | 'cleaning' | 'training' | 'personal_use';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Resource {
  id: string;
  clinic_id: string;
  name: string;
  type: ResourceType;
  category?: string;
  location?: string;
  status: ResourceStatus;
  capacity: number;
  
  // Equipment specific
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_interval_days?: number;
  
  // Staff specific
  skills?: string[];
  availability_schedule?: Record<string, any>;
  hourly_rate?: number;
  
  // Room specific
  equipment_ids?: string[];
  amenities?: Record<string, any>;
  
  // Common
  specifications?: Record<string, any>;
  usage_instructions?: string;
  safety_requirements?: Record<string, any>;
  cost_per_hour?: number;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  appointment_id?: string;
  allocated_by: string;
  start_time: string;
  end_time: string;
  status: AllocationStatus;
  allocation_type: AllocationType;
  notes?: string;
  preparation_time: number;
  cleanup_time: number;
  hourly_rate?: number;
  total_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceConflict {
  id: string;
  resource_id: string;
  conflict_type: string;
  severity: ConflictSeverity;
  primary_allocation_id?: string;
  conflicting_allocation_id?: string;
  description: string;
  status: string;
  resolution_strategy?: string;
  resolution_details?: Record<string, any>;
  resolved_at?: string;
  resolved_by?: string;
  affected_appointments?: string[];
  impact_score: number;
  revenue_impact: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AllocationRequest {
  resource_id: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  allocation_type: AllocationType;
  notes?: string;
  preparation_time?: number;
  cleanup_time?: number;
}

export interface ConflictResolution {
  strategy: string;
  alternative_resources?: string[];
  suggested_times?: { start_time: string; end_time: string }[];
  impact_assessment: {
    severity: ConflictSeverity;
    affected_appointments: string[];
    revenue_impact: number;
  };
}

// =====================================================
// Resource Manager Service
// =====================================================

export class ResourceManager {
  private supabase: any;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // =====================================================
  // Resource Management
  // =====================================================

  async createResource(resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .insert([resourceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  async getResources(clinicId: string, filters?: {
    type?: ResourceType;
    status?: ResourceStatus;
    category?: string;
  }): Promise<Resource[]> {
    try {
      let query = this.supabase
        .from('resources')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  async getResourceById(resourceId: string): Promise<Resource | null> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      return null;
    }
  }

  async updateResource(resourceId: string, updates: Partial<Resource>): Promise<Resource> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', resourceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw new Error('Failed to update resource');
    }
  }

  async updateResourceStatus(resourceId: string, status: ResourceStatus): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('resources')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', resourceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating resource status:', error);
      throw new Error('Failed to update resource status');
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw new Error('Failed to delete resource');
    }
  }

  // =====================================================
  // Resource Allocation Management
  // =====================================================

  async createAllocation(allocationData: AllocationRequest, userId: string): Promise<ResourceAllocation> {
    try {
      // Check for conflicts first
      const conflicts = await this.detectConflicts(
        allocationData.resource_id,
        allocationData.start_time,
        allocationData.end_time
      );

      if (conflicts.length > 0) {
        throw new Error(`Resource conflict detected. ${conflicts.length} overlapping allocations found.`);
      }

      const { data, error } = await this.supabase
        .from('resource_allocations')
        .insert([{
          ...allocationData,
          allocated_by: userId,
          status: 'pending',
          preparation_time: allocationData.preparation_time || 0,
          cleanup_time: allocationData.cleanup_time || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating allocation:', error);
      throw error;
    }
  }

  async getAllocations(resourceId: string, startDate?: string, endDate?: string): Promise<ResourceAllocation[]> {
    try {
      let query = this.supabase
        .from('resource_allocations')
        .select('*')
        .eq('resource_id', resourceId)
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('end_time', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching allocations:', error);
      throw new Error('Failed to fetch allocations');
    }
  }

  async updateAllocationStatus(allocationId: string, status: AllocationStatus): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('resource_allocations')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', allocationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating allocation status:', error);
      throw new Error('Failed to update allocation status');
    }
  }

  async cancelAllocation(allocationId: string): Promise<void> {
    try {
      await this.updateAllocationStatus(allocationId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling allocation:', error);
      throw new Error('Failed to cancel allocation');
    }
  }

  // =====================================================
  // Conflict Detection and Resolution
  // =====================================================

  async detectConflicts(
    resourceId: string,
    startTime: string,
    endTime: string,
    excludeAllocationId?: string
  ): Promise<ResourceAllocation[]> {
    try {
      let query = this.supabase
        .from('resource_allocations')
        .select('*')
        .eq('resource_id', resourceId)
        .neq('status', 'cancelled')
        .neq('status', 'completed')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

      if (excludeAllocationId) {
        query = query.neq('id', excludeAllocationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      throw new Error('Failed to detect conflicts');
    }
  }

  async createConflict(conflictData: {
    resource_id: string;
    conflict_type: string;
    severity: ConflictSeverity;
    description: string;
    primary_allocation_id?: string;
    conflicting_allocation_id?: string;
    impact_score?: number;
    revenue_impact?: number;
  }, userId: string): Promise<ResourceConflict> {
    try {
      const { data, error } = await this.supabase
        .from('resource_conflicts')
        .insert([{
          ...conflictData,
          created_by: userId,
          status: 'pending',
          impact_score: conflictData.impact_score || 1,
          revenue_impact: conflictData.revenue_impact || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conflict:', error);
      throw new Error('Failed to create conflict record');
    }
  }

  async resolveConflict(
    conflictId: string,
    resolution: {
      strategy: string;
      details?: Record<string, any>;
    },
    userId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('resource_conflicts')
        .update({
          status: 'resolved',
          resolution_strategy: resolution.strategy,
          resolution_details: resolution.details,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conflictId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw new Error('Failed to resolve conflict');
    }
  }

  // =====================================================
  // Resource Availability and Optimization
  // =====================================================

  async getAvailableResources(
    clinicId: string,
    startTime: string,
    endTime: string,
    resourceType?: ResourceType,
    requirements?: Record<string, any>
  ): Promise<Resource[]> {
    try {
      // Get all resources of the specified type
      const resources = await this.getResources(clinicId, { 
        type: resourceType,
        status: 'available' 
      });

      // Filter out resources that have conflicting allocations
      const availableResources: Resource[] = [];
      
      for (const resource of resources) {
        const conflicts = await this.detectConflicts(resource.id, startTime, endTime);
        if (conflicts.length === 0) {
          // Check if resource meets requirements
          if (!requirements || this.meetsRequirements(resource, requirements)) {
            availableResources.push(resource);
          }
        }
      }

      return availableResources;
    } catch (error) {
      console.error('Error finding available resources:', error);
      throw new Error('Failed to find available resources');
    }
  }

  private meetsRequirements(resource: Resource, requirements: Record<string, any>): boolean {
    // Simple requirement matching - can be extended based on needs
    if (requirements.category && resource.category !== requirements.category) {
      return false;
    }
    if (requirements.capacity && resource.capacity < requirements.capacity) {
      return false;
    }
    if (requirements.skills && resource.type === 'staff') {
      const resourceSkills = resource.skills || [];
      const requiredSkills = requirements.skills as string[];
      if (!requiredSkills.every(skill => resourceSkills.includes(skill))) {
        return false;
      }
    }
    return true;
  }

  async suggestAlternativeResources(
    originalResourceId: string,
    startTime: string,
    endTime: string,
    requirements?: Record<string, any>
  ): Promise<Resource[]> {
    try {
      // Get the original resource to understand its type and clinic
      const originalResource = await this.getResourceById(originalResourceId);
      if (!originalResource) {
        throw new Error('Original resource not found');
      }

      // Find available alternatives of the same type
      const alternatives = await this.getAvailableResources(
        originalResource.clinic_id,
        startTime,
        endTime,
        originalResource.type,
        requirements
      );

      // Filter out the original resource
      return alternatives.filter(resource => resource.id !== originalResourceId);
    } catch (error) {
      console.error('Error suggesting alternatives:', error);
      throw new Error('Failed to suggest alternative resources');
    }
  }

  async optimizeResourceAllocation(
    clinicId: string,
    date: string
  ): Promise<{
    recommendations: Array<{
      resource_id: string;
      current_utilization: number;
      recommended_actions: string[];
      potential_savings: number;
    }>;
    overall_efficiency: number;
  }> {
    try {
      const resources = await this.getResources(clinicId);
      const recommendations = [];
      let totalUtilization = 0;

      for (const resource of resources) {
        const allocations = await this.getAllocations(
          resource.id,
          `${date}T00:00:00Z`,
          `${date}T23:59:59Z`
        );

        // Calculate utilization
        const totalMinutes = 8 * 60; // 8 hour work day
        const allocatedMinutes = allocations.reduce((sum, allocation) => {
          const start = new Date(allocation.start_time);
          const end = new Date(allocation.end_time);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);

        const utilization = (allocatedMinutes / totalMinutes) * 100;
        totalUtilization += utilization;

        // Generate recommendations
        const actions: string[] = [];
        let potentialSavings = 0;

        if (utilization < 50) {
          actions.push('Consider reducing operating hours or finding additional bookings');
          potentialSavings += (resource.cost_per_hour || 0) * 2;
        } else if (utilization > 90) {
          actions.push('Consider adding additional resources or extending hours');
        }

        if (resource.type === 'equipment' && resource.next_maintenance) {
          const maintenanceDate = new Date(resource.next_maintenance);
          const today = new Date(date);
          const daysUntilMaintenance = Math.ceil(
            (maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilMaintenance <= 7) {
            actions.push('Schedule maintenance soon to prevent downtime');
          }
        }

        recommendations.push({
          resource_id: resource.id,
          current_utilization: Math.round(utilization),
          recommended_actions: actions,
          potential_savings: potentialSavings
        });
      }

      return {
        recommendations,
        overall_efficiency: Math.round(totalUtilization / resources.length)
      };
    } catch (error) {
      console.error('Error optimizing resource allocation:', error);
      throw new Error('Failed to optimize resource allocation');
    }
  }

  // =====================================================
  // Analytics and Reporting
  // =====================================================

  async getResourceUtilization(
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    date: string;
    utilization_percentage: number;
    total_revenue: number;
    appointment_count: number;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('resource_analytics')
        .select('date, utilization_percentage, revenue_generated, appointment_count')
        .eq('resource_id', resourceId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data?.map(item => ({
        date: item.date,
        utilization_percentage: item.utilization_percentage,
        total_revenue: item.revenue_generated,
        appointment_count: item.appointment_count
      })) || [];
    } catch (error) {
      console.error('Error fetching utilization data:', error);
      throw new Error('Failed to fetch utilization data');
    }
  }

  async getConflictHistory(
    resourceId: string,
    limit: number = 50
  ): Promise<ResourceConflict[]> {
    try {
      const { data, error } = await this.supabase
        .from('resource_conflicts')
        .select('*')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conflict history:', error);
      throw new Error('Failed to fetch conflict history');
    }
  }
}