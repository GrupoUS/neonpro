/**
 * @file ANVISA product/procedure logging for regulatory compliance
 * @description Specialized logging for ANVISA-regulated products and procedures
 */

import { AuditLogger } from "./audit-core";

/**
 * ANVISA-compliant product/procedure usage logger
 */
class ANVISALogger extends AuditLogger {
  /**
   * Log ANVISA-regulated product/procedure usage
   * @param {object} params ANVISA action parameters
   * @returns {Promise<boolean>} Success status
   */
  async logANVISAAction(params: {
    action: string;
    details: Record<string, unknown>;
    ipAddress: string;
    patientId: string;
    productId: string;
    userAgent: string;
    userId: string;
    userRole: string;
  }): Promise<boolean> {
    const { action, details, ipAddress, patientId, productId, userAgent, userId, userRole } = params;

    return this.logAction({
      action: `anvisa_${action}`,
      additional_metadata: {
        patient_id: patientId,
        product_details: details,
        regulatory_validation_required: true,
      },
      compliance_category: "anvisa",
      ip_address: ipAddress,
      resource_id: productId,
      resource_type: "anvisa_product",
      risk_level: "high",
      user_agent: userAgent,
      user_id: userId,
      user_role: userRole,
    });
  }
}

export { ANVISALogger };