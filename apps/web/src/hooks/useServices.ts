/**
 * Service Management Hooks
 * React Query hooks for service CRUD operations and data fetching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceFilters,
  ServicesResponse,
  ServiceMutationResponse,
  AvailabilityCheck,
  AvailabilityResult,
  TimeSlot,
} from '@/types/service';

// Query Keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  availability: () => [...serviceKeys.all, 'availability'] as const,
  timeSlots: (serviceId: string, date: string) => 
    [...serviceKeys.availability(), serviceId, date] as const,
};

/**
 * Fetch all services with optional filtering
 */
export function useServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: async (): Promise<ServicesResponse> => {
      let query = supabase
        .from('service_types')
        .select(`
          *,
          clinics (
            id,
            clinic_name
          )
        `)
        .order('name', { ascending: true });

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.clinic_id) {
        query = query.eq('clinic_id', filters.clinic_id);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching services:', error);
        throw new Error(`Failed to fetch services: ${error.message}`);
      }

      return {
        data: (data as unknown as Service[]) || [],
        count: count || 0,
        page: 1,
        per_page: 50,
        total_pages: Math.ceil((count || 0) / 50),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single service by ID
 */
export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async (): Promise<Service> => {
      const { data, error } = await supabase
        .from('service_types')
        .select(`
          *,
          clinics (
            id,
            clinic_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
        throw new Error(`Failed to fetch service: ${error.message}`);
      }

      return data as unknown as Service;
    },
    enabled: !!id,
  });
}

/**
 * Create a new service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: CreateServiceRequest): Promise<ServiceMutationResponse> => {
      console.log('🔧 Creating service:', serviceData);

      const { data, error } = await supabase
        .from('service_types')
        .insert([serviceData])
        .select(`
          *,
          clinics (
            id,
            clinic_name
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error creating service:', error);
        throw new Error(`Failed to create service: ${error.message}`);
      }

      console.log('✅ Service created successfully:', data);
      return {
        success: true,
        data: data as unknown as Service,
        message: 'Serviço criado com sucesso!',
      };
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}

/**
 * Update an existing service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: UpdateServiceRequest): Promise<ServiceMutationResponse> => {
      console.log('🔧 Updating service:', serviceData);

      const { id, ...updateData } = serviceData;

      const { data, error } = await supabase
        .from('service_types')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          clinics (
            id,
            clinic_name
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error updating service:', error);
        throw new Error(`Failed to update service: ${error.message}`);
      }

      console.log('✅ Service updated successfully:', data);
      return {
        success: true,
        data: data as unknown as Service,
        message: 'Serviço atualizado com sucesso!',
      };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) });
    },
  });
}

/**
 * Delete a service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ServiceMutationResponse> => {
      console.log('🔧 Deleting service:', id);

      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting service:', error);
        throw new Error(`Failed to delete service: ${error.message}`);
      }

      console.log('✅ Service deleted successfully');
      return {
        success: true,
        message: 'Serviço excluído com sucesso!',
      };
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}

/**
 * Check availability for a specific time slot
 */
export function useCheckAvailability() {
  return useMutation({
    mutationFn: async (check: AvailabilityCheck): Promise<AvailabilityResult> => {
      console.log('🔍 Checking availability:', check);

      // This would typically check against appointments table
      // For now, return a mock response
      const conflicts: Array<{ type: 'appointment'; start_time: string; end_time: string; description: string; }> = [];
      const warnings: Array<{ type: 'short_break' | 'late_hour' | 'early_hour'; message: string; }> = [];

      // Mock logic - in real implementation, query appointments table
      const isAvailable = Math.random() > 0.3; // 70% chance of being available

      if (!isAvailable) {
        conflicts.push({
          type: 'appointment' as const,
          start_time: check.start_time,
          end_time: check.end_time,
          description: 'Horário já agendado',
        });
      }

      return {
        available: isAvailable,
        conflicts,
        warnings,
      };
    },
  });
}

/**
 * Get available time slots for a service on a specific date
 */
export function useServiceTimeSlots(serviceId: string, date: string, _professionalId?: string) {
  return useQuery({
    queryKey: serviceKeys.timeSlots(serviceId, date),
    queryFn: async (): Promise<TimeSlot[]> => {
      console.log('🔍 Fetching time slots for service:', serviceId, 'on date:', date);

      // Mock time slots - in real implementation, this would:
      // 1. Get service duration
      // 2. Get professional's working hours
      // 3. Check existing appointments
      // 4. Generate available slots

      const baseSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      ];

      return baseSlots.map(time => ({
        time,
        available: Math.random() > 0.3, // 70% chance of being available
        reason: Math.random() > 0.7 ? 'Agendado' : undefined,
      }));
    },
    enabled: !!serviceId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
