/**
 * NeonPro Healthcare Database TypeScript Definitions
 * Generated and enhanced for healthcare compliance
 * LGPD + ANVISA + CFM + Multi-tenant support
 */

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
      // Healthcare Professionals with CFM compliance
      healthcare_professionals: {
        Row: {
          id: string;
          user_id: string;
          cfm_number: string;
          specialty: string;
          role: "doctor" | "nurse" | "admin" | "receptionist";
          active: boolean;
          clinic_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cfm_number: string;
          specialty: string;
          role: "doctor" | "nurse" | "admin" | "receptionist";
          active?: boolean;
          clinic_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cfm_number?: string;
          specialty?: string;
          role?: "doctor" | "nurse" | "admin" | "receptionist";
          active?: boolean;
          clinic_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Patients with LGPD compliance
      patients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          cpf: string; // Encrypted field
          date_of_birth: string;
          gender: "M" | "F" | "Other" | "NotInformed";
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          medical_history: string | null; // Encrypted field
          allergies: string | null;
          current_medications: string | null;
          lgpd_consent: boolean;
          lgpd_consent_date: string;
          marketing_consent: boolean;
          clinic_id: string; // Multi-tenant isolation
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          cpf: string;
          date_of_birth: string;
          gender: "M" | "F" | "Other" | "NotInformed";
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          emergency_contact_name: string;
          emergency_contact_phone: string;
          medical_history?: string | null;
          allergies?: string | null;
          current_medications?: string | null;
          lgpd_consent: boolean;
          lgpd_consent_date?: string;
          marketing_consent?: boolean;
          clinic_id: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          cpf?: string;
          date_of_birth?: string;
          gender?: "M" | "F" | "Other" | "NotInformed";
          address_street?: string;
          address_city?: string;
          address_state?: string;
          address_zip?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          medical_history?: string | null;
          allergies?: string | null;
          current_medications?: string | null;
          lgpd_consent?: boolean;
          lgpd_consent_date?: string;
          marketing_consent?: boolean;
          clinic_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };

      // Appointments
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          professional_id: string;
          clinic_id: string;
          appointment_date: string;
          duration_minutes: number;
          status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          appointment_type: "consultation" | "follow_up" | "procedure" | "emergency";
          notes: string | null;
          symptoms: string | null;
          diagnosis: string | null; // Encrypted field
          treatment_plan: string | null; // Encrypted field
          prescription: string | null; // Encrypted field
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          professional_id: string;
          clinic_id: string;
          appointment_date: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          appointment_type: "consultation" | "follow_up" | "procedure" | "emergency";
          notes?: string | null;
          symptoms?: string | null;
          diagnosis?: string | null;
          treatment_plan?: string | null;
          prescription?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          professional_id?: string;
          clinic_id?: string;
          appointment_date?: string;
          duration_minutes?: number;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
          appointment_type?: "consultation" | "follow_up" | "procedure" | "emergency";
          notes?: string | null;
          symptoms?: string | null;
          diagnosis?: string | null;
          treatment_plan?: string | null;
          prescription?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };

      // Healthcare Audit Logs for LGPD compliance
      healthcare_audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json | null;
          ip_address: string;
          user_agent: string;
          timestamp: string;
          clinic_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address: string;
          user_agent: string;
          timestamp?: string;
          clinic_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string;
          user_agent?: string;
          timestamp?: string;
          clinic_id?: string;
        };
      };

      // Clinics
      clinics: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          phone: string;
          email: string;
          website: string | null;
          anvisa_license: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          phone: string;
          email: string;
          website?: string | null;
          anvisa_license?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          address_street?: string;
          address_city?: string;
          address_state?: string;
          address_zip?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          anvisa_license?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Notifications
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "warning" | "success" | "error" | "appointment" | "compliance";
          read: boolean;
          metadata: Json | null;
          clinic_id: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "warning" | "success" | "error" | "appointment" | "compliance";
          read?: boolean;
          metadata?: Json | null;
          clinic_id: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: "info" | "warning" | "success" | "error" | "appointment" | "compliance";
          read?: boolean;
          metadata?: Json | null;
          clinic_id?: string;
          created_at?: string;
          expires_at?: string | null;
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
      user_role: "super_admin" | "medical_director" | "doctor" | "nurse" | "technician" | "receptionist" | "billing" | "auditor" | "patient";
      appointment_status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
      appointment_type: "consultation" | "follow_up" | "procedure" | "emergency";
      notification_type: "info" | "warning" | "success" | "error" | "appointment" | "compliance";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience type exports for common tables
export type HealthcareProfessional = Database["public"]["Tables"]["healthcare_professionals"]["Row"];
export type HealthcareProfessionalInsert = Database["public"]["Tables"]["healthcare_professionals"]["Insert"];
export type HealthcareProfessionalUpdate = Database["public"]["Tables"]["healthcare_professionals"]["Update"];

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type Clinic = Database["public"]["Tables"]["clinics"]["Row"];
export type ClinicInsert = Database["public"]["Tables"]["clinics"]["Insert"];
export type ClinicUpdate = Database["public"]["Tables"]["clinics"]["Update"];

export type HealthcareAuditLog = Database["public"]["Tables"]["healthcare_audit_logs"]["Row"];
export type HealthcareAuditLogInsert = Database["public"]["Tables"]["healthcare_audit_logs"]["Insert"];
export type HealthcareAuditLogUpdate = Database["public"]["Tables"]["healthcare_audit_logs"]["Update"];

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];