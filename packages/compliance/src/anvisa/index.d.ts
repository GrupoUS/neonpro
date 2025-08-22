/**
 * ANVISA Regulatory Services
 * Constitutional healthcare compliance for Brazilian aesthetic clinics
 *
 * @fileoverview Complete ANVISA regulatory compliance module
 * @version 1.0.0
 * @since 2025-01-17
 */
export { type AdverseEvent, type AdverseEventFilters, AdverseEventService, type AdverseEventSeverity, } from './adverse-event-service';
export { type ClassificationLevel, type DeviceClassification, type MedicalDevice, type MedicalDeviceFilters, MedicalDeviceService, } from './medical-device-service';
export { type ProcedureClassification, ProcedureClassificationService, type ProcedureFilters, } from './procedure-classification-service';
export { type ProductRegistration, type ProductRegistrationAudit, type ProductRegistrationFilters, ProductRegistrationService, } from './product-registration-service';
export { type DocumentAudit, type DocumentGenerationParams, type RegulatoryDocument, RegulatoryDocumentationService, } from './regulatory-documentation-service';
export declare const ANVISA_COMPLIANCE_VERSION = "1.0.0";
export declare const CONSTITUTIONAL_COMPLIANCE_MINIMUM = 9.9;
import { AdverseEventService } from './adverse-event-service';
import { MedicalDeviceService } from './medical-device-service';
import { ProcedureClassificationService } from './procedure-classification-service';
import { ProductRegistrationService } from './product-registration-service';
import { RegulatoryDocumentationService } from './regulatory-documentation-service';
/**
 * ANVISA Service Factory
 * Constitutional service initialization with Supabase integration
 */
export declare function createAnvisaServices(supabaseClient: any): {
    adverseEvent: AdverseEventService;
    medicalDevice: MedicalDeviceService;
    procedureClassification: ProcedureClassificationService;
    productRegistration: ProductRegistrationService;
    regulatoryDocumentation: RegulatoryDocumentationService;
};
/**
 * Constitutional ANVISA Compliance Validator
 * Validates overall ANVISA compliance for clinic operations
 */
export declare function validateAnvisaCompliance(tenantId: string, services: ReturnType<typeof createAnvisaServices>): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
}>;
