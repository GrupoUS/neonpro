/**
 * Appointment Model (T033)
 * Comprehensive appointment management for Brazilian healthcare
 *
 * Features:
 * - Appointment scheduling with Brazilian business hours
 * - Status tracking and no-show management
 * - Reminder settings with WhatsApp support
 * - Conflict detection and validation
 * - Cost calculation and billing integration
 * - LGPD compliance for appointment data
 */

// Appointment status enum
export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
  RESCHEDULED = "rescheduled",
}

// Appointment type enum
export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOW_UP = "follow_up",
  PROCEDURE = "procedure",
  EMERGENCY = "emergency",
  AESTHETIC = "aesthetic",
  PREVENTIVE = "preventive",
  TELEMEDICINE = "telemedicine",
}

// Reminder method enum
export enum ReminderMethod {
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
  PUSH = "push",
  CALL = "call",
}

// Reminder settings interface
export interface ReminderSettings {
  enabled: boolean;
  methods: (ReminderMethod | string)[];
  timeBefore: number[]; // hours before appointment
  customMessage?: string;
  language?: "pt-BR" | "en-US";
}

// Appointment recurrence interface
export interface RecurrenceSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // every N frequency units
  endDate?: Date;
  maxOccurrences?: number;
}

// Main appointment interface
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string; // healthcare provider/doctor

  // Basic information
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  duration?: number; // minutes

  // Status and type
  status: AppointmentStatus | string;
  type: AppointmentType | string;

  // Location and logistics
  location?: string;
  room?: string;
  facility?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;

  // Reminders and notifications
  reminderSettings?: ReminderSettings;
  recurrence?: RecurrenceSettings;

  // Financial information
  cost?: number;
  paid?: boolean;
  paymentMethod?: string;
  insuranceCovered?: boolean;

  // Cancellation and no-show tracking
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  noShowAt?: Date;
  rescheduleCount?: number;

  // Notes and additional information
  notes?: string;
  privateNotes?: string; // only visible to staff
  tags?: string[];
  priority?: "low" | "normal" | "high" | "urgent";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;

  // LGPD compliance
  accessLog?: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;
}

// Validate appointment times
export function validateAppointmentTimes(
  startTime: Date,
  endTime: Date,
): boolean {
  if (!startTime || !endTime) {
    return false;
  }

  if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
    return false;
  }

  return startTime < endTime;
}

// Check for appointment conflicts
export function checkAppointmentConflict(
  existing: { startTime: Date; endTime: Date },
  proposed: { startTime: Date; endTime: Date },
): boolean {
  // Check if proposed appointment overlaps with existing one
  return (
    (proposed.startTime >= existing.startTime &&
      proposed.startTime < existing.endTime) ||
    (proposed.endTime > existing.startTime &&
      proposed.endTime <= existing.endTime) ||
    (proposed.startTime <= existing.startTime &&
      proposed.endTime >= existing.endTime)
  );
}

// Calculate appointment duration in minutes
export function calculateAppointmentDuration(
  startTime: Date,
  endTime: Date,
): number {
  if (!validateAppointmentTimes(startTime, endTime)) {
    return 0;
  }

  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}

// Format appointment for display
export function formatAppointmentForDisplay(
  appointment: Partial<Appointment> & { patientName?: string },
): string {
  const parts: string[] = [];

  if (appointment.title) {
    parts.push(appointment.title);
  }

  if (appointment.startTime) {
    const timeStr = appointment.startTime.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    parts.push(`Data: ${timeStr}`);
  }

  if (appointment.patientName) {
    parts.push(`Paciente: ${appointment.patientName}`);
  }

  if (appointment.location) {
    parts.push(`Local: ${appointment.location}`);
  }

  if (appointment.duration) {
    parts.push(`Duração: ${appointment.duration} min`);
  }

  return parts.join(" | ");
}

// Check if appointment is within Brazilian business hours
export function isWithinBusinessHours(dateTime: Date): boolean {
  const dayOfWeek = dateTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = dateTime.getHours();

  // Check if it's a weekday (Monday to Friday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false; // Weekend
  }

  // Check if it's within business hours (8 AM to 6 PM)
  if (hour < 8 || hour >= 18) {
    return false;
  }

  return true;
}

// Cancel appointment
export function cancelAppointment(
  appointment: Partial<Appointment>,
  reason: string,
  cancelledBy?: string,
): Partial<Appointment> {
  return {
    ...appointment,
    status: AppointmentStatus.CANCELLED,
    cancellationReason: reason,
    cancelledAt: new Date(),
    cancelledBy: cancelledBy || "system",
    updatedAt: new Date(),
  };
}

// Mark appointment as no-show
export function markAsNoShow(
  appointment: Partial<Appointment>,
): Partial<Appointment> {
  return {
    ...appointment,
    status: AppointmentStatus.NO_SHOW,
    noShowAt: new Date(),
    updatedAt: new Date(),
  };
}

// Calculate appointment cost
export function calculateAppointmentCost(
  appointment: { type: string; duration?: number; providerId?: string },
  priceTable: Record<string, number>,
): number {
  const basePrice = priceTable[appointment.type] || 0;

  // Apply duration multiplier if needed
  if (appointment.duration && appointment.duration > 60) {
    const extraTime = appointment.duration - 60;
    const extraCost = (extraTime / 30) * (basePrice * 0.5); // 50% of base price per 30 min
    return basePrice + extraCost;
  }

  return basePrice;
}

// Anonymize appointment for LGPD compliance
export function anonymizeAppointment(
  appointment: Partial<Appointment>,
): Partial<Appointment> {
  const anonymized = { ...appointment };

  if (anonymized.title) {
    anonymized.title = `CONSULTA ANONIMIZADA - ${Date.now()}`;
  }

  if (anonymized.description) {
    anonymized.description = `DESCRIÇÃO ANONIMIZADA - ${Date.now()}`;
  }

  if (anonymized.notes) {
    anonymized.notes = `NOTAS ANONIMIZADAS - ${Date.now()}`;
  }

  if (anonymized.privateNotes) {
    anonymized.privateNotes = `NOTAS PRIVADAS ANONIMIZADAS - ${Date.now()}`;
  }

  if (anonymized.cancellationReason) {
    anonymized.cancellationReason = "MOTIVO ANONIMIZADO";
  }

  return anonymized;
}

// Create appointment with defaults
export function createAppointment(
  data: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "status">,
): Appointment {
  const now = new Date();

  return {
    ...data,
    id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: AppointmentStatus.SCHEDULED,
    createdAt: now,
    updatedAt: now,
    duration:
      data.duration ||
      calculateAppointmentDuration(data.startTime, data.endTime),
  };
}

// Get appointments for a specific date range
export function getAppointmentsInRange(
  appointments: Appointment[],
  startDate: Date,
  endDate: Date,
): Appointment[] {
  return appointments.filter(
    (appointment) =>
      appointment.startTime >= startDate && appointment.startTime <= endDate,
  );
}

// Get upcoming appointments
export function getUpcomingAppointments(
  appointments: Appointment[],
  days: number = 7,
): Appointment[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return appointments
    .filter(
      (appointment) =>
        appointment.startTime >= now &&
        appointment.startTime <= futureDate &&
        appointment.status !== AppointmentStatus.CANCELLED,
    )
    .sort((a, _b) => a.startTime.getTime() - b.startTime.getTime());
}

// Check if appointment needs reminder
export function needsReminder(appointment: Appointment): boolean {
  if (!appointment.reminderSettings?.enabled) {
    return false;
  }

  const now = new Date();
  const appointmentTime = appointment.startTime;
  const hoursUntilAppointment =
    (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return appointment.reminderSettings.timeBefore.some(
    (hours) => Math.abs(hoursUntilAppointment - hours) < 0.5, // Within 30 minutes of reminder time
  );
}

// Get appointment statistics
export function getAppointmentStatistics(appointments: Appointment[]): {
  total: number;
  byStatus: Record<string, number>;
  noShowRate: number;
  averageDuration: number;
} {
  const total = appointments.length;
  const byStatus: Record<string, number> = {};
  let totalDuration = 0;
  let noShows = 0;

  appointments.forEach((appointment) => {
    byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;

    if (appointment.duration) {
      totalDuration += appointment.duration;
    }

    if (appointment.status === AppointmentStatus.NO_SHOW) {
      noShows++;
    }
  });

  return {
    total,
    byStatus,
    noShowRate: total > 0 ? (noShows / total) * 100 : 0,
    averageDuration: total > 0 ? totalDuration / total : 0,
  };
}
