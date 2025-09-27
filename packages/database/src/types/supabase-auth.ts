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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          avatar_url: string | null
          phone: string | null
          profession: string | null
          license: string | null
          clinic: string | null
          lgpd_consent: Json
          data_retention: Json
          preferences: Json
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
          email_verified: boolean | null
          phone_verified: boolean | null
          two_factor_enabled: boolean | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          profession?: string | null
          license?: string | null
          clinic?: string | null
          lgpd_consent?: Json
          data_retention?: Json
          preferences?: Json
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          two_factor_enabled?: boolean | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          profession?: string | null
          license?: string | null
          clinic?: string | null
          lgpd_consent?: Json
          data_retention?: Json
          preferences?: Json
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          two_factor_enabled?: boolean | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
          last_accessed: string | null
          expires_at: string
          is_active: boolean | null
          clinic: string | null
          login_method: string | null
          device_fingerprint: string | null
          location_data: Json | null
          lgpd_session_consent: boolean | null
          audit_trail: Json
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
          last_accessed?: string | null
          expires_at: string
          is_active?: boolean | null
          clinic?: string | null
          login_method?: string | null
          device_fingerprint?: string | null
          location_data?: Json | null
          lgpd_session_consent?: boolean | null
          audit_trail?: Json
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
          last_accessed?: string | null
          expires_at?: string
          is_active?: boolean | null
          clinic?: string | null
          login_method?: string | null
          device_fingerprint?: string | null
          location_data?: Json | null
          lgpd_session_consent?: boolean | null
          audit_trail?: Json
        }
      }
      user_consents: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          granted: boolean
          version: string
          granted_at: string | null
          revoked_at: string | null
          expires_at: string | null
          legal_basis: string | null
          purpose: string | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          consent_type: string
          granted: boolean
          version?: string
          granted_at?: string | null
          revoked_at?: string | null
          expires_at?: string | null
          legal_basis?: string | null
          purpose?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          consent_type?: string
          granted?: boolean
          version?: string
          granted_at?: string | null
          revoked_at?: string | null
          expires_at?: string | null
          legal_basis?: string | null
          purpose?: string | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rate_limits: {
        Row: {
          id: number
          identifier: string
          action: string
          created_at: string | null
        }
        Insert: {
          id?: number
          identifier: string
          action: string
          created_at?: string | null
        }
        Update: {
          id?: number
          identifier?: string
          action?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          email_verified: boolean | null
          phone_verified: boolean | null
          auth_created_at: string | null
          auth_updated_at: string | null
          last_sign_in_at: string | null
          first_name: string | null
          last_name: string | null
          display_name: string | null
          avatar_url: string | null
          profession: string | null
          license: string | null
          clinic: string | null
          lgpd_consent: Json | null
          data_retention: Json | null
          preferences: Json | null
          profile_created_at: string | null
          profile_updated_at: string | null
          last_login_at: string | null
          two_factor_enabled: boolean | null
        }
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_user_login: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_password_strength: {
        Args: {
          password: string
        }
        Returns: boolean
      }
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_corporate_email: {
        Args: {
          email: string
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          user_identifier: string
          action_type: string
        }
        Returns: boolean
      }
      is_clinic_admin: {
        Args: {
          clinic_name: string
        }
        Returns: boolean
      }
      is_healthcare_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_consent: {
        Args: {
          consent_type: string
        }
        Returns: boolean
      }
      can_access_patient_data: {
        Args: {
          patient_id: string
        }
        Returns: boolean
      }
    }
  }
}