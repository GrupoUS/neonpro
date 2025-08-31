import type { BaseEntity } from "./common";

/**
 * Professional Interface - Healthcare Provider
 *
 * Based on Supabase validation with Brazilian healthcare requirements:
 * - Professional licenses (CRM, CRF, CREFITO, etc.)
 * - Specialty management
 * - Multi-tenant clinic association
 * - Access control and permissions
 */
export interface Professional extends BaseEntity {
  // Core Identity
  id: string;
  clinic_id: string; // Multi-tenant isolation
  user_id: string; // Link to auth.users table

  // Professional Identity
  full_name: string;
  professional_title: string; // "Dr.", "Enf.", "Fisio.", "Psic.", etc.
  medical_license: string; // License number (CRM, CRF, etc.)
  professional_license: string; // Alternative license field
  specialty: string[]; // Array of medical specialties
  department?: string; // Department/area within clinic

  // Employment Status
  is_active: boolean; // Currently active
  hire_date?: string; // ISO date
  termination_date?: string; // ISO date (if terminated)

  // Access Control & Permissions
  access_level: number; // 1-5 hierarchy level
  can_access_all_patients: boolean; // Unrestricted patient access
  restricted_areas: string[]; // Array of restricted areas/modules
  permissions: Record<string, boolean>; // Granular permissions

  // Contact Information
  phone?: string;
  email?: string;

  // System Fields
  created_at: string;
  updated_at: string;
}

/**
 * Brazilian Medical License Types
 */
export enum BrazilianLicenseType {
  CRM = "CRM", // Conselho Regional de Medicina
  CRF = "CRF", // Conselho Regional de Farmácia
  COREN = "COREN", // Conselho Regional de Enfermagem
  CREFITO = "CREFITO", // Fisioterapia e Terapia Ocupacional
  CRP = "CRP", // Conselho Regional de Psicologia
  CFN = "CFN", // Conselho Federal de Nutricionistas
  CRO = "CRO", // Conselho Regional de Odontologia
  COFFITO = "COFFITO", // Conselho Federal de Fisioterapia
}

/**
 * Medical Specialties (common Brazilian specialties)
 */
export enum MedicalSpecialty {
  // Clinical Specialties
  CARDIOLOGY = "cardiologia",
  DERMATOLOGY = "dermatologia",
  ENDOCRINOLOGY = "endocrinologia",
  GASTROENTEROLOGY = "gastroenterologia",
  NEUROLOGY = "neurologia",
  OPHTHALMOLOGY = "oftalmologia",
  ORTHOPEDICS = "ortopedia",
  PEDIATRICS = "pediatria",
  PSYCHIATRY = "psiquiatria",

  // Surgical Specialties
  GENERAL_SURGERY = "cirurgia_geral",
  PLASTIC_SURGERY = "cirurgia_plastica",
  CARDIAC_SURGERY = "cirurgia_cardiaca",

  // Other Healthcare Professions
  PHYSIOTHERAPY = "fisioterapia",
  PSYCHOLOGY = "psicologia",
  NUTRITION = "nutricao",
  NURSING = "enfermagem",
  PHARMACY = "farmacia",
  DENTISTRY = "odontologia",
  OCCUPATIONAL_THERAPY = "terapia_ocupacional",
}

/**
 * Professional Access Levels
 */
export enum AccessLevel {
  INTERN = 1, // Trainee/intern level
  ASSISTANT = 2, // Assistant professional
  SPECIALIST = 3, // Specialist level
  SENIOR = 4, // Senior professional
  DIRECTOR = 5, // Department director/chief
}

/**
 * Professional Creation Request
 */
export interface CreateProfessionalRequest {
  // Required fields
  user_id: string;
  full_name: string;
  professional_title: string;
  medical_license: string;
  specialty: string[];

  // Optional fields
  professional_license?: string;
  department?: string;
  phone?: string;
  email?: string;
  hire_date?: string;
  access_level?: AccessLevel;
  can_access_all_patients?: boolean;
  restricted_areas?: string[];
  permissions?: Record<string, boolean>;
}

/**
 * Professional Update Request
 */
export interface UpdateProfessionalRequest extends Partial<CreateProfessionalRequest> {
  is_active?: boolean;
  termination_date?: string;
}

/**
 * Professional Query Parameters
 */
export interface ProfessionalQueryParams {
  clinic_id: string;

  // Status filters
  active_only?: boolean;
  department?: string;
  specialty?: string[];
  access_level?: AccessLevel[];

  // Search
  search?: string; // Search in name, license, email

  // Availability
  available_for_appointments?: boolean;
  available_on_date?: string; // ISO date

  // Pagination
  page?: number;
  limit?: number;
  sort_by?: "full_name" | "hire_date" | "access_level";
  sort_order?: "asc" | "desc";
}

/**
 * Professional Schedule Configuration
 */
export interface ProfessionalSchedule {
  professional_id: string;

  // Weekly schedule
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;

  // Break times
  lunch_break: TimeRange;
  other_breaks?: TimeRange[];

  // Configuration
  appointment_duration_minutes: number;
  buffer_time_minutes: number; // Time between appointments
  max_daily_appointments?: number;
  timezone: string; // Default: 'America/Sao_Paulo'
}

export interface DaySchedule {
  enabled: boolean;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  break_times?: TimeRange[];
}

export interface TimeRange {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  description?: string;
}

/**
 * Professional Statistics
 */
export interface ProfessionalStats {
  professional_id: string;

  // Appointment statistics
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;

  // Performance metrics
  completion_rate: number; // Percentage
  punctuality_score: number; // Average delay in minutes
  patient_satisfaction?: number; // If available

  // Workload
  average_daily_appointments: number;
  busiest_day_of_week: string;
  peak_hours: string[];

  // Time period
  period_start: string; // ISO date
  period_end: string; // ISO date
}

/**
 * Professional with Related Data
 */
export interface ProfessionalDetail extends Professional {
  // Current schedule
  schedule?: ProfessionalSchedule;

  // Recent statistics
  stats?: ProfessionalStats;

  // Upcoming appointments count
  upcoming_appointments: number;

  // Last login info (if available)
  last_login?: string;

  // Professional photo/avatar
  avatar_url?: string;
}

/**
 * Professional Availability Response
 */
export interface ProfessionalAvailability {
  professional_id: string;
  date: string; // ISO date
  available_slots: TimeSlot[];
  total_slots: number;
  booked_slots: number;
  availability_percentage: number;
}

/**
 * License Validation Result
 */
export interface LicenseValidation {
  license_number: string;
  license_type: BrazilianLicenseType;
  state: string; // Brazilian state code
  is_valid: boolean;
  is_active: boolean;
  professional_name?: string; // If available from registry
  specialties?: string[]; // Registered specialties
  expiry_date?: string; // ISO date
  verification_date: string; // ISO timestamp
  verification_source: string; // Registry API or manual
}

/**
 * Time Slot (reused from appointments)
 */
interface TimeSlot {
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  available: boolean;
  duration_minutes: number;
}
