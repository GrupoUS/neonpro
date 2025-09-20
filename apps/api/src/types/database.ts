/**
 * Database types for healthcare applications
 * Provides the missing Database type definitions
 */

// Define basic database structure for healthcare applications
export interface Database {
  public: {
    Tables: {
      // Patient table
      patients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          cpf?: string;
          cns?: string;
          date_of_birth: string;
          gender?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          cpf?: string;
          cns?: string;
          date_of_birth: string;
          gender?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          cpf?: string;
          cns?: string;
          date_of_birth?: string;
          gender?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Appointments table
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          clinic_id: string;
          appointment_date: string;
          appointment_time: string;
          duration: number;
          status:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          clinic_id: string;
          appointment_date: string;
          appointment_time: string;
          duration: number;
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          clinic_id?: string;
          appointment_date?: string;
          appointment_time?: string;
          duration?: number;
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Doctors table
      doctors: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          crm: string;
          specialty: string;
          clinic_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          crm: string;
          specialty: string;
          clinic_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          crm?: string;
          specialty?: string;
          clinic_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Clinics table
      clinics: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Consent records table
      consent_records: {
        Row: {
          id: string;
          patient_id: string;
          consent_type: string;
          consent_given: boolean;
          consent_date: string;
          expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          consent_type: string;
          consent_given: boolean;
          consent_date: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          consent_type?: string;
          consent_given?: boolean;
          consent_date?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Audit logs table
      audit_logs: {
        Row: {
          id: string;
          user_id?: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          details?: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };

      // Healthcare metrics table
      healthcare_metrics: {
        Row: {
          id: string;
          timestamp: string;
          type: string;
          value: number;
          metadata: Record<string, any>;
          clinic_id?: string;
          user_id?: string;
          compliance_flags: {
            lgpd_compliant: boolean;
            cfm_validated: boolean;
            anvisa_compliant: boolean;
            rls_enforced: boolean;
          };
          created_at: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          type: string;
          value: number;
          metadata: Record<string, any>;
          clinic_id?: string;
          user_id?: string;
          compliance_flags: {
            lgpd_compliant: boolean;
            cfm_validated: boolean;
            anvisa_compliant: boolean;
            rls_enforced: boolean;
          };
          created_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          type?: string;
          value?: number;
          metadata?: Record<string, any>;
          clinic_id?: string;
          user_id?: string;
          compliance_flags?: {
            lgpd_compliant: boolean;
            cfm_validated: boolean;
            anvisa_compliant: boolean;
            rls_enforced: boolean;
          };
          created_at?: string;
        };
      };
    };

    Views: {
      // Add view definitions as needed
    };

    Functions: {
      // Add function definitions as needed
    };
  };
}

// Export Json type for compatibility
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Export convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
