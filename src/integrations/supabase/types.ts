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
      Agendamento: {
        Row: {
          clienteId: string
          createdAt: string
          data: string
          hora: string
          id: string
          profissionalId: string
          servicoId: string
          status: string
          updatedAt: string
        }
        Insert: {
          clienteId: string
          createdAt?: string
          data: string
          hora: string
          id?: string
          profissionalId: string
          servicoId: string
          status: string
          updatedAt?: string
        }
        Update: {
          clienteId?: string
          createdAt?: string
          data?: string
          hora?: string
          id?: string
          profissionalId?: string
          servicoId?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Agendamento_clienteId_fkey"
            columns: ["clienteId"]
            isOneToOne: false
            referencedRelation: "Cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Agendamento_profissionalId_fkey"
            columns: ["profissionalId"]
            isOneToOne: false
            referencedRelation: "Profissional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Agendamento_servicoId_fkey"
            columns: ["servicoId"]
            isOneToOne: false
            referencedRelation: "Servico"
            referencedColumns: ["id"]
          },
        ]
      }
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
      agent_metrics: {
        Row: {
          agent_name: string
          created_at: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          performance_score: number | null
          success: boolean | null
          task_type: string
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          performance_score?: number | null
          success?: boolean | null
          task_type: string
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          performance_score?: number | null
          success?: boolean | null
          task_type?: string
        }
        Relationships: []
      }
      ai_scheduling_optimization: {
        Row: {
          created_at: string | null
          hipaa_consent: boolean | null
          id: string
          model_version: string | null
          optimization_request: Json
          optimization_score: number | null
          optimized_slots: Json
          patient_id: string | null
          patient_preferences: Json | null
          processing_time_ms: number | null
          service_id: string | null
          updated_at: string | null
          urgency_level: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          hipaa_consent?: boolean | null
          id?: string
          model_version?: string | null
          optimization_request: Json
          optimization_score?: number | null
          optimized_slots: Json
          patient_id?: string | null
          patient_preferences?: Json | null
          processing_time_ms?: number | null
          service_id?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          hipaa_consent?: boolean | null
          id?: string
          model_version?: string | null
          optimization_request?: Json
          optimization_score?: number | null
          optimized_slots?: Json
          patient_id?: string | null
          patient_preferences?: Json | null
          processing_time_ms?: number | null
          service_id?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_scheduling_optimization_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_scheduling_optimization_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_treatment_recommendations: {
        Row: {
          client_id: string | null
          confidence_score: number | null
          created_at: string | null
          estimated_cost: number | null
          hipaa_consent: boolean | null
          id: string
          model_version: string | null
          patient_data: Json
          processing_time_ms: number | null
          recommendations: Json
          treatment_areas: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          hipaa_consent?: boolean | null
          id?: string
          model_version?: string | null
          patient_data: Json
          processing_time_ms?: number | null
          recommendations: Json
          treatment_areas?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          hipaa_consent?: boolean | null
          id?: string
          model_version?: string | null
          patient_data?: Json
          processing_time_ms?: number | null
          recommendations?: Json
          treatment_areas?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_treatment_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
        }
        Relationships: []
      }
      Cliente: {
        Row: {
          contato: string
          createdAt: string
          id: string
          nome: string
          updatedAt: string
        }
        Insert: {
          contato: string
          createdAt?: string
          id?: string
          nome: string
          updatedAt?: string
        }
        Update: {
          contato?: string
          createdAt?: string
          id?: string
          nome?: string
          updatedAt?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          allergies: string | null
          birthdate: string | null
          consent_marketing: boolean | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          id: string
          instagram_handle: string | null
          is_model_patient: boolean | null
          medical_conditions: string | null
          notes: string | null
          phone: string | null
          preferred_language: string | null
          previous_procedures: string | null
          profile_photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          birthdate?: string | null
          consent_marketing?: boolean | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          id?: string
          instagram_handle?: string | null
          is_model_patient?: boolean | null
          medical_conditions?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          previous_procedures?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          birthdate?: string | null
          consent_marketing?: boolean | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          is_model_patient?: boolean | null
          medical_conditions?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          previous_procedures?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          address: string | null
          business_hours: Json | null
          city: string | null
          clinic_name: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          clinic_name: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          clinic_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      clinicas: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          especialidades: string[] | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome_clinica: string
          telefone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidades?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_clinica: string
          telefone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidades?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_clinica?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          client_id: string
          consent_form_signed: boolean | null
          course_id: string
          created_at: string
          enrollment_date: string
          id: string
          medical_clearance: boolean | null
          notes: string | null
          payment_status: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          consent_form_signed?: boolean | null
          course_id: string
          created_at?: string
          enrollment_date?: string
          id?: string
          medical_clearance?: boolean | null
          notes?: string | null
          payment_status?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          consent_form_signed?: boolean | null
          course_id?: string
          created_at?: string
          enrollment_date?: string
          id?: string
          medical_clearance?: boolean | null
          notes?: string | null
          payment_status?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number
          end_date: string | null
          id: string
          is_active: boolean
          max_students: number
          name: string
          price: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_students?: number
          name: string
          price?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_students?: number
          name?: string
          price?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          agent_name: string
          context: Json | null
          created_at: string | null
          episode_data: Json
          episode_type: string
          id: string
          processed_at: string | null
          provenance: Json | null
        }
        Insert: {
          agent_name: string
          context?: Json | null
          created_at?: string | null
          episode_data: Json
          episode_type: string
          id?: string
          processed_at?: string | null
          provenance?: Json | null
        }
        Update: {
          agent_name?: string
          context?: Json | null
          created_at?: string | null
          episode_data?: Json
          episode_type?: string
          id?: string
          processed_at?: string | null
          provenance?: Json | null
        }
        Relationships: []
      }
      kg_entities: {
        Row: {
          confidence: number | null
          created_at: string | null
          entity_type: string
          id: string
          properties: Json | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          entity_type: string
          id: string
          properties?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          entity_type?: string
          id?: string
          properties?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kg_relationships: {
        Row: {
          confidence: number | null
          created_at: string | null
          episode_id: string | null
          expired_at: string | null
          id: string
          invalid_at: string | null
          properties: Json | null
          relationship_type: string
          source_entity_id: string | null
          target_entity_id: string | null
          valid_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          episode_id?: string | null
          expired_at?: string | null
          id?: string
          invalid_at?: string | null
          properties?: Json | null
          relationship_type: string
          source_entity_id?: string | null
          target_entity_id?: string | null
          valid_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          episode_id?: string | null
          expired_at?: string | null
          id?: string
          invalid_at?: string | null
          properties?: Json | null
          relationship_type?: string
          source_entity_id?: string | null
          target_entity_id?: string | null
          valid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kg_relationships_source_entity_id_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kg_relationships_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "kg_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_patterns: {
        Row: {
          created_at: string | null
          id: string
          last_used: string | null
          pattern_data: Json
          pattern_type: string
          success_rate: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          pattern_data: Json
          pattern_type: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          pattern_data?: Json
          pattern_type?: string
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          client_id: string
          created_at: string
          document_type: string
          file_name: string
          file_url: string
          id: string
          is_verified: boolean | null
          notes: string | null
          updated_at: string
          uploaded_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_url: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      neonpro_profiles: {
        Row: {
          avatar_url: string | null
          clinic_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neonpro_profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_appointments: boolean | null
          email_marketing: boolean | null
          email_reminders: boolean | null
          id: string
          push_notifications: boolean | null
          reminder_hours_before: number | null
          sms_appointments: boolean | null
          sms_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_appointments?: boolean | null
          email_marketing?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_notifications?: boolean | null
          reminder_hours_before?: number | null
          sms_appointments?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_appointments?: boolean | null
          email_marketing?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_notifications?: boolean | null
          reminder_hours_before?: number | null
          sms_appointments?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paciente_preferencias: {
        Row: {
          aceita_notificacoes: boolean | null
          created_at: string
          disponibilidade_dias: number[] | null
          horario_preferido_fim: string | null
          horario_preferido_inicio: string | null
          id: string
          observacoes: string | null
          procedimentos_interesse: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aceita_notificacoes?: boolean | null
          created_at?: string
          disponibilidade_dias?: number[] | null
          horario_preferido_fim?: string | null
          horario_preferido_inicio?: string | null
          id?: string
          observacoes?: string | null
          procedimentos_interesse?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aceita_notificacoes?: boolean | null
          created_at?: string
          disponibilidade_dias?: number[] | null
          horario_preferido_fim?: string | null
          horario_preferido_inicio?: string | null
          id?: string
          observacoes?: string | null
          procedimentos_interesse?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          celular: string | null
          contato_emergencia: Json | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: Json | null
          estado_civil: string | null
          id: string
          informacoes_medicas: Json | null
          nome: string
          observacoes: string | null
          profissao: string | null
          rg: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          celular?: string | null
          contato_emergencia?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          estado_civil?: string | null
          id?: string
          informacoes_medicas?: Json | null
          nome: string
          observacoes?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          celular?: string | null
          contato_emergencia?: Json | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          estado_civil?: string | null
          id?: string
          informacoes_medicas?: Json | null
          nome?: string
          observacoes?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          clinic_id: string
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          id: string
          medical_history: Json | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          id?: string
          medical_history?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          medical_history?: Json | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string | null
          id: string
          patient_id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          treatment_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string | null
          id?: string
          patient_id: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      pratica_procedimentos: {
        Row: {
          created_at: string
          id: string
          pratica_id: string
          procedure_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pratica_id: string
          procedure_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pratica_id?: string
          procedure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pratica_procedimentos_pratica"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pratica_procedimentos_procedure"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pratica_procedimentos_pratica_id_fkey"
            columns: ["pratica_id"]
            isOneToOne: false
            referencedRelation: "praticas_presenciais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pratica_procedimentos_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      praticas_presenciais: {
        Row: {
          created_at: string
          data_pratica: string
          descricao: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          is_active: boolean
          max_alunos: number | null
          max_pacientes: number | null
          nome_pratica: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_pratica: string
          descricao?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          is_active?: boolean
          max_alunos?: number | null
          max_pacientes?: number | null
          nome_pratica: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_pratica?: string
          descricao?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          is_active?: boolean
          max_alunos?: number | null
          max_pacientes?: number | null
          nome_pratica?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_praticas_professor"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "praticas_presenciais_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          aftercare_instructions: string | null
          category: string
          color: string | null
          contraindications: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          requirements: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aftercare_instructions?: string | null
          category?: string
          color?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          requirements?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aftercare_instructions?: string | null
          category?: string
          color?: string | null
          contraindications?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          requirements?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professores: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Profissional: {
        Row: {
          createdAt: string
          especialidade: string
          horariosDisponiveis: string
          id: string
          nome: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          especialidade: string
          horariosDisponiveis: string
          id?: string
          nome: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          especialidade?: string
          horariosDisponiveis?: string
          id?: string
          nome?: string
          updatedAt?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          blocked: boolean | null
          compliance_violations: string[] | null
          created_at: string | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          project: string
          request_data: Json | null
          severity: string
          threat_score: number | null
          user_id: string | null
        }
        Insert: {
          blocked?: boolean | null
          compliance_violations?: string[] | null
          created_at?: string | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          project: string
          request_data?: Json | null
          severity: string
          threat_score?: number | null
          user_id?: string | null
        }
        Update: {
          blocked?: boolean | null
          compliance_violations?: string[] | null
          created_at?: string | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          project?: string
          request_data?: Json | null
          severity?: string
          threat_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          login_notifications: boolean | null
          password_changed_at: string | null
          session_timeout_minutes: number | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          login_notifications?: boolean | null
          password_changed_at?: string | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          login_notifications?: boolean | null
          password_changed_at?: string | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Servico: {
        Row: {
          createdAt: string
          duracao: number
          id: string
          nome: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          duracao: number
          id?: string
          nome: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          duracao?: number
          id?: string
          nome?: string
          updatedAt?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          duracao: number | null
          id: string
          nome_servico: string
          preco: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          nome_servico: string
          preco: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          nome_servico?: string
          preco?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          chunk_number: number
          chunk_type: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          summary: string | null
          title: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          chunk_number: number
          chunk_type?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id: string
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          chunk_number?: number
          chunk_type?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      temporal_facts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          embedding: string | null
          episode_id: string | null
          expired_at: string | null
          fact_data: Json
          fact_type: string
          id: string
          invalid_at: string | null
          object_entity_id: string | null
          predicate: string
          subject_entity_id: string | null
          valid_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          episode_id?: string | null
          expired_at?: string | null
          fact_data: Json
          fact_type: string
          id?: string
          invalid_at?: string | null
          object_entity_id?: string | null
          predicate: string
          subject_entity_id?: string | null
          valid_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          embedding?: string | null
          episode_id?: string | null
          expired_at?: string | null
          fact_data?: Json
          fact_type?: string
          id?: string
          invalid_at?: string | null
          object_entity_id?: string | null
          predicate?: string
          subject_entity_id?: string | null
          valid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temporal_facts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          is_recurring: boolean
          professional_id: string
          reason: string | null
          recurrence_pattern: string | null
          start_date: string
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          professional_id: string
          reason?: string | null
          recurrence_pattern?: string | null
          start_date: string
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          professional_id?: string
          reason?: string | null
          recurrence_pattern?: string | null
          start_date?: string
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria: string
          created_at: string
          data_transacao: string
          descricao: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_transacao?: string
          descricao: string
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_transacao?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          payment_method: string | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          payment_method?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          payment_method?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          ai_recommendations: Json | null
          appointment_id: string | null
          clinic_id: string
          cost: number | null
          created_at: string | null
          description: string | null
          doctor_id: string
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["treatment_status"] | null
          treatment_name: string
          updated_at: string | null
        }
        Insert: {
          ai_recommendations?: Json | null
          appointment_id?: string | null
          clinic_id: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["treatment_status"] | null
          treatment_name: string
          updated_at?: string | null
        }
        Update: {
          ai_recommendations?: Json | null
          appointment_id?: string | null
          clinic_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["treatment_status"] | null
          treatment_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
          name: string
          passwordHash: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          name: string
          passwordHash: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          name?: string
          passwordHash?: string
          updatedAt?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          crm: string | null
          email: string
          especialidade: string | null
          id: string
          nome: string
          role: string
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          crm?: string | null
          email: string
          especialidade?: string | null
          id?: string
          nome: string
          role: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          crm?: string | null
          email?: string
          especialidade?: string | null
          id?: string
          nome?: string
          role?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cleanup_old_chat_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      hybrid_search: {
        Args: {
          query_embedding: string
          query_text: string
          match_threshold?: number
          match_count?: number
          vector_weight?: number
          text_weight?: number
        }
        Returns: {
          id: string
          url: string
          title: string
          content: string
          chunk_type: string
          vector_similarity: number
          text_similarity: number
          combined_score: number
        }[]
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      similarity_search: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          url: string
          title: string
          content: string
          chunk_type: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      temporal_search: {
        Args: {
          query_embedding: string
          time_point?: string
          threshold?: number
          result_limit?: number
        }
        Returns: {
          id: string
          fact_type: string
          fact_data: Json
          confidence_score: number
          similarity: number
          created_at: string
          valid_at: string
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "administrador" | "professor" | "aluno" | "paciente_modelo"
      appointment_status: "scheduled" | "confirmed" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      treatment_status: "planned" | "in_progress" | "completed"
      user_role: "admin" | "doctor" | "staff" | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "professor", "aluno", "paciente_modelo"],
      appointment_status: ["scheduled", "confirmed", "completed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      treatment_status: ["planned", "in_progress", "completed"],
      user_role: ["admin", "doctor", "staff", "patient"],
    },
  },
} as const
