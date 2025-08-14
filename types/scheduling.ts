/**
 * TypeScript Type Definitions
 * NeonPro Intelligent Scheduling System
 * 
 * Complete type definitions for the scheduling system
 * with strict typing for database entities and API responses
 */

// Database Entity Types
export interface Patient {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  external_ids?: Record<string, any>;
  given_names: string[];
  family_name: string;
  full_name: string;
  preferred_name?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  is_active: boolean;
  deceased_indicator: boolean;
  deceased_date?: string;
  data_consent_status: 'granted' | 'denied' | 'pending' | 'withdrawn';
  data_consent_date?: string;
  data_retention_until?: string;
  data_source: 'manual' | 'import' | 'api' | 'migration';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Professional {
  id: string;
  clinic_id: string;
  user_id?: string;
  full_name: string;
  specialization?: string;
  license_number?: string;
  phone?: string;
  email?: string;
  color: string;
  is_active: boolean;
  can_work_weekends: boolean;
  default_start_time: string;
  default_end_time: string;
  default_break_start: string;
  default_break_end: string;
  service_type_ids?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ServiceType {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  color: string;
  requires_room: boolean;
  requires_equipment?: string[];
  preparation_time_minutes: number;
  cleanup_time_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  effective_from?: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show' 
  | 'rescheduled';

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  status: AppointmentStatus;
  start_time: string;
  end_time: string;
  notes?: string;
  internal_notes?: string;
  reminder_sent_at?: string;
  confirmation_sent_at?: string;
  whatsapp_reminder_sent: boolean;
  sms_reminder_sent: boolean;
  room_id?: string;
  priority: number; // 1-5, 1=lowest, 5=highest
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
}

// Extended Appointment with Relations
export interface AppointmentWithRelations extends Appointment {
  patients: Patient;
  professionals: Professional;
  service_types: ServiceType;
  rooms?: Room;
}

export type ConflictType = 
  | 'time_overlap' 
  | 'professional_unavailable' 
  | 'room_conflict' 
  | 'equipment_conflict' 
  | 'business_rule';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ConflictResolutionStatus = 'unresolved' | 'resolved' | 'ignored';

export interface AppointmentConflict {
  id: string;
  appointment_id?: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  conflicting_appointment_id?: string;
  resolution_status: ConflictResolutionStatus;
  resolution_action?: string;
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export type WaitingListStatus = 
  | 'waiting' 
  | 'offered' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'cancelled';

export interface WaitingListEntry {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id?: string;
  service_type_id: string;
  preferred_date?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  flexible_timing: boolean;
  priority: number;
  status: WaitingListStatus;
  notes?: string;
  offered_appointment_id?: string;
  offered_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type ReminderType = 'sms' | 'whatsapp' | 'email' | 'call';

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_type: ReminderType;
  scheduled_for: string;
  sent_at?: string;
  status: ReminderStatus;
  message_content?: string;
  external_message_id?: string;
  error_message?: string;
  created_at: string;
}

export interface Room {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  capacity: number;
  equipment?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateAppointmentRequest {
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  start_time: Date;
  end_time: Date;
  notes?: string;
  internal_notes?: string;
  priority?: number;
  room_id?: string;
  reminder_preferences?: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    hours_before: number;
  };
}

export interface CreateAppointmentResponse {
  success: boolean;
  appointment_id?: string;
  message?: string;
  error_message?: string;
  conflicts?: ConflictDetectionResult[];
}

export interface ConflictDetectionRequest {
  appointment_id?: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  room_id?: string;
  service_type_id?: string;
}

export interface SchedulingConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  resourceId?: string;
  resourceType?: 'room' | 'equipment' | 'service' | 'staff';
  conflictDescription: string;
  affectedAppointments: string[];
  suggestedActions: string[];
}

export interface ResolutionOption {
  id: string;
  type: 'reschedule' | 'reassign' | 'waitlist' | 'split' | 'escalate';
  confidence: number; // 0-1
  description: string;
  impact: 'minimal' | 'low' | 'medium' | 'high' | 'significant';
  alternativeSlots?: AvailableSlot[];
  resourceAlternatives?: any[];
  estimatedResolutionTime: number; // minutes
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: SchedulingConflict[];
  resolutionOptions: ResolutionOption[];
  processingTimeMs: number;
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  is_available: boolean;
  conflicts?: string[];
  professional_id: string;
  room_id?: string;
}

export interface AvailableSlotsRequest {
  professional_id: string;
  date: string; // YYYY-MM-DD
  duration_minutes?: number;
  service_type_id?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
}

export interface AvailableSlotsResponse {
  date: string;
  professional_id: string;
  slots: AvailableSlot[];
  total_slots: number;
  available_slots: number;
  business_hours: {
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  };
}

// Form Types
export interface AppointmentFormData {
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  date: Date;
  time: string;
  duration_minutes: number;
  notes?: string;
  internal_notes?: string;
  priority: number;
  room_id?: string;
  reminder_preferences?: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    hours_before: number;
  };
}

export interface ProfessionalScheduleFormData {
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  effective_from?: Date;
  effective_until?: Date;
}

// Component Props Types
export interface CalendarViewProps {
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onTimeSlotClick?: (date: Date, time: string, professionalId?: string) => void;
  onCreateAppointment?: () => void;
  selectedProfessional?: string;
  viewMode?: 'month' | 'week' | 'day';
}

export interface AppointmentFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedProfessional?: string;
  patientId?: string;
  onSuccess?: (appointmentId: string) => void;
  onCancel?: () => void;
  editingAppointment?: {
    id: string;
    patient_id: string;
    professional_id: string;
    service_type_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
    internal_notes?: string;
    priority: number;
    room_id?: string;
  };
}

export interface ConflictDetectionProps {
  appointmentStart: Date;
  appointmentEnd: Date;
  professionalId: string;
  treatmentType: string;
  roomId?: string;
  equipmentIds?: string[];
  onConflictDetected?: (result: ConflictDetectionResult) => void;
  onResolutionSelected?: (option: ResolutionOption) => void;
  autoDetect?: boolean;
}

export interface ProfessionalScheduleManagerProps {
  professionalId?: string;
  onScheduleUpdate?: () => void;
}

// Analytics and Reporting Types
export interface AppointmentAnalytics {
  total_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  confirmation_rate: number;
  completion_rate: number;
  average_duration: number;
  most_popular_times: Array<{
    time_slot: string;
    appointment_count: number;
    occupancy_rate: number;
  }>;
  professional_utilization: Array<{
    professional_id: string;
    professional_name: string;
    total_slots: number;
    booked_slots: number;
    utilization_rate: number;
  }>;
}

export interface SchedulingMetrics {
  date_range: {
    start: string;
    end: string;
  };
  total_capacity: number;
  total_booked: number;
  occupancy_rate: number;
  conflicts_detected: number;
  conflicts_resolved: number;
  average_booking_lead_time: number; // days
  peak_hours: string[];
  seasonal_trends: Array<{
    period: string;
    booking_volume: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

// Error Types
export interface SchedulingError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// WhatsApp Integration Types
export interface WhatsAppReminderConfig {
  enabled: boolean;
  template_id: string;
  hours_before: number[];
  include_appointment_details: boolean;
  include_preparation_instructions: boolean;
}

export interface WhatsAppMessage {
  id: string;
  appointment_id: string;
  phone_number: string;
  message_content: string;
  template_used?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  external_message_id?: string;
}

// Virtual Waiting Room Types
export interface WaitingRoomEntry {
  id: string;
  appointment_id: string;
  patient_id: string;
  check_in_time: string;
  estimated_wait_time: number; // minutes
  position_in_queue: number;
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'left';
  notification_preferences: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  updated_at: string;
}

export interface WaitingRoomStatus {
  total_waiting: number;
  average_wait_time: number;
  current_queue: Array<{
    position: number;
    patient_name: string;
    appointment_time: string;
    estimated_delay: number;
    status: string;
  }>;
  next_available_slot?: string;
}

// LGPD Compliance Types
export interface DataProcessingConsent {
  id: string;
  patient_id: string;
  consent_type: 'scheduling' | 'reminders' | 'analytics' | 'marketing';
  granted: boolean;
  granted_at?: string;
  withdrawn_at?: string;
  legal_basis: string;
  retention_period: number; // days
  purpose_description: string;
  data_categories: string[];
  third_party_sharing: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataRetentionPolicy {
  entity_type: 'appointment' | 'patient' | 'professional' | 'conflict';
  retention_period_days: number;
  auto_delete: boolean;
  anonymization_rules: Array<{
    field: string;
    method: 'hash' | 'mask' | 'remove' | 'generalize';
  }>;
  legal_basis: string;
  exceptions: string[];
}

// Export all types for easy importing
export type {
  // Add any additional type aliases here if needed
};