"use strict";
/**
 * Session Management Types
 * Comprehensive TypeScript interfaces for session management and security
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuspiciousActivityType =
  exports.SecurityLevel =
  exports.SessionAction =
  exports.DeviceType =
  exports.SecuritySeverity =
  exports.SecurityEventType =
    void 0;
// Enums
var SecurityEventType;
(function (SecurityEventType) {
  SecurityEventType["LOGIN_SUCCESS"] = "login_success";
  SecurityEventType["LOGIN_FAILED"] = "login_failed";
  SecurityEventType["SESSION_CREATED"] = "session_created";
  SecurityEventType["SESSION_EXPIRED"] = "session_expired";
  SecurityEventType["SESSION_TERMINATED"] = "session_terminated";
  SecurityEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
  SecurityEventType["DEVICE_REGISTERED"] = "device_registered";
  SecurityEventType["DEVICE_BLOCKED"] = "device_blocked";
  SecurityEventType["IP_BLOCKED"] = "ip_blocked";
  SecurityEventType["CONCURRENT_LIMIT_EXCEEDED"] = "concurrent_limit_exceeded";
  SecurityEventType["GEOGRAPHIC_ANOMALY"] = "geographic_anomaly";
  SecurityEventType["TIME_ANOMALY"] = "time_anomaly";
  SecurityEventType["RAPID_LOGIN_ATTEMPTS"] = "rapid_login_attempts";
  SecurityEventType["SESSION_HIJACK_ATTEMPT"] = "session_hijack_attempt";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
  SecuritySeverity["LOW"] = "low";
  SecuritySeverity["MEDIUM"] = "medium";
  SecuritySeverity["HIGH"] = "high";
  SecuritySeverity["CRITICAL"] = "critical";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
var DeviceType;
(function (DeviceType) {
  DeviceType["DESKTOP"] = "desktop";
  DeviceType["MOBILE"] = "mobile";
  DeviceType["TABLET"] = "tablet";
  DeviceType["UNKNOWN"] = "unknown";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var SessionAction;
(function (SessionAction) {
  SessionAction["CREATE"] = "create";
  SessionAction["REFRESH"] = "refresh";
  SessionAction["EXTEND"] = "extend";
  SessionAction["TERMINATE"] = "terminate";
  SessionAction["EXPIRE"] = "expire";
  SessionAction["VALIDATE"] = "validate";
  SessionAction["UPDATE_ACTIVITY"] = "update_activity";
  SessionAction["SECURITY_CHECK"] = "security_check";
  SessionAction["DEVICE_REGISTER"] = "device_register";
  SessionAction["DEVICE_TRUST"] = "device_trust";
  SessionAction["POLICY_VIOLATION"] = "policy_violation";
})(SessionAction || (exports.SessionAction = SessionAction = {}));
var SecurityLevel;
(function (SecurityLevel) {
  SecurityLevel["BASIC"] = "basic";
  SecurityLevel["STANDARD"] = "standard";
  SecurityLevel["HIGH"] = "high";
  SecurityLevel["MAXIMUM"] = "maximum";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
var SuspiciousActivityType;
(function (SuspiciousActivityType) {
  SuspiciousActivityType["UNUSUAL_LOGIN_TIME"] = "unusual_login_time";
  SuspiciousActivityType["GEOGRAPHIC_ANOMALY"] = "geographic_anomaly";
  SuspiciousActivityType["NEW_DEVICE_LOGIN"] = "new_device_login";
  SuspiciousActivityType["RAPID_LOGIN_ATTEMPTS"] = "rapid_login_attempts";
  SuspiciousActivityType["CONCURRENT_SESSIONS_EXCEEDED"] = "concurrent_sessions_exceeded";
  SuspiciousActivityType["IP_REPUTATION_RISK"] = "ip_reputation_risk";
  SuspiciousActivityType["BEHAVIORAL_ANOMALY"] = "behavioral_anomaly";
  SuspiciousActivityType["SESSION_PATTERN_ANOMALY"] = "session_pattern_anomaly";
})(SuspiciousActivityType || (exports.SuspiciousActivityType = SuspiciousActivityType = {}));
