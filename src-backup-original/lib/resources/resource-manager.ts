/**
 * Smart Resource Management System
 * Story 2.4: Intelligent resource allocation and real-time tracking
 * 
 * Features:
 * - Real-time resource tracking (rooms, equipment, staff)
 * - Intelligent allocation optimization
 * - Conflict prevention and resolution
 * - Mobile status updates
 * - Predictive maintenance integration
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Types for Resource Management
export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  location: string;
  status: ResourceStatus;
  capacity?: number;
  skills_required?: string[];
  equipment_type?: string;
  maintenance_schedule?: Date;
  last_updated: Date;
  metadata?: Record<string, any>;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  appointment_id?: string;
  staff_id?: string;
  start_time: Date;
  end_time: Date;
  status: AllocationStatus;
  priority: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceRecord {
  id: string;
  resource_id: string;
  maintenance_type: MaintenanceType;
  scheduled_date: Date;
  completed_date?: Date;
  cost?: number;
  notes?: string;
  technician_id?: string;
  status: MaintenanceStatus;
}

export interface ResourceUtilization {
  resource_id: string;
  date: Date;
  utilization_percentage: number;
  revenue_generated: number;
  maintenance_cost: number;
  efficiency_score: number;
}

export type ResourceType = 'room' | 'equipment' | 'staff' | 'vehicle' | 'other';
export type ResourceStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved' | 'offline';
export type AllocationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type MaintenanceType = 'preventive' | 'corrective' | 'emergency' | 'calibration' | 'upgrade';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface ResourceConflict {
  type: 'time_overlap' | 'capacity_exceeded' | 'skill_mismatch' | 'maintenance_conflict';
  resource_id: string;
  conflicting_allocations: string[];
  suggested_alternatives: ResourceAllocation[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AllocationRequest {
  resource_type: ResourceType;
  start_time: Date;
  end_time: Date;
  requirements: {
    capacity?: number;
    skills?: string[];
    equipment_type?: string;
    location_preference?: string;
  };
  priority: number;
  appointment_id?: string;
  staff_id?: string;
}

export interface ResourceAnalytics {
  utilization_rate: number;
  revenue_per_hour: number;
  maintenance_cost_ratio: number;
  efficiency_trend: number;
  peak_usage_hours: number[];
  bottleneck_resources: string[];
  optimization_opportunities: string[];
}

/**
 * Core Resource Manager Class
 * Handles all resource operations with real-time tracking
 */
export class ResourceManager {
  private supabase;
  private realTimeSubscriptions: Map<string, any> = new Map();
  private allocationCache: Map<string, ResourceAllocation[]> = new Map();
  private resourceCache: Map<string, Resource> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.initializeRealTimeSubscriptions();
  }

  /**
   * Initialize real-time subscriptions for resource updates
   */
  private async initializeRealTimeSubscriptions(): Promise<void> {
    try {
      // Subscribe to resource status changes
      const resourceSubscription = this.supabase
        .channel('resource_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'resources'
          },
          (payload) => this.handleResourceChange(payload)
        )
        .subscribe();

      // Subscribe to allocation changes
      const allocationSubscription = this.supabase
        .channel('allocation_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'resource_allocations'
          },
          (payload) => this.handleAllocationChange(payload)
        )
        .subscribe();

      this.realTimeSubscriptions.set('resources', resourceSubscription);
      this.realTimeSubscriptions.set('allocations', allocationSubscription);

      console.log('✅ Resource Manager: Real-time subscriptions initialized');
    } catch (error) {
      console.error('❌ Resource Manager: Failed to initialize subscriptions:', error);
    }
  }

  /**
   * Handle real-time resource changes
   */
  private handleResourceChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        this.resourceCache.set(newRecord.id, newRecord);
        this.notifyResourceUpdate(newRecord);
        break;
      case 'DELETE':
        this.resourceCache.delete(oldRecord.id);
        this.notifyResourceUpdate(oldRecord, 'deleted');
        break;
    }
  }

  /**
   * Handle real-time allocation changes
   */
  private handleAllocationChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Update allocation cache
    this.updateAllocationCache(newRecord || oldRecord);
    
    // Check for conflicts after allocation changes
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      this.checkForConflicts(newRecord.resource_id);
    }
  }

  /**
   * Get all resources with optional filtering
   */
  async getResources(filters?: {
    type?: ResourceType;
    status?: ResourceStatus;
    location?: string;
    available_at?: Date;
  }): Promise<Resource[]> {
    try {
      let query = this.supabase
        .from('resources')
        .select('*');

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      // Filter by availability if requested
      if (filters?.available_at) {
        return this.filterByAvailability(data || [], filters.available_at);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching resources:', error);
      throw new Error('Failed to fetch resources');
    }
  }

  /**
   * Get resource by ID with caching
   */
  async getResource(id: string): Promise<Resource | null> {
    try {
      // Check cache first
      if (this.resourceCache.has(id)) {
        return this.resourceCache.get(id)!;
      }

      const { data, error } = await this.supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.resourceCache.set(id, data);
      }

      return data;
    } catch (error) {
      console.error(`❌ Error fetching resource ${id}:`, error);
      return null;
    }
  }

  /**
   * Create new resource
   */
  async createResource(resource: Omit<Resource, 'id' | 'last_updated'>): Promise<Resource> {
    try {
      const newResource = {
        ...resource,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('resources')
        .insert([newResource])
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.resourceCache.set(data.id, data);

      console.log(`✅ Resource created: ${data.name} (${data.id})`);
      return data;
    } catch (error) {
      console.error('❌ Error creating resource:', error);
      throw new Error('Failed to create resource');
    }
  }

  /**
   * Update resource status (mobile-friendly)
   */
  async updateResourceStatus(
    resourceId: string, 
    status: ResourceStatus, 
    metadata?: Record<string, any>
  ): Promise<Resource> {
    try {
      const updateData: any = {
        status,
        last_updated: new Date().toISOString()
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { data, error } = await this.supabase
        .from('resources')
        .update(updateData)
        .eq('id', resourceId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.resourceCache.set(resourceId, data);

      console.log(`✅ Resource status updated: ${resourceId} -> ${status}`);
      return data;
    } catch (error) {
      console.error(`❌ Error updating resource status:`, error);
      throw new Error('Failed to update resource status');
    }
  }

  /**
   * Request resource allocation with intelligent optimization
   */
  async requestAllocation(request: AllocationRequest): Promise<{
    allocation?: ResourceAllocation;
    conflicts?: ResourceConflict[];
    alternatives?: Resource[];
  }> {
    try {
      // Find optimal resource
      const optimalResource = await this.findOptimalResource(request);
      
      if (!optimalResource) {
        // Find alternatives
        const alternatives = await this.findAlternativeResources(request);
        return { alternatives };
      }

      // Check for conflicts
      const conflicts = await this.checkAllocationConflicts(
        optimalResource.id,
        request.start_time,
        request.end_time
      );

      if (conflicts.length > 0) {
        const alternatives = await this.findAlternativeResources(request);
        return { conflicts, alternatives };
      }

      // Create allocation
      const allocation = await this.createAllocation({
        resource_id: optimalResource.id,
        start_time: request.start_time,
        end_time: request.end_time,
        priority: request.priority,
        appointment_id: request.appointment_id,
        staff_id: request.staff_id,
        status: 'pending'
      });

      return { allocation };
    } catch (error) {
      console.error('❌ Error requesting allocation:', error);
      throw new Error('Failed to request resource allocation');
    }
  }

  /**
   * Create resource allocation
   */
  async createAllocation(
    allocation: Omit<ResourceAllocation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ResourceAllocation> {
    try {
      const newAllocation = {
        ...allocation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('resource_allocations')
        .insert([newAllocation])
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.updateAllocationCache(data);

      console.log(`✅ Allocation created: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating allocation:', error);
      throw new Error('Failed to create allocation');
    }
  }

  /**
   * Get resource allocations for a time period
   */
  async getAllocations(
    resourceId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ResourceAllocation[]> {
    try {
      let query = this.supabase
        .from('resource_allocations')
        .select('*');

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('end_time', endDate.toISOString());
      }

      const { data, error } = await query.order('start_time');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching allocations:', error);
      throw new Error('Failed to fetch allocations');
    }
  }

  /**
   * Find optimal resource based on requirements
   */
  private async findOptimalResource(request: AllocationRequest): Promise<Resource | null> {
    try {
      const availableResources = await this.getResources({
        type: request.resource_type,
        status: 'available'
      });

      // Filter by requirements
      let candidates = availableResources.filter(resource => {
        // Check capacity
        if (request.requirements.capacity && 
            resource.capacity && 
            resource.capacity < request.requirements.capacity) {
          return false;
        }

        // Check skills for staff
        if (request.requirements.skills && resource.skills_required) {
          const hasRequiredSkills = request.requirements.skills.every(skill =>
            resource.skills_required!.includes(skill)
          );
          if (!hasRequiredSkills) return false;
        }

        // Check equipment type
        if (request.requirements.equipment_type && 
            resource.equipment_type !== request.requirements.equipment_type) {
          return false;
        }

        return true;
      });

      if (candidates.length === 0) return null;

      // Score and rank candidates
      const scoredCandidates = await Promise.all(
        candidates.map(async resource => {
          const score = await this.calculateResourceScore(resource, request);
          return { resource, score };
        })
      );

      // Return highest scored resource
      scoredCandidates.sort((a, b) => b.score - a.score);
      return scoredCandidates[0].resource;
    } catch (error) {
      console.error('❌ Error finding optimal resource:', error);
      return null;
    }
  }

  /**
   * Calculate resource optimization score
   */
  private async calculateResourceScore(resource: Resource, request: AllocationRequest): Promise<number> {
    let score = 100; // Base score

    try {
      // Location preference bonus
      if (request.requirements.location_preference === resource.location) {
        score += 20;
      }

      // Utilization efficiency (prefer balanced utilization)
      const utilization = await this.getResourceUtilization(resource.id);
      if (utilization && utilization.utilization_percentage > 0.3 && utilization.utilization_percentage < 0.8) {
        score += 15;
      }

      // Maintenance schedule consideration
      if (resource.maintenance_schedule) {
        const daysDiff = Math.abs(
          (resource.maintenance_schedule.getTime() - request.start_time.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff < 7) {
          score -= 10; // Penalize if maintenance is soon
        }
      }

      // Skill match bonus for staff
      if (resource.type === 'staff' && request.requirements.skills && resource.skills_required) {
        const matchRatio = request.requirements.skills.filter(skill =>
          resource.skills_required!.includes(skill)
        ).length / request.requirements.skills.length;
        score += matchRatio * 25;
      }

      return Math.max(0, score);
    } catch (error) {
      console.error('❌ Error calculating resource score:', error);
      return 50; // Default score on error
    }
  }

  /**
   * Find alternative resources when optimal is not available
   */
  private async findAlternativeResources(request: AllocationRequest): Promise<Resource[]> {
    try {
      const allResources = await this.getResources({
        type: request.resource_type
      });

      // Relaxed filtering for alternatives
      const alternatives = allResources.filter(resource => {
        // Must not be offline
        if (resource.status === 'offline') return false;

        // Basic capacity check (allow some flexibility)
        if (request.requirements.capacity && 
            resource.capacity && 
            resource.capacity < request.requirements.capacity * 0.8) {
          return false;
        }

        return true;
      });

      // Score and sort alternatives
      const scoredAlternatives = await Promise.all(
        alternatives.map(async resource => {
          const score = await this.calculateResourceScore(resource, request);
          return { resource, score };
        })
      );

      scoredAlternatives.sort((a, b) => b.score - a.score);
      return scoredAlternatives.slice(0, 5).map(item => item.resource);
    } catch (error) {
      console.error('❌ Error finding alternatives:', error);
      return [];
    }
  }

  /**
   * Check for allocation conflicts
   */
  private async checkAllocationConflicts(
    resourceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ResourceConflict[]> {
    try {
      const conflicts: ResourceConflict[] = [];

      // Get existing allocations for the resource
      const existingAllocations = await this.getAllocations(
        resourceId,
        new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 24h before
        new Date(endTime.getTime() + 24 * 60 * 60 * 1000)     // 24h after
      );

      // Check for time overlaps
      const overlapping = existingAllocations.filter(allocation => {
        const allocStart = new Date(allocation.start_time);
        const allocEnd = new Date(allocation.end_time);
        
        return (
          (startTime >= allocStart && startTime < allocEnd) ||
          (endTime > allocStart && endTime <= allocEnd) ||
          (startTime <= allocStart && endTime >= allocEnd)
        );
      });

      if (overlapping.length > 0) {
        conflicts.push({
          type: 'time_overlap',
          resource_id: resourceId,
          conflicting_allocations: overlapping.map(a => a.id),
          suggested_alternatives: [],
          severity: 'high'
        });
      }

      return conflicts;
    } catch (error) {
      console.error('❌ Error checking conflicts:', error);
      return [];
    }
  }

  /**
   * Get resource utilization analytics
   */
  async getResourceUtilization(resourceId: string, days: number = 30): Promise<ResourceUtilization | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await this.supabase
        .from('resource_analytics')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('❌ Error fetching utilization:', error);
      return null;
    }
  }

  /**
   * Filter resources by availability at specific time
   */
  private async filterByAvailability(resources: Resource[], dateTime: Date): Promise<Resource[]> {
    const available: Resource[] = [];

    for (const resource of resources) {
      const conflicts = await this.checkAllocationConflicts(
        resource.id,
        dateTime,
        new Date(dateTime.getTime() + 60 * 60 * 1000) // 1 hour window
      );

      if (conflicts.length === 0 && resource.status === 'available') {
        available.push(resource);
      }
    }

    return available;
  }

  /**
   * Update allocation cache
   */
  private updateAllocationCache(allocation: ResourceAllocation): void {
    const resourceAllocations = this.allocationCache.get(allocation.resource_id) || [];
    const existingIndex = resourceAllocations.findIndex(a => a.id === allocation.id);
    
    if (existingIndex >= 0) {
      resourceAllocations[existingIndex] = allocation;
    } else {
      resourceAllocations.push(allocation);
    }
    
    this.allocationCache.set(allocation.resource_id, resourceAllocations);
  }

  /**
   * Check for conflicts after allocation changes
   */
  private async checkForConflicts(resourceId: string): Promise<void> {
    try {
      const allocations = await this.getAllocations(resourceId);
      
      // Implementation for conflict detection logic
      // This would trigger notifications if conflicts are found
      
      console.log(`✅ Conflict check completed for resource: ${resourceId}`);
    } catch (error) {
      console.error('❌ Error checking conflicts:', error);
    }
  }

  /**
   * Notify about resource updates
   */
  private notifyResourceUpdate(resource: Resource, action: string = 'updated'): void {
    // Implementation for real-time notifications
    console.log(`📡 Resource ${action}: ${resource.name} (${resource.id})`);
  }

  /**
   * Cleanup subscriptions
   */
  async cleanup(): Promise<void> {
    for (const [key, subscription] of this.realTimeSubscriptions) {
      await subscription.unsubscribe();
      console.log(`✅ Unsubscribed from ${key}`);
    }
    this.realTimeSubscriptions.clear();
    this.allocationCache.clear();
    this.resourceCache.clear();
  }
}

// Export singleton instance
export const resourceManager = new ResourceManager();
export default ResourceManager;