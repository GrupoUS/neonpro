export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string | null
          data_hora: string
          duracao: number | null
          id: string
          observacoes: string | null
          paciente_id: string | null
          profissional_id: string | null
          servico_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_hora: string
          duracao?: number | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          profissional_id?: string | null
          servico_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_hora?: string
          duracao?: number | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          profissional_id?: string | null
          servico_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_alunos: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          pratica_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          pratica_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          pratica_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_alunos_pratica_id_fkey"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_aluno"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_pratica"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_pacientes: {
        Row: {
          aluno_id: string | null
          created_at: string
          horario_fim: string
          horario_inicio: string
          id: string
          observacoes: string | null
          paciente_id: string
          pratica_id: string
          procedure_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          horario_fim: string
          horario_inicio: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          pratica_id: string
          procedure_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          horario_fim?: string
          horario_inicio?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          pratica_id?: string
          procedure_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_pacientes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pacientes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pacientes_pratica_id_fkey"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_pacientes_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_pacientes_aluno"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_pacientes_paciente"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_pacientes_pratica"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_pacientes_procedure"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          course_year: number | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          registration_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_year?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_year?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appearance_settings: {
        Row: {
          created_at: string | null
          date_format: string | null
          id: string
          language: string | null
          sidebar_collapsed: boolean | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointment_procedures: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          notes: string | null
          price_at_booking: number
          procedure_id: string
          quantity: number
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          price_at_booking: number
          procedure_id: string
          quantity?: number
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          price_at_booking?: number
          procedure_id?: string
          quantity?: number
        }
        Relationships: []
      }
      appointments: {
        Row: {
          after_photos_url: string[] | null
          before_photos_url: string[] | null
          client_id: string
          course_id: string | null
          created_at: string
          end_time: string
          id: string
          instructor_notes: string | null
          notes: string | null
          price_at_booking: number
          procedure_type: string | null
          professional_id: string
          service_id: string
          start_time: string
          status: string
          student_feedback: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          after_photos_url?: string[] | null
          before_photos_url?: string[] | null
          client_id: string
          course_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          instructor_notes?: string | null
          notes?: string | null
          price_at_booking: number
          procedure_type?: string | null
          professional_id: string
          service_id: string
          start_time: string
          status: string
          student_feedback?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          after_photos_url?: string[] | null
          before_photos_url?: string[] | null
          client_id?: string
          course_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          instructor_notes?: string | null
          notes?: string | null
          price_at_booking?: number
          procedure_type?: string | null
          professional_id?: string
          service_id?: string
          start_time?: string
          status?: string
          student_feedback?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          professional_id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          professional_id: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          professional_id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conteudo: string
          id: string
          metadata: Json | null
          processed: boolean | null
          session_id: string
          timestamp: string
          tipo: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          conteudo: string
          id?: string
          metadata?: Json | null
          processed?: boolean | null
          session_id: string
          timestamp?: string
          tipo: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          conteudo?: string
          id?: string
          metadata?: Json | null
          processed?: boolean | null
          session_id?: string
          timestamp?: string
          tipo?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          configuracoes: Json | null
          contexto: Json | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuracoes?: Json | null
          contexto?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuracoes?: Json | null
          contexto?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_analytics: {
        Row: {
          dados: Json | null
          evento: string
          id: string
          session_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          dados?: Json | null
          evento: string
          id?: string
          session_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          dados?: Json | null
          evento?: string
          id?: string
          session_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_config: {
        Row: {
          automacoes_ativas: Json | null
          comandos_customizados: Json | null
          created_at: string
          id: string
          max_tokens: number | null
          modelo_preferido: string | null
          openrouter_api_key: string | null
          personalidade: Json | null
          temperatura: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          automacoes_ativas?: Json | null
          comandos_customizados?: Json | null
          created_at?: string
          id?: string
          max_tokens?: number | null
          modelo_preferido?: string | null
          openrouter_api_key?: string | null
          personalidade?: Json | null
          temperatura?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          automacoes_ativas?: Json | null
          comandos_customizados?: Json | null
          created_at?: string
          id?: string
          max_tokens?: number | null
          modelo_preferido?: string | null
          openrouter_api_key?: string | null
          personalidade?: Json | null
          temperatura?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_portal_access: {
        Row: {
          access_token: string
          client_id: string
          clinic_user_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
        }
        Insert: {
          access_token: string
          client_id: string
          clinic_user_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
        }
        Update: {
          access_token?: string
          client_id?: string
          clinic_user_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
        }
        Relationships: []
      }
      client_portal_settings: {
        Row: {
          auto_confirm_appointments: boolean
          booking_advance_days: number
          booking_instructions: string | null
          booking_notice_hours: number
          created_at: string
          enable_self_booking: boolean
          id: string
          show_prices: boolean
          updated_at: string
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          auto_confirm_appointments?: boolean
          booking_advance_days?: number
          booking_instructions?: string | null
          booking_notice_hours?: number
          created_at?: string
          enable_self_booking?: boolean
          id?: string
          show_prices?: boolean
          updated_at?: string
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          auto_confirm_appointments?: boolean
          booking_advance_days?: number
          booking_instructions?: string | null
          booking_notice_hours?: number
          created_at?: string
          enable_self_booking?: boolean
          id?: string
          show_prices?: boolean
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
        }\n        Relationships: []\n      }\n      clients: {\n        Row: {\n          allergies: string | null\n          birthdate: string | null\n          consent_marketing: boolean | null\n          created_at: string\n          email: string | null\n          emergency_contact_name: string | null\n          emergency_contact_phone: string | null\n          full_name: string\n          id: string\n          instagram_handle: string | null\n          is_model_patient: boolean | null\n          medical_conditions: string | null\n          notes: string | null\n          phone: string | null\n          preferred_language: string | null\n          previous_procedures: string | null\n          profile_photo_url: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          allergies?: string | null\n          birthdate?: string | null\n          consent_marketing?: boolean | null\n          created_at?: string\n          email?: string | null\n          emergency_contact_name?: string | null\n          emergency_contact_phone?: string | null\n          full_name: string\n          id?: string\n          instagram_handle?: string | null\n          is_model_patient?: boolean | null\n          medical_conditions?: string | null\n          notes?: string | null\n          phone?: string | null\n          preferred_language?: string | null\n          previous_procedures?: string | null\n          profile_photo_url?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          allergies?: string | null\n          birthdate?: string | null\n          consent_marketing?: boolean | null\n          created_at?: string\n          email?: string | null\n          emergency_contact_name?: string | null\n          emergency_contact_phone?: string | null\n          full_name?: string\n          id?: string\n          instagram_handle?: string | null\n          is_model_patient?: boolean | null\n          medical_conditions?: string | null\n          notes?: string | null\n          phone?: string | null\n          preferred_language?: string | null\n          previous_procedures?: string | null\n          profile_photo_url?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      clinic_settings: {\n        Row: {\n          address: string | null\n          business_hours: Json | null\n          city: string | null\n          clinic_name: string\n          created_at: string\n          email: string | null\n          id: string\n          logo_url: string | null\n          phone: string | null\n          state: string | null\n          updated_at: string\n          user_id: string\n          zip_code: string | null\n        }\n        Insert: {\n          address?: string | null\n          business_hours?: Json | null\n          city?: string | null\n          clinic_name: string\n          created_at?: string\n          email?: string | null\n          id?: string\n          logo_url?: string | null\n          phone?: string | null\n          state?: string | null\n          updated_at?: string\n          user_id: string\n          zip_code?: string | null\n        }\n        Update: {\n          address?: string | null\n          business_hours?: Json | null\n          city?: string | null\n          clinic_name?: string\n          created_at?: string\n          email?: string | null\n          id?: string\n          logo_url?: string | null\n          phone?: string | null\n          state?: string | null\n          updated_at?: string\n          user_id?: string\n          zip_code?: string | null\n        }\n        Relationships: []\n      }\n      clinicas: {\n        Row: {\n          cnpj: string | null\n          created_at: string\n          email: string | null\n          endereco: string | null\n          especialidades: string[] | null\n          horario_funcionamento: Json | null\n          id: string\n          logo_url: string | null\n          nome_clinica: string\n          telefone: string | null\n          updated_at: string\n          user_id: string\n          website: string | null\n        }\n        Insert: {\n          cnpj?: string | null\n          created_at?: string\n          email?: string | null\n          endereco?: string | null\n          especialidades?: string[] | null\n          horario_funcionamento?: Json | null\n          id?: string\n          logo_url?: string | null\n          nome_clinica: string\n          telefone?: string | null\n          updated_at?: string\n          user_id: string\n          website?: string | null\n        }\n        Update: {\n          cnpj?: string | null\n          created_at?: string\n          email?: string | null\n          endereco?: string | null\n          especialidades?: string[] | null\n          horario_funcionamento?: Json | null\n          id?: string\n          logo_url?: string | null\n          nome_clinica?: string\n          telefone?: string | null\n          updated_at?: string\n          user_id?: string\n          website?: string | null\n        }\n        Relationships: []\n      }\n      course_enrollments: {\n        Row: {\n          client_id: string\n          consent_form_signed: boolean | null\n          course_id: string\n          created_at: string\n          enrollment_date: string\n          id: string\n          medical_clearance: boolean | null\n          notes: string | null\n          payment_status: string\n          status: string\n          updated_at: string\n        }\n        Insert: {\n          client_id: string\n          consent_form_signed?: boolean | null\n          course_id: string\n          created_at?: string\n          enrollment_date?: string\n          id?: string\n          medical_clearance?: boolean | null\n          notes?: string | null\n          payment_status?: string\n          status?: string\n          updated_at?: string\n        }\n        Update: {\n          client_id?: string\n          consent_form_signed?: boolean | null\n          course_id?: string\n          created_at?: string\n          enrollment_date?: string\n          id?: string\n          medical_clearance?: boolean | null\n          notes?: string | null\n          payment_status?: string\n          status?: string\n          updated_at?: string\n        }\n        Relationships: [\n          {\n            foreignKeyName: "course_enrollments_client_id_fkey"\n            columns: ["client_id"]\n            isOneToOne: false\n            referencedRelation: "clients"\n            referencedColumns: ["id"]\n          },\n          {\n            foreignKeyName: "course_enrollments_course_id_fkey"\n            columns: ["course_id"]\n            isOneToOne: false\n            referencedRelation: "courses"\n            referencedColumns: ["id"]\n          },\n        ]\n      }\n      courses: {\n        Row: {\n          created_at: string\n          description: string | null\n          duration_hours: number\n          end_date: string | null\n          id: string\n          is_active: boolean\n          max_students: number\n          name: string\n          price: number\n          start_date: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          created_at?: string\n          description?: string | null\n          duration_hours?: number\n          end_date?: string | null\n          id?: string\n          is_active?: boolean\n          max_students?: number\n          name: string\n          price?: number\n          start_date?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          created_at?: string\n          description?: string | null\n          duration_hours?: number\n          end_date?: string | null\n          id?: string\n          is_active?: boolean\n          max_students?: number\n          name?: string\n          price?: number\n          start_date?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      medical_documents: {\n        Row: {\n          client_id: string\n          created_at: string\n          document_type: string\n          file_name: string\n          file_url: string\n          id: string\n          is_verified: boolean | null\n          notes: string | null\n          updated_at: string\n          uploaded_at: string\n          verified_at: string | null\n          verified_by: string | null\n        }\n        Insert: {\n          client_id: string\n          created_at?: string\n          document_type: string\n          file_name: string\n          file_url: string\n          id?: string\n          is_verified?: boolean | null\n          notes?: string | null\n          updated_at?: string\n          uploaded_at?: string\n          verified_at?: string | null\n          verified_by?: string | null\n        }\n        Update: {\n          client_id?: string\n          created_at?: string\n          document_type?: string\n          file_name?: string\n          file_url?: string\n          id?: string\n          is_verified?: boolean | null\n          notes?: string | null\n          updated_at?: string\n          uploaded_at?: string\n          verified_at?: string | null\n          verified_by?: string | null\n        }\n        Relationships: [\n          {\n            foreignKeyName: "medical_documents_client_id_fkey"\n            columns: ["client_id"]\n            isOneToOne: false\n            referencedRelation: "clients"\n            referencedColumns: ["id"]\n          },\n        ]\n      }\n      notification_settings: {\n        Row: {\n          created_at: string | null\n          email_appointments: boolean | null\n          email_marketing: boolean | null\n          email_reminders: boolean | null\n          id: string\n          push_notifications: boolean | null\n          reminder_hours_before: number | null\n          sms_appointments: boolean | null\n          sms_reminders: boolean | null\n          updated_at: string | null\n          user_id: string\n        }\n        Insert: {\n          created_at?: string | null\n          email_appointments?: boolean | null\n          email_marketing?: boolean | null\n          email_reminders?: boolean | null\n          id?: string\n          push_notifications?: boolean | null\n          reminder_hours_before?: number | null\n          sms_appointments?: boolean | null\n          sms_reminders?: boolean | null\n          updated_at?: string | null\n          user_id: string\n        }\n        Update: {\n          created_at?: string | null\n          email_appointments?: boolean | null\n          email_marketing?: boolean | null\n          email_reminders?: boolean | null\n          id?: string\n          push_notifications?: boolean | null\n          reminder_hours_before?: number | null\n          sms_appointments?: boolean | null\n          sms_reminders?: boolean | null\n          updated_at?: string | null\n          user_id?: string\n        }\n        Relationships: []\n      }\n      notifications: {\n        Row: {\n          action_url: string | null\n          created_at: string\n          id: string\n          is_read: boolean | null\n          message: string\n          related_entity_id: string | null\n          related_entity_type: string | null\n          title: string\n          type: string\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          action_url?: string | null\n          created_at?: string\n          id?: string\n          is_read?: boolean | null\n          message: string\n          related_entity_id?: string | null\n          related_entity_type?: string | null\n          title: string\n          type?: string\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          action_url?: string | null\n          created_at?: string\n          id?: string\n          is_read?: boolean | null\n          message?: string\n          related_entity_id?: string | null\n          related_entity_type?: string | null\n          title?: string\n          type?: string\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      paciente_preferencias: {\n        Row: {\n          aceita_notificacoes: boolean | null\n          created_at: string\n          disponibilidade_dias: number[] | null\n          horario_preferido_fim: string | null\n          horario_preferido_inicio: string | null\n          id: string\n          observacoes: string | null\n          procedimentos_interesse: string[] | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          aceita_notificacoes?: boolean | null\n          created_at?: string\n          disponibilidade_dias?: number[] | null\n          horario_preferido_fim?: string | null\n          horario_preferido_inicio?: string | null\n          id?: string\n          observacoes?: string | null\n          procedimentos_interesse?: string[] | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          aceita_notificacoes?: boolean | null\n          created_at?: string\n          disponibilidade_dias?: number[] | null\n          horario_preferido_fim?: string | null\n          horario_preferido_inicio?: string | null\n          id?: string\n          observacoes?: string | null\n          procedimentos_interesse?: string[] | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      pacientes: {\n        Row: {\n          celular: string | null\n          contato_emergencia: Json | null\n          cpf: string | null\n          created_at: string | null\n          data_nascimento: string | null\n          email: string | null\n          endereco: Json | null\n          estado_civil: string | null\n          id: string\n          informacoes_medicas: Json | null\n          nome: string\n          observacoes: string | null\n          profissao: string | null\n          rg: string | null\n          telefone: string | null\n          updated_at: string | null\n          user_id: string | null\n        }\n        Insert: {\n          celular?: string | null\n          contato_emergencia?: Json | null\n          cpf?: string | null\n          created_at?: string | null\n          data_nascimento?: string | null\n          email?: string | null\n          endereco?: Json | null\n          estado_civil?: string | null\n          id?: string\n          informacoes_medicas?: Json | null\n          nome: string\n          observacoes?: string | null\n          profissao?: string | null\n          rg?: string | null\n          telefone?: string | null\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Update: {\n          celular?: string | null\n          contato_emergencia?: Json | null\n          cpf?: string | null\n          created_at?: string | null\n          data_nascimento?: string | null\n          email?: string | null\n          endereco?: Json | null\n          estado_civil?: string | null\n          id?: string\n          informacoes_medicas?: Json | null\n          nome?: string\n          observacoes?: string | null\n          profissao?: string | null\n          rg?: string | null\n          telefone?: string | null\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Relationships: []\n      }\n      pratica_procedimentos: {\n        Row: {\n          created_at: string\n          id: string\n          pratica_id: string\n          procedure_id: string\n        }\n        Insert: {\n          created_at?: string\n          id?: string\n          pratica_id: string\n          procedure_id: string\n        }\n        Update: {\n          created_at?: string\n          id?: string\n          pratica_id?: string\n          procedure_id?: string\n        }\n        Relationships: [\n          {\n            foreignKeyName: "fk_pratica_procedimentos_pratica"\n            columns: ["pratica_id"]\n            isOneToOne: false\n            referencedRelation: "praticas_presenciais"\n            referencedColumns: ["id"]\n          },\n          {\n            foreignKeyName: "fk_pratica_procedimentos_procedure"\n            columns: ["procedure_id"]\n            isOneToOne: false\n            referencedRelation: "procedures"\n            referencedColumns: ["id"]\n          },\n          {\n            foreignKeyName: "pratica_procedimentos_pratica_id_fkey"\n            columns: ["pratica_id"]\n            isOneToOne: false\n            referencedRelation: "praticas_presenciais"\n            referencedColumns: ["id"]\n          },\n          {\n            foreignKeyName: "pratica_procedimentos_procedure_id_fkey"\n            columns: ["procedure_id"]\n            isOneToOne: false\n            referencedRelation: "procedures"\n            referencedColumns: ["id"]\n          },\n        ]\n      }\n      praticas_presenciais: {\n        Row: {\n          created_at: string\n          data_pratica: string\n          descricao: string | null\n          horario_fim: string\n          horario_inicio: string\n          id: string\n          is_active: boolean\n          max_alunos: number | null\n          max_pacientes: number | null\n          nome_pratica: string\n          professor_id: string\n          updated_at: string\n        }\n        Insert: {\n          created_at?: string\n          data_pratica: string\n          descricao?: string | null\n          horario_fim: string\n          horario_inicio: string\n          id?: string\n          is_active?: boolean\n          max_alunos?: number | null\n          max_pacientes?: number | null\n          nome_pratica: string\n          professor_id: string\n          updated_at?: string\n        }\n        Update: {\n          created_at?: string\n          data_pratica?: string\n          descricao?: string | null\n          horario_fim?: string\n          horario_inicio?: string\n          id?: string\n          is_active?: boolean\n          max_alunos?: number | null\n          max_pacientes?: number | null\n          nome_pratica?: string\n          professor_id?: string\n          updated_at?: string\n        }\n        Relationships: [\n          {\n            foreignKeyName: "fk_praticas_professor"\n            columns: ["professor_id"]\n            isOneToOne: false\n            referencedRelation: "professores"\n            referencedColumns: ["id"]\n          },\n          {\n            foreignKeyName: "praticas_presenciais_professor_id_fkey"\n            columns: ["professor_id"]\n            isOneToOne: false\n            referencedRelation: "professores"\n            referencedColumns: ["id"]\n          },\n        ]\n      }\n      procedures: {\n        Row: {\n          aftercare_instructions: string | null\n          category: string\n          color: string | null\n          contraindications: string | null\n          created_at: string\n          description: string | null\n          duration_minutes: number\n          id: string\n          is_active: boolean\n          name: string\n          price: number\n          requirements: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          aftercare_instructions?: string | null\n          category?: string\n          color?: string | null\n          contraindications?: string | null\n          created_at?: string\n          description?: string | null\n          duration_minutes?: number\n          id?: string\n          is_active?: boolean\n          name: string\n          price?: number\n          requirements?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          aftercare_instructions?: string | null\n          category?: string\n          color?: string | null\n          contraindications?: string | null\n          created_at?: string\n          description?: string | null\n          duration_minutes?: number\n          id?: string\n          is_active?: boolean\n          name?: string\n          price?: number\n          requirements?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      professionals: {\n        Row: {\n          bio: string | null\n          created_at: string\n          email: string | null\n          full_name: string\n          id: string\n          is_active: boolean\n          phone: string | null\n          specialty: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          bio?: string | null\n          created_at?: string\n          email?: string | null\n          full_name: string\n          id?: string\n          is_active?: boolean\n          phone?: string | null\n          specialty?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          bio?: string | null\n          created_at?: string\n          email?: string | null\n          full_name?: string\n          id?: string\n          is_active?: boolean\n          phone?: string | null\n          specialty?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      professores: {\n        Row: {\n          bio: string | null\n          created_at: string\n          email: string | null\n          full_name: string\n          id: string\n          is_active: boolean\n          phone: string | null\n          specialty: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          bio?: string | null\n          created_at?: string\n          email?: string | null\n          full_name: string\n          id?: string\n          is_active?: boolean\n          phone?: string | null\n          specialty?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          bio?: string | null\n          created_at?: string\n          email?: string | null\n          full_name?: string\n          id?: string\n          is_active?: boolean\n          phone?: string | null\n          specialty?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      profiles: {\n        Row: {\n          avatar_url: string | null\n          created_at: string | null\n          email: string | null\n          id: string\n          name: string | null\n          phone: string | null\n          role: string | null\n          updated_at: string | null\n        }\n        Insert: {\n          avatar_url?: string | null\n          created_at?: string | null\n          email?: string | null\n          id: string\n          name?: string | null\n          phone?: string | null\n          role?: string | null\n          updated_at?: string | null\n        }\n        Update: {\n          avatar_url?: string | null\n          created_at?: string | null\n          email?: string | null\n          id?: string\n          name?: string | null\n          phone?: string | null\n          role?: string | null\n          updated_at?: string | null\n        }\n        Relationships: []\n      }\n      security_settings: {\n        Row: {\n          backup_codes: string[] | null\n          created_at: string | null\n          id: string\n          login_notifications: boolean | null\n          password_changed_at: string | null\n          session_timeout_minutes: number | null\n          two_factor_enabled: boolean | null\n          updated_at: string | null\n          user_id: string\n        }\n        Insert: {\n          backup_codes?: string[] | null\n          created_at?: string | null\n          id?: string\n          login_notifications?: boolean | null\n          password_changed_at?: string | null\n          session_timeout_minutes?: number | null\n          two_factor_enabled?: boolean | null\n          updated_at?: string | null\n          user_id: string\n        }\n        Update: {\n          backup_codes?: string[] | null\n          created_at?: string | null\n          id?: string\n          login_notifications?: boolean | null\n          password_changed_at?: string | null\n          session_timeout_minutes?: number | null\n          two_factor_enabled?: boolean | null\n          updated_at?: string | null\n          user_id?: string\n        }\n        Relationships: []\n      }\n      services: {\n        Row: {\n          color: string | null\n          created_at: string\n          description: string | null\n          duration_minutes: number\n          id: string\n          is_active: boolean\n          name: string\n          price: number\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          color?: string | null\n          created_at?: string\n          description?: string | null\n          duration_minutes: number\n          id?: string\n          is_active?: boolean\n          name: string\n          price: number\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          color?: string | null\n          created_at?: string\n          description?: string | null\n          duration_minutes?: number\n          id?: string\n          is_active?: boolean\n          name?: string\n          price?: number\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      servicos: {\n        Row: {\n          ativo: boolean | null\n          created_at: string | null\n          descricao: string | null\n          duracao: number | null\n          id: string\n          nome_servico: string\n          preco: number\n          updated_at: string | null\n          user_id: string | null\n        }\n        Insert: {\n          ativo?: boolean | null\n          created_at?: string | null\n          descricao?: string | null\n          duracao?: number | null\n          id?: string\n          nome_servico: string\n          preco: number\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Update: {\n          ativo?: boolean | null\n          created_at?: string | null\n          descricao?: string | null\n          duracao?: number | null\n          id?: string\n          nome_servico?: string\n          preco?: number\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Relationships: []\n      }\n      time_off: {\n        Row: {\n          created_at: string\n          end_date: string\n          end_time: string | null\n          id: string\n          is_recurring: boolean\n          professional_id: string\n          reason: string | null\n          recurrence_pattern: string | null\n          start_date: string\n          start_time: string | null\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          created_at?: string\n          end_date: string\n          end_time?: string | null\n          id?: string\n          is_recurring?: boolean\n          professional_id: string\n          reason?: string | null\n          recurrence_pattern?: string | null\n          start_date: string\n          start_time?: string | null\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          created_at?: string\n          end_date?: string\n          end_time?: string | null\n          id?: string\n          is_recurring?: boolean\n          professional_id?: string\n          reason?: string | null\n          recurrence_pattern?: string | null\n          start_date?: string\n          start_time?: string | null\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n      transacoes: {\n        Row: {\n          categoria: string\n          created_at: string\n          data_transacao: string\n          descricao: string\n          id: string\n          observacoes: string | null\n          tipo: string\n          updated_at: string\n          user_id: string\n          valor: number\n        }\n        Insert: {\n          categoria: string\n          created_at?: string\n          data_transacao?: string\n          descricao: string\n          id?: string\n          observacoes?: string | null\n          tipo: string\n          updated_at?: string\n          user_id: string\n          valor: number\n        }\n        Update: {\n          categoria?: string\n          created_at?: string\n          data_transacao?: string\n          descricao?: string\n          id?: string\n          observacoes?: string | null\n          tipo?: string\n          updated_at?: string\n          user_id?: string\n          valor?: number\n        }\n        Relationships: []\n      }\n      transactions: {\n        Row: {\n          amount: number\n          appointment_id: string | null\n          category: string\n          created_at: string\n          description: string\n          id: string\n          payment_method: string | null\n          transaction_date: string\n          type: string\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          amount: number\n          appointment_id?: string | null\n          category: string\n          created_at?: string\n          description: string\n          id?: string\n          payment_method?: string | null\n          transaction_date?: string\n          type: string\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          amount?: number\n          appointment_id?: string | null\n          category?: string\n          created_at?: string\n          description?: string\n          id?: string\n          payment_method?: string | null\n          transaction_date?: string\n          type?: string\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: [\n          {\n            foreignKeyName: "transactions_appointment_id_fkey"\n            columns: ["appointment_id"]\n            isOneToOne: false\n            referencedRelation: "appointments"\n            referencedColumns: ["id"]\n          },\n        ]\n      }\n      user_profiles: {\n        Row: {\n          ativo: boolean | null\n          created_at: string | null\n          crm: string | null\n          email: string\n          especialidade: string | null\n          id: string\n          nome: string\n          role: string\n          telefone: string | null\n          updated_at: string | null\n          user_id: string | null\n        }\n        Insert: {\n          ativo?: boolean | null\n          created_at?: string | null\n          crm?: string | null\n          email: string\n          especialidade?: string | null\n          id?: string\n          nome: string\n          role: string\n          telefone?: string | null\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Update: {\n          ativo?: boolean | null\n          created_at?: string | null\n          crm?: string | null\n          email?: string\n          especialidade?: string | null\n          id?: string\n          nome?: string\n          role?: string\n          telefone?: string | null\n          updated_at?: string | null\n          user_id?: string | null\n        }\n        Relationships: []\n      }\n      user_roles: {\n        Row: {\n          created_at: string\n          id: string\n          role: Database[\"public\"][\"Enums\"][\"app_role\"]\n          updated_at: string\n          user_id: string\n        }\n        Insert: {\n          created_at?: string\n          id?: string\n          role: Database[\"public\"][\"Enums\"][\"app_role\"]\n          updated_at?: string\n          user_id: string\n        }\n        Update: {\n          created_at?: string\n          id?: string\n          role?: Database[\"public\"][\"Enums\"][\"app_role\"]\n          updated_at?: string\n          user_id?: string\n        }\n        Relationships: []\n      }\n    }\n    Views: {\n      [_ in never]: never\n    }\n    Functions: {\n      cleanup_old_chat_sessions: {\n        Args: Record<PropertyKey, never>\n        Returns: undefined\n      }\n      has_role: {\n        Args: {\n          _user_id: string\n          _role: Database[\"public\"][\"Enums\"][\"app_role\"]\n        }\n        Returns: boolean\n      }\n    }\n    Enums: {\n      app_role: \"administrador\" | \"professor\" | \"aluno\" | \"paciente_modelo\"\n    }\n    CompositeTypes: {\n      [_ in never]: never\n    }\n  }\n}\n\ntype DefaultSchema = Database[Extract<keyof Database, \"public\">]\n\nexport type Tables<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof (DefaultSchema[\"Tables\"] & DefaultSchema[\"Views\"])\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof (Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"] &\n        Database[DefaultTableNameOrOptions[\"schema\"]][\"Views\"])\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? (DefaultSchema[\"Tables\"] &\n      DefaultSchema[\"Views\"])[TableName] extends {\n      Row: infer R\n    }\n    ? R\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema[\"Tables\"] &\n        DefaultSchema[\"Views\"])\n    ? (DefaultSchema[\"Tables\"] &\n        DefaultSchema[\"Views\"])[DefaultSchemaTableNameOrOptions] extends {\n        Row: infer R\n      }\n      ? R\n      : never\n    : never\n\nexport type TablesInsert<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema[\"Tables\"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"][TableName] extends {\n      Insert: infer I\n    }\n    ? I\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema[\"Tables\"]\n    ? DefaultSchema[\"Tables\"][DefaultSchemaTableNameOrOptions] extends {\n        Insert: infer I\n      }\n      ? I\n      : never\n    : never\n\nexport type TablesUpdate<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema[\"Tables\"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions[\"schema\"]][\"Tables\"][TableName] extends {\n      Update: infer U\n    }\n    ? U\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema[\"Tables\"]\n    ? DefaultSchema[\"Tables\"][DefaultSchemaTableNameOrOptions] extends {\n        Update: infer U\n      }\n      ? U\n      : never\n    : never\n\nexport type Enums<\n  DefaultSchemaEnumNameOrOptions extends\n    | keyof DefaultSchema[\"Enums\"]\n    | { schema: keyof Database },\n  EnumName extends DefaultSchemaEnumNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaEnumNameOrOptions[\"schema\"]][\"Enums\"]\n    : never = never,\n> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaEnumNameOrOptions[\"schema\"]][\"Enums\"][EnumName]\n  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema[\"Enums\"]\n    ? DefaultSchema[\"Enums\"][DefaultSchemaEnumNameOrOptions]\n    : never\n\nexport type CompositeTypes<\n  PublicCompositeTypeNameOrOptions extends\n    | keyof DefaultSchema[\"CompositeTypes\"]\n    | { schema: keyof Database },\n  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[PublicCompositeTypeNameOrOptions[\"schema\"]][\"CompositeTypes\"]\n    : never = never,\n> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }\n  ? Database[PublicCompositeTypeNameOrOptions[\"schema\"]][\"CompositeTypes\"][CompositeTypeName]\n  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema[\"CompositeTypes\"]\n    ? DefaultSchema[\"CompositeTypes\"][PublicCompositeTypeNameOrOptions]\n    : never\n\nexport const Constants = {\n  public: {\n    Enums: {\n      app_role: [\"administrador\", \"professor\", \"aluno\", \"paciente_modelo\"],\n    },\n  },\n} as const\n
