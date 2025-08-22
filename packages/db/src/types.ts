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
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // Healthcare Professionals with CFM compliance
      healthcare_professionals: {
        Row: {
          id: string;
          user_id: string;
          cfm_number: string;
          specialty: string;
          role: 'doctor' | 'nurse' | 'admin' | 'receptionist';
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
          role: 'doctor' | 'nurse' | 'admin' | 'receptionist';
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
          role?: 'doctor' | 'nurse' | 'admin' | 'receptionist';
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
          gender: 'M' | 'F' | 'Other' | 'NotInformed';
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
          gender: 'M' | 'F' | 'Other' | 'NotInformed';
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
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          cpf?: string;
          date_of_birth?: string;
          gender?: 'M' | 'F' | 'Other' | 'NotInformed';
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
      }; // Appointments with real-time updates
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          professional_id: string;
          clinic_id: string;
          appointment_date: string;
          appointment_time: string;
          duration_minutes: number;
          treatment_type: string;
          status:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes: string | null;
          price: number;
          payment_status: 'pending' | 'paid' | 'partial' | 'cancelled';
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
          appointment_time: string;
          duration_minutes?: number;
          treatment_type: string;
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string | null;
          price: number;
          payment_status?: 'pending' | 'paid' | 'partial' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          professional_id?: string;
          clinic_id?: string;
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          treatment_type?: string;
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string | null;
          price?: number;
          payment_status?: 'pending' | 'paid' | 'partial' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };

      // Clinics for multi-tenant isolation
      clinics: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          email: string;
          phone: string;
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          anvisa_license: string | null;
          subscription_plan: 'basic' | 'professional' | 'enterprise';
          subscription_status: 'active' | 'suspended' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          email: string;
          phone: string;
          address_street: string;
          address_city: string;
          address_state: string;
          address_zip: string;
          anvisa_license?: string | null;
          subscription_plan?: 'basic' | 'professional' | 'enterprise';
          subscription_status?: 'active' | 'suspended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          email?: string;
          phone?: string;
          address_street?: string;
          address_city?: string;
          address_state?: string;
          address_zip?: string;
          anvisa_license?: string | null;
          subscription_plan?: 'basic' | 'professional' | 'enterprise';
          subscription_status?: 'active' | 'suspended' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };

      // Healthcare audit logs for LGPD compliance
      healthcare_audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json | null;
          ip_address: string;
          user_agent: string;
          clinic_id: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address: string;
          user_agent: string;
          clinic_id: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string;
          user_agent?: string;
          clinic_id?: string;
          timestamp?: string;
        };
      };

      // Notifications system
      notifications: {
        Row: {
          id: string;
          user_id: string;
          clinic_id: string | null;
          title: string;
          message: string;
          type:
            | 'info'
            | 'warning'
            | 'error'
            | 'success'
            | 'appointment'
            | 'payment'
            | 'system';
          data: Json | null;
          related_entity_type:
            | 'appointment'
            | 'patient'
            | 'payment'
            | 'user'
            | null;
          related_entity_id: string | null;
          is_read: boolean;
          read_at: string | null;
          channels: string[];
          delivery_status: Json;
          scheduled_for: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          clinic_id?: string | null;
          title: string;
          message: string;
          type:
            | 'info'
            | 'warning'
            | 'error'
            | 'success'
            | 'appointment'
            | 'payment'
            | 'system';
          data?: Json | null;
          related_entity_type?:
            | 'appointment'
            | 'patient'
            | 'payment'
            | 'user'
            | null;
          related_entity_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          channels?: string[];
          delivery_status?: Json;
          scheduled_for?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          clinic_id?: string | null;
          title?: string;
          message?: string;
          type?:
            | 'info'
            | 'warning'
            | 'error'
            | 'success'
            | 'appointment'
            | 'payment'
            | 'system';
          data?: Json | null;
          related_entity_type?:
            | 'appointment'
            | 'patient'
            | 'payment'
            | 'user'
            | null;
          related_entity_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          channels?: string[];
          delivery_status?: Json;
          scheduled_for?: string | null;
          expires_at?: string | null;
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
};

// Healthcare-specific type exports
export type HealthcareProfessional =
  Database['public']['Tables']['healthcare_professionals']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Clinic = Database['public']['Tables']['clinics']['Row'];
export type HealthcareAuditLog =
  Database['public']['Tables']['healthcare_audit_logs']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Insert types for forms
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type AppointmentInsert =
  Database['public']['Tables']['appointments']['Insert'];
export type HealthcareProfessionalInsert =
  Database['public']['Tables']['healthcare_professionals']['Insert'];
export type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];

// Update types for edits
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];
export type AppointmentUpdate =
  Database['public']['Tables']['appointments']['Update'];
export type HealthcareProfessionalUpdate =
  Database['public']['Tables']['healthcare_professionals']['Update'];
export type NotificationUpdate =
  Database['public']['Tables']['notifications']['Update'];
