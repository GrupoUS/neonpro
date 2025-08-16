// app/lib/types/appointments.ts
// Enhanced Appointment Types for NeonPro
// Generated from database schema for Story 1.1

// Base types for database entities
export type DatabaseEntity = {
  id: string;
  created_at: string;
  updated_at: string;
};

export interface SoftDeletableEntity extends DatabaseEntity {
  deleted_at: string | null;
  deleted_reason: string | null;
}

export interface AuditableEntity extends SoftDeletableEntity {
  created_by?: string | null;
  updated_by?: string | null;
  change_reason?: string | null;
}

// Clinic Types
export interface Clinic extends DatabaseEntity {
  name: string;
  business_hours: BusinessHours;
  timezone: string;
}

export type BusinessHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export type DaySchedule = {
  start: string; // "HH:MM" format
  end: string; // "HH:MM" format
  enabled: boolean;
}; // Patient Types
export interface Patient extends SoftDeletableEntity {
  clinic_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  notes?: string | null;
}

export interface PatientWithRelations extends Patient {
  appointments?: Appointment[];
}

// Professional Types
export interface Professional extends SoftDeletableEntity {
  clinic_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  specialization?: string | null;
  license_number?: string | null;
  availability: BusinessHours;
}

export interface ProfessionalWithRelations extends Professional {
  appointments?: Appointment[];
  clinic?: Clinic;
}

// Service Type
export interface ServiceType extends SoftDeletableEntity {
  clinic_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price?: number | null;
  color: string;
}

// Appointment Types
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Appointment History for Audit Trail
export interface AppointmentHistoryEntry extends DatabaseEntity {
  appointment_id: string;
  action: 'create' | 'update' | 'cancel' | 'complete' | 'reschedule';
  changed_fields: string[];
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  change_reason?: string | null;
  changed_by: string;
  changed_by_name: string;
}
export interface Appointment extends AuditableEntity {
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string | null;
  internal_notes?: string | null;
  deleted_by?: string | null;
}

export interface AppointmentWithRelations extends Appointment {
  patient: Patient;
  professional: Professional;
  service_type: ServiceType;
  clinic?: Clinic;
  history?: AppointmentHistoryEntry[];
}

// Extended Appointment with Formatted Details for UI
export interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  patient_email?: string | null;
  patient_phone?: string | null;
  professional_name: string;
  service_name: string;
  service_duration: number;
  service_price?: number | null;
  service_color: string;
  clinic_name: string;
}

// Form Types for Frontend
export type CreateAppointmentFormData = {
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  start_time: Date;
  end_time?: Date;
  notes?: string;
  internal_notes?: string;
};

export interface UpdateAppointmentFormData
  extends Partial<CreateAppointmentFormData> {
  status?: AppointmentStatus;
  change_reason?: string;
}

// API Response Types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error_code?: string;
  error_message?: string;
};

export interface BookingResponse extends ApiResponse {
  appointment_id?: string;
}

// Calendar Types
export interface CalendarEvent extends Appointment {
  title: string;
  color: string;
  start: Date;
  end: Date;
}

// Filter Types
export type AppointmentFilters = {
  professional_id?: string;
  patient_id?: string;
  service_type_id?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  date_from?: Date;
  date_to?: Date;
  search_query?: string;
};

// Enhanced filter types for URL state management
export type AppointmentFilterParams = {
  professional?: string;
  service?: string;
  status?: string; // comma-separated for multiple values
  date_from?: string; // ISO date string
  date_to?: string; // ISO date string
  search?: string;
  view?: 'day' | 'week' | 'month';
};

// Filter options for dropdowns
export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterOptionsData = {
  professionals: FilterOption[];
  services: FilterOption[];
  statuses: FilterOption[];
};
// API Response Types
export type BookingResponse = {
  success: boolean;
  appointment_id?: string;
  message?: string;
  error_message?: string;
  error_details?: string;
};

export type ConflictCheckResponse = {
  has_conflict: boolean;
  conflicting_appointments?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    professional_name: string;
    patient_name: string;
  }>;
};

export type AvailableSlot = {
  slot_start: string;
  slot_end: string;
  is_available: boolean;
  duration_minutes: number;
};

export type AvailableSlotsResponse = {
  success: boolean;
  data: AvailableSlot[];
  error_message?: string;
};

export type AppointmentListResponse = {
  success: boolean;
  data: AppointmentWithRelations[];
  total_count: number;
  error_message?: string;
};

// Sidebar-specific Response Types
export type AppointmentDetailsResponse = {
  success: boolean;
  data: AppointmentWithDetails;
  error_message?: string;
};

export type AppointmentHistoryResponse = {
  success: boolean;
  data: AppointmentHistoryEntry[];
  total_count: number;
  error_message?: string;
};

export type UpdateAppointmentResponse = {
  success: boolean;
  data?: AppointmentWithDetails;
  conflicts?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    professional_name: string;
    patient_name: string;
  }>;
  error_message?: string;
  error_details?: string;
};
