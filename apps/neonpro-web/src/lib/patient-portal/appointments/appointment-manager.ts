import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogger } from "../../audit/audit-logger";
import type { LGPDManager } from "../../lgpd/lgpd-manager";
import type { SessionManager } from "../auth/session-manager";

// Configuration interface
export interface AppointmentConfig {
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  maxReschedulingAttempts: number;
  cancellationDeadlineHours: number;
  enableWaitingList: boolean;
  autoConfirmationEnabled: boolean;
  reminderIntervals: number[]; // hours before appointment
}

// Available time slot
export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  isAvailable: boolean;
  price: number;
}

// Booking request
export interface BookingRequest {
  patientId: string;
  serviceId: string;
  staffId: string;
  preferredDate: Date;
  preferredTime: string;
  notes?: string;
  isUrgent?: boolean;
  reminderPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
} // Booking result
export interface BookingResult {
  success: boolean;
  appointmentId?: string;
  message: string;
  conflictingAppointments?: any[];
  suggestedAlternatives?: TimeSlot[];
  waitingListPosition?: number;
}

// Reschedule request
export interface RescheduleRequest {
  appointmentId: string;
  newDate: Date;
  newTime: string;
  reason: string;
}

// Cancellation request
export interface CancellationRequest {
  appointmentId: string;
  reason: string;
  requestRefund?: boolean;
}

export class AppointmentManager {
  private supabase: SupabaseClient;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private sessionManager: SessionManager;
  private config: AppointmentConfig;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    sessionManager: SessionManager,
    config?: Partial<AppointmentConfig>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.config = {
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 2,
      maxReschedulingAttempts: 3,
      cancellationDeadlineHours: 24,
      enableWaitingList: true,
      autoConfirmationEnabled: false,
      reminderIntervals: [24, 2], // 24 hours and 2 hours before
      ...config,
    };
  }

  /**
   * Get available time slots for booking
   */
  async getAvailableSlots(
    patientId: string,
    sessionToken: string,
    serviceId: string,
    startDate: Date,
    endDate: Date,
    staffId?: string,
  ): Promise<TimeSlot[]> {
    try {
      // Validate session
      const sessionValidation = await this.sessionManager.validateSession(sessionToken);
      if (!sessionValidation.isValid || sessionValidation.session?.patientId !== patientId) {
        throw new Error("Invalid session or unauthorized access");
      }

      // Validate date range
      const now = new Date();
      const maxDate = new Date(
        now.getTime() + this.config.maxAdvanceBookingDays * 24 * 60 * 60 * 1000,
      );

      if (startDate < now || endDate > maxDate) {
        throw new Error(
          `Booking dates must be between now and ${this.config.maxAdvanceBookingDays} days in advance`,
        );
      }
      // Get service details
      const { data: service, error: serviceError } = await this.supabase
        .from("services")
        .select("id, name, duration, price, category")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Build staff filter
      let staffFilter = {};
      if (staffId) {
        staffFilter = { id: staffId };
      }

      // Get available staff for the service
      const { data: availableStaff, error: staffError } = await this.supabase
        .from("staff")
        .select(`
          id, name, specialization,
          staff_availability!inner(
            day_of_week, start_time, end_time, is_available
          )
        `)
        .match(staffFilter)
        .eq("staff_availability.is_available", true);

      if (staffError) throw staffError;

      // Get existing appointments in the date range
      const { data: existingAppointments, error: appointmentsError } = await this.supabase
        .from("appointments")
        .select("staff_id, appointment_date, appointment_time, estimated_duration")
        .gte("appointment_date", startDate.toISOString().split("T")[0])
        .lte("appointment_date", endDate.toISOString().split("T")[0])
        .in("status", ["scheduled", "confirmed", "in_progress"]);
      if (appointmentsError) throw appointmentsError;

      // Generate available time slots
      const availableSlots: TimeSlot[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Check each staff member's availability for this day
        for (const staff of availableStaff || []) {
          const dayAvailability = staff.staff_availability.find(
            (avail: any) => avail.day_of_week === dayOfWeek,
          );

          if (dayAvailability) {
            const slots = this.generateTimeSlots(
              currentDate,
              dayAvailability.start_time,
              dayAvailability.end_time,
              service.duration,
              staff,
              service,
              existingAppointments,
            );
            availableSlots.push(...slots);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Log slot access
      await this.auditLogger.log({
        action: "slots_accessed",
        userId: patientId,
        userType: "patient",
        details: {
          serviceId,
          dateRange: { startDate, endDate },
          slotsFound: availableSlots.length,
        },
      });

      return availableSlots.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      await this.auditLogger.log({
        action: "slots_access_failed",
        userId: patientId,
        userType: "patient",
        details: { error: error.message },
      });
      throw error;
    }
  }
  /**
   * Generate time slots for a specific day and staff member
   */
  private generateTimeSlots(
    date: Date,
    startTime: string,
    endTime: string,
    serviceDuration: number,
    staff: any,
    service: any,
    existingAppointments: any[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    const now = new Date();
    const minBookingTime = new Date(
      now.getTime() + this.config.minAdvanceBookingHours * 60 * 60 * 1000,
    );

    while (slotStart.getTime() + serviceDuration * 60 * 1000 <= slotEnd.getTime()) {
      const slotEndTime = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

      // Check if slot is in the future with minimum advance booking time
      if (slotStart >= minBookingTime) {
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt) => {
          if (apt.staff_id !== staff.id) return false;

          const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
          const aptEndTime = new Date(aptDate.getTime() + apt.estimated_duration * 60 * 1000);

          return (
            (slotStart >= aptDate && slotStart < aptEndTime) ||
            (slotEndTime > aptDate && slotEndTime <= aptEndTime) ||
            (slotStart <= aptDate && slotEndTime >= aptEndTime)
          );
        });
        if (!hasConflict) {
          slots.push({
            id: `${staff.id}_${date.toISOString().split("T")[0]}_${slotStart.getHours()}:${slotStart.getMinutes().toString().padStart(2, "0")}`,
            date: new Date(date),
            startTime: `${slotStart.getHours()}:${slotStart.getMinutes().toString().padStart(2, "0")}`,
            endTime: `${slotEndTime.getHours()}:${slotEndTime.getMinutes().toString().padStart(2, "0")}`,
            staffId: staff.id,
            staffName: staff.name,
            serviceId: service.id,
            serviceName: service.name,
            duration: serviceDuration,
            isAvailable: true,
            price: service.price,
          });
        }
      }

      // Move to next slot (15-minute intervals)
      slotStart.setMinutes(slotStart.getMinutes() + 15);
    }

    return slots;
  }

  /**
   * Book an appointment
   */
  async bookAppointment(request: BookingRequest, sessionToken: string): Promise<BookingResult> {
    try {
      // Validate session
      const sessionValidation = await this.sessionManager.validateSession(sessionToken);
      if (
        !sessionValidation.isValid ||
        sessionValidation.session?.patientId !== request.patientId
      ) {
        throw new Error("Invalid session or unauthorized access");
      }
      // Validate booking request
      const validationResult = await this.validateBookingRequest(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message,
          conflictingAppointments: validationResult.conflicts,
          suggestedAlternatives: validationResult.alternatives,
        };
      }

      // Check for existing appointments at the same time
      const { data: conflictingAppointments, error: conflictError } = await this.supabase
        .from("appointments")
        .select("*")
        .eq("staff_id", request.staffId)
        .eq("appointment_date", request.preferredDate.toISOString().split("T")[0])
        .eq("appointment_time", request.preferredTime)
        .in("status", ["scheduled", "confirmed", "in_progress"]);

      if (conflictError) throw conflictError;

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        // Get alternative slots
        const alternatives = await this.getAlternativeSlots(
          request.serviceId,
          request.preferredDate,
          request.staffId,
        );

        return {
          success: false,
          message: "Horário não disponível. Verifique as alternativas sugeridas.",
          conflictingAppointments,
          suggestedAlternatives: alternatives,
        };
      }
      // Create the appointment
      const { data: newAppointment, error: insertError } = await this.supabase
        .from("appointments")
        .insert({
          patient_id: request.patientId,
          service_id: request.serviceId,
          staff_id: request.staffId,
          appointment_date: request.preferredDate.toISOString().split("T")[0],
          appointment_time: request.preferredTime,
          status: this.config.autoConfirmationEnabled ? "confirmed" : "scheduled",
          notes: request.notes,
          is_urgent: request.isUrgent || false,
          reminder_preferences: request.reminderPreferences,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log successful booking
      await this.auditLogger.log({
        action: "appointment_booked",
        userId: request.patientId,
        userType: "patient",
        details: {
          appointmentId: newAppointment.id,
          serviceId: request.serviceId,
          staffId: request.staffId,
          appointmentDate: request.preferredDate,
          appointmentTime: request.preferredTime,
        },
      });

      return {
        success: true,
        appointmentId: newAppointment.id,
        message: "Agendamento realizado com sucesso!",
      };
    } catch (error) {
      await this.auditLogger.log({
        action: "appointment_booking_failed",
        userId: request.patientId,
        userType: "patient",
        details: { error: error.message },
      });
      throw error;
    }
  }
  /**
   * Validate booking request
   */
  private async validateBookingRequest(request: BookingRequest): Promise<{
    isValid: boolean;
    message: string;
    conflicts?: any[];
    alternatives?: TimeSlot[];
  }> {
    const now = new Date();
    const appointmentDateTime = new Date(
      `${request.preferredDate.toISOString().split("T")[0]}T${request.preferredTime}`,
    );
    const minBookingTime = new Date(
      now.getTime() + this.config.minAdvanceBookingHours * 60 * 60 * 1000,
    );
    const maxBookingTime = new Date(
      now.getTime() + this.config.maxAdvanceBookingDays * 24 * 60 * 60 * 1000,
    );

    // Check minimum advance booking time
    if (appointmentDateTime < minBookingTime) {
      return {
        isValid: false,
        message: `Agendamentos devem ser feitos com pelo menos ${this.config.minAdvanceBookingHours} horas de antecedência.`,
      };
    }

    // Check maximum advance booking time
    if (appointmentDateTime > maxBookingTime) {
      return {
        isValid: false,
        message: `Agendamentos podem ser feitos com até ${this.config.maxAdvanceBookingDays} dias de antecedência.`,
      };
    }

    // Validate service exists
    const { data: service, error: serviceError } = await this.supabase
      .from("services")
      .select("id, name, is_active")
      .eq("id", request.serviceId)
      .single();

    if (serviceError || !service || !service.is_active) {
      return {
        isValid: false,
        message: "Serviço não encontrado ou não disponível.",
      };
    }
    // Validate staff exists and is available
    const { data: staff, error: staffError } = await this.supabase
      .from("staff")
      .select("id, name, is_active")
      .eq("id", request.staffId)
      .single();

    if (staffError || !staff || !staff.is_active) {
      return {
        isValid: false,
        message: "Profissional não encontrado ou não disponível.",
      };
    }

    return {
      isValid: true,
      message: "Validação bem-sucedida",
    };
  }

  /**
   * Get alternative time slots when preferred slot is not available
   */
  private async getAlternativeSlots(
    serviceId: string,
    preferredDate: Date,
    staffId: string,
  ): Promise<TimeSlot[]> {
    const startDate = new Date(preferredDate);
    const endDate = new Date(preferredDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days

    const alternatives = await this.getAvailableSlots(
      "", // We'll skip session validation for internal use
      "",
      serviceId,
      startDate,
      endDate,
      staffId,
    );

    return alternatives.slice(0, 5); // Return top 5 alternatives
  }
}
