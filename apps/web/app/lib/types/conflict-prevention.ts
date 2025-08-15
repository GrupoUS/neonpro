// =============================================
// NeonPro Conflict Prevention System Types
// Story 1.2: Advanced conflict detection types
// =============================================

import type { AppointmentWithRelations } from './appointments';

// Professional schedule interfaces
export interface ProfessionalSchedule {
  id: string;
  professional_id: string;
  clinic_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  max_appointments_per_hour: number;
  buffer_minutes_between: number;
  min_booking_notice_hours: number;
  max_booking_days_ahead: number;
  created_at: string;
  updated_at: string;
}

// Clinic holiday interfaces
export interface ClinicHoliday {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  start_date: string; // ISO date format
  end_date: string; // ISO date format
  start_time?: string; // HH:MM format for partial day closures
  end_time?: string; // HH:MM format for partial day closures
  is_recurring: boolean;
  recurrence_type?: 'yearly' | 'monthly' | 'weekly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Service type rules interfaces
export interface ServiceTypeRules {
  id: string;
  service_type_id: string;
  clinic_id: string;
  pre_service_buffer_minutes: number;
  post_service_buffer_minutes: number;
  min_booking_notice_hours: number;
  max_booking_days_ahead: number;
  allow_simultaneous_bookings: boolean;
  max_simultaneous_count: number;
  requires_deposit: boolean;
  cancellation_hours_notice: number;
  created_at: string;
  updated_at: string;
}

// Conflict detection types
export type ConflictType =
  | 'PAST_APPOINTMENT'
  | 'NO_SCHEDULE'
  | 'OUTSIDE_WORKING_HOURS'
  | 'DURING_BREAK'
  | 'CLINIC_HOLIDAY'
  | 'SHORT_NOTICE'
  | 'TOO_FAR_AHEAD'
  | 'APPOINTMENT_OVERLAP'
  | 'PRE_BUFFER_CONFLICT'
  | 'POST_BUFFER_CONFLICT'
  | 'HOURLY_CAPACITY_EXCEEDED'
  | 'SERVICE_SIMULTANEOUS_NOT_ALLOWED';

export type ConflictSeverity = 'error' | 'warning' | 'info';

export interface AppointmentConflict {
  type: ConflictType;
  message: string;
  severity: ConflictSeverity;
  details?: Record<string, any>;
  // Type-specific fields
  day_of_week?: number;
  working_hours?: {
    start: string;
    end: string;
  };
  break_time?: {
    start: string;
    end: string;
  };
  date?: string;
  required_notice_hours?: number;
  max_days_ahead?: number;
  conflict_count?: number;
  buffer_minutes?: number;
  max_per_hour?: number;
  current_count?: number;
}

// Alternative slot suggestion
export interface AlternativeSlot {
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  available: boolean;
  conflicts?: AppointmentConflict[];
  score?: number; // Preference score (higher = better)
  reason?: string; // Why this slot is suggested
}

// Validation request/response types
export interface SlotValidationRequest {
  professional_id: string;
  service_type_id: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  exclude_appointment_id?: string;
}

export interface SlotValidationResponse {
  success: boolean;
  available: boolean;
  conflicts: AppointmentConflict[];
  warnings: AppointmentConflict[];
  alternative_slots: AlternativeSlot[];
  validation_details: {
    appointment_date: string;
    appointment_time: string;
    day_of_week: number;
    duration_minutes: number;
    working_hours?: {
      start: string;
      end: string;
      break_start?: string;
      break_end?: string;
    };
    service_rules?: {
      pre_buffer_minutes: number;
      post_buffer_minutes: number;
      min_notice_hours: number;
      max_days_ahead: number;
    };
  };
  performance?: {
    validation_time_ms: number;
  };
}

// Enhanced appointment booking result
export interface BookingResult {
  success: boolean;
  appointment_id?: string;
  conflicts?: AppointmentConflict[];
  warnings?: AppointmentConflict[];
  created_at?: string;
  validation_details?: {
    duration_minutes: number;
    day_of_week: number;
    buffer_applied: {
      pre_buffer_minutes: number;
      post_buffer_minutes: number;
    };
  };
  error?: string;
  error_code?: string;
  sql_state?: string;
}

// Business rules configuration types
export interface WorkingHoursConfig {
  professional_id: string;
  schedules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start_time?: string;
    break_end_time?: string;
    is_available: boolean;
    max_appointments_per_hour: number;
    buffer_minutes_between: number;
  }>;
  default_settings: {
    min_booking_notice_hours: number;
    max_booking_days_ahead: number;
  };
}

export interface HolidayConfig {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_recurring: boolean;
  recurrence_type?: 'yearly' | 'monthly' | 'weekly';
}

// Availability checking types
export interface AvailabilityQuery {
  professional_id: string;
  service_type_id: string;
  date: string; // ISO date
  duration_minutes?: number;
  preferred_times?: string[]; // Array of HH:MM times
  exclude_appointment_id?: string;
}

export interface AvailabilitySlot {
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  available: boolean;
  conflicts: number;
  capacity_remaining: number;
  booking_urgency: 'low' | 'medium' | 'high'; // Based on availability
}

export interface AvailabilityResponse {
  date: string;
  professional_id: string;
  service_type_id: string;
  working_hours?: {
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  };
  slots: AvailabilitySlot[];
  summary: {
    total_slots: number;
    available_slots: number;
    peak_hours: string[]; // Hours with most availability
    recommended_times: string[]; // Best times to book
  };
  holidays: string[]; // Dates that are holidays
  restrictions: {
    min_notice_hours: number;
    max_days_ahead: number;
    requires_deposit: boolean;
    cancellation_notice_hours: number;
  };
}

// Professional availability overview
export interface ProfessionalAvailability {
  professional_id: string;
  name: string;
  specialization?: string;
  weekly_schedule: Array<{
    day: number;
    day_name: string;
    available: boolean;
    hours?: string; // "09:00 - 18:00"
    break?: string; // "12:00 - 13:00"
    slots_available: number;
    peak_hours: string[];
  }>;
  next_available: {
    date: string;
    time: string;
    datetime: string;
  };
  booking_rules: {
    min_notice_hours: number;
    max_days_ahead: number;
    buffer_between_minutes: number;
  };
}

// Conflict prevention settings
export interface ConflictPreventionSettings {
  clinic_id: string;
  global_settings: {
    default_buffer_minutes: number;
    max_appointments_per_hour: number;
    min_booking_notice_hours: number;
    max_booking_days_ahead: number;
    allow_double_booking: boolean;
    require_deposit_for_booking: boolean;
  };
  professional_overrides: Record<string, Partial<WorkingHoursConfig>>;
  service_type_overrides: Record<string, Partial<ServiceTypeRules>>;
  holiday_calendar: ClinicHoliday[];
  last_updated: string;
  updated_by: string;
}

// API response wrapper for conflict prevention
export interface ConflictPreventionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
  conflicts?: AppointmentConflict[];
  warnings?: AppointmentConflict[];
  timestamp: string;
  performance_ms?: number;
}

// Extended appointment type with conflict prevention data
export interface AppointmentWithConflictData extends AppointmentWithRelations {
  conflict_score?: number; // 0-10 scale (0 = no conflicts, 10 = major conflicts)
  buffer_violations?: AppointmentConflict[];
  schedule_warnings?: AppointmentConflict[];
  alternative_suggestions?: AlternativeSlot[];
  booking_urgency?: 'low' | 'medium' | 'high';
  cancellation_impact?: {
    affects_other_appointments: boolean;
    notice_period_violation: boolean;
    deposit_forfeit: boolean;
  };
}
// Professional schedule configuration for forms
export interface ProfessionalScheduleConfig {
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  max_appointments_per_hour: number;
  buffer_minutes_between: number;
  min_booking_notice_hours: number;
  max_booking_days_ahead: number;
}

// Clinic holiday configuration for forms
export interface HolidayConfig {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_recurring: boolean;
  recurrence_type?: 'yearly' | 'monthly' | 'weekly';
}

// Service type rule interface (better naming)
export interface ServiceTypeRule {
  id: string;
  service_type_id: string;
  clinic_id: string;
  minimum_duration: number;
  maximum_duration: number;
  buffer_before: number;
  buffer_after: number;
  max_daily_bookings?: number;
  requires_specific_professional: boolean;
  allowed_professional_ids?: string[];
  minimum_advance_hours: number;
  maximum_advance_days: number;
  allow_same_day: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service type rule configuration for forms
export interface ServiceTypeRuleConfig {
  service_type_id: string;
  minimum_duration: number;
  maximum_duration: number;
  buffer_before: number;
  buffer_after: number;
  max_daily_bookings?: number;
  requires_specific_professional: boolean;
  allowed_professional_ids: string[];
  minimum_advance_hours: number;
  maximum_advance_days: number;
  allow_same_day: boolean;
  description?: string;
}
