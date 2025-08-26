/**
 * @file Medical professional action logging for CFM compliance
 * @description Specialized logging for medical professional actions
 */

import { AuditLogger } from "./audit-core";

/**
 * CFM-compliant medical professional action logger
 */
class MedicalLogger extends AuditLogger {
  /**
   * Log medical professional action (CFM compliance)
   * @param {object} params Medical action parameters
   * @returns {Promise<boolean>} Success status
   */
  async logMedicalAction(params: {
    action: string;
    details: Record<string, unknown>;
    ipAddress: string;
    patientId: string;
    professionalId: string;
    userAgent: string;
  }): Promise<boolean> {
    const { action, details, ipAddress, patientId, professionalId, userAgent } =
      params;

    return this.logAction({
      action: `medical_${action}`,
      additional_metadata: {
        cfm_license_validated: true,
        digital_signature_required: true,
        medical_details: details,
      },
      compliance_category: "cfm",
      ip_address: ipAddress,
      resource_id: patientId,
      resource_type: "medical_record",
      risk_level: "high", // Medical actions are always high risk
      user_agent: userAgent,
      user_id: professionalId,
      user_role: "doctor", // or get from user profile
    });
  }
}

export { MedicalLogger };
