/**
 * Professional Services Service
 * Handles CRUD operations for professional-service relationships
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  BulkAssignServicesRequest,
  CreateProfessionalServiceRequest,
  ProfessionalService,
  ProfessionalServiceDetailed,
  ProfessionalServiceFilters,
  ProfessionalServiceStats,
  ProfessionalWithService,
  ServiceWithProfessional,
  SetPrimaryProfessionalRequest,
  UpdateProfessionalServiceRequest,
} from '@/types/professional-services';

class ProfessionalServicesService {
  /**
   * Get all professional-service relationships with optional filtering
   */
  async getProfessionalServices(
    filters: ProfessionalServiceFilters = {},
  ): Promise<ProfessionalService[]> {
    let query = (supabase as any)
      .from('professional_services' as any)
      .select('*');

    // Apply filters
    if (filters.professional_id) {
      query = query.eq('professional_id', filters.professional_id);
    }
    if (filters.service_id) {
      query = query.eq('service_id', filters.service_id);
    }
    if (filters.is_primary !== undefined) {
      query = query.eq('is_primary', filters.is_primary);
    }
    if (filters.proficiency_level) {
      query = query.eq('proficiency_level', filters.proficiency_level);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch professional services: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get detailed professional-service relationships for a clinic
   */
  async getProfessionalServicesDetailed(clinicId: string): Promise<ProfessionalServiceDetailed[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_professional_services_detailed' as any, { p_clinic_id: clinicId } as any);

    if (error) {
      throw new Error(`Failed to fetch detailed professional services: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get services by professional
   */
  async getServicesByProfessional(professionalId: string): Promise<ServiceWithProfessional[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_services_by_professional' as any, { p_professional_id: professionalId } as any);

    if (error) {
      throw new Error(`Failed to fetch services by professional: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get professionals by service
   */
  async getProfessionalsByService(serviceId: string): Promise<ProfessionalWithService[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_professionals_by_service' as any, { p_service_id: serviceId } as any);

    if (error) {
      throw new Error(`Failed to fetch professionals by service: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new professional-service relationship
   */
  async createProfessionalService(
    request: CreateProfessionalServiceRequest,
  ): Promise<ProfessionalService> {
    const { data, error } = await (supabase as any)
      .from('professional_services' as any)
      .insert({
        professional_id: request.professional_id,
        service_id: request.service_id,
        is_primary: request.is_primary || false,
        proficiency_level: request.proficiency_level || 'intermediate',
        hourly_rate: request.hourly_rate || null,
        notes: request.notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create professional service: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a professional-service relationship
   */
  async updateProfessionalService(
    request: UpdateProfessionalServiceRequest,
  ): Promise<ProfessionalService> {
    const updateData: Partial<ProfessionalService> = {};

    if (request.is_primary !== undefined) updateData.is_primary = request.is_primary;
    if (request.proficiency_level) updateData.proficiency_level = request.proficiency_level;
    if (request.hourly_rate !== undefined) updateData.hourly_rate = request.hourly_rate;
    if (request.is_active !== undefined) updateData.is_active = request.is_active;
    if (request.notes !== undefined) updateData.notes = request.notes;

    const { data, error } = await (supabase as any)
      .from('professional_services' as any)
      .update(updateData as any)
      .eq('id', request.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update professional service: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a professional-service relationship
   */
  async deleteProfessionalService(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('professional_services' as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete professional service: ${error.message}`);
    }
  }

  /**
   * Bulk assign services to a professional
   */
  async bulkAssignServices(request: BulkAssignServicesRequest): Promise<number> {
    const { data, error } = await (supabase as any)
      .rpc('bulk_assign_services_to_professional' as any, {
        p_professional_id: request.professional_id,
        p_service_ids: request.service_ids,
        p_proficiency_level: request.proficiency_level || 'intermediate',
        p_is_primary: request.is_primary || false,
      });

    if (error) {
      throw new Error(`Failed to bulk assign services: ${error.message}`);
    }

    return (data as number) || 0;
  }

  /**
   * Set primary professional for a service
   */
  async setPrimaryProfessional(request: SetPrimaryProfessionalRequest): Promise<boolean> {
    const { data, error } = await (supabase as any)
      .rpc('set_primary_professional_for_service' as any, {
        p_service_id: request.service_id,
        p_professional_id: request.professional_id,
      });

    if (error) {
      throw new Error(`Failed to set primary professional: ${error.message}`);
    }

    return (data as boolean) || false;
  }

  /**
   * Get professional-service statistics for a clinic
   */
  async getProfessionalServiceStats(clinicId: string): Promise<ProfessionalServiceStats> {
    // Get all professional services for the clinic
    const professionalServices = await this.getProfessionalServicesDetailed(clinicId);

    const totalAssignments = professionalServices.length;
    const activeAssignments = professionalServices.filter(ps => ps.is_active).length;
    const primaryAssignments = professionalServices.filter(ps => ps.is_primary).length;

    // Calculate proficiency distribution
    const proficiencyDistribution = professionalServices.reduce((acc, ps) => {
      acc[ps.proficiency_level] = (acc[ps.proficiency_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average hourly rate
    const ratesWithValues = professionalServices
      .filter(ps => ps.hourly_rate !== null)
      .map(ps => ps.hourly_rate!);
    const averageHourlyRate = ratesWithValues.length > 0
      ? ratesWithValues.reduce((sum, rate) => sum + rate, 0) / ratesWithValues.length
      : 0;

    // Calculate services per professional and professionals per service
    const uniqueProfessionals = new Set(professionalServices.map(ps => ps.professional_id));
    const uniqueServices = new Set(professionalServices.map(ps => ps.service_id));

    const servicesPerProfessional = uniqueProfessionals.size > 0
      ? totalAssignments / uniqueProfessionals.size
      : 0;

    const professionalsPerService = uniqueServices.size > 0
      ? totalAssignments / uniqueServices.size
      : 0;

    return {
      total_assignments: totalAssignments,
      active_assignments: activeAssignments,
      primary_assignments: primaryAssignments,
      proficiency_distribution: proficiencyDistribution as Record<any, number>,
      average_hourly_rate: averageHourlyRate,
      services_per_professional: servicesPerProfessional,
      professionals_per_service: professionalsPerService,
    };
  }

  /**
   * Check if a professional can perform a service
   */
  async canProfessionalPerformService(professionalId: string, serviceId: string): Promise<boolean> {
    const { data, error } = await (supabase as any)
      .from('professional_services' as any)
      .select('id')
      .eq('professional_id', professionalId)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to check professional service capability: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get available professionals for a service with their proficiency
   */
  async getAvailableProfessionalsForService(serviceId: string): Promise<ProfessionalWithService[]> {
    const professionals = await this.getProfessionalsByService(serviceId);

    // Filter only active professionals
    return professionals.filter(prof => prof.availability_score > 0);
  }

  /**
   * Get recommended professional for a service (highest proficiency, primary if available)
   */
  async getRecommendedProfessionalForService(
    serviceId: string,
  ): Promise<ProfessionalWithService | null> {
    const professionals = await this.getAvailableProfessionalsForService(serviceId);

    if (professionals.length === 0) {
      return null;
    }

    // Sort by primary status first, then by proficiency level
    const sorted = professionals.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return b.availability_score - a.availability_score;
    });

    return sorted[0];
  }
}

export const professionalServicesService = new ProfessionalServicesService();
