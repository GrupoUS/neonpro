export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          medical_history: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          medical_history?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          medical_history?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          staff_member_id: string
          service_id: string | null
          appointment_date: string
          duration: number
          status:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          staff_member_id: string
          service_id?: string | null
          appointment_date: string
          duration: number
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          staff_member_id?: string
          service_id?: string | null
          appointment_date?: string
          duration?: number
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'completed'
            | 'cancelled'
            | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_patient_id_fkey'
            columns: ['patient_id',]
            referencedRelation: 'patients'
            referencedColumns: ['id',]
          },
          {
            foreignKeyName: 'appointments_staff_member_id_fkey'
            columns: ['staff_member_id',]
            referencedRelation: 'staff_members'
            referencedColumns: ['id',]
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id',]
            referencedRelation: 'services'
            referencedColumns: ['id',]
          },
        ]
      }
      financial_transactions: {
        Row: {
          id: string
          type: 'income' | 'expense'
          amount: number
          description: string | null
          category: string | null
          date: string
          patient_id: string | null
          service_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'income' | 'expense'
          amount: number
          description?: string | null
          category?: string | null
          date: string
          patient_id?: string | null
          service_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'income' | 'expense'
          amount?: number
          description?: string | null
          category?: string | null
          date?: string
          patient_id?: string | null
          service_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'financial_transactions_patient_id_fkey'
            columns: ['patient_id',]
            referencedRelation: 'patients'
            referencedColumns: ['id',]
          },
          {
            foreignKeyName: 'financial_transactions_service_id_fkey'
            columns: ['service_id',]
            referencedRelation: 'services'
            referencedColumns: ['id',]
          },
        ]
      }
      staff_members: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          specialty: string | null
          license_number: string | null
          status: 'active' | 'inactive'
          hire_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          specialty?: string | null
          license_number?: string | null
          status?: 'active' | 'inactive'
          hire_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          specialty?: string | null
          license_number?: string | null
          status?: 'active' | 'inactive'
          hire_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          duration: number
          category: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          duration: number
          category?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          duration?: number
          category?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
