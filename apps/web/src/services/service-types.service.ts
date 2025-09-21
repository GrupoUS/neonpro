/**
 * Service Types Service - Database operations for service management
 * Handles aesthetic clinic services and procedures
 */

import { supabase } from '@/integrations/supabase/client';

// type ServiceTypeRow = Database['public']['Tables']['service_types']['Row'];

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  color?: string;
  isActive: boolean;
}

class ServiceTypeService {
  /**
   * Get all active service types for a clinic
   */
  async getServiceTypes(clinicId?: string): Promise<ServiceType[]> {
    try {
      let query = supabase
        .from('service_types')
        .select(
          `
          id,
          name,
          description,
          duration_minutes,
          price,
          color,
          is_active
        `,
        )
        .eq('is_active', true)
        .order('name');

      // If clinic-specific services exist, filter by clinic
      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching service types:', error);
        throw new Error(`Failed to fetch service types: ${error.message}`);
      }

      return (data || []).map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || undefined,
        durationMinutes: service.duration_minutes || 60,
        price: service.price || 0,
        category: undefined, // No category column in current schema
        color: service.color || '#3b82f6',
        isActive: service.is_active || false,
      }));
    } catch (_error) {
      console.error('Error in getServiceTypes:', error);
      throw error;
    }
  }

  /**
   * Search service types by name or category
   */
  async searchServiceTypes(
    _query: string,
    clinicId?: string,
    limit = 10,
  ): Promise<ServiceType[]> {
    try {
      let dbQuery = supabase
        .from('service_types')
        .select(
          `
          id,
          name,
          description,
          duration_minutes,
          price,
          color,
          is_active
        `,
        )
        .eq('is_active', true)
        .or(`name.ilike.%${query}%`)
        .limit(limit)
        .order('name');

      if (clinicId) {
        dbQuery = dbQuery.eq('clinic_id', clinicId);
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Error searching service types:', error);
        throw new Error(`Failed to search service types: ${error.message}`);
      }

      return (data || []).map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || undefined,
        durationMinutes: service.duration_minutes || 60,
        price: service.price || 0,
        category: undefined, // No category column in current schema
        color: service.color || '#3b82f6',
        isActive: service.is_active || false,
      }));
    } catch (_error) {
      console.error('Error in searchServiceTypes:', error);
      throw error;
    }
  }

  /**
   * Get service type by ID
   */
  async getServiceType(serviceTypeId: string): Promise<ServiceType | null> {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select(
          `
          id,
          name,
          description,
          duration_minutes,
          price,
          color,
          is_active
        `,
        )
        .eq('id', serviceTypeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Service type not found
        }
        console.error('Error getting service type:', error);
        throw new Error(`Failed to get service type: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        durationMinutes: data.duration_minutes || 60,
        price: data.price || 0,
        category: undefined, // No category column in current schema
        color: data.color || '#3b82f6',
        isActive: data.is_active || false,
      };
    } catch (_error) {
      console.error('Error in getServiceType:', error);
      throw error;
    }
  }

  /**
   * Get service types by category
   * Note: Current schema doesn't have category column, returning empty array
   */
  async getServiceTypesByCategory(
    _category: string,
    _clinicId?: string,
  ): Promise<ServiceType[]> {
    try {
      // Since there's no category column in the current schema,
      // we'll return an empty array for now
      return [];
    } catch (_error) {
      console.error('Error in getServiceTypesByCategory:', error);
      throw error;
    }
  }

  /**
   * Get available service categories
   * Note: Current schema doesn't have category column, returning empty array
   */
  async getServiceCategories(_clinicId?: string): Promise<string[]> {
    try {
      // Since there's no category column in the current schema,
      // we'll return an empty array for now
      return [];
    } catch (_error) {
      console.error('Error in getServiceCategories:', error);
      throw error;
    }
  }
}

export const _serviceTypeService = new ServiceTypeService();
