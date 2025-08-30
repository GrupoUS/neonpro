import type { BaseEntity } from "./common";

/**
 * Appointment Interface - Enhanced based on Supabase Healthcare Schema
 * 
 * Reflects real database structure with advanced features:
 * - Multi-tenant isolation (clinic_id)
 * - WhatsApp/SMS reminders
 * - Priority system
 * - Comprehensive audit trail
 * - Room assignment
 */
export interface Appointment extends BaseEntity {
  // Core Identity & Multi-tenancy
  id: string;
  clinic_id: string;              // Multi-tenant isolation
  patient_id: string;             // FK to patients
  professional_id: string;        // FK to professionals
  service_type_id: string;        // FK to service_types
  room_id?: string;               // Optional room assignment

  // Scheduling Details
  start_time: string;             // ISO timestamp with timezone
  end_time: string;               // ISO timestamp with timezone
  status: AppointmentStatus;
  priority: number;               // 1-5 scale (1=lowest, 5=highest)

  // Notes & Documentation
  notes?: string;                 // Patient-visible notes
  internal_notes?: string;        // Staff-only notes

  // Communication & Reminders
  reminder_sent_at?: string;      // When reminder was sent
  confirmation_sent_at?: string;  // When confirmation was sent
  whatsapp_reminder_sent: boolean; // WhatsApp reminder status
  sms_reminder_sent: boolean;     // SMS reminder status

  // Cancellation Information
  cancelled_at?: string;          // When appointment was cancelled
  cancelled_by?: string;          // User ID who cancelled
  cancellation_reason?: string;   // Reason for cancellation

  // Audit Fields (BaseEntity extended)
  created_at: string;
  updated_at: string;
  created_by: string;             // User ID who created
  updated_by?: string;            // User ID who last updated
}

/**
 * Appointment Status Enum - Comprehensive workflow
 */
export enum AppointmentStatus {
  SCHEDULED = "scheduled",        // Initial booking
  CONFIRMED = "confirmed",        // Patient confirmed attendance
  CHECKED_IN = "checked_in",      // Patient arrived and checked in
  IN_PROGRESS = "in_progress",    // Currently being attended
  COMPLETED = "completed",        // Successfully completed
  CANCELLED = "cancelled",        // Cancelled before appointment
  NO_SHOW = "no_show",           // Patient didn't show up
  RESCHEDULED = "rescheduled"     // Moved to different time
}

/**
 * Appointment Priority Levels
 */
export enum AppointmentPriority {
  ROUTINE = 1,          // Regular appointment
  PREFERRED = 2,        // Preferred scheduling
  URGENT = 3,           // Needs attention soon
  EMERGENCY = 4,        // Emergency appointment
  CRITICAL = 5          // Critical/life-threatening
}

/**
 * Appointment Booking Request
 */
export interface AppointmentBookingRequest {
  // Required fields
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  start_time: string;             // ISO timestamp
  end_time: string;               // ISO timestamp

  // Optional fields
  room_id?: string;
  notes?: string;
  internal_notes?: string;
  priority?: AppointmentPriority;
  send_confirmation?: boolean;    // Send confirmation immediately
  send_reminder?: boolean;        // Schedule reminder
}

/**
 * Appointment Update Request
 */
export interface AppointmentUpdateRequest {
  // Rescheduling
  start_time?: string;
  end_time?: string;
  room_id?: string;

  // Status changes
  status?: AppointmentStatus;
  
  // Documentation
  notes?: string;
  internal_notes?: string;
  priority?: AppointmentPriority;

  // Cancellation
  cancellation_reason?: string;
}

/**
 * Appointment Query Parameters
 */
export interface AppointmentQueryParams {
  clinic_id: string;
  
  // Date filtering
  start_date?: string;            // ISO date (YYYY-MM-DD)
  end_date?: string;              // ISO date (YYYY-MM-DD)
  date?: string;                  // Specific date
  
  // Entity filtering
  patient_id?: string;            // Filter by patient
  professional_id?: string;      // Filter by professional
  room_id?: string;               // Filter by room
  service_type_id?: string;      // Filter by service type
  
  // Status filtering
  status?: AppointmentStatus[];   // Array of statuses
  priority?: AppointmentPriority[];
  
  // Boolean filters
  upcoming_only?: boolean;        // Only future appointments
  today_only?: boolean;           // Only today's appointments
  needs_reminder?: boolean;       // Reminder not sent
  
  // Pagination
  page?: number;
  limit?: number;
  sort_by?: 'start_time' | 'created_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

/**
 * Time Slot for Availability
 */
export interface TimeSlot {
  start_time: string;             // ISO timestamp
  end_time: string;               // ISO timestamp
  available: boolean;
  duration_minutes: number;
  professional_id: string;
  room_id?: string;
}

/**
 * Availability Query Parameters
 */
export interface AvailabilityParams {
  professional_id: string;
  date: string;                   // ISO date (YYYY-MM-DD)
  duration_minutes: number;       // Required appointment duration
  preferred_times?: string[];     // Preferred time slots
  exclude_lunch?: boolean;        // Exclude lunch hours
  business_hours_only?: boolean;  // Only during business hours
}

/**
 * Appointment Reminder Configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  methods: ReminderMethod[];
  advance_hours: number;          // Hours before appointment
  template_id?: string;           // Custom message template
}

export enum ReminderMethod {
  SMS = "sms",
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  PUSH = "push"
}

/**
 * Appointment Conflict Information
 */
export interface AppointmentConflict {
  type: ConflictType;
  conflicting_appointment: Appointment;
  message: string;
  can_override: boolean;
}

export enum ConflictType {
  PROFESSIONAL_DOUBLE_BOOKING = "professional_double_booking",
  ROOM_DOUBLE_BOOKING = "room_double_booking",
  PATIENT_DOUBLE_BOOKING = "patient_double_booking",
  OUTSIDE_BUSINESS_HOURS = "outside_business_hours",
  PROFESSIONAL_UNAVAILABLE = "professional_unavailable"
}

/**
 * Appointment Statistics (for dashboard)
 */
export interface AppointmentStats {
  total_appointments: number;
  by_status: Record<AppointmentStatus, number>;
  by_priority: Record<AppointmentPriority, number>;
  completion_rate: number;        // Percentage
  no_show_rate: number;          // Percentage
  average_duration_minutes: number;
  busiest_hours: Array<{
    hour: number;
    count: number;
  }>;
  reminder_effectiveness: {
    sent: number;
    attended: number;
    rate: number;
  };
}

/**
 * Appointment with Related Data (for detailed views)
 */
export interface AppointmentDetail extends Appointment {
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    photo_url?: string;
  };
  professional: {
    id: string;
    name: string;
    title: string;
    specialty: string[];
  };
  service_type: {
    id: string;
    name: string;
    duration_minutes: number;
    color?: string;
  };
  room?: {
    id: string;
    name: string;
    capacity: number;
  };
}