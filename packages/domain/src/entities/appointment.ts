/**
 * Appointment Entity - Single source of truth for appointment data
 */
export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
  RESCHEDULED = "rescheduled"
}

/**
 * Appointment priority levels
 */
export enum AppointmentPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  EMERGENCY = 5
}

/**
 * Appointment type enum
 */
export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOW_UP = "follow_up",
  EMERGENCY = "emergency",
  PROCEDURE = "procedure",
  SURGERY = "surgery",
  THERAPY = "therapy",
  VACCINATION = "vaccination",
  CHECK_UP = "check_up"
}

/**
 * Appointment cancellation reasons
 */
export enum CancellationReason {
  PATIENT_CANCELLED = "patient_cancelled",
  PROFESSIONAL_CANCELLED = "professional_cancelled",
  CLINIC_CANCELLED = "clinic_cancelled",
  NO_SHOW = "no_show",
  MEDICAL_REASON = "medical_reason",
  SCHEDULING_ERROR = "scheduling_error",
  OTHER = "other"
}

/**
 * Appointment Entity
 */
export interface Appointment {
  // Core identification
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  serviceTypeId?: string;
  
  // Timing information
  startTime: string;
  endTime: string;
  duration?: number; // in minutes
  
  // Status and metadata
  status: AppointmentStatus;
  priority?: AppointmentPriority;
  type: AppointmentType;
  
  // Details and notes
  notes?: string;
  internalNotes?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  
  // Notifications and reminders
  reminderSentAt?: string;
  confirmationSentAt?: string;
  whatsappReminderSent?: boolean;
  smsReminderSent?: boolean;
  emailReminderSent?: boolean;
  
  // Room and location
  roomId?: string;
  location?: string;
  virtualMeetingLink?: string;
  
  // Cancellation information
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: CancellationReason;
  cancellationNotes?: string;
  
  // Rescheduling information
  rescheduledFrom?: string;
  rescheduledTo?: string;
  
  // Billing information
  billingCode?: string;
  insuranceApproved?: boolean;
  cost?: number;
  paidAmount?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Calendar-specific properties for UI integration
 */
export interface AppointmentCalendarView extends Omit<Appointment, 'notes' | 'internalNotes'> {
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  description?: string;
  allDay?: boolean;
  resource?: any;
}

/**
 * Appointment validation utilities
 */
export class AppointmentValidator {
  /**
   * Validate appointment time conflicts
   */
  static validateNoConflicts(
    appointment: Appointment,
    existingAppointments: Appointment[]
  ): string[] {
    const errors: string[] = [];
    
    for (const existing of existingAppointments) {
      if (existing.id === appointment.id) continue;
      
      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existing.endTime);
      
      // Check for overlap
      if (
        appointmentStart < existingEnd &&
        appointmentEnd > existingStart &&
        existing.professionalId === appointment.professionalId
      ) {
        errors.push(`Time conflict with appointment ${existing.id}`);
      }
    }
    
    return errors;
  }

  /**
   * Validate appointment timing
   */
  static validateTiming(appointment: Appointment): string[] {
    const errors: string[] = [];
    
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    if (startTime >= endTime) {
      errors.push('Start time must be before end time');
    }
    
    if (startTime < new Date()) {
      errors.push('Cannot schedule appointments in the past');
    }
    
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (duration < 5) {
      errors.push('Appointment duration must be at least 5 minutes');
    }
    
    return errors;
  }

  /**
   * Validate required fields
   */
  static validateRequired(appointment: Appointment): string[] {
    const errors: string[] = [];
    
    if (!appointment.id) errors.push('Appointment ID is required');
    if (!appointment.clinicId) errors.push('Clinic ID is required');
    if (!appointment.patientId) errors.push('Patient ID is required');
    if (!appointment.professionalId) errors.push('Professional ID is required');
    if (!appointment.startTime) errors.push('Start time is required');
    if (!appointment.endTime) errors.push('End time is required');
    if (!appointment.status) errors.push('Status is required');
    if (!appointment.type) errors.push('Type is required');
    
    return errors;
  }
}

/**
 * Appointment factory methods
 */
export class AppointmentFactory {
  /**
   * Create a new appointment
   */
  static create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const _now = new Date().toISOString();
    
    return {
      ...data,
      id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: data.status || AppointmentStatus.SCHEDULED,
      type: data.type || AppointmentType.CONSULTATION,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Convert appointment to calendar view
   */
  static toCalendarView(appointment: Appointment): AppointmentCalendarView {
    return {
      ...appointment,
      title: `Appointment - ${appointment.patientId}`,
      start: appointment.startTime,
      end: appointment.endTime,
      description: appointment.notes || '',
      color: this.getStatusColor(appointment.status),
    };
  }

  /**
   * Get color for appointment status
   */
  private static getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return '#3B82F6'; // blue
      case AppointmentStatus.CONFIRMED:
        return '#10B981'; // green
      case AppointmentStatus.IN_PROGRESS:
        return '#F59E0B'; // yellow
      case AppointmentStatus.COMPLETED:
        return '#6B7280'; // gray
      case AppointmentStatus.CANCELLED:
        return '#EF4444'; // red
      case AppointmentStatus.NO_SHOW:
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  }
}