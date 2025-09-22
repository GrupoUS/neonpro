/**
 * Service Templates Service
 * Handles CRUD operations for service templates and packages
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CreateServiceTemplateItemRequest,
  CreateServiceTemplateRequest,
  DuplicateServiceTemplateRequest,
  ServiceTemplate,
  ServiceTemplateFilters,
  ServiceTemplateStats,
  ServiceTemplateWithItems,
  UpdateServiceTemplateItemRequest,
  UpdateServiceTemplateRequest,
} from '@/types/service-templates';

class ServiceTemplatesService {
  // Use an any-typed supabase client to avoid strict generated overloads during migration
  private sb: any = supabase;
  /**
   * Get all service templates with optional filtering
   */
  async getServiceTemplates(
    filters: ServiceTemplateFilters = {},
  ): Promise<ServiceTemplate[]> {
    let query = this.sb.from('service_templates').select('*');

    // Apply filters
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.template_type) {
      query = query.eq('template_type', filters.template_type);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch service templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get service templates with items and calculated prices
   */
  async getServiceTemplatesWithItems(
    clinicId: string,
  ): Promise<ServiceTemplateWithItems[]> {
    const { data, error } = await this.sb.rpc(
      'get_service_templates_with_items',
      { p_clinic_id: clinicId },
    );

    if (error) {
      throw new Error(
        `Failed to fetch service templates with items: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Get a single service template by ID
   */
  async getServiceTemplate(id: string): Promise<ServiceTemplate | null> {
    const { data, error } = await this.sb
      .from('service_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch service template: ${error.message}`);
    }

    return data as any;
  }

  /**
   * Get a service template with its items
   */
  async getServiceTemplateWithItems(
    id: string,
  ): Promise<ServiceTemplateWithItems | null> {
    const template = await this.getServiceTemplate(id);
    if (!template) return null;

    // Get template items
    const { data: items, error: itemsError } = await this.sb
      .from('service_template_items')
      .select(
        `
        *,
        service_types!inner(name, price)
      `,
      )
      .eq('template_id', id)
      .order('sequence_order');

    if (itemsError) {
      throw new Error(`Failed to fetch template items: ${itemsError.message}`);
    }

    // Transform the data to match our interface
    const transformedItems: Array<{ total_price: number } & any> = (
      items || []
    ).map((item: any) => ({
      id: item.id,
      template_id: item.template_id,
      service_id: item.service_id,
      service_name: item.service_types.name,
      service_price: item.service_types.price,
      quantity: item.quantity,
      sequence_order: item.sequence_order,
      is_required: item.is_required,
      discount_percentage: item.discount_percentage,
      notes: item.notes,
      total_price: item.service_types.price
        * item.quantity
        * (1 - (item.discount_percentage || 0) / 100),
      created_at: item.created_at,
    }));

    return {
      ...template,
      category_name: null, // Would need to join with categories
      category_color: null,
      calculated_price: transformedItems.reduce(
        (sum: number, item: { total_price: number }) => sum + item.total_price,
        0 as number,
      ),
      items: transformedItems,
    };
  }

  /**
   * Create a new service template
   */
  async createServiceTemplate(
    _request: CreateServiceTemplateRequest,
  ): Promise<ServiceTemplate> {
    const { data, error } = await this.sb
      .from('service_templates')
      .insert({
        name: request.name,
        description: request.description || null,
        template_type: request.template_type,
        category_id: request.category_id || null,
        clinic_id: request.clinic_id,
        default_duration_minutes: request.default_duration_minutes || 60,
        default_price: request.default_price || 0,
        price_type: request.price_type || 'fixed',
        is_featured: request.is_featured || false,
        template_config: request.template_config || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create service template: ${error.message}`);
    }

    // Add template items if provided
    if (request.items && request.items.length > 0) {
      await this.addTemplateItems(data.id, request.items);
    }

    return data as any;
  }

  /**
   * Update a service template
   */
  async updateServiceTemplate(
    _request: UpdateServiceTemplateRequest,
  ): Promise<ServiceTemplate> {
    const updateData: Partial<ServiceTemplate> = {};

    if (request.name) updateData.name = request.name;
    if (request.description !== undefined) {
      updateData.description = request.description;
    }
    if (request.template_type) updateData.template_type = request.template_type;
    if (request.category_id !== undefined) {
      updateData.category_id = request.category_id;
    }
    if (request.default_duration_minutes) {
      updateData.default_duration_minutes = request.default_duration_minutes;
    }
    if (request.default_price !== undefined) {
      updateData.default_price = request.default_price;
    }
    if (request.price_type) updateData.price_type = request.price_type;
    if (request.is_active !== undefined) {
      updateData.is_active = request.is_active;
    }
    if (request.is_featured !== undefined) {
      updateData.is_featured = request.is_featured;
    }
    if (request.sort_order !== undefined) {
      updateData.sort_order = request.sort_order;
    }
    if (request.template_config) {
      updateData.template_config = request.template_config;
    }

    const { data, error } = await this.sb
      .from('service_templates')
      .update(updateData)
      .eq('id', request.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update service template: ${error.message}`);
    }

    return data as any;
  }

  /**
   * Delete a service template
   */
  async deleteServiceTemplate(id: string): Promise<void> {
    const { error } = await this.sb
      .from('service_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete service template: ${error.message}`);
    }
  }

  /**
   * Add items to a template
   */
  async addTemplateItems(
    templateId: string,
    items: CreateServiceTemplateItemRequest[],
  ): Promise<void> {
    const itemsData = items.map((item, _index) => ({
      template_id: templateId,
      service_id: item.service_id,
      quantity: item.quantity || 1,
      sequence_order: item.sequence_order !== undefined ? item.sequence_order : index,
      is_required: item.is_required !== undefined ? item.is_required : true,
      discount_percentage: item.discount_percentage || null,
      notes: item.notes || null,
    }));

    const { error } = await this.sb
      .from('service_template_items')
      .insert(itemsData);

    if (error) {
      throw new Error(`Failed to add template items: ${error.message}`);
    }
  }

  /**
   * Update a template item
   */
  async updateTemplateItem(
    _request: UpdateServiceTemplateItemRequest,
  ): Promise<void> {
    const updateData: any = {};

    if (request.quantity !== undefined) updateData.quantity = request.quantity;
    if (request.sequence_order !== undefined) {
      updateData.sequence_order = request.sequence_order;
    }
    if (request.is_required !== undefined) {
      updateData.is_required = request.is_required;
    }
    if (request.discount_percentage !== undefined) {
      updateData.discount_percentage = request.discount_percentage;
    }
    if (request.notes !== undefined) updateData.notes = request.notes;

    const { error } = await this.sb
      .from('service_template_items')
      .update(updateData)
      .eq('id', request.id);

    if (error) {
      throw new Error(`Failed to update template item: ${error.message}`);
    }
  }

  /**
   * Remove a template item
   */
  async removeTemplateItem(itemId: string): Promise<void> {
    const { error } = await this.sb
      .from('service_template_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to remove template item: ${error.message}`);
    }
  }

  /**
   * Increment template usage count
   */
  async incrementTemplateUsage(templateId: string): Promise<boolean> {
    const { data, error } = await this.sb.rpc('increment_template_usage', {
      p_template_id: templateId as any,
    });

    if (error) {
      throw new Error(`Failed to increment template usage: ${error.message}`);
    }

    return Boolean(data as any);
  }

  /**
   * Duplicate a service template
   */
  async duplicateServiceTemplate(
    _request: DuplicateServiceTemplateRequest,
  ): Promise<string> {
    const { data, error } = await this.sb.rpc('duplicate_service_template', {
      p_template_id: request.template_id,
      p_new_name: request.new_name,
      p_clinic_id: request.clinic_id,
    });

    if (error) {
      throw new Error(`Failed to duplicate service template: ${error.message}`);
    }

    return String(data as any);
  }

  /**
   * Get service template statistics
   */
  async getServiceTemplateStats(
    clinicId: string,
  ): Promise<ServiceTemplateStats> {
    const templates = await this.getServiceTemplates({ clinic_id: clinicId });

    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.is_active).length;
    const featuredTemplates = templates.filter(t => t.is_featured).length;
    const totalUsage = templates.reduce(
      (sum: number, t: any) => sum + (t.usage_count || 0),
      0,
    );

    // Calculate template type distribution
    const templateTypes = templates.reduce(
      (acc: Record<string, number>, template: any) => {
        acc[template.template_type] = (acc[template.template_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate price type distribution
    const priceTypes = templates.reduce((acc, template) => {
        acc[template.price_type] = (acc[template.price_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate averages
    const averagePrice = totalTemplates > 0
      ? templates.reduce((sum, t) => sum + t.default_price, 0)
        / totalTemplates
      : 0;

    const averageDuration = totalTemplates > 0
      ? templates.reduce((sum, t) => sum + t.default_duration_minutes, 0)
        / totalTemplates
      : 0;

    // Find most used template
    const mostUsedTemplate = templates.length > 0
      ? templates.reduce((max, template) => template.usage_count > max.usage_count ? template : max)
      : null;

    return {
      total_templates: totalTemplates,
      active_templates: activeTemplates,
      featured_templates: featuredTemplates,
      total_usage: totalUsage,
      template_types: templateTypes as any,
      price_types: priceTypes as any,
      average_price: averagePrice,
      average_duration: averageDuration,
      most_used_template: mostUsedTemplate
        ? {
          id: mostUsedTemplate.id,
          name: mostUsedTemplate.name,
          usage_count: mostUsedTemplate.usage_count,
        }
        : null,
    };
  }
}

export const serviceTemplatesService = new ServiceTemplatesService();
