"use strict";
/**
 * LGPD Compliance Framework - Index Exports
 * Centraliza exports de todos os módulos de compliance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LGPDComplianceServiceDefault = exports.LGPDAuditTrailService = exports.LGPDAutoAnonymizationService = exports.LGPDAutoReportingService = exports.LGPDAutoAuditService = exports.LGPDAutoDataSubjectRightsService = exports.LGPDAutoConsentService = exports.LGPDAutomationOrchestrator = exports.privacyProtectionManager = exports.PrivacyProtectionManager = exports.LGPDComplianceService = exports.EncryptionService = exports.scheduleDataDeletion = exports.generateDataExport = exports.LGPDAuditEventType = exports.LGPDAuditTrail = exports.ComplianceReportType = exports.AuditEventType = exports.DataSubjectRequestStatus = exports.DataSubjectRequestType = exports.LegalBasis = exports.ConsentStatus = exports.ConsentType = exports.LGPDCore = exports.LGPDDataSubjectService = exports.LGPDConsentService = exports.LGPDEncryptionService = void 0;
// Core LGPD Services
var lgpd_core_1 = require("./lgpd-core");
Object.defineProperty(exports, "LGPDEncryptionService", { enumerable: true, get: function () { return lgpd_core_1.LGPDEncryptionService; } });
Object.defineProperty(exports, "LGPDConsentService", { enumerable: true, get: function () { return lgpd_core_1.LGPDConsentService; } });
Object.defineProperty(exports, "LGPDDataSubjectService", { enumerable: true, get: function () { return lgpd_core_1.LGPDDataSubjectService; } });
Object.defineProperty(exports, "LGPDCore", { enumerable: true, get: function () { return lgpd_core_1.LGPDCore; } });
// Export enum values for direct usage
var lgpd_1 = require("../../types/lgpd");
Object.defineProperty(exports, "ConsentType", { enumerable: true, get: function () { return lgpd_1.ConsentType; } });
Object.defineProperty(exports, "ConsentStatus", { enumerable: true, get: function () { return lgpd_1.ConsentStatus; } });
Object.defineProperty(exports, "LegalBasis", { enumerable: true, get: function () { return lgpd_1.LegalBasis; } });
Object.defineProperty(exports, "DataSubjectRequestType", { enumerable: true, get: function () { return lgpd_1.DataSubjectRequestType; } });
Object.defineProperty(exports, "DataSubjectRequestStatus", { enumerable: true, get: function () { return lgpd_1.DataSubjectRequestStatus; } });
Object.defineProperty(exports, "AuditEventType", { enumerable: true, get: function () { return lgpd_1.AuditEventType; } });
Object.defineProperty(exports, "ComplianceReportType", { enumerable: true, get: function () { return lgpd_1.ComplianceReportType; } });
// Audit Trail Services
var audit_trail_1 = require("./audit-trail");
Object.defineProperty(exports, "LGPDAuditTrail", { enumerable: true, get: function () { return audit_trail_1.LGPDAuditTrail; } });
Object.defineProperty(exports, "LGPDAuditEventType", { enumerable: true, get: function () { return audit_trail_1.AuditEventType; } });
// Data Export/Deletion Services
var data_export_1 = require("./data-export");
Object.defineProperty(exports, "generateDataExport", { enumerable: true, get: function () { return data_export_1.generateDataExport; } });
var data_deletion_1 = require("./data-deletion");
Object.defineProperty(exports, "scheduleDataDeletion", { enumerable: true, get: function () { return data_deletion_1.scheduleDataDeletion; } });
var lgpd_core_2 = require("./lgpd-core");
Object.defineProperty(exports, "EncryptionService", { enumerable: true, get: function () { return lgpd_core_2.LGPDEncryptionService; } });
// Default export with named alias
var lgpd_core_3 = require("./lgpd-core");
Object.defineProperty(exports, "LGPDComplianceService", { enumerable: true, get: function () { return lgpd_core_3.default; } });
// Privacy Protection Services
var privacy_protection_1 = require("./privacy-protection");
Object.defineProperty(exports, "PrivacyProtectionManager", { enumerable: true, get: function () { return privacy_protection_1.PrivacyProtectionManager; } });
Object.defineProperty(exports, "privacyProtectionManager", { enumerable: true, get: function () { return privacy_protection_1.privacyProtectionManager; } });
// Automation Services
var lgpd_automation_1 = require("./lgpd-automation");
Object.defineProperty(exports, "LGPDAutomationOrchestrator", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutomationOrchestrator; } });
Object.defineProperty(exports, "LGPDAutoConsentService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutoConsentService; } });
Object.defineProperty(exports, "LGPDAutoDataSubjectRightsService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutoDataSubjectRightsService; } });
Object.defineProperty(exports, "LGPDAutoAuditService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutoAuditService; } });
Object.defineProperty(exports, "LGPDAutoReportingService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutoReportingService; } });
Object.defineProperty(exports, "LGPDAutoAnonymizationService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAutoAnonymizationService; } });
Object.defineProperty(exports, "LGPDAuditTrailService", { enumerable: true, get: function () { return lgpd_automation_1.LGPDAuditTrailService; } });
// Re-export default for backwards compatibility
var lgpd_core_4 = require("./lgpd-core");
Object.defineProperty(exports, "LGPDComplianceServiceDefault", { enumerable: true, get: function () { return lgpd_core_4.default; } });
