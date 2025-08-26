/**
 * LGPD Consent Management
 * Manages consent records and data subject rights according to LGPD
 */

import { supabase } from "@/lib/supabase";
import type {
  ConsentRecord,
  DataSubjectRequest,
  DataSubjectRightType,
} from "@/types/lgpd";

export class LGPDConsentManager {
  /**
   * Record new consent from data subject
   */
  async recordConsent(consent: {
    dataSubjectId: string;
    purpose: string;
    legalBasis: string;
    consentGiven: boolean;
    metadata?: Record<string, any>;
  }): Promise<ConsentRecord> {
    const { data, error } = await supabase
      .from("consent_records")
      .insert({
        data_subject_id: consent.dataSubjectId,
        purpose: consent.purpose,
        legal_basis: consent.legalBasis,
        consent_given: consent.consentGiven,
        consent_date: new Date().toISOString(),
        metadata: consent.metadata || {},
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  /**
   * Withdraw consent for specific purpose
   */
  async withdrawConsent(dataSubjectId: string, purpose: string): Promise<void> {
    const { error } = await supabase
      .from("consent_records")
      .update({
        consent_given: false,
        withdrawal_date: new Date().toISOString(),
        status: "withdrawn",
      })
      .eq("data_subject_id", dataSubjectId)
      .eq("purpose", purpose)
      .eq("status", "active");

    if (error) {
      throw error;
    }
  }

  /**
   * Get current consent status for data subject
   */
  async getConsentStatus(dataSubjectId: string): Promise<ConsentRecord[]> {
    const { data, error } = await supabase
      .from("consent_records")
      .select("*")
      .eq("data_subject_id", dataSubjectId)
      .eq("status", "active");

    if (error) {
      throw error;
    }
    return data;
  }

  /**
   * Process data subject rights request (LGPD Articles 18-22)
   */
  async processDataSubjectRequest(request: {
    dataSubjectId: string;
    requestType: DataSubjectRightType;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<DataSubjectRequest> {
    const { data, error } = await supabase
      .from("data_subject_requests")
      .insert({
        data_subject_id: request.dataSubjectId,
        request_type: request.requestType,
        description: request.description,
        status: "submitted",
        submitted_date: new Date().toISOString(),
        response_deadline: this.calculateResponseDeadline(request.requestType),
        metadata: request.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  /**
   * Calculate response deadline based on request type
   */
  private calculateResponseDeadline(requestType: DataSubjectRightType): string {
    const now = new Date();

    // LGPD specifies response times
    switch (requestType) {
      case "access":
      case "rectification":
      case "erasure":
      case "portability":
      case "restriction":
      case "objection": {
        // 15 days for most requests, can be extended to 30 days
        now.setDate(now.getDate() + 15);
        break;
      }
      default: {
        now.setDate(now.getDate() + 30);
      }
    }

    return now.toISOString();
  }

  /**
   * Update request status
   */
  async updateRequestStatus(
    requestId: string,
    status:
      | "submitted"
      | "in_progress"
      | "completed"
      | "rejected"
      | "under_review",
    response?: string,
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (response) {
      updateData.response = response;
      updateData.response_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("data_subject_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      throw error;
    }
  }

  /**
   * Log data access for audit purposes
   */
  async logDataAccess(access: {
    userId: string;
    dataSubjectId: string;
    accessType: string;
    dataAccessed: string[];
    purpose: string;
    legalBasis: string;
  }): Promise<void> {
    const { error } = await supabase.from("data_access_logs").insert({
      user_id: access.userId,
      data_subject_id: access.dataSubjectId,
      access_type: access.accessType,
      data_accessed: access.dataAccessed,
      purpose: access.purpose,
      legal_basis: access.legalBasis,
      access_timestamp: new Date().toISOString(),
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Generate data portability export
   */
  async generateDataExport(dataSubjectId: string): Promise<{
    personalData: any;
    consentRecords: ConsentRecord[];
    requestHistory: DataSubjectRequest[];
  }> {
    // Get all personal data
    const { data: personalData, error: personalError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", dataSubjectId)
      .single();

    if (personalError) {
      throw personalError;
    }

    // Get consent records
    const { data: consentRecords, error: consentError } = await supabase
      .from("consent_records")
      .select("*")
      .eq("data_subject_id", dataSubjectId);

    if (consentError) {
      throw consentError;
    }

    // Get request history
    const { data: requestHistory, error: requestError } = await supabase
      .from("data_subject_requests")
      .select("*")
      .eq("data_subject_id", dataSubjectId);

    if (requestError) {
      throw requestError;
    }

    return {
      personalData,
      consentRecords,
      requestHistory,
    };
  }

  /**
   * Check consent validity for processing
   */
  async isConsentValidForProcessing(
    dataSubjectId: string,
    purpose: string,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("consent_records")
      .select("consent_given, legal_basis, consent_date, withdrawal_date")
      .eq("data_subject_id", dataSubjectId)
      .eq("purpose", purpose)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return false;
    }

    // Check if consent is given and not withdrawn
    return data.consent_given && !data.withdrawal_date;
  }

  /**
   * Get client IP (simplified - should be implemented properly)
   */
  private async getClientIP(): Promise<string> {
    // This should be implemented to get actual client IP
    // In a real implementation, this would come from headers or request context
    return "unknown";
  }

  /**
   * Schedule automatic data deletion based on retention policies
   */
  async scheduleDataDeletion(
    dataSubjectId: string,
    retentionPeriod: number,
  ): Promise<void> {
    const deletionDate = new Date();
    deletionDate.setFullYear(deletionDate.getFullYear() + retentionPeriod);

    const { error } = await supabase.from("data_retention_policies").insert({
      data_subject_id: dataSubjectId,
      data_type: "patient_data",
      retention_period_years: retentionPeriod,
      scheduled_deletion_date: deletionDate.toISOString(),
      status: "scheduled",
      legal_basis: "retention_policy",
    });

    if (error) {
      throw error;
    }
  }
}

export const lgpdConsentManager = new LGPDConsentManager();
