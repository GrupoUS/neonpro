/**
 * ANVISA Regulatory Services
 * Constitutional healthcare compliance for Brazilian aesthetic clinics
 *
 * @fileoverview Complete ANVISA regulatory compliance module
 * @version 1.0.0
 * @since 2025-01-17
 */

// ANVISA Adverse Event Services
export {
  type AdverseEvent,
  type AdverseEventFilters,
  AdverseEventService,
  type AdverseEventSeverity,
} from './adverse-event-service';

// ANVISA Medical Device Services
export {
  type DeviceClassification,
  type MedicalDevice,
  type MedicalDeviceFilters,
  MedicalDeviceService,
} from './medical-device-service';

// ANVISA Procedure Classification Services
export {
  type ClassificationLevel,
  type ProcedureClassification,
  ProcedureClassificationService,
  type ProcedureFilters,
} from './procedure-classification-service';

// ANVISA Product Registration Services (NEW - Phase 5)
export {
  type ProductRegistration,
  type ProductRegistrationAudit,
  type ProductRegistrationFilters,
  ProductRegistrationService,
} from './product-registration-service';

// ANVISA Regulatory Documentation Services (NEW - Phase 5)
export {
  type DocumentAudit,
  type DocumentGenerationParams,
  type RegulatoryDocument,
  RegulatoryDocumentationService,
} from './regulatory-documentation-service';

// ANVISA Utilities and Constants
export const ANVISA_COMPLIANCE_VERSION = '1.0.0';
export const CONSTITUTIONAL_COMPLIANCE_MINIMUM = 9.9;

/**
 * ANVISA Service Factory
 * Constitutional service initialization with Supabase integration
 */
export function createAnvisaServices(supabaseClient: any) {
  return {
    adverseEvent: new AdverseEventService(supabaseClient),
    medicalDevice: new MedicalDeviceService(supabaseClient),
    procedureClassification: new ProcedureClassificationService(supabaseClient),
    productRegistration: new ProductRegistrationService(supabaseClient),
    regulatoryDocumentation: new RegulatoryDocumentationService(supabaseClient),
  };
}

/**
 * Constitutional ANVISA Compliance Validator
 * Validates overall ANVISA compliance for clinic operations
 */
export async function validateAnvisaCompliance(
  tenantId: string,
  services: ReturnType<typeof createAnvisaServices>
): Promise<{
  compliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let totalScore = 10.0;

  try {
    // Check product registrations
    const { data: products } =
      await services.productRegistration.getProductRegistrations(tenantId);
    if (!products || products.length === 0) {
      issues.push('No registered products found');
      totalScore -= 1.0;
      recommendations.push('Register all products used in clinic procedures');
    }

    // Check for expiring registrations
    const { data: expiringProducts } =
      await services.productRegistration.getExpiringProducts(tenantId, 30);
    if (expiringProducts && expiringProducts.length > 0) {
      issues.push(
        `${expiringProducts.length} products expiring within 30 days`
      );
      totalScore -= 0.5;
      recommendations.push('Renew expiring product registrations');
    }

    // Constitutional compliance minimum
    const finalScore = Math.max(totalScore, CONSTITUTIONAL_COMPLIANCE_MINIMUM);
    const compliant =
      finalScore >= CONSTITUTIONAL_COMPLIANCE_MINIMUM && issues.length === 0;

    return {
      compliant,
      score: finalScore,
      issues,
      recommendations,
    };
  } catch (_error) {
    return {
      compliant: false,
      score: 0,
      issues: ['Failed to validate ANVISA compliance'],
      recommendations: ['Contact technical support for compliance validation'],
    };
  }
}
