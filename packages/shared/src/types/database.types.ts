/**
 * Temporary database types re-export
 * This file re-exports database types to work around module resolution issues
 * TODO: Remove this file once @neonpro/database module resolution is fixed
 */

// Essential database types for shared package
export interface Database {
  public: {
    Tables: {
      healthcare_professionals: {
        Row: {
          id: string;
          cfm_number: string;
          cfm_state: string;
          full_name: string;
          email: string;
          specialty: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cfm_number: string;
          cfm_state: string;
          full_name: string;
          email: string;
          specialty: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cfm_number?: string;
          cfm_state?: string;
          full_name?: string;
          email?: string;
          specialty?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          cpf: string;
          date_of_birth: string;
          gender: "M" | "F" | "Other" | "NotInformed";
          address_street: string;
          address_number: string;
          address_complement: string | null;
          address_district: string;
          address_city: string;
          address_state: string;
          address_zipcode: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          clinic_id: string;
          active: boolean;
          lgpd_consent: boolean;
          lgpd_consent_date: string | null;
          created_at: string;
          updated_at: string;
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
          address_number: string;
          address_complement?: string | null;
          address_district: string;
          address_city: string;
          address_state: string;
          address_zipcode: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          clinic_id: string;
          active?: boolean;
          lgpd_consent: boolean;
          lgpd_consent_date?: string | null;
          created_at?: string;
          updated_at?: string;
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
          address_number?: string;
          address_complement?: string | null;
          address_district?: string;
          address_city?: string;
          address_state?: string;
          address_zipcode?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          clinic_id?: string;
          active?: boolean;
          lgpd_consent?: boolean;
          lgpd_consent_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          professional_id: string;
          clinic_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          professional_id: string;
          clinic_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          professional_id?: string;
          clinic_id?: string;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      healthcare_audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Record<string, unknown> | null;
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
          metadata?: any | null;
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
          metadata?: any | null;
          ip_address?: string;
          user_agent?: string;
          timestamp?: string;
          clinic_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Essential type exports
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export type HealthcareProfessional =
  Database["public"]["Tables"]["healthcare_professionals"]["Row"];
export type HealthcareProfessionalInsert =
  Database["public"]["Tables"]["healthcare_professionals"]["Insert"];
export type HealthcareProfessionalUpdate =
  Database["public"]["Tables"]["healthcare_professionals"]["Update"];
