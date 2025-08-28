export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined; }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Core Healthcare Tables
      patients: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: Json;
          medical_history?: Json;
          allergies?: string[];
          emergency_contact?: Json;
          lgpd_consent: boolean;
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          email: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: Json;
          medical_history?: Json;
          allergies?: string[];
          emergency_contact?: Json;
          lgpd_consent: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: Json;
          medical_history?: Json;
          allergies?: string[];
          emergency_contact?: Json;
          lgpd_consent?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };

      // Healthcare Professionals
      professionals: {
        Row: {
          id: string;
          tenant_id: string;
          user_id?: string;
          name: string;
          email: string;
          phone?: string;
          specialties: string[];
          license_number: string;
          license_expiry: string;
          cfm_registration?: string;
          availability_schedule?: Json;
          hourly_rate?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string;
          name: string;
          email: string;
          phone?: string;
          specialties: string[];
          license_number: string;
          license_expiry: string;
          cfm_registration?: string;
          availability_schedule?: Json;
          hourly_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          specialties?: string[];
          license_number?: string;
          license_expiry?: string;
          cfm_registration?: string;
          availability_schedule?: Json;
          hourly_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Appointments
      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          professional_id: string;
          service_type_id?: string;
          appointment_date: string;
          duration_minutes: number;
          status: string;
          notes?: string;
          preparation_instructions?: string;
          followup_required: boolean;
          price?: number;
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          professional_id: string;
          service_type_id?: string;
          appointment_date: string;
          duration_minutes: number;
          status: string;
          notes?: string;
          preparation_instructions?: string;
          followup_required?: boolean;
          price?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          professional_id?: string;
          service_type_id?: string;
          appointment_date?: string;
          duration_minutes?: number;
          status?: string;
          notes?: string;
          preparation_instructions?: string;
          followup_required?: boolean;
          price?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };

      // LGPD Compliance
      lgpd_patient_consents: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          purpose_id: string;
          consent_status: string;
          consent_given_at?: string;
          consent_withdrawn_at?: string;
          expiry_date?: string;
          consent_method?: string;
          consent_evidence?: Json;
          withdrawal_reason?: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          purpose_id: string;
          consent_status?: string;
          consent_given_at?: string;
          consent_withdrawn_at?: string;
          expiry_date?: string;
          consent_method?: string;
          consent_evidence?: Json;
          withdrawal_reason?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          purpose_id?: string;
          consent_status?: string;
          consent_given_at?: string;
          consent_withdrawn_at?: string;
          expiry_date?: string;
          consent_method?: string;
          consent_evidence?: Json;
          withdrawal_reason?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Audit Logs
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id?: string;
          action: string;
          resource_type: string;
          resource_id?: string;
          old_values?: Json;
          new_values?: Json;
          ip_address?: string;
          user_agent?: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string;
          action: string;
          resource_type: string;
          resource_id?: string;
          old_values?: Json;
          new_values?: Json;
          ip_address?: string;
          user_agent?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          old_values?: Json;
          new_values?: Json;
          ip_address?: string;
          user_agent?: string;
          timestamp?: string;
        };
      };

      // Multi-tenant System
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain?: string;
          settings?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_tenants: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Subscription System
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price_monthly: number;
          price_yearly?: number;
          features?: Json;
          max_users?: number;
          max_patients?: number;
          max_appointments?: number;
          storage_gb?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price_monthly: number;
          price_yearly?: number;
          features?: Json;
          max_users?: number;
          max_patients?: number;
          max_appointments?: number;
          storage_gb?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_monthly?: number;
          price_yearly?: number;
          features?: Json;
          max_users?: number;
          max_patients?: number;
          max_appointments?: number;
          storage_gb?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          status: string;
          billing_cycle: string;
          current_period_start?: string;
          current_period_end?: string;
          trial_end?: string;
          cancel_at?: string;
          canceled_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id: string;
          status?: string;
          billing_cycle?: string;
          current_period_start?: string;
          current_period_end?: string;
          trial_end?: string;
          cancel_at?: string;
          canceled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plan_id?: string;
          status?: string;
          billing_cycle?: string;
          current_period_start?: string;
          current_period_end?: string;
          trial_end?: string;
          cancel_at?: string;
          canceled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper Types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Common Healthcare Types
export type Patient = Tables<"patients">;
export type Professional = Tables<"professionals">;
export type Appointment = Tables<"appointments">;
export type Tenant = Tables<"tenants">;
export type UserTenant = Tables<"user_tenants">;
export type SubscriptionPlan = Tables<"subscription_plans">;
export type Subscription = Tables<"subscriptions">;
export type LgpdConsent = Tables<"lgpd_patient_consents">;
export type AuditLog = Tables<"audit_logs">;

// Insert Types
export type PatientInsert = Inserts<"patients">;
export type ProfessionalInsert = Inserts<"professionals">;
export type AppointmentInsert = Inserts<"appointments">;
export type TenantInsert = Inserts<"tenants">;

// Update Types
export type PatientUpdate = Updates<"patients">;
export type ProfessionalUpdate = Updates<"professionals">;
export type AppointmentUpdate = Updates<"appointments">;
export type TenantUpdate = Updates<"tenants">;
