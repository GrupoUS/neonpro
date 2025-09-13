/**
 * Service Categories Service
 * Handles CRUD operations for service categories
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CreateServiceCategoryRequest,
  ServiceCategory,
  ServiceCategoryFilters,
  ServiceCategoryWithServices,
  UpdateServiceCategoryRequest,
} from '@/types/service-categories';
import { DEFAULT_SERVICE_CATEGORIES } from '@/types/service-categories';

class ServiceCategoriesService {
  /**
   * Get all service categories with optional filtering
   */
  async getServiceCategories(filters?: ServiceCategoryFilters): Promise<ServiceCategory[]> {
    try {
      let query = supabase
        .from('service_categories' as any)
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at,
          clinics!fk_service_categories_clinic (
            id,
            clinic_name
          )
        `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = (await query) as { data: any[] | null; error: any | null };

      if (error) {
        console.error('Error fetching service categories:', error);
        throw new Error(`Failed to fetch service categories: ${error.message}`);
      }

      return (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color || '#3b82f6',
        icon: category.icon,
        sort_order: category.sort_order || 0,
        is_active: category.is_active || false,
        clinic_id: category.clinic_id,
        created_at: category.created_at,
        updated_at: category.updated_at,
        clinic: category.clinics
          ? {
            id: category.clinics.id,
            clinic_name: category.clinics.clinic_name,
          }
          : undefined,
      }));
    } catch (error) {
      console.error('Error in getServiceCategories:', error);
      throw error;
    }
  }

  /**
   * Get service category by ID
   */
  async getServiceCategory(categoryId: string): Promise<ServiceCategory | null> {
    try {
      const singleResult: any = await supabase
        .from('service_categories' as any)
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at,
          clinics!fk_service_categories_clinic (
            id,
            clinic_name
          )
        `)
        .eq('id', categoryId)
        .single();
      const { data, error } = singleResult;

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Category not found
        }
        console.error('Error getting service category:', error);
        throw new Error(`Failed to get service category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color || '#3b82f6',
        icon: data.icon,
        sort_order: data.sort_order || 0,
        is_active: data.is_active || false,
        clinic_id: data.clinic_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        clinic: data.clinics
          ? {
            id: data.clinics.id,
            clinic_name: data.clinics.clinic_name,
          }
          : undefined,
      };
    } catch (error) {
      console.error('Error in getServiceCategory:', error);
      throw error;
    }
  }

  /**
   * Create a new service category
   */
  async createServiceCategory(
    categoryData: CreateServiceCategoryRequest,
  ): Promise<ServiceCategory> {
    try {
      const insertResult: any = await supabase
        .from('service_categories' as any)
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          color: categoryData.color || '#3b82f6',
          icon: categoryData.icon || null,
          sort_order: categoryData.sort_order || 0,
          is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
          clinic_id: categoryData.clinic_id,
        })
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at
        `)
        .single();
      const { data, error } = insertResult;

      if (error) {
        console.error('Error creating service category:', error);
        throw new Error(`Failed to create service category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color || '#3b82f6',
        icon: data.icon,
        sort_order: data.sort_order || 0,
        is_active: data.is_active || false,
        clinic_id: data.clinic_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in createServiceCategory:', error);
      throw error;
    }
  }

  /**
   * Update an existing service category
   */
  async updateServiceCategory(
    categoryData: UpdateServiceCategoryRequest,
  ): Promise<ServiceCategory> {
    try {
      const updateData: any = {};

      if (categoryData.name !== undefined) updateData.name = categoryData.name;
      if (categoryData.description !== undefined) updateData.description = categoryData.description;
      if (categoryData.color !== undefined) updateData.color = categoryData.color;
      if (categoryData.icon !== undefined) updateData.icon = categoryData.icon;
      if (categoryData.sort_order !== undefined) updateData.sort_order = categoryData.sort_order;
      if (categoryData.is_active !== undefined) updateData.is_active = categoryData.is_active;

      const updateResult: any = await supabase
        .from('service_categories' as any)
        .update(updateData)
        .eq('id', categoryData.id)
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at
        `)
        .single();
      const { data, error } = updateResult;

      if (error) {
        console.error('Error updating service category:', error);
        throw new Error(`Failed to update service category: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color || '#3b82f6',
        icon: data.icon,
        sort_order: data.sort_order || 0,
        is_active: data.is_active || false,
        clinic_id: data.clinic_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in updateServiceCategory:', error);
      throw error;
    }
  }

  /**
   * Delete a service category
   */
  async deleteServiceCategory(categoryId: string): Promise<void> {
    try {
      // First check if category has services
      const { data: services, error: servicesError } = await supabase
        .from('service_types' as any)
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (servicesError) {
        console.error('Error checking category services:', servicesError);
        throw new Error(`Failed to check category services: ${servicesError.message}`);
      }

      if (services && services.length > 0) {
        throw new Error(
          'Cannot delete category that has services. Please move or delete services first.',
        );
      }

      const { error } = await supabase
        .from('service_categories' as any)
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting service category:', error);
        throw new Error(`Failed to delete service category: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteServiceCategory:', error);
      throw error;
    }
  }

  /**
   * Get service categories with their services
   */
  async getServiceCategoriesWithServices(clinicId: string): Promise<ServiceCategoryWithServices[]> {
    try {
      const { data, error } = (await supabase
        .from('service_categories' as any)
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at,
          service_types!fk_service_types_category (
            id,
            name,
            price,
            duration_minutes,
            is_active
          )
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })) as { data: any[] | null; error: any | null };

      if (error) {
        console.error('Error fetching categories with services:', error);
        throw new Error(`Failed to fetch categories with services: ${error.message}`);
      }

      return (data || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color || '#3b82f6',
        icon: category.icon,
        sort_order: category.sort_order || 0,
        is_active: category.is_active || false,
        clinic_id: category.clinic_id,
        created_at: category.created_at,
        updated_at: category.updated_at,
        services: (category.service_types || []).map((service: any) => ({
          id: service.id,
          name: service.name,
          price: service.price || 0,
          duration_minutes: service.duration_minutes || 60,
          is_active: service.is_active || false,
        })),
      }));
    } catch (error) {
      console.error('Error in getServiceCategoriesWithServices:', error);
      throw error;
    }
  }

  /**
   * Initialize default categories for a new clinic
   */
  async initializeDefaultCategories(clinicId: string): Promise<ServiceCategory[]> {
    try {
      const categoriesData = (DEFAULT_SERVICE_CATEGORIES as any[]).map((category: any) => ({
        ...category,
        clinic_id: clinicId,
      }));

      const { data, error } = await supabase
        .from('service_categories' as any)
        .insert(categoriesData)
        .select(`
          id,
          name,
          description,
          color,
          icon,
          sort_order,
          is_active,
          clinic_id,
          created_at,
          updated_at
        `);

      if (error) {
        console.error('Error initializing default categories:', error);
        throw new Error(`Failed to initialize default categories: ${error.message}`);
      }

      return (data as any[] | null || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color || '#3b82f6',
        icon: category.icon,
        sort_order: category.sort_order || 0,
        is_active: category.is_active || false,
        clinic_id: category.clinic_id,
        created_at: category.created_at,
        updated_at: category.updated_at,
      }));
    } catch (error) {
      console.error('Error in initializeDefaultCategories:', error);
      throw error;
    }
  }
}

export const serviceCategoriesService = new ServiceCategoriesService();
