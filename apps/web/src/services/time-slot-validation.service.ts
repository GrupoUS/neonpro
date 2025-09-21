/**
 * Time Slot Validation Service
 * Handles advanced appointment scheduling validation with business rules
 */

import { supabase } from '@/integrations/supabase/client';
import { addMinutes, format, isAfter, isBefore, isWeekend, parseISO } from 'date-fns';

// Type definitions
export interface TimeSlotValidationResult {
  isValid: boolean;
  conflicts: ConflictInfo[];
  warnings: WarningInfo[];
  suggestedAlternatives?: TimeSlot[];
}

export interface ConflictInfo {
  type:
    | 'professional_busy'
    | 'clinic_closed'
    | 'service_unavailable'
    | 'capacity_exceeded';
  message: string;
  conflictingAppointment?: {
    id: string;
    patientName: string;
    startTime: Date;
    endTime: Date;
  };
}

export interface WarningInfo {
  type:
    | 'short_notice'
    | 'outside_preferred_hours'
    | 'weekend_booking'
    | 'buffer_time';
  message: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

export interface BusinessRules {
  clinicHours: {
    monday: { start: string; end: string; closed?: boolean };
    tuesday: { start: string; end: string; closed?: boolean };
    wednesday: { start: string; end: string; closed?: boolean };
    thursday: { start: string; end: string; closed?: boolean };
    friday: { start: string; end: string; closed?: boolean };
    saturday: { start: string; end: string; closed?: boolean };
    sunday: { start: string; end: string; closed?: boolean };
  };
  bufferTime: number; // minutes between appointments
  advanceBookingDays: number; // how many days in advance can book
  minNoticeHours: number; // minimum hours notice required
  maxConcurrentAppointments: number; // max appointments at same time
  allowWeekendBookings: boolean;
}

class TimeSlotValidationService {
  private defaultBusinessRules: BusinessRules = {
    clinicHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: '09:00', end: '14:00' },
      sunday: { closed: true, start: '00:00', end: '00:00' },
    },
    bufferTime: 15, // 15 minutes between appointments
    advanceBookingDays: 90, // 3 months in advance
    minNoticeHours: 2, // 2 hours minimum notice
    maxConcurrentAppointments: 3, // max 3 appointments at same time
    allowWeekendBookings: true,
  };

  /**
   * Validate a time slot for appointment booking
   */
  async validateTimeSlot(
    clinicId: string,
    professionalId: string,
    serviceTypeId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<TimeSlotValidationResult> {
    const conflicts: ConflictInfo[] = [];
    const warnings: WarningInfo[] = [];

    try {
      // Get business rules for clinic
      const businessRules = await this.getBusinessRules(clinicId);

      // 1. Check clinic operating hours
      const clinicHoursConflict = this.checkClinicHours(
        startTime,
        endTime,
        businessRules,
      );
      if (clinicHoursConflict) conflicts.push(clinicHoursConflict);

      // 2. Check professional availability
      const professionalConflicts = await this.checkProfessionalAvailability(
        professionalId,
        startTime,
        endTime,
        excludeAppointmentId,
      );
      conflicts.push(...professionalConflicts);

      // 3. Check service availability
      const serviceConflict = await this.checkServiceAvailability(
        serviceTypeId,
        startTime,
        endTime,
      );
      if (serviceConflict) conflicts.push(serviceConflict);

      // 4. Check capacity limits
      const capacityConflict = await this.checkCapacityLimits(
        clinicId,
        startTime,
        endTime,
        businessRules,
        excludeAppointmentId,
      );
      if (capacityConflict) conflicts.push(capacityConflict);

      // 5. Check business rule warnings
      const businessWarnings = this.checkBusinessRuleWarnings(
        startTime,
        endTime,
        businessRules,
      );
      warnings.push(...businessWarnings);

      // 6. Generate alternative suggestions if there are conflicts
      let suggestedAlternatives: TimeSlot[] | undefined;
      if (conflicts.length > 0) {
        suggestedAlternatives = await this.generateAlternativeSlots(
          clinicId,
          professionalId,
          serviceTypeId,
          startTime,
          endTime.getTime() - startTime.getTime(),
        );
      }

      return {
        isValid: conflicts.length === 0,
        conflicts,
        warnings,
        suggestedAlternatives,
      };
    } catch (error) {
      console.error('Error validating time slot:', error);
      return {
        isValid: false,
        conflicts: [
          {
            type: 'service_unavailable',
            message: 'Unable to validate appointment slot. Please try again.',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Check if appointment time falls within clinic operating hours
   */
  private checkClinicHours(
    startTime: Date,
    endTime: Date,
    businessRules: BusinessRules,
  ): ConflictInfo | null {
    const dayOfWeek = startTime
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase() as keyof BusinessRules['clinicHours'];
    const dayRules = businessRules.clinicHours[dayOfWeek];

    if (dayRules.closed) {
      return {
        type: 'clinic_closed',
        message: `A clínica está fechada ${
          dayOfWeek === 'sunday'
            ? 'aos domingos'
            : dayOfWeek === 'saturday'
            ? 'aos sábados'
            : `às ${dayOfWeek}s`
        }.`,
      };
    }

    const [startHour, startMinute] = dayRules.start.split(':').map(Number);
    const [endHour, endMinute] = dayRules.end.split(':').map(Number);

    const clinicStart = new Date(startTime);
    clinicStart.setHours(startHour, startMinute, 0, 0);

    const clinicEnd = new Date(startTime);
    clinicEnd.setHours(endHour, endMinute, 0, 0);

    if (isBefore(startTime, clinicStart) || isAfter(endTime, clinicEnd)) {
      return {
        type: 'clinic_closed',
        message: `Horário fora do funcionamento da clínica (${dayRules.start} - ${dayRules.end}).`,
      };
    }

    return null;
  }

  /**
   * Check professional availability for the time slot
   */
  private async checkProfessionalAvailability(
    professionalId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<ConflictInfo[]> {
    const conflicts: ConflictInfo[] = [];

    try {
      // Get conflicting appointments
      let query = supabase
        .from('appointments')
        .select(
          `
          id,
          start_time,
          end_time,
          status,
          patients!inner(full_name)
        `,
        )
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .or(
          `and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`,
        );

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: conflictingAppointments, error } = await query;

      if (error) throw error;

      conflictingAppointments?.forEach(_appointment => {
        conflicts.push({
          type: 'professional_busy',
          message: `Profissional já possui agendamento das ${
            appointment.start_time
              ? format(parseISO(appointment.start_time), 'HH:mm')
              : '00:00'
          } às ${
            appointment.end_time
              ? format(parseISO(appointment.end_time), 'HH:mm')
              : '00:00'
          }.`,
          conflictingAppointment: {
            id: appointment.id,
            patientName: appointment.patients?.full_name || 'Paciente',
            startTime: appointment.start_time
              ? parseISO(appointment.start_time)
              : new Date(),
            endTime: appointment.end_time
              ? parseISO(appointment.end_time)
              : new Date(),
          },
        });
      });

      return conflicts;
    } catch (error) {
      console.error('Error checking professional availability:', error);
      return [
        {
          type: 'professional_busy',
          message: 'Não foi possível verificar a disponibilidade do profissional.',
        },
      ];
    }
  }

  /**
   * Check service availability (placeholder for future service-specific rules)
   */
  private async checkServiceAvailability(
    _serviceTypeId: string,
    _startTime: Date,
    _endTime: Date,
  ): Promise<ConflictInfo | null> {
    // Placeholder for service-specific availability rules
    // Could include equipment availability, room booking, etc.
    return null;
  }

  /**
   * Check capacity limits for the time slot
   */
  private async checkCapacityLimits(
    clinicId: string,
    startTime: Date,
    endTime: Date,
    businessRules: BusinessRules,
    excludeAppointmentId?: string,
  ): Promise<ConflictInfo | null> {
    try {
      // Count concurrent appointments
      let query = supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .or(
          `and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`,
        );

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { count, error } = await query;

      if (error) throw error;

      if (count && count >= businessRules.maxConcurrentAppointments) {
        return {
          type: 'capacity_exceeded',
          message:
            `Capacidade máxima atingida para este horário (${businessRules.maxConcurrentAppointments} agendamentos simultâneos).`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking capacity limits:', error);
      return null;
    }
  }

  /**
   * Check for business rule warnings
   */
  private checkBusinessRuleWarnings(
    startTime: Date,
    _endTime: Date,
    businessRules: BusinessRules,
  ): WarningInfo[] {
    const warnings: WarningInfo[] = [];
    const now = new Date();

    // Check minimum notice time
    const hoursUntilAppointment = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < businessRules.minNoticeHours) {
      warnings.push({
        type: 'short_notice',
        message: `Agendamento com menos de ${businessRules.minNoticeHours} horas de antecedência.`,
      });
    }

    // Check weekend booking
    if (isWeekend(startTime) && !businessRules.allowWeekendBookings) {
      warnings.push({
        type: 'weekend_booking',
        message: 'Agendamento em final de semana pode ter disponibilidade limitada.',
      });
    }

    return warnings;
  }

  /**
   * Generate alternative time slots when conflicts exist
   */
  private async generateAlternativeSlots(
    clinicId: string,
    professionalId: string,
    serviceTypeId: string,
    originalStartTime: Date,
    durationMs: number,
  ): Promise<TimeSlot[]> {
    const alternatives: TimeSlot[] = [];
    const duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

    // Try to find alternatives within the same day and next 3 days
    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
      const searchDate = new Date(originalStartTime);
      searchDate.setDate(searchDate.getDate() + dayOffset);
      searchDate.setHours(8, 0, 0, 0); // Start from 8 AM

      // Generate time slots for the day
      const dayAlternatives = await this.findAvailableSlotsForDay(
        clinicId,
        professionalId,
        serviceTypeId,
        searchDate,
        duration,
      );

      alternatives.push(...dayAlternatives);

      // Limit to 5 alternatives
      if (alternatives.length >= 5) break;
    }

    return alternatives.slice(0, 5);
  }

  /**
   * Find available slots for a specific day
   */
  private async findAvailableSlotsForDay(
    clinicId: string,
    professionalId: string,
    serviceTypeId: string,
    date: Date,
    durationMinutes: number,
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const businessRules = await this.getBusinessRules(clinicId);

    // Get day of week and operating hours
    const dayOfWeek = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase() as keyof BusinessRules['clinicHours'];
    const dayRules = businessRules.clinicHours[dayOfWeek];

    if (dayRules.closed) return slots;

    // Parse operating hours
    const [startHour, startMinute] = dayRules.start.split(':').map(Number);
    const [endHour, endMinute] = dayRules.end.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Generate 30-minute intervals
    while (
      currentTime.getTime() + durationMinutes * 60 * 1000
        <= endTime.getTime()
    ) {
      const slotEnd = addMinutes(currentTime, durationMinutes);

      // Validate this slot
      const validation = await this.validateTimeSlot(
        clinicId,
        professionalId,
        serviceTypeId,
        currentTime,
        slotEnd,
      );

      if (validation.isValid) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          duration: durationMinutes,
        });
      }

      // Move to next 30-minute slot
      currentTime = addMinutes(currentTime, 30);
    }

    return slots;
  }

  /**
   * Get business rules for a clinic
   */
  private async getBusinessRules(clinicId: string): Promise<BusinessRules> {
    try {
      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('operating_hours')
        .eq('id', clinicId)
        .single();

      if (error) throw error;

      // If clinic has custom operating hours, merge with defaults
      if (clinic?.operating_hours) {
        return {
          ...this.defaultBusinessRules,
          clinicHours: {
            ...this.defaultBusinessRules.clinicHours,
            ...(clinic.operating_hours as any),
          },
        };
      }

      return this.defaultBusinessRules;
    } catch (error) {
      console.error('Error getting business rules:', error);
      return this.defaultBusinessRules;
    }
  }
}

export const timeSlotValidationService = new TimeSlotValidationService();
