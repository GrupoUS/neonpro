// Authentication types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  healthcare_provider_id?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "admin"
  | "healthcare_provider"
  | "super_admin";

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user: User;
}

export interface SignInCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  healthcare_provider_id?: string;
  terms_accepted: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  password: string;
  confirm_password: string;
}

// Healthcare Provider types
export interface HealthcareProvider {
  id: string;
  name: string;
  type: ProviderType;
  registration_number: string;
  address: Address;
  contact: ContactInfo;
  settings: ProviderSettings;
  subscription: SubscriptionInfo;
  created_at: string;
  updated_at: string;
}

export type ProviderType =
  | "hospital"
  | "clinic"
  | "laboratory"
  | "pharmacy"
  | "imaging_center"
  | "rehabilitation_center"
  | "dental_clinic";

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  emergency_phone?: string;
}

export interface ProviderSettings {
  timezone: string;
  language: string;
  business_hours: BusinessHours[];
  appointment_settings: AppointmentSettings;
  notification_preferences: NotificationPreferences;
}

export interface BusinessHours {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  is_closed: boolean;
}

export interface AppointmentSettings {
  default_duration: number; // minutes
  advance_booking_days: number;
  cancellation_hours: number;
  confirmation_required: boolean;
  online_booking_enabled: boolean;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  system_updates: boolean;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  features: string[];
  limits: SubscriptionLimits;
}

export type SubscriptionPlan = "free" | "basic" | "professional" | "enterprise";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "unpaid";

export interface SubscriptionLimits {
  max_patients: number;
  max_appointments_per_month: number;
  max_storage_gb: number;
  max_users: number;
  api_requests_per_hour: number;
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

// Session management
export interface SessionInfo {
  session_id: string;
  user_id: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  location?: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

export interface DeviceInfo {
  user_agent: string;
  platform: string;
  browser: string;
  is_mobile: boolean;
}
