export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          professional_title: string | null;
          medical_license: string | null;
          department: string | null;
          phone: string | null;
          role: string | null;
          google_provider_id: string | null;
          google_picture: string | null;
          google_verified_email: boolean | null;
          profile_sync_status: string | null;
          google_sync_enabled: boolean | null;
          last_google_sync: string | null;
          created_at: string | null;
          updated_at: string | null;
          data_consent_given: boolean | null;
          lgpd_consent_date: string | null;
          tenant_id: string | null;
          clinic_id: string | null;
          professional_license: string | null;
          specialty: string[] | null;
          is_active: boolean;
          hire_date: string | null;
          termination_date: string | null;
          permissions: Json | null;
          access_level: number | null;
          can_access_all_patients: boolean | null;
          restricted_areas: string[] | null;
          lgpd_consent_given: boolean | null;
          lgpd_consent_version: string | null;
          privacy_settings: Json | null;
          preferred_language: string | null;
          notification_preferences: Json | null;
          communication_consent: Json | null;
          last_login_at: string | null;
          password_changed_at: string | null;
          failed_login_attempts: number | null;
          account_locked_until: string | null;
          mfa_enabled: boolean | null;
          deleted_at: string | null;
          // New subscription fields
          subscription_plan: string | null;
          subscription_status: string | null;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          professional_title?: string | null;
          medical_license?: string | null;
          department?: string | null;
          phone?: string | null;
          role?: string | null;
          google_provider_id?: string | null;
          google_picture?: string | null;
          google_verified_email?: boolean | null;
          profile_sync_status?: string | null;
          google_sync_enabled?: boolean | null;
          last_google_sync?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          data_consent_given?: boolean | null;
          lgpd_consent_date?: string | null;
          tenant_id?: string | null;
          clinic_id?: string | null;
          professional_license?: string | null;
          specialty?: string[] | null;
          is_active?: boolean;
          hire_date?: string | null;
          termination_date?: string | null;
          permissions?: Json | null;
          access_level?: number | null;
          can_access_all_patients?: boolean | null;
          restricted_areas?: string[] | null;
          lgpd_consent_given?: boolean | null;
          lgpd_consent_version?: string | null;
          privacy_settings?: Json | null;
          preferred_language?: string | null;
          notification_preferences?: Json | null;
          communication_consent?: Json | null;
          last_login_at?: string | null;
          password_changed_at?: string | null;
          failed_login_attempts?: number | null;
          account_locked_until?: string | null;
          mfa_enabled?: boolean | null;
          deleted_at?: string | null;
          // New subscription fields
          subscription_plan?: string | null;
          subscription_status?: string | null;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          professional_title?: string | null;
          medical_license?: string | null;
          department?: string | null;
          phone?: string | null;
          role?: string | null;
          google_provider_id?: string | null;
          google_picture?: string | null;
          google_verified_email?: boolean | null;
          profile_sync_status?: string | null;
          google_sync_enabled?: boolean | null;
          last_google_sync?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          data_consent_given?: boolean | null;
          lgpd_consent_date?: string | null;
          tenant_id?: string | null;
          clinic_id?: string | null;
          professional_license?: string | null;
          specialty?: string[] | null;
          is_active?: boolean;
          hire_date?: string | null;
          termination_date?: string | null;
          permissions?: Json | null;
          access_level?: number | null;
          can_access_all_patients?: boolean | null;
          restricted_areas?: string[] | null;
          lgpd_consent_given?: boolean | null;
          lgpd_consent_version?: string | null;
          privacy_settings?: Json | null;
          preferred_language?: string | null;
          notification_preferences?: Json | null;
          communication_consent?: Json | null;
          last_login_at?: string | null;
          password_changed_at?: string | null;
          failed_login_attempts?: number | null;
          account_locked_until?: string | null;
          mfa_enabled?: boolean | null;
          deleted_at?: string | null;
          // New subscription fields
          subscription_plan?: string | null;
          subscription_status?: string | null;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          clinic_id: string;
          customer_id: string;
          plan_id: string;
          subscription_code: string;
          status: string;
          current_cycle: number | null;
          total_cycles: number | null;
          amount: number;
          currency: string | null;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string;
          current_period_end: string;
          next_billing_date: string | null;
          cancelled_at: string | null;
          expires_at: string | null;
          default_payment_method_id: string | null;
          proration_behavior: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          customer_id: string;
          plan_id: string;
          subscription_code: string;
          status?: string;
          current_cycle?: number | null;
          total_cycles?: number | null;
          amount: number;
          currency?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start: string;
          current_period_end: string;
          next_billing_date?: string | null;
          cancelled_at?: string | null;
          expires_at?: string | null;
          default_payment_method_id?: string | null;
          proration_behavior?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          customer_id?: string;
          plan_id?: string;
          subscription_code?: string;
          status?: string;
          current_cycle?: number | null;
          total_cycles?: number | null;
          amount?: number;
          currency?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          next_billing_date?: string | null;
          cancelled_at?: string | null;
          expires_at?: string | null;
          default_payment_method_id?: string | null;
          proration_behavior?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
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
