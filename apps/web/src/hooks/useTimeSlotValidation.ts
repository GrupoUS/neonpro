/**
 * Time Slot Validation Hooks
 * React Query hooks for appointment time slot validation
 */

import { timeSlotValidationService, type TimeSlotValidationResult } from '@/services/time-slot-validation.service';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to validate a time slot for appointment booking
 */
export function useTimeSlotValidation(
  clinicId: string,
  professionalId: string,
  serviceTypeId: string,
  startTime: Date | null,
  endTime: Date | null,
  excludeAppointmentId?: string
) {
  return useQuery({
    queryKey: [
      'time-slot-validation',
      clinicId,
      professionalId,
      serviceTypeId,
      startTime?.toISOString(),
      endTime?.toISOString(),
      excludeAppointmentId,
    ],
    queryFn: () =>
      timeSlotValidationService.validateTimeSlot(
        clinicId,
        professionalId,
        serviceTypeId,
        startTime!,
        endTime!,
        excludeAppointmentId
      ),
    enabled: !!(clinicId && professionalId && serviceTypeId && startTime && endTime),
    staleTime: 30 * 1000, // 30 seconds (short for real-time validation)
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Revalidate when user returns to window
  });
}

/**
 * Hook to get validation result with loading and error states
 */
export function useTimeSlotValidationWithStatus(
  clinicId: string,
  professionalId: string,
  serviceTypeId: string,
  startTime: Date | null,
  endTime: Date | null,
  excludeAppointmentId?: string
) {
  const query = useTimeSlotValidation(
    clinicId,
    professionalId,
    serviceTypeId,
    startTime,
    endTime,
    excludeAppointmentId
  );

  return {
    ...query,
    validation: query.data,
    isValidating: query.isLoading || query.isFetching,
    hasConflicts: query.data ? query.data.conflicts.length > 0 : false,
    hasWarnings: query.data ? query.data.warnings.length > 0 : false,
    isValid: query.data ? query.data.isValid : false,
  };
}
