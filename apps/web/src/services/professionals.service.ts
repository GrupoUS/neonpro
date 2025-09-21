/**
 * Professional Service
 * Handles professional management, availability, and specialization matching
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/supabase/types/database';
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns';

// Type definitions
type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];

export interface Professional {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  serviceTypeIds: string[];
  workingHours: {
    startTime: string | null;
    endTime: string | null;
    breakStart: string | null;
    breakEnd: string | null;
  };
  canWorkWeekends: boolean;
  color: string | null;
  isActive: boolean;
  clinicId: string;
}

export interface ProfessionalAvailability {
  professionalId: string;
  date: Date;
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  workingHours: {
    start: string;
    end: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
}

class ProfessionalService {
  /**
   * Get all active professionals for a clinic
   */
  async getProfessionalsByClinic(clinicId: string): Promise<Professional[]> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;

      return data.map(this.transformProfessional);
    } catch (_error) {
      console.error('Error fetching professionals:', error);
      throw error;
    }
  }

  /**
   * Get professionals by service type
   */
  async getProfessionalsByServiceType(
    clinicId: string,
    serviceTypeId: string,
  ): Promise<Professional[]> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .contains('service_type_ids', [serviceTypeId])
        .order('full_name');

      if (error) throw error;

      return data.map(this.transformProfessional);
    } catch (_error) {
      console.error('Error fetching professionals by service type:', error);
      throw error;
    }
  }

  /**
   * Get professional availability for a specific date
   */
  async getProfessionalAvailability(
    professionalId: string,
    date: Date,
    serviceDuration: number = 60, // default 60 minutes
  ): Promise<ProfessionalAvailability> {
    try {
      // Get professional info
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId)
        .single();

      if (profError) throw profError;

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('start_time, end_time, status')
        .eq('professional_id', professionalId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (apptError) throw apptError;

      // Calculate availability
      const workingHours = {
        start: professional.default_start_time || '09:00',
        end: professional.default_end_time || '18:00',
        breakStart: professional.default_break_start || undefined,
        breakEnd: professional.default_break_end || undefined,
      };

      const bookedSlots = appointments.map(apt => ({
        start: apt.start_time ? parseISO(apt.start_time) : new Date(),
        end: apt.end_time ? parseISO(apt.end_time) : new Date(),
        duration: apt.start_time && apt.end_time
          ? Math.round(
            (parseISO(apt.end_time).getTime()
              - parseISO(apt.start_time).getTime())
              / (1000 * 60),
          )
          : 0,
      }));

      const availableSlots = this.calculateAvailableSlots(
        date,
        workingHours,
        bookedSlots,
        serviceDuration,
      );

      return {
        professionalId,
        date,
        availableSlots,
        bookedSlots,
        workingHours,
      };
    } catch (_error) {
      console.error('Error getting professional availability:', error);
      throw error;
    }
  }

  /**
   * Check if professional is available for a specific time slot
   */
  async isProfessionalAvailable(
    professionalId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    try {
      // Check for conflicting appointments
      const { data: conflicts, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .or(
          `and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`,
        );

      if (error) throw error;

      return conflicts.length === 0;
    } catch (_error) {
      console.error('Error checking professional availability:', error);
      return false;
    }
  }

  /**
   * Transform database row to Professional interface
   */
  private transformProfessional(row: ProfessionalRow): Professional {
    const anyRow = row as any;
    return {
      id: anyRow.id,
      fullName: anyRow.full_name,
      email: anyRow.email || '',
      phone: anyRow.phone || '',
      specialization: anyRow.specialization || '',
      licenseNumber: anyRow.license_number,
      serviceTypeIds: anyRow.service_type_ids || [],
      workingHours: {
        startTime: anyRow.default_start_time,
        endTime: anyRow.default_end_time,
        breakStart: anyRow.default_break_start,
        breakEnd: anyRow.default_break_end,
      },
      canWorkWeekends: anyRow.can_work_weekends || false,
      color: anyRow.color || '#3B82F6',
      isActive: anyRow.is_active || false,
      clinicId: anyRow.clinic_id,
    };
  }

  /**
   * Calculate available time slots for a professional
   */
  private calculateAvailableSlots(
    date: Date,
    workingHours: {
      start: string;
      end: string;
      breakStart?: string;
      breakEnd?: string;
    },
    bookedSlots: TimeSlot[],
    serviceDuration: number,
  ): TimeSlot[] {
    const availableSlots: TimeSlot[] = [];

    // Parse working hours
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const workStart = new Date(date);
    workStart.setHours(startHour, startMinute, 0, 0);

    const workEnd = new Date(date);
    workEnd.setHours(endHour, endMinute, 0, 0);

    // Handle break time if specified
    let breakStart: Date | undefined;
    let breakEnd: Date | undefined;

    if (workingHours.breakStart && workingHours.breakEnd) {
      const [breakStartHour, breakStartMinute] = workingHours.breakStart
        .split(':')
        .map(Number);
      const [breakEndHour, breakEndMinute] = workingHours.breakEnd
        .split(':')
        .map(Number);

      breakStart = new Date(date);
      breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);

      breakEnd = new Date(date);
      breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);
    }

    // Generate time slots
    let currentTime = new Date(workStart);

    while (
      isBefore(addMinutes(currentTime, serviceDuration), workEnd)
      || addMinutes(currentTime, serviceDuration).getTime() === workEnd.getTime()
    ) {
      const slotEnd = addMinutes(currentTime, serviceDuration);

      // Check if slot conflicts with break time
      const conflictsWithBreak = breakStart
        && breakEnd
        && isBefore(currentTime, breakEnd)
        && isAfter(slotEnd, breakStart);

      // Check if slot conflicts with booked appointments
      const conflictsWithBooking = bookedSlots.some(
        booked => isBefore(currentTime, booked.end) && isAfter(slotEnd, booked.start),
      );

      if (!conflictsWithBreak && !conflictsWithBooking) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          duration: serviceDuration,
        });
      }

      // Move to next slot (15-minute intervals)
      currentTime = addMinutes(currentTime, 15);
    }

    return availableSlots;
  }
}

export const _professionalService = new ProfessionalService();
