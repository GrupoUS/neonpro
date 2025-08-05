"use strict";
/**
 * Shared tRPC types for NeonPro Healthcare
 *
 * Type definitions for:
 * - Healthcare user roles and permissions
 * - Medical data structures
 * - LGPD compliance types
 * - Audit trail interfaces
 * - API response formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareErrorCode = void 0;
// Error codes for healthcare API
var HealthcareErrorCode;
(function (HealthcareErrorCode) {
  HealthcareErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
  HealthcareErrorCode["FORBIDDEN"] = "FORBIDDEN";
  HealthcareErrorCode["NOT_FOUND"] = "NOT_FOUND";
  HealthcareErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
  HealthcareErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
  HealthcareErrorCode["LGPD_CONSENT_REQUIRED"] = "LGPD_CONSENT_REQUIRED";
  HealthcareErrorCode["MEDICAL_LICENSE_INVALID"] = "MEDICAL_LICENSE_INVALID";
  HealthcareErrorCode["TENANT_ACCESS_DENIED"] = "TENANT_ACCESS_DENIED";
  HealthcareErrorCode["DATA_RETENTION_EXPIRED"] = "DATA_RETENTION_EXPIRED";
  HealthcareErrorCode["AUDIT_LOG_REQUIRED"] = "AUDIT_LOG_REQUIRED";
})(HealthcareErrorCode || (exports.HealthcareErrorCode = HealthcareErrorCode = {}));
// All types are already exported individually above
