/**
 * Supabase Database Types for NEONPRO
 * Generated types for clinic management SaaS
 */

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
      neonpro_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "admin" | "doctor" | "staff" | "patient";
          clinic_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "doctor" | "staff" | "patient";
          clinic_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "doctor" | "staff" | "patient";
          clinic_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinics: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          medical_history: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          medical_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          medical_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          duration_minutes: number;
          status: "scheduled" | "confirmed" | "completed" | "cancelled";
          notes: string | null;
          treatment_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          doctor_id: string;
          appointment_date: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          treatment_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          doctor_id?: string;
          appointment_date?: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          treatment_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      treatments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          doctor_id: string;
          appointment_id: string | null;
          treatment_name: string;
          description: string | null;
          cost: number | null;
          status: "planned" | "in_progress" | "completed";
          ai_recommendations: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          doctor_id: string;
          appointment_id?: string | null;
          treatment_name: string;
          description?: string | null;
          cost?: number | null;
          status?: "planned" | "in_progress" | "completed";
          ai_recommendations?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          doctor_id?: string;
          appointment_id?: string | null;
          treatment_name?: string;
          description?: string | null;
          cost?: number | null;
          status?: "planned" | "in_progress" | "completed";
          ai_recommendations?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          treatment_id: string | null;
          amount: number;
          status: "pending" | "completed" | "failed" | "refunded";
          payment_method: string | null;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          treatment_id?: string | null;
          amount: number;
          status?: "pending" | "completed" | "failed" | "refunded";
          payment_method?: string | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          treatment_id?: string | null;
          amount?: number;
          status?: "pending" | "completed" | "failed" | "refunded";
          payment_method?: string | null;
          transaction_id?: string | null;
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
      user_role: "admin" | "doctor" | "staff" | "patient";
      appointment_status: "scheduled" | "confirmed" | "completed" | "cancelled";
      treatment_status: "planned" | "in_progress" | "completed";
      payment_status: "pending" | "completed" | "failed" | "refunded";
    };
  };
}
