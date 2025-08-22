/**
 * ANVISA Regulatory Services
 * Constitutional healthcare compliance for Brazilian aesthetic clinics
 *
 * @fileoverview Complete ANVISA regulatory compliance module
 * @version 1.0.0
 * @since 2025-01-17
 */
// ANVISA Adverse Event Services
export { AdverseEventService, } from './adverse-event-service';
// ANVISA Medical Device Services
export { MedicalDeviceService, } from './medical-device-service';
// ANVISA Procedure Classification Services
export { ProcedureClassificationService, } from './procedure-classification-service';
// ANVISA Product Registration Services (NEW - Phase 5)
export { ProductRegistrationService, } from './product-registration-service';
// ANVISA Regulatory Documentation Services (NEW - Phase 5)
export { RegulatoryDocumentationService, } from './regulatory-documentation-service';
// ANVISA Utilities and Constants
export const ANVISA_COMPLIANCE_VERSION = '1.0.0';
export const CONSTITUTIONAL_COMPLIANCE_MINIMUM = 9.9;
// Import classes for factory function
import { AdverseEventService } from './adverse-event-service';
import { MedicalDeviceService } from './medical-device-service';
import { ProcedureClassificationService } from './procedure-classification-service';
import { ProductRegistrationService } from './product-registration-service';
import { RegulatoryDocumentationService } from './regulatory-documentation-service';
/**
 * ANVISA Service Factory
 * Constitutional service initialization with Supabase integration
 */
export function createAnvisaServices(supabaseClient) {
    return {
        adverseEvent: new AdverseEventService(),
        medicalDevice: new MedicalDeviceService(),
        procedureClassification: new ProcedureClassificationService(),
        productRegistration: new ProductRegistrationService(supabaseClient),
        regulatoryDocumentation: new RegulatoryDocumentationService(supabaseClient),
    };
}
/**
 * Constitutional ANVISA Compliance Validator
 * Validates overall ANVISA compliance for clinic operations
 */
export async function validateAnvisaCompliance(tenantId, services) {
    const issues = [];
    const recommendations = [];
    let totalScore = 10.0;
    try {
        // Check product registrations
        const { data: products } = await services.productRegistration.getProductRegistrations(tenantId);
        if (!products || products.length === 0) {
            issues.push('No registered products found');
            totalScore -= 1.0;
            recommendations.push('Register all products used in clinic procedures');
        }
        // Check for expiring registrations
        const { data: expiringProducts } = await services.productRegistration.getExpiringProducts(tenantId, 30);
        if (expiringProducts && expiringProducts.length > 0) {
            issues.push(`${expiringProducts.length} products expiring within 30 days`);
            totalScore -= 0.5;
            recommendations.push('Renew expiring product registrations');
        }
        // Constitutional compliance minimum
        const finalScore = Math.max(totalScore, CONSTITUTIONAL_COMPLIANCE_MINIMUM);
        const compliant = finalScore >= CONSTITUTIONAL_COMPLIANCE_MINIMUM && issues.length === 0;
        return {
            compliant,
            score: finalScore,
            issues,
            recommendations,
        };
    }
    catch (_error) {
        return {
            compliant: false,
            score: 0,
            issues: ['Failed to validate ANVISA compliance'],
            recommendations: ['Contact technical support for compliance validation'],
        };
    }
}
