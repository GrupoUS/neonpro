/**
 * Professional Management Hooks
 * React Query hooks for professional data management
 */

import { professionalService } from '@/services/professionals.service';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch professionals by clinic
 */
export function useProfessionals(clinicId: string) {
  return useQuery({
    queryKey: ['professionals', clinicId],
    queryFn: () => professionalService.getProfessionalsByClinic(clinicId),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch professionals by service type
 */
export function useProfessionalsByServiceType(
  clinicId: string,
  serviceTypeId: string,
) {
  return useQuery({
    queryKey: ['professionals', 'by-service-type',clinicId, serviceTypeId],
    queryFn: () =>
      professionalService.getProfessionalsByServiceType(
        clinicId,
        serviceTypeId,
      ),
    enabled: !!clinicId && !!serviceTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch professional availability
 */
export function useProfessionalAvailability(
  professionalId: string,
  date: Date,
  serviceDuration: number = 60,
) {
  return useQuery({
    queryKey: [
      'professional-availability',
      professionalId,
      date.toDateString(),
      serviceDuration,
    ],
    queryFn: () =>
      professionalService.getProfessionalAvailability(
        professionalId,
        date,
        serviceDuration,
      ),
    enabled: !!professionalId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for availability)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if professional is available for a specific time slot
 */
export function useProfessionalAvailabilityCheck(
  professionalId: string,
  startTime: Date | null,
  endTime: Date | null,
) {
  return useQuery({
    queryKey: [
      'professional-availability-check',
      professionalId,
      startTime?.toISOString(),
      endTime?.toISOString(),
    ],
    queryFn: () =>
      professionalService.isProfessionalAvailable(
        professionalId,
        startTime!,
        endTime!,
      ),
    enabled: !!professionalId && !!startTime && !!endTime,
    staleTime: 1 * 60 * 1000, // 1 minute (very short for real-time checking)
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}
