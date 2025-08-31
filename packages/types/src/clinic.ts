import type { BaseEntity } from "./common";

/**
 * Clinic Interface - Multi-tenant Healthcare Organization
 *
 * Based on Supabase validation with Brazilian business requirements:
 * - CNPJ (Brazilian corporate tax ID)
 * - State registration (Inscrição Estadual)
 * - Multi-location support
 * - Brazilian address format
 */
export interface Clinic extends BaseEntity {
  // Core Identity
  id: string;
  clinic_code: string; // Unique business identifier

  // Business Information
  clinic_name: string; // Commercial name
  legal_name?: string; // Legal registered name
  tax_id?: string; // CNPJ (Brazilian corporate tax ID)
  state_registration?: string; // Inscrição Estadual
  municipal_registration?: string; // Inscrição Municipal

  // Contact Information
  email?: string;
  phone?: string;
  website?: string;

  // Address (Brazilian format)
  address_line1?: string; // Street address
  address_line2?: string; // Complement (apt, suite, etc.)
  city?: string;
  state?: string; // Brazilian state code (SP, RJ, etc.)
  postal_code?: string; // CEP format (00000-000)
  country?: string; // Default: 'Brazil'
  neighborhood?: string; // Bairro (Brazilian addressing)

  // Business Settings
  business_type?: BusinessType;
  specialties?: string[]; // Main clinic specialties
  services_offered?: string[]; // List of services

  // Configuration
  settings: ClinicSettings;

  // Status
  is_active: boolean;
  subscription_status: SubscriptionStatus;

  // System Fields
  created_at: string;
  updated_at: string;
}

/**
 * Brazilian Healthcare Business Types
 */
export enum BusinessType {
  MEDICAL_CLINIC = "clinica_medica",
  DENTAL_CLINIC = "clinica_odontologica",
  PHYSIOTHERAPY_CLINIC = "clinica_fisioterapia",
  PSYCHOLOGY_CLINIC = "clinica_psicologia",
  NUTRITION_CLINIC = "clinica_nutricao",
  MULTI_SPECIALTY = "multispecialidade",
  HOSPITAL = "hospital",
  DIAGNOSTIC_CENTER = "centro_diagnostico",
  REHABILITATION_CENTER = "centro_reabilitacao",
  AESTHETIC_CLINIC = "clinica_estetica",
}

/**
 * Subscription Status for SaaS model
 */
export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

/**
 * Comprehensive Clinic Settings
 */
export interface ClinicSettings {
  // Basic Configuration
  timezone: string; // Default: 'America/Sao_Paulo'
  locale: string; // Default: 'pt-BR'
  currency: string; // Default: 'BRL'

  // Business Hours
  business_hours: BusinessHours;

  // Appointment Settings
  appointment_settings: AppointmentSettings;

  // Communication Settings
  communication: CommunicationSettings;

  // LGPD & Compliance
  compliance: ComplianceSettings;

  // Integration Settings
  integrations: IntegrationSettings;

  // UI/UX Settings
  branding: BrandingSettings;

  // Feature Flags
  features: FeatureFlags;
}

/**
 * Business Hours Configuration
 */
export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;

  // Holiday and exception handling
  holidays: Holiday[];
  exceptions: DateException[];
}

export interface DayHours {
  enabled: boolean;
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  lunch_break?: TimeBreak;
  other_breaks?: TimeBreak[];
}

export interface TimeBreak {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  description: string;
}

export interface Holiday {
  date: string; // ISO date or MM-DD for annual
  name: string;
  is_annual: boolean;
}

export interface DateException {
  date: string; // ISO date
  is_closed: boolean;
  custom_hours?: DayHours;
  reason: string;
}

/**
 * Appointment Configuration
 */
export interface AppointmentSettings {
  // Default durations (minutes)
  default_duration: number;
  minimum_duration: number;
  maximum_duration: number;

  // Booking rules
  advance_booking_days: number; // How far ahead patients can book
  minimum_notice_hours: number; // Minimum notice for cancellation
  allow_online_booking: boolean;
  require_confirmation: boolean;

  // Reminders
  reminder_settings: ReminderSettings;

  // No-show handling
  no_show_policy: NoShowPolicy;

  // Overbooking
  allow_overbooking: boolean;
  overbooking_percentage: number;
}

export interface ReminderSettings {
  enabled: boolean;
  methods: ("sms" | "whatsapp" | "email")[];
  advance_hours: number[]; // Multiple reminder times
  template_customization: boolean;
}

export interface NoShowPolicy {
  track_no_shows: boolean;
  max_no_shows: number; // Before restrictions
  restriction_duration_days: number;
  charge_no_show_fee: boolean;
  no_show_fee_amount?: number;
}

/**
 * Communication Settings
 */
export interface CommunicationSettings {
  // WhatsApp Business
  whatsapp_enabled: boolean;
  whatsapp_number?: string;
  whatsapp_api_key?: string;

  // SMS
  sms_enabled: boolean;
  sms_provider?: string;
  sms_api_key?: string;

  // Email
  email_enabled: boolean;
  smtp_settings?: SMTPSettings;

  // Templates
  message_templates: MessageTemplate[];
}

export interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string; // Encrypted
  use_tls: boolean;
  from_address: string;
  from_name: string;
}

export interface MessageTemplate {
  id: string;
  type: "appointment_confirmation" | "appointment_reminder" | "appointment_cancellation";
  channel: "sms" | "whatsapp" | "email";
  template: string;
  variables: string[];
  is_active: boolean;
}

/**
 * Compliance & LGPD Settings
 */
export interface ComplianceSettings {
  // LGPD Configuration
  lgpd_enabled: boolean;
  data_retention_days: number;
  automatic_purging: boolean;
  consent_version: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;

  // Audit Trail
  audit_level: "basic" | "detailed" | "comprehensive";
  audit_retention_days: number;

  // Data Export
  allow_data_export: boolean;
  export_format: ("json" | "pdf" | "csv")[];

  // Encryption
  field_level_encryption: string[]; // Fields to encrypt

  // Access Control
  require_mfa_for_sensitive_data: boolean;
  session_timeout_minutes: number;
}

/**
 * Integration Settings
 */
export interface IntegrationSettings {
  // Calendar Sync
  google_calendar: CalendarIntegration;
  outlook_calendar: CalendarIntegration;

  // Payment Gateways
  payment_providers: PaymentProvider[];

  // External APIs
  cep_lookup_enabled: boolean;
  crm_validation_enabled: boolean;

  // Third-party Tools
  analytics_tracking: AnalyticsSettings;
}

export interface CalendarIntegration {
  enabled: boolean;
  client_id?: string;
  client_secret?: string;
  sync_direction: "both" | "to_external" | "from_external";
}

export interface PaymentProvider {
  provider: "stripe" | "mercadopago" | "pagseguro" | "cielo";
  enabled: boolean;
  api_key?: string;
  webhook_secret?: string;
  environment: "sandbox" | "production";
}

export interface AnalyticsSettings {
  google_analytics_id?: string;
  hotjar_enabled: boolean;
  custom_events_tracking: boolean;
}

/**
 * Branding & UI Settings
 */
export interface BrandingSettings {
  // Visual Identity
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;

  // Custom CSS
  custom_css?: string;

  // Patient Portal
  portal_customization: PortalCustomization;
}

export interface PortalCustomization {
  welcome_message: string;
  custom_fields: CustomField[];
  hide_default_fields: string[];
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "select" | "textarea";
  required: boolean;
  options?: string[]; // For select type
}

/**
 * Feature Flags
 */
export interface FeatureFlags {
  // Core Features
  patient_portal: boolean;
  online_scheduling: boolean;
  telemedicine: boolean;

  // Advanced Features
  ai_scheduling: boolean;
  predictive_analytics: boolean;
  automated_reminders: boolean;

  // Integration Features
  calendar_sync: boolean;
  payment_processing: boolean;
  insurance_verification: boolean;

  // Compliance Features
  advanced_audit_trail: boolean;
  gdpr_compliance: boolean;
  hipaa_compliance: boolean;
}

/**
 * Clinic Creation Request
 */
export interface CreateClinicRequest {
  // Required fields
  clinic_name: string;
  clinic_code: string;
  email: string;

  // Optional fields
  legal_name?: string;
  tax_id?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  business_type?: BusinessType;
  specialties?: string[];

  // Initial settings
  timezone?: string;
  locale?: string;
}

/**
 * Clinic Update Request
 */
export interface UpdateClinicRequest extends Partial<CreateClinicRequest> {
  settings?: Partial<ClinicSettings>;
  is_active?: boolean;
}

/**
 * Clinic Statistics
 */
export interface ClinicStats {
  clinic_id: string;

  // Patient Statistics
  total_patients: number;
  active_patients: number;
  new_patients_this_month: number;

  // Appointment Statistics
  total_appointments: number;
  appointments_this_month: number;
  completion_rate: number;
  no_show_rate: number;

  // Professional Statistics
  total_professionals: number;
  active_professionals: number;

  // Revenue (if enabled)
  revenue_this_month?: number;
  revenue_last_month?: number;

  // Performance Metrics
  average_wait_time_minutes: number;
  patient_satisfaction_score?: number;

  // Generated at
  generated_at: string;
}
