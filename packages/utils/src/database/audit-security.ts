/**
 * @file Security event logging for compliance monitoring
 * @description Specialized logging for security events and incidents
 */

import { AuditLogger } from "./audit-core";
import type { RiskLevel } from "./audit-types";

/**
 * Security event logger for compliance monitoring
 */
class SecurityLogger extends AuditLogger {
  /**
   * Log security event
   * @param {object} params Security event parameters
   * @returns {Promise<boolean>} Success status
   */
  async logSecurityEvent(params: {
    description: string;
    eventType: string;
    ipAddress: string;
    severity?: RiskLevel;
    userAgent: string;
    userId: string | null;
  }): Promise<boolean> {
    const {
      description,
      eventType,
      ipAddress,
      severity = "medium",
      userAgent,
      userId,
    } = params;

    return this.logAction({
      action: `security_${eventType}`,
      additional_metadata: {
        event_description: description,
        security_incident: severity === "high" || severity === "critical",
      },
      compliance_category: "security",
      ip_address: ipAddress,
      resource_id: "system",
      resource_type: "security",
      risk_level: severity,
      user_agent: userAgent,
      user_id: userId || "system",
      user_role: "system",
    });
  }
}

export { SecurityLogger };