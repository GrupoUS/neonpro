// =============================================================================
// NeonPro Appointments System Types
// Purpose: TypeScript interfaces and types for appointment booking system
// =============================================================================

// Database enums
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ProfessionalSpecialty =
  | 'dermatologist'
  | 'aesthetician'
  | 'cosmetologist'
  | 'plastic_surgeon'
  | 'nutritionist'
  | 'physiotherapist';

// Service interface
export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  requires_evaluation: boolean;
  preparation_instructions?: string;
  post_care_instructions?: string;
  created_at: string;
  updated_at: string;
}

// Professional interface
export interface Professional {
  id: string;
  user_id?: string;
  name: string;
  specialty: ProfessionalSpecialty;
  license_number?: string;
  bio?: string;
  photo_url?: string;
  years_experience: number;
  is_active: boolean;
  accepts_new_patients: boolean;
  working_hours?: Record<string, any>;
  created_at: string;
  updated_at: string;
} // Time slot interface
export interface TimeSlot {
  id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_recurring: boolean;
  recurrence_pattern?: Record<string, any>;
  created_at: string;
}

// Appointment interface
export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  patient_notes?: string;
  professional_notes?: string;
  internal_notes?: string;
  booking_source: string;
  confirmation_code?: string;
  reminder_sent_at?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
}

// Appointment services junction
export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  order_index: number;
  estimated_duration: number;
  actual_duration?: number;
}

// Extended interfaces with relations
export interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  professional_name: string;
  professional_specialty: ProfessionalSpecialty;
  service_name: string;
  service_category: string;
  service_price?: number;
}

export interface AvailableTimeSlot {
  id: string;
  professional_id: string;
  professional_name: string;
  specialty: ProfessionalSpecialty;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

// Booking form interfaces
export interface BookingFormData {
  service_id: string;
  professional_id: string;
  scheduled_at: string;
  patient_notes?: string;
}

export interface BookingStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Booking wizard context
export interface BookingWizardState {
  currentStep: number;
  selectedService?: Service;
  selectedProfessional?: Professional;
  selectedTimeSlot?: AvailableTimeSlot;
  patientNotes: string;
  isLoading: boolean;
  error?: string;
}

// API response types
export interface ServiceCategory {
  category: string;
  services: Service[];
  icon?: string;
  description?: string;
}

export interface BookingResponse {
  success: boolean;
  appointment?: Appointment;
  confirmation_code?: string;
  error?: string;
}

// Availability checking
export interface AvailabilityRequest {
  professional_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD format
}

export interface AvailabilityResponse {
  date: string;
  available_slots: AvailableTimeSlot[];
  booked_slots: string[]; // ISO datetime strings
  unavailable_periods: Array<{
    start: string;
    end: string;
    reason: string;
  }>;
}

// Form validation types
export interface BookingValidation {
  service: boolean;
  professional: boolean;
  timeSlot: boolean;
  notes: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

export type { Service, Professional, TimeSlot, Appointment };
