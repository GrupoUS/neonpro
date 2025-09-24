// NeonPro Database Types
// This file defines the database schema types for Supabase integration

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'doctor' | 'receptionist' | 'patient';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'doctor' | 'receptionist' | 'patient';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'doctor' | 'receptionist' | 'patient';
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          service_id: string;
          scheduled_at: string;
          status:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
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
          service_id: string;
          scheduled_at: string;
          status:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
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
          service_id?: string;
          scheduled_at?: string;
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
