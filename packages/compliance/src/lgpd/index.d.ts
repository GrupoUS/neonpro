/**
 * @fileoverview LGPD (Lei Geral de Proteção de Dados) Compliance Module
 * Constitutional Brazilian Data Protection Law Implementation
 *
 * This module provides comprehensive LGPD compliance utilities for healthcare systems
 * with constitutional validation and ≥9.9/10 quality standards.
 *
 * Features:
 * - DPIA (Data Protection Impact Assessment) automation
 * - Consent lifecycle management with constitutional validation
 * - Right to erasure automation (Art. 18 LGPD)
 * - Data portability export/import system
 * - Breach notification automation (72h constitutional compliance)
 *
 * @version 0.1.0
 * @compliance LGPD Art. 7º, 11º, 14º, 18º, 33º, 48º
 */
export { LGPDAuditLogger } from './audit-logger';
export { BreachNotificationService } from './breach-notification-service';
export { ConsentService } from './consent-service';
export { DataErasureService } from './data-erasure-service';
export { DataPortabilityService } from './data-portability-service';
export { DPIAService } from './dpia-service';
export { LGPDReportGenerator } from './report-generator';
export * from './types';
export { LGPDValidator } from './validator';
/**
 * LGPD Constitutional Compliance Configuration
 */
export declare const LGPD_CONFIG: {
    readonly CONSTITUTIONAL_COMPLIANCE: true;
    readonly QUALITY_STANDARD: 9.9;
    readonly CONSENT_EXPIRY_MONTHS: 24;
    readonly BREACH_NOTIFICATION_HOURS: 72;
    readonly DATA_RETENTION_YEARS: 5;
    readonly MINOR_AGE_THRESHOLD: 18;
    readonly HEALTH_DATA_EXTRA_PROTECTION: true;
    readonly SENSITIVE_DATA_ENCRYPTION: "AES-256";
    readonly AUDIT_TRAIL_REQUIRED: true;
    readonly GRANULAR_CONSENT_REQUIRED: true;
    readonly PATIENT_PRIVACY_FIRST: true;
    readonly MEDICAL_ACCURACY_REQUIRED: true;
    readonly TRANSPARENCY_MANDATE: true;
    readonly AI_ETHICS_VALIDATION: true;
};
/**
 * LGPD Legal Basis Hierarchy for Healthcare
 * Prioritized according to constitutional healthcare principles
 */
export declare const HEALTHCARE_LEGAL_BASIS_PRIORITY: readonly ["HEALTH_PROTECTION", "HEALTH_PROCEDURES", "VITAL_INTEREST", "CONSENT", "LEGAL_OBLIGATION", "CONTRACT_EXECUTION", "LEGITIMATE_INTEREST"];
/**
 * LGPD Module Status and Health Check
 */
export declare function getLGPDModuleStatus(): Promise<{
    module: string;
    version: string;
    status: string;
    constitutionalCompliance: boolean;
    qualityScore: number;
    features: {
        dpia: string;
        consentManagement: string;
        dataErasure: string;
        dataPortability: string;
        breachNotification: string;
    };
    lastHealthCheck: string;
}>;
