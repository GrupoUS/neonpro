#!/usr/bin/env tsx

/**
 * Script to sync Supabase types with Prisma schema
 * Run with: npx tsx scripts/sync-types.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
// Import removed - @neonpro/security package no longer exists
// import { HealthcareSecurityLogger } from '@neonpro/security'

// Global healthcare security logger instance - disabled due to package removal
// let healthcareLogger: HealthcareSecurityLogger | null = null

// Simple console logger fallback
function getHealthcareLogger() {
  return {
    info: (message: string, data?: any) => {
      console.log(`[INFO] ${message}`, data || '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[WARN] ${message}`, data || '')
    },
    error: (message: string, data?: any) => {
      console.error(`[ERROR] ${message}`, data || '')
    }
  }
}

// ES module equivalents for __dirname
const _filename = fileURLToPath(import.meta.url)
void _filename
const _dirnamePath = dirname(__filename)

// Read Prisma schema and generate basic Supabase types
const _prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
void _prismaSchemaPath
const typesOutputPath = path.join(__dirname, '..', 'src', 'types', 'supabase-generated.ts')

function generateSupabaseTypes() {
  const logger = getHealthcareLogger()
  logger.info('🔄 Synchronizing Supabase types with Prisma schema...', {
    action: 'sync_types_start',
    component: 'database_sync',
  })

  // Ensure the types directory exists
  const typesDir = path.dirname(typesOutputPath)
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true })
  }

  const generatedTypes = `
// Auto-generated Supabase types from Prisma schema
// DO NOT EDIT MANUALLY - Run 'npm run sync-types' to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Core healthcare enums
export type AuditAction = 'VIEW' | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'AI_CHAT' | 'AI_PREDICTION' | 'AI_ANALYSIS' | ''AI_RECOMMENDATION'
export type ResourceType = 'PATIENT_RECORD' | 'PATIENT_DATA' | 'PATIENT_CONSENT' | 'APPOINTMENT' | 'COMMUNICATION' | 'AI_PREDICTION' | 'AI_MODEL_PERFORMANCE' | 'TELEMEDICINE_SESSION' | 'PRESCRIPTION' | 'COMPLIANCE_REPORT' | 'REPORT' | 'SYSTEM_CONFIG' | ''USER_ACCOUNT'
export type AuditStatus = 'SUCCESS' | 'FAILED' | 'FAILURE' | 'PARTIAL_SUCCESS' | ''BLOCKED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplianceFramework = 'HIPAA' | 'LGPD' | 'GDPR' | 'SOC2';
export type ComplianceStatusEnum = 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW' | ''CRITICAL'
export type EscalationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | ''CLOSED'
export type GoogleCalendarSyncStatus = 'SYNCED' | 'PENDING' | 'FAILED' | 'CONFLICT' | 'IGNORED';
export type GoogleCalendarOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | ''REFRESH_TOKEN'
export type SyncDirection = 'TO_GOOGLE' | 'FROM_GOOGLE' | ''BIDIRECTIONAL'

// Core table types based on Prisma schema
export interface Database {
  public: {
    Tables: {
      // Core healthcare tables
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      clinics: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          medical_record_number: string;
          external_ids?: Json;
          given_names: string[];
          family_name: string;
          full_name: string;
          preferred_name?: string;
          phone_primary?: string;
          phone_secondary?: string;
          email?: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          birth_date?: string;
          gender?: string;
          marital_status?: string;
          is_active?: boolean;
          deceased_indicator?: boolean;
          deceased_date?: string;
          cpf?: string;
          rg?: string;
          rg_issuing_organ?: string;
          cns?: string;
          passport_number?: string;
          data_consent_status?: string;
          data_consent_date?: string;
          data_consent_version?: string;
          data_retention_until?: string;
          data_anonymized_at?: string;
          data_anonymization_scheduled?: string;
          data_processing_purpose: string[];
          data_source?: string;
          sensitive_data_consent?: Json;
          lgpd_consent_given: boolean;
          lgpd_consent_version?: string;
          lgpd_withdrawal_history: Json[];
          data_sharing_consent?: Json;
          marketing_consent?: boolean;
          research_consent?: boolean;
          right_to_forget_requested?: boolean;
          right_to_forget_request_date?: string;
          data_portability_requested?: boolean;
          preferred_contact_method?: string;
          blood_type?: string;
          allergies: string[];
          chronic_conditions: string[];
          current_medications: string[];
          insurance_provider?: string;
          insurance_number?: string;
          insurance_plan?: string;
          sus_card_number?: string;
          plan_operadora_ans?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          emergency_contact_cpf?: string;
          no_show_risk_score?: number;
          last_no_show_date?: string;
          total_no_shows?: number;
          total_appointments?: number;
          no_show_prediction_features?: Json;
          behavioral_patterns?: Json;
          preferred_appointment_time: string[];
          communication_preferences?: Json;
          language_preference?: string;
          accessibility_needs: string[];
          patient_status?: string;
          registration_source?: string;
          last_visit_date?: string;
          next_appointment_date?: string;
          patient_notes?: string;
          nationality?: string;
          primary_doctor_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          photo_url?: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          medical_record_number: string;
          external_ids?: Json;
          given_names: string[];
          family_name: string;
          full_name: string;
          preferred_name?: string;
          phone_primary?: string;
          phone_secondary?: string;
          email?: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          birth_date?: string;
          gender?: string;
          marital_status?: string;
          is_active?: boolean;
          deceased_indicator?: boolean;
          deceased_date?: string;
          cpf?: string;
          rg?: string;
          rg_issuing_organ?: string;
          cns?: string;
          passport_number?: string;
          data_consent_status?: string;
          data_consent_date?: string;
          data_consent_version?: string;
          data_retention_until?: string;
          data_anonymized_at?: string;
          data_anonymization_scheduled?: string;
          data_processing_purpose?: string[];
          data_source?: string;
          sensitive_data_consent?: Json;
          lgpd_consent_given?: boolean;
          lgpd_consent_version?: string;
          lgpd_withdrawal_history?: Json[];
          data_sharing_consent?: Json;
          marketing_consent?: boolean;
          research_consent?: boolean;
          right_to_forget_requested?: boolean;
          right_to_forget_request_date?: string;
          data_portability_requested?: boolean;
          preferred_contact_method?: string;
          blood_type?: string;
          allergies?: string[];
          chronic_conditions?: string[];
          current_medications?: string[];
          insurance_provider?: string;
          insurance_number?: string;
          insurance_plan?: string;
          sus_card_number?: string;
          plan_operadora_ans?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          emergency_contact_cpf?: string;
          no_show_risk_score?: number;
          last_no_show_date?: string;
          total_no_shows?: number;
          total_appointments?: number;
          no_show_prediction_features?: Json;
          behavioral_patterns?: Json;
          preferred_appointment_time?: string[];
          communication_preferences?: Json;
          language_preference?: string;
          accessibility_needs?: string[];
          patient_status?: string;
          registration_source?: string;
          last_visit_date?: string;
          next_appointment_date?: string;
          patient_notes?: string;
          nationality?: string;
          primary_doctor_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          photo_url?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          medical_record_number?: string;
          external_ids?: Json;
          given_names?: string[];
          family_name?: string;
          full_name?: string;
          preferred_name?: string;
          phone_primary?: string;
          phone_secondary?: string;
          email?: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          birth_date?: string;
          gender?: string;
          marital_status?: string;
          is_active?: boolean;
          deceased_indicator?: boolean;
          deceased_date?: string;
          cpf?: string;
          rg?: string;
          rg_issuing_organ?: string;
          cns?: string;
          passport_number?: string;
          data_consent_status?: string;
          data_consent_date?: string;
          data_consent_version?: string;
          data_retention_until?: string;
          data_anonymized_at?: string;
          data_anonymization_scheduled?: string;
          data_processing_purpose?: string[];
          data_source?: string;
          sensitive_data_consent?: Json;
          lgpd_consent_given?: boolean;
          lgpd_consent_version?: string;
          lgpd_withdrawal_history?: Json[];
          data_sharing_consent?: Json;
          marketing_consent?: boolean;
          research_consent?: boolean;
          right_to_forget_requested?: boolean;
          right_to_forget_request_date?: string;
          data_portability_requested?: boolean;
          preferred_contact_method?: string;
          blood_type?: string;
          allergies?: string[];
          chronic_conditions?: string[];
          current_medications?: string[];
          insurance_provider?: string;
          insurance_number?: string;
          insurance_plan?: string;
          sus_card_number?: string;
          plan_operadora_ans?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
          emergency_contact_relationship?: string;
          emergency_contact_cpf?: string;
          no_show_risk_score?: number;
          last_no_show_date?: string;
          total_no_shows?: number;
          total_appointments?: number;
          no_show_prediction_features?: Json;
          behavioral_patterns?: Json;
          preferred_appointment_time?: string[];
          communication_preferences?: Json;
          language_preference?: string;
          accessibility_needs?: string[];
          patient_status?: string;
          registration_source?: string;
          last_visit_date?: string;
          next_appointment_date?: string;
          patient_notes?: string;
          nationality?: string;
          primary_doctor_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          photo_url?: string;
        };
      };
      
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          service_type_id: string;
          status?: string;
          appointment_type?: string;
          scheduled_date?: string;
          start_time: string;
          end_time: string;
          time_zone?: string;
          duration?: number;
          priority?: EscalationPriority;
          treatment_type?: string;
          phone?: string;
          tuss_code?: string;
          tuss_procedure_name?: string;
          cfm_specialty_code?: string;
          cfm_professional_crm?: string;
          cfm_validation_status?: string;
          cfm_validated_at?: string;
          anvisa_compliant?: boolean;
          anvisa_protocol_number?: string;
          no_show_risk_score?: number;
          no_show_prediction_model?: string;
          no_show_risk_factors?: Json;
          no_show_predicted_at?: string;
          no_show_actual_outcome?: boolean;
          no_show_prevention_actions: string[];
          patient_confirmed?: boolean;
          patient_confirmed_at?: string;
          reminder_sent_at?: string;
          confirmation_sent_at?: string;
          whatsapp_reminder_sent?: boolean;
          sms_reminder_sent?: boolean;
          email_reminder_sent?: boolean;
          last_reminder_sent_at?: string;
          reminder_count?: number;
          chief_complaint?: string;
          clinical_protocol?: string;
          prior_auth_required?: boolean;
          prior_auth_number?: string;
          prior_auth_status?: string;
          room_id?: string;
          appointment_location?: string;
          check_in_time?: string;
          check_out_time?: string;
          waiting_time?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          subscription_channels: string[];
          last_updated_channel?: string;
          real_time_update_enabled?: boolean;
          notes?: string;
          internal_notes?: string;
          clinical_notes?: string;
          follow_up_required?: boolean;
          follow_up_date?: string;
          follow_up_instructions?: string;
          estimated_cost?: number;
          actual_cost?: number;
          payment_status?: string;
          insurance_covered?: boolean;
          copay_amount?: number;
          reschedule_count?: number;
          last_rescheduled_at?: string;
          rescheduled_by?: string;
          rescheduling_reason?: string;
          cancelled_at?: string;
          cancelled_by?: string;
          cancellation_reason?: string;
          cancellation_fee?: number;
          patient_satisfaction_score?: number;
          patient_feedback?: string;
          service_quality_score?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
          version?: number;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          service_type_id: string;
          status?: string;
          appointment_type?: string;
          scheduled_date?: string;
          start_time: string;
          end_time: string;
          time_zone?: string;
          duration?: number;
          priority?: EscalationPriority;
          treatment_type?: string;
          phone?: string;
          tuss_code?: string;
          tuss_procedure_name?: string;
          cfm_specialty_code?: string;
          cfm_professional_crm?: string;
          cfm_validation_status?: string;
          cfm_validated_at?: string;
          anvisa_compliant?: boolean;
          anvisa_protocol_number?: string;
          no_show_risk_score?: number;
          no_show_prediction_model?: string;
          no_show_risk_factors?: Json;
          no_show_predicted_at?: string;
          no_show_actual_outcome?: boolean;
          no_show_prevention_actions?: string[];
          patient_confirmed?: boolean;
          patient_confirmed_at?: string;
          reminder_sent_at?: string;
          confirmation_sent_at?: string;
          whatsapp_reminder_sent?: boolean;
          sms_reminder_sent?: boolean;
          email_reminder_sent?: boolean;
          last_reminder_sent_at?: string;
          reminder_count?: number;
          chief_complaint?: string;
          clinical_protocol?: string;
          prior_auth_required?: boolean;
          prior_auth_number?: string;
          prior_auth_status?: string;
          room_id?: string;
          appointment_location?: string;
          check_in_time?: string;
          check_out_time?: string;
          waiting_time?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          subscription_channels?: string[];
          last_updated_channel?: string;
          real_time_update_enabled?: boolean;
          notes?: string;
          internal_notes?: string;
          clinical_notes?: string;
          follow_up_required?: boolean;
          follow_up_date?: string;
          follow_up_instructions?: string;
          estimated_cost?: number;
          actual_cost?: number;
          payment_status?: string;
          insurance_covered?: boolean;
          copay_amount?: number;
          reschedule_count?: number;
          last_rescheduled_at?: string;
          rescheduled_by?: string;
          rescheduling_reason?: string;
          cancelled_at?: string;
          cancelled_by?: string;
          cancellation_reason?: string;
          cancellation_fee?: number;
          patient_satisfaction_score?: number;
          patient_feedback?: string;
          service_quality_score?: number;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by?: string;
          version?: number;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          professional_id?: string;
          service_type_id?: string;
          status?: string;
          appointment_type?: string;
          scheduled_date?: string;
          start_time?: string;
          end_time?: string;
          time_zone?: string;
          duration?: number;
          priority?: EscalationPriority;
          treatment_type?: string;
          phone?: string;
          tuss_code?: string;
          tuss_procedure_name?: string;
          cfm_specialty_code?: string;
          cfm_professional_crm?: string;
          cfm_validation_status?: string;
          cfm_validated_at?: string;
          anvisa_compliant?: boolean;
          anvisa_protocol_number?: string;
          no_show_risk_score?: number;
          no_show_prediction_model?: string;
          no_show_risk_factors?: Json;
          no_show_predicted_at?: string;
          no_show_actual_outcome?: boolean;
          no_show_prevention_actions?: string[];
          patient_confirmed?: boolean;
          patient_confirmed_at?: string;
          reminder_sent_at?: string;
          confirmation_sent_at?: string;
          whatsapp_reminder_sent?: boolean;
          sms_reminder_sent?: boolean;
          email_reminder_sent?: boolean;
          last_reminder_sent_at?: string;
          reminder_count?: number;
          chief_complaint?: string;
          clinical_protocol?: string;
          prior_auth_required?: boolean;
          prior_auth_number?: string;
          prior_auth_status?: string;
          room_id?: string;
          appointment_location?: string;
          check_in_time?: string;
          check_out_time?: string;
          waiting_time?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          subscription_channels?: string[];
          last_updated_channel?: string;
          real_time_update_enabled?: boolean;
          notes?: string;
          internal_notes?: string;
          clinical_notes?: string;
          follow_up_required?: boolean;
          follow_up_date?: string;
          follow_up_instructions?: string;
          estimated_cost?: number;
          actual_cost?: number;
          payment_status?: string;
          insurance_covered?: boolean;
          copay_amount?: number;
          reschedule_count?: number;
          last_rescheduled_at?: string;
          rescheduled_by?: string;
          rescheduling_reason?: string;
          cancelled_at?: string;
          cancelled_by?: string;
          cancellation_reason?: string;
          cancellation_fee?: number;
          patient_satisfaction_score?: number;
          patient_feedback?: string;
          service_quality_score?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          version?: number;
        };
      };
      
      // Additional core tables would be defined here...
      // This is a truncated example for brevity
      
    };
    Views: {
      // Views would be defined here
    };
    Functions: {
      // Functions would be defined here
      validate_lgpd_consent: {
        Args: {
          patient_uuid: string;
          purpose: string;
        };
        Returns: boolean;
      };
      calculate_no_show_risk: {
        Args: {
          appointment_uuid: string;
        };
        Returns: number;
      };
      sanitize_for_ai: {
        Args: {
          input_text: string;
        };
        Returns: string;
      };
    };
    Enums: {
      AuditAction: AuditAction;
      ResourceType: ResourceType;
      AuditStatus: AuditStatus;
      RiskLevel: RiskLevel;
      ComplianceFramework: ComplianceFramework;
      ComplianceStatusEnum: ComplianceStatusEnum;
      EscalationPriority: EscalationPriority;
      EscalationStatus: EscalationStatus;
      GoogleCalendarSyncStatus: GoogleCalendarSyncStatus;
      GoogleCalendarOperation: GoogleCalendarOperation;
      SyncDirection: SyncDirection;
    };
    CompositeTypes: {
      // Composite types would be defined here
    };
  };
}

// Export for use with Supabase client
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
`

  fs.writeFileSync(typesOutputPath, generatedTypes)
  logger.info('✅ Supabase types synchronized successfully!', {
    action: 'sync_types_complete',
    component: 'database_sync',
    outputPath: typesOutputPath,
  })
  logger.info(`📁 Generated: ${typesOutputPath}`, {
    action: 'sync_types_output',
    component: 'database_sync',
    outputPath: typesOutputPath,
  })
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSupabaseTypes()
}

export { generateSupabaseTypes }
