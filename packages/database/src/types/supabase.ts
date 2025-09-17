export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          accuracy: number
          clinic_id: string | null
          confidence_interval: Json
          created_at: string | null
          evaluation_date: string
          f1_score: number
          id: string
          model_id: string | null
          model_version: string
          p_value: number | null
          precision: number
          recall: number
          sample_size: number
          statistical_significance: boolean
          test_id: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy: number
          clinic_id?: string | null
          confidence_interval?: Json
          created_at?: string | null
          evaluation_date?: string
          f1_score: number
          id?: string
          model_id?: string | null
          model_version: string
          p_value?: number | null
          precision: number
          recall: number
          sample_size: number
          statistical_significance?: boolean
          test_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number
          clinic_id?: string | null
          confidence_interval?: Json
          created_at?: string | null
          evaluation_date?: string
          f1_score?: number
          id?: string
          model_id?: string | null
          model_version?: string
          p_value?: number | null
          precision?: number
          recall?: number
          sample_size?: number
          statistical_significance?: boolean
          test_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "ab_test_results_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_model_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_test_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          model_a_id: string | null
          model_b_id: string | null
          start_date: string
          status: string
          success_criteria: Json
          test_name: string
          traffic_split: number
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          model_a_id?: string | null
          model_b_id?: string | null
          start_date?: string
          status: string
          success_criteria?: Json
          test_name: string
          traffic_split: number
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          model_a_id?: string | null
          model_b_id?: string | null
          start_date?: string
          status?: string
          success_criteria?: Json
          test_name?: string
          traffic_split?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "ab_tests_model_a_id_fkey"
            columns: ["model_a_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_model_a_id_fkey"
            columns: ["model_a_id"]
            isOneToOne: false
            referencedRelation: "ml_model_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_model_b_id_fkey"
            columns: ["model_b_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_tests_model_b_id_fkey"
            columns: ["model_b_id"]
            isOneToOne: false
            referencedRelation: "ml_model_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      access_audit_log: {
        Row: {
          access_granted: boolean
          action_attempted: Database["public"]["Enums"]["permission_action"]
          affected_profile_id: string | null
          created_at: string
          data_exported: boolean | null
          denial_reason: string | null
          export_format: string | null
          id: string
          ip_address: unknown | null
          justification: string | null
          request_method: string | null
          request_path: string | null
          resource_id: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          sensitive_data_accessed: string[] | null
          session_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          access_granted: boolean
          action_attempted: Database["public"]["Enums"]["permission_action"]
          affected_profile_id?: string | null
          created_at?: string
          data_exported?: boolean | null
          denial_reason?: string | null
          export_format?: string | null
          id?: string
          ip_address?: unknown | null
          justification?: string | null
          request_method?: string | null
          request_path?: string | null
          resource_id?: string | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          sensitive_data_accessed?: string[] | null
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          access_granted?: boolean
          action_attempted?: Database["public"]["Enums"]["permission_action"]
          affected_profile_id?: string | null
          created_at?: string
          data_exported?: boolean | null
          denial_reason?: string | null
          export_format?: string | null
          id?: string
          ip_address?: unknown | null
          justification?: string | null
          request_method?: string | null
          request_path?: string | null
          resource_id?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          sensitive_data_accessed?: string[] | null
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      access_violations: {
        Row: {
          action_attempted:
            | Database["public"]["Enums"]["permission_action"]
            | null
          admin_notified: boolean | null
          auto_blocked: boolean | null
          created_at: string
          id: string
          investigated: boolean | null
          investigated_at: string | null
          investigated_by: string | null
          investigation_notes: string | null
          ip_address: unknown
          request_body: Json | null
          request_headers: Json | null
          request_method: string | null
          request_path: string | null
          resource_type: Database["public"]["Enums"]["resource_type"] | null
          severity: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          violation_type: string
        }
        Insert: {
          action_attempted?:
            | Database["public"]["Enums"]["permission_action"]
            | null
          admin_notified?: boolean | null
          auto_blocked?: boolean | null
          created_at?: string
          id?: string
          investigated?: boolean | null
          investigated_at?: string | null
          investigated_by?: string | null
          investigation_notes?: string | null
          ip_address: unknown
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_path?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          severity?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          violation_type: string
        }
        Update: {
          action_attempted?:
            | Database["public"]["Enums"]["permission_action"]
            | null
          admin_notified?: boolean | null
          auto_blocked?: boolean | null
          created_at?: string
          id?: string
          investigated?: boolean | null
          investigated_at?: string | null
          investigated_by?: string | null
          investigation_notes?: string | null
          ip_address?: unknown
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_path?: string | null
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          severity?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_violations_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_violations_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_violations_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
        ]
      },
      accounts_payable: {
        Row: {
          ap_number: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          expense_category_id: string
          gross_amount: number
          id: string
          invoice_date: string | null
          invoice_number: string | null
          net_amount: number
          paid_amount: number | null
          status: string | null
          tax_amount: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          ap_number: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          expense_category_id: string
          gross_amount: number
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          net_amount: number
          paid_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          ap_number?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          expense_category_id?: string
          gross_amount?: number
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          net_amount?: number
          paid_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          clinic_id: string
          confirmation_sent_at: string | null
          created_at: string | null
          created_by: string
          end_time: string
          id: string
          internal_notes: string | null
          notes: string | null
          patient_id: string
          priority: number | null
          professional_id: string
          reminder_sent_at: string | null
          room_id: string | null
          service_type_id: string
          sms_reminder_sent: boolean | null
          start_time: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
          whatsapp_reminder_sent: boolean | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinic_id: string
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by: string
          end_time: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          patient_id: string
          priority?: number | null
          professional_id: string
          reminder_sent_at?: string | null
          room_id?: string | null
          service_type_id: string
          sms_reminder_sent?: boolean | null
          start_time: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_reminder_sent?: boolean | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinic_id?: string
          confirmation_sent_at?: string | null
          created_at?: string | null
          created_by?: string
          end_time?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          patient_id?: string
          priority?: number | null
          professional_id?: string
          reminder_sent_at?: string | null
          room_id?: string | null
          service_type_id?: string
          sms_reminder_sent?: boolean | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          whatsapp_reminder_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "analytics_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_professional"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_service_type"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address_city: string | null
          address_line_1: string | null
          address_line_2: string | null
          address_postal_code: string | null
          address_state: string | null
          birth_date: string | null
          clinic_id: string
          created_at: string | null
          created_by: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_company: string | null
          insurance_id_number: string | null
          is_active: boolean | null
          marital_status: string | null
          nationality: string | null
          notes: string | null
          occupation: string | null
          patient_number: string
          phone: string | null
          preferred_communication_method: string | null
          preferred_language: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          birth_date?: string | null
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_company?: string | null
          insurance_id_number?: string | null
          is_active?: boolean | null
          marital_status?: string | null
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          patient_number: string
          phone?: string | null
          preferred_communication_method?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          birth_date?: string | null
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_company?: string | null
          insurance_id_number?: string | null
          is_active?: boolean | null
          marital_status?: string | null
          nationality?: string | null
          notes?: string | null
          occupation?: string | null
          patient_number?: string
          phone?: string | null
          preferred_communication_method?: string | null
          preferred_language?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      professionals: {
        Row: {
          clinic_id: string
          created_at: string | null
          crm_number: string | null
          crm_state: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          profile_id: string
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          crm_number?: string | null
          crm_state?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          profile_id: string
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          crm_number?: string | null
          crm_state?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          profile_id?: string
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "professionals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line1: string | null
          address_line2: string | null
          address_postal_code: string | null
          address_state: string | null
          birth_date: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          professional_title: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          gender?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          professional_title?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          professional_title?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          clinic_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          service_category_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          service_category_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          service_category_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "service_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_types_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "professional_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "unread_messages_by_user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clinics: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line1: string | null
          address_line2: string | null
          address_postal_code: string | null
          address_state: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          name: string
          phone: string | null
          settings: Json | null
          subscription_plan: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          subscription_plan?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          mfa_enabled: boolean
          permissions: Json
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          mfa_enabled?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          mfa_enabled?: boolean
          permissions?: Json
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      professional_overview: {
        Row: {
          active_alerts: number | null
          active_certifications: number | null
          active_registrations: number | null
          certifications_expiring_soon: number | null
          compliance_score: number | null
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at: string | null
          critical_alerts: number | null
          department: string | null
          email: string | null
          expired_certifications: number | null
          expired_registrations: number | null
          full_name: string | null
          id: string | null
          last_assessment_date: string | null
          next_review_date: string | null
          professional_title: string | null
          registrations_expiring_soon: number | null
          role: string | null
          total_certifications: number | null
          total_registrations: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      analytics_patients: {
        Row: {
          age_years: number | null
          city: string | null
          clinic_id: string | null
          created_at: string | null
          gender_code: string | null
          id: string | null
          patient_count: number | null
          registration_date: string | null
          registration_month: number | null
          registration_month_start: string | null
          registration_quarter_start: string | null
          registration_year: number | null
          state: string | null
        }
        Insert: {
          age_years?: never
          city?: never
          clinic_id?: string | null
          created_at?: string | null
          gender_code?: never
          id?: string | null
          patient_count?: never
          registration_date?: never
          registration_month?: never
          registration_month_start?: never
          registration_quarter_start?: never
          registration_year?: never
          state?: never
        }
        Update: {
          age_years?: never
          city?: never
          clinic_id?: string | null
          created_at?: string | null
          gender_code?: never
          id?: string | null
          patient_count?: never
          registration_date?: never
          registration_month?: never
          registration_month_start?: never
          registration_quarter_start?: never
          registration_year?: never
          state?: never
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "communication_stats_by_clinic"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      unread_messages_by_user: {
        Row: {
          latest_message_at: string | null
          unread_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      communication_stats_by_clinic: {
        Row: {
          clinic_id: string | null
          clinic_name: string | null
          failed_notifications: number | null
          sent_notifications: number | null
          total_conversations: number | null
          total_messages: number | null
          total_notifications: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_clinician: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      permission_action:
        | "view"
        | "create"
        | "update"
        | "delete"
        | "verify"
        | "approve"
        | "audit"
        | "export"
        | "manage_access"
      resource_type:
        | "professional_registrations"
        | "professional_certifications"
        | "compliance_assessments"
        | "audit_logs"
        | "api_configurations"
        | "compliance_alerts"
        | "reports"
        | "system_settings"
      compliance_status:
        | "compliant"
        | "non_compliant"
        | "pending_review"
        | "under_investigation"
        | "remediation_required"
        | "exempted"
      churn_risk_level: "low" | "medium" | "high" | "critical"
      retention_strategy_type:
        | "email_campaign"
        | "sms_reminder"
        | "discount_offer"
        | "personalized_content"
        | "loyalty_program"
        | "referral_incentive"
        | "appointment_reminder"
        | "birthday_campaign"
        | "reactivation_campaign"
        | "feedback_request"
      engagement_event_type:
        | "appointment_scheduled"
        | "appointment_completed"
        | "appointment_cancelled"
        | "email_opened"
        | "email_clicked"
        | "sms_received"
        | "app_login"
        | "profile_updated"
        | "payment_completed"
        | "review_submitted"
        | "referral_made"
      api_provider_type:
        | "cfm"
        | "crm_state"
        | "coren"
        | "cro"
        | "crf"
        | "crefito"
        | "crn"
        | "crp"
        | "anvisa"
        | "custom_api"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      permission_action: [
        "view",
        "create",
        "update",
        "delete",
        "verify",
        "approve",
        "audit",
        "export",
        "manage_access",
      ],
      resource_type: [
        "professional_registrations",
        "professional_certifications",
        "compliance_assessments",
        "audit_logs",
        "api_configurations",
        "compliance_alerts",
        "reports",
        "system_settings",
      ],
      compliance_status: [
        "compliant",
        "non_compliant",
        "pending_review",
        "under_investigation",
        "remediation_required",
        "exempted",
      ],
      churn_risk_level: ["low", "medium", "high", "critical"],
      retention_strategy_type: [
        "email_campaign",
        "sms_reminder",
        "discount_offer",
        "personalized_content",
        "loyalty_program",
        "referral_incentive",
        "appointment_reminder",
        "birthday_campaign",
        "reactivation_campaign",
        "feedback_request",
      ],
      engagement_event_type: [
        "appointment_scheduled",
        "appointment_completed",
        "appointment_cancelled",
        "email_opened",
        "email_clicked",
        "sms_received",
        "app_login",
        "profile_updated",
        "payment_completed",
        "review_submitted",
        "referral_made",
      ],
      api_provider_type: [
        "cfm",
        "crm_state",
        "coren",
        "cro",
        "crf",
        "crefito",
        "crn",
        "crp",
        "anvisa",
        "custom_api",
      ],
    },
  },
} as const,
      service_categories: {
        Row: {
          clinic_id: string
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      expense_categories: {
        Row: {
          category_code: string
          category_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      },
      vendors: {
        Row: {
          address_line1: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          payment_method: string | null
          payment_terms_days: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_code: string
          vendor_type: string | null
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_code: string
          vendor_type?: string | null
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_code?: string
          vendor_type?: string | null
        }
        Relationships: []
      },
      staff_members: {
        Row: {
          access_level: string | null
          created_at: string | null
          id: string
          profile_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          profile_id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      professionals: {
        Row: {
          clinic_id: string
          created_at: string | null
          default_break_end: string | null
          default_break_start: string | null
          default_end_time: string | null
          default_start_time: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          license_number: string | null
          phone_primary: string | null
          professional_type: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          default_break_end?: string | null
          default_break_start?: string | null
          default_end_time?: string | null
          default_start_time?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone_primary?: string | null
          professional_type?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          default_break_end?: string | null
          default_break_start?: string | null
          default_end_time?: string | null
          default_start_time?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone_primary?: string | null
          professional_type?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      },
      service_types: {
        Row: {
          category_id: string | null
          clinic_id: string
          color: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          clinic_id: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          clinic_id?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      },
      clinics: {
        Row: {
          address_line1: string | null
          business_hours: Json | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          operating_hours: Json | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          business_hours?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          operating_hours?: Json | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          business_hours?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          operating_hours?: Json | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      [_ in never]: never
    },
    Enums: {
      [_ in never]: never
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never