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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "professor" | "aluno" | "paciente_modelo"
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
    },
  },
} as const
