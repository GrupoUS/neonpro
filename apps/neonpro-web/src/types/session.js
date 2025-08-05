Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStatus =
  exports.SecuritySeverity =
  exports.SecurityEventType =
  exports.SecurityLevel =
  exports.DeviceType =
  exports.SessionAction =
    void 0;
exports.isValidSessionStatus = isValidSessionStatus;
exports.isValidSecurityEventType = isValidSecurityEventType;
exports.isValidSecuritySeverity = isValidSecuritySeverity;
exports.getSecurityLevelFromScore = getSecurityLevelFromScore;
exports.isHighRiskEvent = isHighRiskEvent;
exports.shouldAuditEvent = shouldAuditEvent;
// Session types for authentication and security
var SessionAction;
((SessionAction) => {
  SessionAction.LOGIN = "login";
  SessionAction.LOGOUT = "logout";
  SessionAction.REFRESH = "refresh";
  SessionAction.EXTEND = "extend";
  SessionAction.VALIDATE = "validate";
  SessionAction.TERMINATE = "terminate";
})(SessionAction || (exports.SessionAction = SessionAction = {}));
var DeviceType;
((DeviceType) => {
  DeviceType.DESKTOP = "desktop";
  DeviceType.MOBILE = "mobile";
  DeviceType.TABLET = "tablet";
  DeviceType.UNKNOWN = "unknown";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var SecurityLevel;
((SecurityLevel) => {
  SecurityLevel.LOW = "low";
  SecurityLevel.MEDIUM = "medium";
  SecurityLevel.HIGH = "high";
  SecurityLevel.CRITICAL = "critical";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
var SecurityEventType;
((SecurityEventType) => {
  SecurityEventType.SUCCESSFUL_LOGIN = "successful_login";
  SecurityEventType.FAILED_LOGIN = "failed_login";
  SecurityEventType.PASSWORD_CHANGE = "password_change";
  SecurityEventType.MFA_ENABLED = "mfa_enabled";
  SecurityEventType.MFA_DISABLED = "mfa_disabled";
  SecurityEventType.SUSPICIOUS_ACTIVITY = "suspicious_activity";
  SecurityEventType.DEVICE_REGISTERED = "device_registered";
  SecurityEventType.DEVICE_REMOVED = "device_removed";
  SecurityEventType.SESSION_CREATED = "session_created";
  SecurityEventType.SESSION_EXTENDED = "session_extended";
  SecurityEventType.SESSION_TERMINATED = "session_terminated";
  SecurityEventType.PRIVILEGE_ESCALATION = "privilege_escalation";
  SecurityEventType.UNAUTHORIZED_ACCESS = "unauthorized_access";
  SecurityEventType.DATA_ACCESS = "data_access";
  SecurityEventType.ADMIN_ACTION = "admin_action";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
var SecuritySeverity;
((SecuritySeverity) => {
  SecuritySeverity.INFO = "info";
  SecuritySeverity.LOW = "low";
  SecuritySeverity.MEDIUM = "medium";
  SecuritySeverity.HIGH = "high";
  SecuritySeverity.CRITICAL = "critical";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
var SessionStatus;
((SessionStatus) => {
  SessionStatus.ACTIVE = "active";
  SessionStatus.EXPIRED = "expired";
  SessionStatus.TERMINATED = "terminated";
  SessionStatus.INVALID = "invalid";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
// Type guards
function isValidSessionStatus(status) {
  return Object.values(SessionStatus).includes(status);
}
function isValidSecurityEventType(type) {
  return Object.values(SecurityEventType).includes(type);
}
function isValidSecuritySeverity(severity) {
  return Object.values(SecuritySeverity).includes(severity);
}
// Utility functions
function getSecurityLevelFromScore(score) {
  if (score >= 90) return SecurityLevel.CRITICAL;
  if (score >= 70) return SecurityLevel.HIGH;
  if (score >= 50) return SecurityLevel.MEDIUM;
  return SecurityLevel.LOW;
}
function isHighRiskEvent(eventType) {
  var highRiskEvents = [
    SecurityEventType.FAILED_LOGIN,
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    SecurityEventType.PRIVILEGE_ESCALATION,
    SecurityEventType.UNAUTHORIZED_ACCESS,
  ];
  return highRiskEvents.includes(eventType);
}
function shouldAuditEvent(eventType, severity) {
  // Always audit high and critical severity events
  if (severity === SecuritySeverity.HIGH || severity === SecuritySeverity.CRITICAL) {
    return true;
  }
  // Audit specific event types regardless of severity
  var alwaysAuditEvents = [
    SecurityEventType.PASSWORD_CHANGE,
    SecurityEventType.MFA_ENABLED,
    SecurityEventType.MFA_DISABLED,
    SecurityEventType.ADMIN_ACTION,
  ];
  return alwaysAuditEvents.includes(eventType);
}
