/**
 * CFM Professional Standards Services
 * Constitutional healthcare compliance for Brazilian medical professionals
 *
 * @fileoverview Complete CFM professional standards compliance module
 * @version 1.0.0
 * @since 2025-01-17
 */
export { type DigitalSignature, DigitalSignatureService, type SignatureAudit, type SignatureValidationParams, type SignatureVerificationResponse, } from './digital-signature-service';
export { type EthicsAudit, type EthicsViolation, type MedicalEthicsAssessment, type MedicalEthicsComplianceResponse, MedicalEthicsService, type MedicalEthicsValidationParams, } from './medical-ethics-service';
export { type LegalComplianceAssessment, type MedicalRecordAudit, type MedicalRecordComplianceResponse, MedicalRecordsService, type MedicalRecordValidation, type MedicalRecordValidationParams, type RecordCompletenessAssessment, } from './medical-records-service';
export { type LicenseAudit, type LicenseVerificationParams, type LicenseVerificationResponse, type ProfessionalLicense, ProfessionalLicensingService, } from './professional-licensing-service';
export { type TelemedicineAudit, type TelemedicineComplianceResponse, TelemedicineComplianceService, type TelemedicineConsultation, type TelemedicinePlatformRequirements, type TelemedicineValidationParams, } from './telemedicine-compliance-service';
export declare const CFM_COMPLIANCE_VERSION = "1.0.0";
export declare const CONSTITUTIONAL_CFM_COMPLIANCE_MINIMUM = 9.9;
import { DigitalSignatureService } from './digital-signature-service';
import { MedicalEthicsService } from './medical-ethics-service';
import { MedicalRecordsService } from './medical-records-service';
import { ProfessionalLicensingService } from './professional-licensing-service';
import { TelemedicineComplianceService } from './telemedicine-compliance-service';
/**
 * CFM Service Factory
 * Constitutional service initialization with Supabase integration
 */
export declare function createCfmServices(supabaseClient: any): {
    digitalSignature: DigitalSignatureService;
    professionalLicensing: ProfessionalLicensingService;
    telemedicineCompliance: TelemedicineComplianceService;
    medicalEthics: MedicalEthicsService;
    medicalRecords: MedicalRecordsService;
};
/**
 * Constitutional CFM Compliance Validator
 * Validates overall CFM compliance for medical professional operations
 */
export declare function validateCfmCompliance(tenantId: string, services: ReturnType<typeof createCfmServices>): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
    professional_standards_met: boolean;
}>;
/**
 * CFM Resolution Compliance Checker
 * Validates compliance with specific CFM resolutions
 */
export declare function validateCfmResolutions(tenantId: string, services: ReturnType<typeof createCfmServices>, resolutions?: string[]): Promise<{
    compliant: boolean;
    resolution_compliance: Record<string, boolean>;
    issues: string[];
    recommendations: string[];
}>;
