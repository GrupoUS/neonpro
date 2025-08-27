/**
 * @file Patient data access logging for LGPD compliance
 * @description Specialized logging for patient data access events
 */

import { AuditLogger } from "./audit-core";
import type {
  AccessType,
  DataSubjectRequestType,
  ProcessingStatus,
  RiskLevel,
} from "./audit-types";

/**
 * LGPD-compliant patient data access logger
 */
class PatientDataLogger extends AuditLogger {
  /**
   * Log patient data access (LGPD compliance)
   * @param {object} params Access parameters
   * @returns {Promise<boolean>} Success status
   */
  async logPatientDataAccess(params: {
    accessType: AccessType;
    accessedFields?: string[];
    ipAddress: string;
    patientId: string;
    userAgent: string;
    userId: string;
    userRole: string;
  }): Promise<boolean> {
    const {
      accessType,
      accessedFields,
      ipAddress,
      patientId,
      userAgent,
      userId,
      userRole,
    } = params;

    return this.logAction({
      action: `patient_data_${accessType}`,
      additional_metadata: {
        accessed_fields: accessedFields,
        data_subject_id: patientId,
        processing_purpose: this.getProcessingPurpose(accessType),
      },
      compliance_category: "lgpd",
      ip_address: ipAddress,
      resource_id: patientId,
      resource_type: "patient_data",
      risk_level: this.determineRiskLevel(accessType, userRole),
      user_agent: userAgent,
      user_id: userId,
      user_role: userRole,
    });
  }

  /**
   * Log data subject rights request (LGPD Article 18)
   * @param {object} params Request parameters
   * @returns {Promise<boolean>} Success status
   */
  async logDataSubjectRightsRequest(params: {
    processingStatus: ProcessingStatus;
    requestDetails: Record<string, unknown>;
    requestType: DataSubjectRequestType;
    subjectId: string;
  }): Promise<boolean> {
    const { processingStatus, requestDetails, requestType, subjectId } = params;

    return this.logAction({
      action: `lgpd_${requestType}_request`,
      additional_metadata: {
        legal_basis: (requestDetails as { legal_basis?: string; }).legal_basis,
        processing_status: processingStatus,
        request_details: requestDetails,
        response_deadline: this.calculateResponseDeadline(requestType),
      },
      compliance_category: "lgpd",
      ip_address: (requestDetails as { ip_address?: string; }).ip_address || "unknown",
      resource_id: subjectId,
      resource_type: "data_subject_rights",
      risk_level: "high",
      user_agent: (requestDetails as { user_agent?: string; }).user_agent || "unknown",
      user_id: subjectId,
      user_role: "data_subject",
    });
  }

  /**
   * Determine risk level based on access type and user role
   * @param {AccessType} accessType Type of access
   * @param {string} userRole User role
   * @returns {RiskLevel} Risk level
   */
  private determineRiskLevel(
    accessType: AccessType,
    userRole: string,
  ): RiskLevel {
    const highRiskActions: AccessType[] = ["delete", "export"];
    const adminRoles = ["admin", "super_admin"];

    if (highRiskActions.includes(accessType)) {
      return "high";
    }

    if (adminRoles.includes(userRole)) {
      return "medium";
    }

    return "low";
  }

  /**
   * Get processing purpose for access type
   * @param {AccessType} accessType Type of access
   * @returns {string} Processing purpose
   */
  private getProcessingPurpose(accessType: AccessType): string {
    const purposes: Record<AccessType, string> = {
      delete: "Data retention compliance",
      edit: "Patient record maintenance",
      export: "Data portability request",
      view: "Healthcare service delivery",
    };
    return purposes[accessType] || "General healthcare operations";
  }

  /**
   * Calculate response deadline for data subject requests
   * @param {string} _requestType Request type
   * @returns {Date} Response deadline
   */
  protected calculateResponseDeadline(_requestType: string): Date {
    const deadline = new Date();
    const DEFAULT_DEADLINE_DAYS = 15;
    // LGPD Article 19: 15 days for most requests
    deadline.setDate(deadline.getDate() + DEFAULT_DEADLINE_DAYS);
    return deadline;
  }
}

export { PatientDataLogger };
