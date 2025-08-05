"use strict";
/**
 * LGPD Types and Interfaces
 * Complete type definitions for LGPD compliance system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSubjectRequestStatus =
  exports.DataSubjectRequestType =
  exports.ComplianceReportType =
  exports.SensitiveDataType =
  exports.AuditEventType =
  exports.RequestStatus =
  exports.DataSubjectRight =
  exports.LegalBasis =
  exports.ConsentStatus =
  exports.ConsentType =
    void 0;
// Enums for LGPD compliance
var ConsentType;
(function (ConsentType) {
  ConsentType["MARKETING"] = "marketing";
  ConsentType["ANALYTICS"] = "analytics";
  ConsentType["FUNCTIONAL"] = "functional";
  ConsentType["ESSENTIAL"] = "essential";
  ConsentType["MEDICAL_DATA"] = "medical_data";
  ConsentType["SENSITIVE_DATA"] = "sensitive_data";
  ConsentType["THIRD_PARTY"] = "third_party";
  ConsentType["LOCATION"] = "location";
  ConsentType["BIOMETRIC"] = "biometric";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var ConsentStatus;
(function (ConsentStatus) {
  ConsentStatus["GRANTED"] = "granted";
  ConsentStatus["DENIED"] = "denied";
  ConsentStatus["REVOKED"] = "revoked";
  ConsentStatus["PENDING"] = "pending";
  ConsentStatus["EXPIRED"] = "expired";
  ConsentStatus["PARTIAL"] = "partial";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
var LegalBasis;
(function (LegalBasis) {
  LegalBasis["CONSENT"] = "consent";
  LegalBasis["CONTRACT"] = "contract";
  LegalBasis["LEGAL_OBLIGATION"] = "legal_obligation";
  LegalBasis["VITAL_INTERESTS"] = "vital_interests";
  LegalBasis["PUBLIC_TASK"] = "public_task";
  LegalBasis["LEGITIMATE_INTERESTS"] = "legitimate_interests";
  LegalBasis["MEDICAL_CARE"] = "medical_care";
  LegalBasis["HEALTH_PROTECTION"] = "health_protection";
})(LegalBasis || (exports.LegalBasis = LegalBasis = {}));
var DataSubjectRight;
(function (DataSubjectRight) {
  DataSubjectRight["ACCESS"] = "access";
  DataSubjectRight["RECTIFICATION"] = "rectification";
  DataSubjectRight["ERASURE"] = "erasure";
  DataSubjectRight["PORTABILITY"] = "portability";
  DataSubjectRight["RESTRICTION"] = "restriction";
  DataSubjectRight["OBJECTION"] = "objection";
  DataSubjectRight["WITHDRAW_CONSENT"] = "withdraw_consent";
  DataSubjectRight["REVIEW_AUTOMATED_DECISION"] = "review_automated_decision";
})(DataSubjectRight || (exports.DataSubjectRight = DataSubjectRight = {}));
var RequestStatus;
(function (RequestStatus) {
  RequestStatus["PENDING"] = "pending";
  RequestStatus["IN_PROGRESS"] = "in_progress";
  RequestStatus["COMPLETED"] = "completed";
  RequestStatus["REJECTED"] = "rejected";
  RequestStatus["CANCELLED"] = "cancelled";
  RequestStatus["EXPIRED"] = "expired";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var AuditEventType;
(function (AuditEventType) {
  AuditEventType["CONSENT_GRANTED"] = "consent_granted";
  AuditEventType["CONSENT_REVOKED"] = "consent_revoked";
  AuditEventType["DATA_ACCESS"] = "data_access";
  AuditEventType["DATA_MODIFIED"] = "data_modified";
  AuditEventType["DATA_DELETED"] = "data_deleted";
  AuditEventType["DATA_EXPORTED"] = "data_exported";
  AuditEventType["DATA_BREACHED"] = "data_breached";
  AuditEventType["REQUEST_SUBMITTED"] = "request_submitted";
  AuditEventType["REQUEST_PROCESSED"] = "request_processed";
  AuditEventType["SYSTEM_ACCESS"] = "system_access";
  AuditEventType["ENCRYPTION_APPLIED"] = "encryption_applied";
  AuditEventType["SECURITY_EVENT"] = "security_event";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
var SensitiveDataType;
(function (SensitiveDataType) {
  SensitiveDataType["RACIAL_ETHNIC"] = "racial_ethnic";
  SensitiveDataType["POLITICAL_OPINION"] = "political_opinion";
  SensitiveDataType["RELIGIOUS_BELIEF"] = "religious_belief";
  SensitiveDataType["UNION_MEMBERSHIP"] = "union_membership";
  SensitiveDataType["GENETIC_DATA"] = "genetic_data";
  SensitiveDataType["BIOMETRIC_DATA"] = "biometric_data";
  SensitiveDataType["HEALTH_DATA"] = "health_data";
  SensitiveDataType["SEXUAL_ORIENTATION"] = "sexual_orientation";
  SensitiveDataType["CRIMINAL_CONVICTION"] = "criminal_conviction";
})(SensitiveDataType || (exports.SensitiveDataType = SensitiveDataType = {}));
var ComplianceReportType;
(function (ComplianceReportType) {
  ComplianceReportType["CONSENT_SUMMARY"] = "consent_summary";
  ComplianceReportType["DATA_PROCESSING"] = "data_processing";
  ComplianceReportType["SUBJECT_REQUESTS"] = "subject_requests";
  ComplianceReportType["SECURITY_INCIDENTS"] = "security_incidents";
  ComplianceReportType["AUDIT_TRAIL"] = "audit_trail";
  ComplianceReportType["COMPLIANCE_STATUS"] = "compliance_status";
  ComplianceReportType["BREACH_REPORT"] = "breach_report";
  ComplianceReportType["RETENTION_REPORT"] = "retention_report";
})(ComplianceReportType || (exports.ComplianceReportType = ComplianceReportType = {}));
var DataSubjectRequestType;
(function (DataSubjectRequestType) {
  DataSubjectRequestType["ACCESS"] = "access";
  DataSubjectRequestType["RECTIFICATION"] = "rectification";
  DataSubjectRequestType["ERASURE"] = "erasure";
  DataSubjectRequestType["PORTABILITY"] = "portability";
  DataSubjectRequestType["RESTRICTION"] = "restriction";
  DataSubjectRequestType["OBJECTION"] = "objection";
})(DataSubjectRequestType || (exports.DataSubjectRequestType = DataSubjectRequestType = {}));
var DataSubjectRequestStatus;
(function (DataSubjectRequestStatus) {
  DataSubjectRequestStatus["PENDING"] = "pending";
  DataSubjectRequestStatus["IN_PROGRESS"] = "in_progress";
  DataSubjectRequestStatus["COMPLETED"] = "completed";
  DataSubjectRequestStatus["REJECTED"] = "rejected";
})(DataSubjectRequestStatus || (exports.DataSubjectRequestStatus = DataSubjectRequestStatus = {}));
