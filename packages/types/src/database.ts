// Database types for Supabase integration

export interface Database {
  public: {
    Tables: {
      // Core tables
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          role: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          role?: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          role?: string;
          active?: boolean;
        };
      };

      patients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cpf: string;
          birth_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cpf: string;
          birth_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cpf?: string;
          birth_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          scheduled_at: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          scheduled_at: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          scheduled_at?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Compliance tables
      audit_logs: {
        Row: {
          id: string;
          event_type: string;
          user_id: string;
          resource_id: string;
          details: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          user_id: string;
          resource_id: string;
          details?: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          user_id?: string;
          resource_id?: string;
          details?: unknown;
          created_at?: string;
        };
      };

      consent_records: {
        Row: {
          id: string;
          patient_id: string;
          consent_type: string;
          granted: boolean;
          granted_at: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          consent_type: string;
          granted: boolean;
          granted_at: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          consent_type?: string;
          granted?: boolean;
          granted_at?: string;
          expires_at?: string;
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

// Export commonly used types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
