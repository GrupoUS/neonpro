import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a convenience export for the client
export const createClient = () => supabase;

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          user_id: string | null;
          full_name: string;
          cpf: string | null;
          date_of_birth: string | null;
          email: string | null;
          phone: string | null;
          lgpd_consent_given: boolean;
          lgpd_consent_date: string | null;
          data_retention_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          user_id?: string | null;
          full_name: string;
          cpf?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          phone?: string | null;
          lgpd_consent_given?: boolean;
          lgpd_consent_date?: string | null;
          data_retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          user_id?: string | null;
          full_name?: string;
          cpf?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          phone?: string | null;
          lgpd_consent_given?: boolean;
          lgpd_consent_date?: string | null;
          data_retention_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinics: {
        Row: {
          id: string;
          name: string;
          cnpj: string | null;
          health_license_number: string | null;
          address: any | null;
          settings: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj?: string | null;
          health_license_number?: string | null;
          address?: any | null;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          health_license_number?: string | null;
          address?: any | null;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      professionals: {
        Row: {
          id: string;
          clinic_id: string;
          user_id: string | null;
          full_name: string;
          specialization: string;
          license_number: string | null;
          license_type: string | null;
          is_active: boolean;
          can_prescribe: boolean;
          emergency_contact: boolean;
          working_hours: any[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          user_id?: string | null;
          full_name: string;
          specialization: string;
          license_number?: string | null;
          license_type?: string | null;
          is_active?: boolean;
          can_prescribe?: boolean;
          emergency_contact?: boolean;
          working_hours?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          user_id?: string | null;
          full_name?: string;
          specialization?: string;
          license_number?: string | null;
          license_type?: string | null;
          is_active?: boolean;
          can_prescribe?: boolean;
          emergency_contact?: boolean;
          working_hours?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          scheduled_date: string;
          duration: number;
          status:
            | "SCHEDULED"
            | "CONFIRMED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED"
            | "NO_SHOW"
            | "RESCHEDULED";
          treatment_type: string;
          priority: string;
          notes: string | null;
          no_show_risk_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          scheduled_date: string;
          duration?: number;
          status?:
            | "SCHEDULED"
            | "CONFIRMED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED"
            | "NO_SHOW"
            | "RESCHEDULED";
          treatment_type: string;
          priority?: string;
          notes?: string | null;
          no_show_risk_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          professional_id?: string;
          scheduled_date?: string;
          duration?: number;
          status?:
            | "SCHEDULED"
            | "CONFIRMED"
            | "IN_PROGRESS"
            | "COMPLETED"
            | "CANCELLED"
            | "NO_SHOW"
            | "RESCHEDULED";
          treatment_type?: string;
          priority?: string;
          notes?: string | null;
          no_show_risk_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lgpd_consents: {
        Row: {
          id: string;
          patient_id: string;
          consent_type:
            | "TREATMENT"
            | "DATA_SHARING"
            | "RESEARCH"
            | "MARKETING"
            | "EMERGENCY_CONTACT";
          status: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED";
          purpose: string;
          data_recipients: string[] | null;
          retention_period: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          consent_type:
            | "TREATMENT"
            | "DATA_SHARING"
            | "RESEARCH"
            | "MARKETING"
            | "EMERGENCY_CONTACT";
          status?: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED";
          purpose: string;
          data_recipients?: string[] | null;
          retention_period?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          consent_type?:
            | "TREATMENT"
            | "DATA_SHARING"
            | "RESEARCH"
            | "MARKETING"
            | "EMERGENCY_CONTACT";
          status?: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED";
          purpose?: string;
          data_recipients?: string[] | null;
          retention_period?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
