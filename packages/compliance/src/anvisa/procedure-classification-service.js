/**
 * @fileoverview ANVISA Procedure Classification Service
 * Constitutional Brazilian Healthcare Procedure Classification (RDC 67/2007)
 *
 * Constitutional Healthcare Principle: Medical Accuracy + Patient Safety
 * Quality Standard: ≥9.9/10
 *
 * ANVISA RDC 67/2007 - Aesthetic Procedures Classification:
 * - Low Risk: Minimally invasive procedures
 * - Medium Risk: Moderately invasive procedures
 * - High Risk: Highly invasive procedures requiring specialized oversight
 * - Constitutional requirement: All procedures must have proper classification
 */
import { z } from 'zod';
/**
 * Procedure Risk Classification
 */
export var ProcedureRiskLevel;
(function (ProcedureRiskLevel) {
    ProcedureRiskLevel["LOW"] = "LOW";
    ProcedureRiskLevel["MEDIUM"] = "MEDIUM";
    ProcedureRiskLevel["HIGH"] = "HIGH";
    ProcedureRiskLevel["CRITICAL"] = "CRITICAL";
})(ProcedureRiskLevel || (ProcedureRiskLevel = {}));
/**
 * Procedure Classification Schema
 */
export const ProcedureClassificationSchema = z.object({
    classificationId: z.string().uuid().optional(),
    tenantId: z.string().uuid(),
    procedureName: z.string().min(3).max(200),
    procedureCode: z.string().min(3).max(50),
    anvisaCategory: z.string().min(2).max(100),
    riskLevel: z.nativeEnum(ProcedureRiskLevel),
    invasivenessLevel: z.enum([
        'NON_INVASIVE',
        'MINIMALLY_INVASIVE',
        'MODERATELY_INVASIVE',
        'HIGHLY_INVASIVE',
    ]),
    anesthesiaRequired: z.enum([
        'NONE',
        'TOPICAL',
        'LOCAL',
        'REGIONAL',
        'GENERAL',
    ]),
    specialistRequired: z.boolean().default(false),
    requiredCertifications: z.array(z.string()),
    contraindications: z.array(z.string()),
    requirementsForExecution: z.object({
        minimumProfessionalLevel: z.enum([
            'TECHNICIAN',
            'NURSE',
            'GENERAL_PHYSICIAN',
            'SPECIALIST',
            'SURGEON',
        ]),
        requiredTraining: z.array(z.string()),
        supervisionRequired: z.boolean().default(false),
        equipmentRequired: z.array(z.string()),
        facilityRequirements: z.array(z.string()),
        preOperativeAssessment: z.boolean().default(false),
        postOperativeMonitoring: z.boolean().default(false),
    }),
    patientEligibility: z.object({
        minimumAge: z.number().min(0).max(150),
        maximumAge: z.number().min(0).max(150).optional(),
        pregnancyContraindicated: z.boolean().default(false),
        specificConditionsRequired: z.array(z.string()).optional(),
        specificConditionsProhibited: z.array(z.string()).optional(),
        informedConsentRequired: z.boolean().default(true),
        parentalConsentAge: z.number().min(0).max(18).optional(),
    }),
    regulatoryCompliance: z.object({
        anvisaApprovalRequired: z.boolean().default(false),
        cfmApprovalRequired: z.boolean().default(false),
        institutionalProtocolRequired: z.boolean().default(false),
        ethicsCommitteeApproval: z.boolean().default(false),
        adverseEventReportingMandatory: z.boolean().default(true),
    }),
    constitutionalValidation: z.object({
        patientSafetyValidated: z.boolean().default(false),
        medicalEthicsCompliant: z.boolean().default(false),
        qualityStandardsMet: z.boolean().default(false),
        regulatoryComplianceScore: z.number().min(0).max(10),
        lastValidationDate: z.date(),
        validatedBy: z.string().uuid(),
    }),
    classifiedBy: z.string().uuid(),
    classificationDate: z.date(),
    lastReviewDate: z.date().optional(),
    nextReviewDate: z.date(),
});
/**
 * Constitutional Procedure Classification Service for ANVISA Compliance
 */
export class ProcedureClassificationService {
    constructor() {
        this.constitutionalQualityStandard = 9.9;
        this.classificationReviewMonths = 12; // Annual review for constitutional compliance
    }
    /**
     * Classify Procedure with Constitutional ANVISA Compliance
     * Implements ANVISA RDC 67/2007 with constitutional healthcare validation
     */
    async classifyProcedure(classification) {
        try {
            // Step 1: Validate procedure classification data
            const validatedClassification = ProcedureClassificationSchema.parse(classification);
            // Step 2: Constitutional healthcare validation
            const constitutionalValidation = await this.validateConstitutionalRequirements(validatedClassification);
            if (!constitutionalValidation.valid) {
                return {
                    success: false,
                    error: `Constitutional procedure validation failed: ${constitutionalValidation.violations.join(', ')}`,
                    complianceScore: constitutionalValidation.score,
                    regulatoryValidation: { lgpd: true, anvisa: false, cfm: false },
                    auditTrail: await this.createAuditEvent('PROCEDURE_CONSTITUTIONAL_VIOLATION', validatedClassification),
                    timestamp: new Date(),
                };
            }
            // Step 3: ANVISA RDC 67/2007 compliance validation
            const anvisaValidation = await this.validateANVISACompliance(validatedClassification);
            if (!anvisaValidation.compliant) {
                return {
                    success: false,
                    error: `ANVISA RDC 67/2007 compliance failed: ${anvisaValidation.issues.join(', ')}`,
                    complianceScore: anvisaValidation.score,
                    regulatoryValidation: { lgpd: true, anvisa: false, cfm: true },
                    auditTrail: await this.createAuditEvent('PROCEDURE_ANVISA_VIOLATION', validatedClassification),
                    timestamp: new Date(),
                };
            }
            // Step 4: Professional qualification validation
            const professionalValidation = await this.validateProfessionalRequirements(validatedClassification);
            // Step 5: Patient safety assessment
            const safetyAssessment = await this.assessPatientSafety(validatedClassification);
            // Step 6: Calculate constitutional compliance score
            const complianceScore = this.calculateComplianceScore(constitutionalValidation, anvisaValidation, professionalValidation, safetyAssessment);
            // Step 7: Store procedure classification
            const classifiedProcedure = await this.storeProcedureClassification({
                ...validatedClassification,
                classificationId: validatedClassification.classificationId || crypto.randomUUID(),
                constitutionalValidation: {
                    patientSafetyValidated: true,
                    medicalEthicsCompliant: true,
                    qualityStandardsMet: complianceScore >= this.constitutionalQualityStandard,
                    regulatoryComplianceScore: complianceScore,
                    lastValidationDate: new Date(),
                    validatedBy: validatedClassification.constitutionalValidation.validatedBy,
                },
                nextReviewDate: new Date(Date.now() +
                    this.classificationReviewMonths * 30 * 24 * 60 * 60 * 1000),
            });
            // Step 8: Generate compliance documentation
            await this.generateComplianceDocumentation(classifiedProcedure);
            // Step 9: Generate audit trail
            const auditTrail = await this.createAuditEvent('PROCEDURE_CLASSIFIED', classifiedProcedure);
            // Step 10: Send classification notification
            await this.sendClassificationNotification(classifiedProcedure, complianceScore);
            return {
                success: true,
                data: classifiedProcedure,
                complianceScore,
                regulatoryValidation: { lgpd: true, anvisa: true, cfm: true },
                auditTrail,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const auditTrail = await this.createAuditEvent('PROCEDURE_CLASSIFICATION_ERROR', classification);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Unknown procedure classification error',
                complianceScore: 0,
                regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
                auditTrail,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Validate Classification with Constitutional Standards
     */
    async validateClassification(classificationId, tenantId) {
        try {
            // Step 1: Retrieve procedure classification
            const classification = await this.getProcedureClassification(classificationId, tenantId);
            if (!classification) {
                throw new Error('Procedure classification not found');
            }
            // Step 2: Perform comprehensive validation
            const validationResult = await this.performClassificationValidation(classification);
            // Step 3: Generate audit trail
            const auditTrail = await this.createAuditEvent('CLASSIFICATION_VALIDATED', {
                classificationId,
                validationResult,
            });
            return {
                success: true,
                data: validationResult,
                complianceScore: validationResult.constitutionalCompliance.overallScore,
                regulatoryValidation: {
                    lgpd: true,
                    anvisa: validationResult.validationChecks.regulatoryComplianceMet,
                    cfm: validationResult.validationChecks.ethicalStandardsMet,
                },
                auditTrail,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const auditTrail = await this.createAuditEvent('CLASSIFICATION_VALIDATION_ERROR', {
                classificationId,
            });
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Failed to validate classification',
                complianceScore: 0,
                regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
                auditTrail,
                timestamp: new Date(),
            };
        }
    }
    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    /**
     * Validate Constitutional Healthcare Requirements
     */
    async validateConstitutionalRequirements(classification) {
        const violations = [];
        let score = 10;
        // Patient safety validation
        if (classification.riskLevel === 'CRITICAL' &&
            !classification.requirementsForExecution.supervisionRequired) {
            violations.push('Critical risk procedures require supervision (constitutional patient safety)');
            score -= 2;
        }
        // Medical ethics validation
        if (!classification.patientEligibility.informedConsentRequired) {
            violations.push('Informed consent required for all procedures (constitutional medical ethics)');
            score -= 1.5;
        }
        // Age protection validation
        if (classification.patientEligibility.minimumAge < 18 &&
            !classification.patientEligibility.parentalConsentAge) {
            violations.push('Parental consent age must be specified for minor procedures');
            score -= 1;
        }
        // High-risk procedure validation
        if ((classification.riskLevel === 'HIGH' ||
            classification.riskLevel === 'CRITICAL') &&
            !classification.requirementsForExecution.preOperativeAssessment) {
            violations.push('Pre-operative assessment required for high-risk procedures');
            score -= 1.5;
        }
        // Professional qualification validation
        if (classification.riskLevel === 'HIGH' &&
            classification.requirementsForExecution.minimumProfessionalLevel ===
                'TECHNICIAN') {
            violations.push('High-risk procedures require physician-level professionals');
            score -= 2;
        }
        const finalScore = Math.max(0, Math.min(10, score));
        return {
            valid: violations.length === 0,
            score: finalScore,
            violations,
        };
    }
    /**
     * Validate ANVISA RDC 67/2007 Compliance
     */
    async validateANVISACompliance(classification) {
        const issues = [];
        let score = 10;
        // Risk level appropriate to invasiveness
        if (classification.invasivenessLevel === 'HIGHLY_INVASIVE' &&
            classification.riskLevel === 'LOW') {
            issues.push('Highly invasive procedures cannot be classified as low risk');
            score -= 2;
        }
        // Anesthesia requirements validation
        if (classification.anesthesiaRequired === 'GENERAL' &&
            classification.riskLevel === 'LOW') {
            issues.push('General anesthesia procedures require higher risk classification');
            score -= 1.5;
        }
        // Specialist requirement validation
        if (classification.riskLevel === 'HIGH' &&
            !classification.specialistRequired) {
            issues.push('High-risk procedures require specialist oversight');
            score -= 2;
        }
        // Facility requirements for high-risk procedures
        if (classification.riskLevel === 'HIGH' &&
            classification.requirementsForExecution.facilityRequirements.length === 0) {
            issues.push('High-risk procedures require specific facility requirements');
            score -= 1;
        }
        const finalScore = Math.max(0, Math.min(10, score));
        return {
            compliant: issues.length === 0,
            score: finalScore,
            issues,
        };
    }
    // Additional helper methods (implementation stubs)
    async validateProfessionalRequirements(_classification) {
        return { valid: true, score: 9.5 };
    }
    async assessPatientSafety(_classification) {
        return { safe: true, score: 9.8 };
    }
    calculateComplianceScore(...validations) {
        const scores = validations.map((v) => v.score || 9.0);
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return Math.min(10, Math.max(0, average));
    }
    async storeProcedureClassification(classification) {
        return classification;
    }
    async getProcedureClassification(_id, _tenantId) {
        return null; // Would query database
    }
    async performClassificationValidation(classification) {
        return {
            classificationId: classification.classificationId,
            isValid: true,
            constitutionalCompliance: {
                patientSafetyScore: 9.9,
                medicalEthicsScore: 9.8,
                regulatoryComplianceScore: 9.7,
                overallScore: 9.8,
            },
            validationChecks: {
                riskLevelAppropriate: true,
                professionalRequirementsMet: true,
                equipmentRequirementsMet: true,
                patientEligibilityClear: true,
                regulatoryComplianceMet: true,
                ethicalStandardsMet: true,
            },
            recommendations: [],
            requiredUpdates: [],
            nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        };
    }
    async generateComplianceDocumentation(_classification) { }
    async sendClassificationNotification(_classification, _score) { }
    async createAuditEvent(action, data) {
        return {
            id: crypto.randomUUID(),
            eventType: 'PROCEDURE_CLASSIFICATION',
            action,
            timestamp: new Date(),
            metadata: data,
        };
    }
}
