import { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConsentRecord,
  MedicalDataClassification,
  RTCAuditLogEntry,
  UserDataExport,
} from "../types";

/**
 * Service for managing patient consent and LGPD compliance
 * Handles consent requests, verification, revocation, and audit trails
 */
export class ConsentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Request consent for medical data processing
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to process
   * @param purpose - Purpose of data processing
   * @param sessionId - Optional session ID for tracking
   * @returns Promise<boolean> - True if consent request was created
   */
  async requestConsent(
    userId: string,
    dataType: MedicalDataClassification,
    purpose: string,
    sessionId?: string,
  ): Promise<boolean> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id, clinic_id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        console.error("Patient not found for user:", userId);
        return false;
      }

      // Create consent request
      const { data: consentData, error: consentError } = await this.supabase
        .from("consent_records")
        .insert({
          patient_id: patient.id,
          clinic_id: patient.clinic_id,
          purpose,
          data_categories: [dataType],
          status: "pending",
          requested_at: new Date().toISOString(),
          session_id: sessionId,
          lgpd_basis: "consent",
          metadata: {
            request_source: "webrtc_session",
            session_id: sessionId,
          },
        })
        .select("id")
        .single();

      if (consentError) {
        console.error("Failed to request consent:", consentError);
        return false;
      }

      return !!consentData; // Return true if consent ID was created
    } catch (error) {
      console.error("ConsentService.requestConsent error:", error);
      return false;
    }
  }

  /**
   * Verify existing consent is valid using RPC function
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to verify
   * @param sessionId - Session ID for tracking
   * @returns Promise<boolean> - True if consent is valid
   */
  async verifyConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
  ): Promise<boolean> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id, clinic_id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        return false;
      }

      // Use RPC function to validate consent
      const { data: isValid, error } = await this.supabase.rpc(
        "validate_webrtc_consent",
        {
          p_patient_id: patient.id,
          p_session_id: sessionId,
          p_data_types: [dataType],
          p_clinic_id: patient.clinic_id,
        },
      );

      if (error) {
        console.error("Failed to verify consent:", error);
        return false;
      }

      return !!isValid;
    } catch (error) {
      console.error("ConsentService.verifyConsent error:", error);
      return false;
    }
  }

  /**
   * Revoke consent for specific data type
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to revoke
   * @param sessionId - Session ID for tracking
   * @param reason - Optional reason for revocation
   */
  async revokeConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
    reason?: string,
  ): Promise<void> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id, clinic_id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        throw new Error("Patient not found for user");
      }

      // Update consent status to withdrawn
      const { error } = await this.supabase
        .from("consent_records")
        .update({
          status: "withdrawn",
          withdrawn_at: new Date().toISOString(),
          withdrawn_reason: reason || "User request",
          updated_at: new Date().toISOString(),
          metadata: {
            withdrawn_reason: reason || "User revoked consent",
            withdrawn_session_id: sessionId,
          },
        })
        .eq("patient_id", patient.id)
        .contains("data_categories", [dataType])
        .eq("status", "granted");

      if (error) {
        throw new Error(`Failed to revoke consent: ${error.message}`);
      }

      // Create audit log for consent revocation using RPC
      await this.supabase.rpc("create_webrtc_audit_log", {
        p_session_id: sessionId,
        p_user_id: userId,
        p_user_role: "patient",
        p_event_type: "consent-revoked",
        p_data_classification: dataType,
        p_clinic_id: patient.clinic_id,
        p_metadata: {
          reason: reason || "User request",
          revoked_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("ConsentService.revokeConsent error:", error);
      throw error;
    }
  }

  /**
   * Get consent history for audit purposes
   * @param userId - Patient user ID
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getConsentHistory(userId: string): Promise<RTCAuditLogEntry[]> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id, clinic_id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        return [];
      }

      // Get audit logs related to consent for this patient from main audit_logs table
      const { data: auditLogs, error } = await this.supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .in("action", ["consent-given", "consent-revoked", "consent-requested"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to get consent history:", error);
        return [];
      }

      // Transform audit logs to RTCAuditLogEntry format
      return (auditLogs || []).map((log) => ({
        id: log.id,
        sessionId: log.resource_id || "",
        eventType: log.action,
        userId: log.user_id,
        userRole: "patient",
        dataClassification: log.new_values?.data_type || "general-medical",
        timestamp: log.created_at,
        clinicId: log.clinic_id,
        metadata: log.new_values || {},
      }));
    } catch (error) {
      console.error("ConsentService.getConsentHistory error:", error);
      return [];
    }
  }

  /**
   * Export all user data for LGPD compliance
   * @param userId - Patient user ID
   * @returns Promise<UserDataExport> - Complete user data export
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        throw new Error("Patient not found for user");
      }

      // Get all consent records
      const { data: consentRecords } = await this.supabase
        .from("consent_records")
        .select("*")
        .eq("patient_id", patient.id);

      // Get WebRTC audit logs
      const { data: webrtcAuditLogs } = await this.supabase
        .from("webrtc_audit_logs")
        .select("*")
        .eq("user_id", userId);

      // Get general audit logs
      const { data: generalAuditLogs } = await this.supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId);

      return {
        exportDate: new Date().toISOString(),
        patient,
        consentRecords: consentRecords || [],
        webrtcAuditLogs: webrtcAuditLogs || [],
        generalAuditLogs: generalAuditLogs || [],
        note: "This export contains all personal data processed by NeonPro according to LGPD requirements.",
      };
    } catch (error) {
      console.error("ConsentService.exportUserData error:", error);
      throw error;
    }
  }

  /**
   * Delete user data for LGPD compliance (right to be forgotten)
   * @param userId - Patient user ID
   * @param sessionId - Optional specific session to delete
   */
  async deleteUserData(userId: string, sessionId?: string): Promise<void> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id, clinic_id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        throw new Error("Patient not found for user");
      }

      if (sessionId) {
        // Delete specific session data
        await this.supabase
          .from("consent_records")
          .delete()
          .eq("patient_id", patient.id)
          .eq("session_id", sessionId);

        await this.supabase
          .from("webrtc_audit_logs")
          .delete()
          .eq("user_id", userId)
          .eq("session_id", sessionId);
      } else {
        // Delete all user data
        await this.supabase
          .from("consent_records")
          .delete()
          .eq("patient_id", patient.id);

        await this.supabase
          .from("webrtc_audit_logs")
          .delete()
          .eq("user_id", userId);
      }

      // Create audit log for data deletion
      await this.supabase.rpc("create_webrtc_audit_log", {
        p_session_id: sessionId || "data-deletion",
        p_user_id: userId,
        p_user_role: "patient",
        p_event_type: "data-deleted",
        p_data_classification: "all",
        p_clinic_id: patient.clinic_id,
        p_metadata: {
          deletion_type: sessionId ? "session-specific" : "complete",
          deleted_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("ConsentService.deleteUserData error:", error);
      throw error;
    }
  }

  /**
   * Grant consent for a specific consent record
   * @param patientId - Patient ID
   * @param consentId - Consent record ID
   * @returns Promise<boolean> - True if consent was granted successfully
   */
  async grantConsent(patientId: string, consentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("consent_records")
        .update({
          status: "granted",
          granted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", consentId)
        .eq("patient_id", patientId);

      return !error;
    } catch (error) {
      console.error("ConsentService.grantConsent error:", error);
      return false;
    }
  }

  /**
   * Get pending consents for a user
   * @param userId - Patient user ID
   * @returns Promise<ConsentRecord[]> - Array of pending consent records
   */
  async getPendingConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (patientError || !patient) {
        return [];
      }

      // Get pending consent records
      const { data: consents, error } = await this.supabase
        .from("consent_records")
        .select("*")
        .eq("patient_id", patient.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to get pending consents:", error);
        return [];
      }

      return consents || [];
    } catch (error) {
      console.error("ConsentService.getPendingConsents error:", error);
      return [];
    }
  }
}