/**
 * Pricing Rules Service
 * Service layer for dynamic pricing engine operations
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  PricingRule,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  PricingRuleFilters,
  PricingCalculation
} from '@/types/pricing-rules';

export class PricingRulesService {
  /**
   * Get all pricing rules for a clinic
   */
  static async getPricingRules(clinicId: string, filters?: PricingRuleFilters): Promise<PricingRule[]> {
    let query = supabase
      .from('pricing_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('priority', { ascending: false });

    if (filters?.rule_type) {
      query = query.eq('rule_type', filters.rule_type);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pricing rules:', error);
      throw new Error(`Failed to fetch pricing rules: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific pricing rule
   */
  static async getPricingRule(id: string): Promise<PricingRule | null> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching pricing rule:', error);
      throw new Error(`Failed to fetch pricing rule: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new pricing rule
   */
  static async createPricingRule(
    clinicId: string,
    request: CreatePricingRuleRequest
  ): Promise<PricingRule> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .insert({
        clinic_id: clinicId,
        ...request,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pricing rule:', error);
      throw new Error(`Failed to create pricing rule: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a pricing rule
   */
  static async updatePricingRule(
    id: string,
    request: UpdatePricingRuleRequest
  ): Promise<PricingRule> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .update({
        ...request,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pricing rule:', error);
      throw new Error(`Failed to update pricing rule: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a pricing rule
   */
  static async deletePricingRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pricing rule:', error);
      throw new Error(`Failed to delete pricing rule: ${error.message}`);
    }
  }

  /**
   * Toggle pricing rule active status
   */
  static async togglePricingRule(id: string, isActive: boolean): Promise<PricingRule> {
    return this.updatePricingRule(id, { is_active: isActive });
  }

  /**
   * Calculate pricing for a service with applied rules
   */
  static async calculateServicePricing(
    clinicId: string,
    serviceId: string,
    context: {
      professional_id?: string;
      appointment_date?: Date;
      client_id?: string;
      is_first_time_client?: boolean;
    }
  ): Promise<PricingCalculation> {
    // Get base price from service
    const { data: service, error: serviceError } = await supabase
      .from('service_types')
      .select('price')
      .eq('id', serviceId)
      .single();

    if (serviceError) {
      throw new Error(`Failed to fetch service price: ${serviceError.message}`);
    }

    const basePrice = service.price || 0;

    // Get applicable pricing rules
    const rules = await this.getPricingRules(clinicId, { is_active: true });

    // Calculate pricing with rules
    const { calculatePricing } = await import('@/types/pricing-rules');
    return calculatePricing(basePrice, rules, {
      service_id: serviceId,
      ...context
    });
  }

  /**
   * Get pricing rules that apply to a specific service
   */
  static async getServicePricingRules(
    clinicId: string,
    serviceId: string
  ): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .or(`service_ids.cs.{${serviceId}},service_ids.is.null`)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching service pricing rules:', error);
      throw new Error(`Failed to fetch service pricing rules: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get pricing rules that apply to a specific professional
   */
  static async getProfessionalPricingRules(
    clinicId: string,
    professionalId: string
  ): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .or(`professional_ids.cs.{${professionalId}},professional_ids.is.null`)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching professional pricing rules:', error);
      throw new Error(`Failed to fetch professional pricing rules: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Bulk update pricing rule priorities
   */
  static async updatePricingRulePriorities(
    updates: { id: string; priority: number }[]
  ): Promise<void> {
    const { error } = await supabase.rpc('bulk_update_pricing_rule_priorities', {
      updates: updates
    });

    if (error) {
      console.error('Error updating pricing rule priorities:', error);
      throw new Error(`Failed to update pricing rule priorities: ${error.message}`);
    }
  }

  /**
   * Get pricing statistics for a clinic
   */
  static async getPricingStats(clinicId: string): Promise<{
    total_rules: number;
    active_rules: number;
    rules_by_type: Record<string, number>;
    avg_discount: number;
    total_savings: number;
  }> {
    const { data, error } = await supabase.rpc('get_pricing_stats', {
      p_clinic_id: clinicId
    });

    if (error) {
      console.error('Error fetching pricing stats:', error);
      throw new Error(`Failed to fetch pricing stats: ${error.message}`);
    }

    return data || {
      total_rules: 0,
      active_rules: 0,
      rules_by_type: {},
      avg_discount: 0,
      total_savings: 0
    };
  }
}

export const pricingRulesService = PricingRulesService;
