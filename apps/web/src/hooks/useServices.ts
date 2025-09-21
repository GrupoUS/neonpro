/**
 * Service Management Hooks
 * React Query hooks for service CRUD operations and data fetching
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  AvailabilityCheck,
  AvailabilityResult,
  CreateServiceRequest,
  Service,
  ServiceFilters,
  ServiceMutationResponse,
  ServicesResponse,
  TimeSlot,
  UpdateServiceRequest,
} from '@/types/service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
        .select('*')
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
        .select('*')
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
    mutationFn: async (
      serviceData: CreateServiceRequest,
    ): Promise<ServiceMutationResponse> => {
      console.log('🔧 Creating service:', serviceData);

      const { data, error } = await supabase
        .from('service_types')
        .insert([serviceData])
        .select('*')
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
    mutationFn: async (
      serviceData: UpdateServiceRequest,
    ): Promise<ServiceMutationResponse> => {
      console.log('🔧 Updating service:', serviceData);

      const { id, ...updateData } = serviceData;

      const { data, error } = await supabase
        .from('service_types')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          clinics (
            id,
            clinic_name
          )
        `,
        )
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
    onSuccess: (_, _variables) => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(variables.id),
      });
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
    mutationFn: async (
      check: AvailabilityCheck,
    ): Promise<AvailabilityResult> => {
      console.log('🔍 Checking availability:', check);

      const conflicts: Array<{
        type: 'appointment';
        start_time: string;
        end_time: string;
        description: string;
      }> = [];
      const warnings: Array<{
        type: 'short_break' | 'late_hour' | 'early_hour';
        message: string;
      }> = [];

      try {
        // Parse the date and time
        const startDateTime = new Date(`${check.date}T${check.start_time}`);
        const endDateTime = new Date(`${check.date}T${check.end_time}`);

        // Check for existing appointments that conflict
        const { data: existingAppointments, error } = await supabase
          .from('appointments')
          .select(
            `
            id,
            start_time,
            end_time,
            patients!fk_appointments_patient (
              full_name
            ),
            service_types!fk_appointments_service_type (
              name
            )
          `,
          )
          .eq('professional_id', check.professional_id)
          .in('status', ['scheduled', 'confirmed'])
          .or(
            `start_time.lt.${endDateTime.toISOString()},end_time.gt.${startDateTime.toISOString()}`,
          );

        if (error) {
          console.error('Error checking availability:', error);
          throw new Error(`Failed to check availability: ${error.message}`);
        }

        // Add conflicts for existing appointments
        if (existingAppointments && existingAppointments.length > 0) {
          existingAppointments.forEach(appointment => {
            const patient = appointment.patients as any;
            const service = appointment.service_types as any;
            conflicts.push({
              type: 'appointment' as const,
              start_time: appointment.start_time
                ? new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : '00:00',
              end_time: appointment.end_time
                ? new Date(appointment.end_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : '00:00',
              description: `Agendamento existente: ${patient?.full_name || 'Paciente'} - ${
                service?.name || 'Serviço'
              }`,
            });
          });
        }

        // Check for business hour warnings
        const hour = startDateTime.getHours();
        if (hour < 8) {
          warnings.push({
            type: 'early_hour' as const,
            message: 'Agendamento muito cedo. Horário de funcionamento inicia às 08:00.',
          });
        } else if (hour >= 18) {
          warnings.push({
            type: 'late_hour' as const,
            message: 'Agendamento tardio. Horário de funcionamento termina às 18:00.',
          });
        }

        // Check for short break between appointments
        const now = new Date();
        const hoursUntilAppointment = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilAppointment < 2) {
          warnings.push({
            type: 'short_break' as const,
            message: 'Agendamento com menos de 2 horas de antecedência.',
          });
        }

        return {
          available: conflicts.length === 0,
          conflicts,
          warnings,
        };
      } catch (_error) {
        console.error('Error in availability check:', error);
        throw error;
      }
    },
  });
}

/**
 * Get available time slots for a service on a specific date
 */
export function useServiceTimeSlots(
  serviceId: string,
  date: string,
  professionalId?: string,
) {
  return useQuery({
    queryKey: serviceKeys.timeSlots(serviceId, date),
    queryFn: async (): Promise<TimeSlot[]> => {
      console.log(
        '🔍 Fetching time slots for service:',
        serviceId,
        'on date:',
        date,
      );

      try {
        // Get service duration
        const { data: service, error: serviceError } = await supabase
          .from('service_types')
          .select('duration_minutes')
          .eq('id', serviceId)
          .single();

        if (serviceError) {
          console.error('Error fetching service:', serviceError);
          throw new Error(`Failed to fetch service: ${serviceError.message}`);
        }

        const serviceDuration = service?.duration_minutes || 60;

        // Get existing appointments for the date
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        let appointmentsQuery = supabase
          .from('appointments')
          .select('start_time, end_time')
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString())
          .in('status', ['scheduled', 'confirmed']);

        if (professionalId) {
          appointmentsQuery = appointmentsQuery.eq(
            'professional_id',
            professionalId,
          );
        }

        const { data: appointments, error: appointmentsError } = await appointmentsQuery;

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          throw new Error(
            `Failed to fetch appointments: ${appointmentsError.message}`,
          );
        }

        // Generate time slots from 8:00 to 18:00 with 30-minute intervals
        const slots: TimeSlot[] = [];
        const startHour = 8;
        const endHour = 18;
        const intervalMinutes = 30;

        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const timeString = `${hour.toString().padStart(2, '0')}:${
              minute
                .toString()
                .padStart(2, '0')
            }`;
            const slotStart = new Date(`${date}T${timeString}:00`);
            const slotEnd = new Date(
              slotStart.getTime() + serviceDuration * 60 * 1000,
            );

            // Check if this slot conflicts with existing appointments
            const hasConflict = appointments?.some(appointment => {
              if (!appointment.start_time || !appointment.end_time) {
                return false;
              }
              const appointmentStart = new Date(appointment.start_time);
              const appointmentEnd = new Date(appointment.end_time);

              return (
                (slotStart >= appointmentStart && slotStart < appointmentEnd)
                || (slotEnd > appointmentStart && slotEnd <= appointmentEnd)
                || (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
              );
            });

            slots.push({
              time: timeString,
              available: !hasConflict,
              reason: hasConflict ? 'Agendado' : undefined,
            });
          }
        }

        return slots;
      } catch (_error) {
        console.error('Error generating time slots:', error);
        throw error;
      }
    },
    enabled: !!serviceId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
