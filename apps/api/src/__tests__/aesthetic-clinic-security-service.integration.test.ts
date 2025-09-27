/**
 * Comprehensive integration tests for aesthetic clinic security service
 * Validates healthcare-specific security measures for aesthetic medicine practices
 * Security: Critical - Aesthetic clinic security service integration tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AestheticClinicSecurityService } from '../security/aesthetic-clinic-security-service'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { LGPDService } from '../services/lgpd-service'
import { SecurityValidationService } from '../services/security-validation-service'

// Mock external dependencies
vi.mock('../services/healthcare-session-management-service', () => ({
  HealthcareSessionManagementService: {
    validateSession: vi.fn(),
    getUserRoles: vi.fn(),
    logDataAccess: vi.fn(),
  },
}))

vi.mock('../services/security-validation-service', () => ({
  SecurityValidationService: {
    validateHealthcareDataAccess: vi.fn(),
    detectMedicalDataBreach: vi.fn(),
  },
}))

vi.mock('../services/lgpd-service', () => ({
  LGPDService: {
    validateConsent: vi.fn(),
    anonymizeData: vi.fn(),
  },
}))

describe('Aesthetic Clinic Security Service Integration Tests', () => {
  let aestheticSecurityService: typeof AestheticClinicSecurityService
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService
  let lgpdService: typeof LGPDService

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Initialize services
    aestheticSecurityService = AestheticClinicSecurityService
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService
    lgpdService = LGPDService

    // Set up environment variables
    vi.stubEnv('ANVISA_COMPLIANCE_ENABLED', 'true')
    vi.stubEnv('CFM_COMPLIANCE_ENABLED', 'true')
    vi.stubEnv('AESTHETIC_CLINIC_SECURITY_LEVEL', 'high')
  })

  afterEach(() => {
    // Clean up environment
    vi.unstubAllEnvs()
  })

  describe('Aesthetic Procedure Access Control', () => {
    it('should validate aesthetic procedure access with proper credentials', async () => {
      // Mock session for aesthetic professional
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          specialty: 'aesthetic_medicine',
          healthcareProvider: 'Aesthetic Clinic',
          isActive: true,
        },
      })

      vi.spyOn(sessionService, 'getUserRoles').mockResolvedValueOnce([
        'aesthetic_physician',
        'botox_certified',
        'filler_certified',
      ])

      const accessRequest = {
        procedureType: 'botox_injection',
        patientId: 'patient-456',
        treatmentPlanId: 'treatment-789',
        accessReason: 'treatment_administration',
      }

      const result = await aestheticSecurityService.validateProcedureAccess(
        accessRequest,
        'session-123',
      )

      expect(result.authorized).toBe(true)
      expect(result.credentialsValidated).toBe(true)
      expect(result.certificateVerified).toBe(true)
      expect(result.accessLevel).toBe('full')
    })

    it('should require specific certifications for high-risk procedures', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          specialty: 'aesthetic_medicine',
          certifications: ['botox_certified'], // Missing filler certification
          isActive: true,
        },
      })

      const accessRequest = {
        procedureType: 'dermal_fillers', // Requires filler certification
        patientId: 'patient-456',
        accessReason: 'treatment_planning',
      }

      const result = await aestheticSecurityService.validateProcedureAccess(
        accessRequest,
        'session-123',
      )

      expect(result.authorized).toBe(false)
      expect(result.reason).toContain('missing_certification')
      expect(result.requiredCertifications).toContain('filler_certified')
    })

    it('should enforce ANVISA compliance for aesthetic procedures', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          anvisaRegistration: 'REG-12345',
          isActive: true,
        },
      })

      const procedureData = {
        procedureType: 'laser_treatment',
        anvisaProductCode: 'PRODUCT-67890',
        batchNumber: 'BATCH-001',
        expirationDate: '2025-12-31',
      }

      const complianceCheck = await aestheticSecurityService.validateANVISACompliance(
        procedureData,
        'session-123',
      )

      expect(complianceCheck.compliant).toBe(true)
      expect(complianceCheck.anvisaVerified).toBe(true)
      expect(complianceCheck.productRegistrationValid).toBe(true)
      expect(complianceCheck.batchValid).toBe(true)
    })

    it('should block unauthorized access to sensitive aesthetic records', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-456',
          userId: 'staff-123',
          userRole: 'receptionist', // Limited access role
          isActive: true,
        },
      })

      const accessRequest = {
        recordType: 'before_after_photos',
        patientId: 'patient-456',
        accessReason: 'record_viewing',
      }

      const result = await aestheticSecurityService.validateRecordAccess(
        accessRequest,
        'session-456',
      )

      expect(result.authorized).toBe(false)
      expect(result.reason).toContain('insufficient_privileges')
      expect(result.requiredRole).toContain('aesthetic_physician')
    })
  })

  describe('Patient Privacy and Image Protection', () => {
    it('should protect before/after patient photos with enhanced security', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      vi.spyOn(validationService, 'validateHealthcareDataAccess').mockResolvedValueOnce({
        isValid: true,
        accessLevel: 'full',
        privacyScore: 95,
      })

      const imageAccessRequest = {
        imageType: 'before_after_photo',
        patientId: 'patient-456',
        procedureId: 'procedure-789',
        accessReason: 'treatment_evaluation',
      }

      const result = await aestheticSecurityService.validateImageAccess(
        imageAccessRequest,
        'session-123',
      )

      expect(result.authorized).toBe(true)
      expect(result.encryptionRequired).toBe(true)
      expect(result.watermarkApplied).toBe(true)
      expect(result.auditTrailEnabled).toBe(true)
    })

    it('should implement consent verification for photo usage', async () => {
      vi.spyOn(lgpdService, 'validateConsent').mockResolvedValueOnce({
        valid: true,
        consentType: 'photo_usage',
        expiresAt: new Date('2025-12-31'),
        scope: 'treatment_documentation',
      })

      const consentCheck = await aestheticSecurityService.validatePhotoUsageConsent(
        'patient-456',
        'marketing_materials',
      )

      expect(consentCheck.authorized).toBe(true)
      expect(consentCheck.consentType).toBe('photo_usage')
      expect(consentCheck.scopeValid).toBe(true)
      expect(consentCheck.notExpired).toBe(true)
    })

    it('should prevent unauthorized photo distribution', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const distributionRequest = {
        photoId: 'photo-789',
        patientId: 'patient-456',
        distributionChannel: 'social_media',
        purpose: 'marketing',
      }

      const result = await aestheticSecurityService.validatePhotoDistribution(
        distributionRequest,
        'session-123',
      )

      expect(result.authorized).toBe(false)
      expect(result.reason).toContain('explicit_consent_required')
      expect(result.requiresLegalReview).toBe(true)
    })

    it('should implement facial recognition privacy protection', async () => {
      const facialData = {
        patientId: 'patient-456',
        facialFeatures: 'encrypted-facial-data',
        procedureDate: '2024-01-15',
      }

      const privacyProtection = await aestheticSecurityService.applyFacialPrivacyProtection(
        facialData,
      )

      expect(privacyProtection.anonymized).toBe(true)
      expect(privacyProtection.featuresHashed).toBe(true)
      expect(privacyProtection.reversible).toBe(false) // One-way hash
      expect(privacyProtection.complianceLevel).toBe('high')
    })
  })

  describe('Treatment Plan Security', () => {
    it('should secure treatment plan access and modifications', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          isActive: true,
        },
      })

      const treatmentPlan = {
        patientId: 'patient-456',
        procedures: ['botox_injection', 'dermal_fillers'],
        estimatedCost: 5000,
        riskAssessment: 'low',
      }

      const securityCheck = await aestheticSecurityService.validateTreatmentPlanAccess(
        treatmentPlan,
        'read',
        'session-123',
      )

      expect(securityCheck.authorized).toBe(true)
      expect(securityCheck.planLocked).toBe(false)
      expect(securityCheck.signatureRequired).toBe(false) // Read access
    })

    it('should require digital signatures for treatment plan modifications', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          isActive: true,
        },
      })

      const planModification = {
        patientId: 'patient-456',
        modificationType: 'procedure_addition',
        originalPlan: 'plan-789',
        newProcedure: 'chemical_peel',
        justification: 'patient_request',
      }

      const result = await aestheticSecurityService.validateTreatmentPlanModification(
        planModification,
        'session-123',
      )

      expect(result.authorized).toBe(true)
      expect(result.digitalSignatureRequired).toBe(true)
      expect(result.patientConsentRequired).toBe(true)
      expect(result.auditTrailMandatory).toBe(true)
    })

    it('should validate cost transparency requirements', async () => {
      const treatmentCosts = {
        procedures: [
          { name: 'botox_injection', cost: 2000, anvisa_code: 'BOTOX-001' },
          { name: 'dermal_fillers', cost: 3000, anvisa_code: 'FILLER-001' },
        ],
        totalCost: 5000,
        paymentTerms: 'full_payment_upfront',
      }

      const costValidation = await aestheticSecurityService.validateCostTransparency(
        treatmentCosts,
      )

      expect(costValidation.compliant).toBe(true)
      expect(costValidation.allCostsDisclosed).toBe(true)
      expect(costValidation.anvisaCodesPresent).toBe(true)
      expect(costValidation.paymentTermsClear).toBe(true)
    })
  })

  describe('Inventory and Product Security', () => {
    it('should secure aesthetic product inventory access', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'clinic_manager',
          isActive: true,
        },
      })

      const inventoryRequest = {
        productType: 'dermal_fillers',
        action: 'view_inventory',
        reason: 'stock_check',
      }

      const result = await aestheticSecurityService.validateInventoryAccess(
        inventoryRequest,
        'session-123',
      )

      expect(result.authorized).toBe(true)
      expect(result.inventoryLevelAccess).toBe('full')
      expect(result.costVisibility).toBe(true)
    })

    it('should track product batch and expiration security', async () => {
      const productBatch = {
        productId: 'filler-001',
        batchNumber: 'BATCH-789',
        expirationDate: '2025-06-30',
        anvisaRegistration: 'REG-12345',
        storageConditions: 'refrigerated',
      }

      const batchValidation = await aestheticSecurityService.validateProductBatchSecurity(
        productBatch,
      )

      expect(batchValidation.valid).toBe(true)
      expect(batchValidation.anvisaCompliant).toBe(true)
      expect(batchValidation.expirationValid).toBe(true)
      expect(batchValidation.storageCompliant).toBe(true)
    })

    it('should prevent unauthorized product waste or disposal', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-456',
          userId: 'staff-123',
          userRole: 'technician', // Limited role
          isActive: true,
        },
      })

      const disposalRequest = {
        productId: 'botox-001',
        quantity: 2,
        reason: 'expired',
        disposalMethod: 'medical_waste',
      }

      const result = await aestheticSecurityService.validateProductDisposal(
        disposalRequest,
        'session-456',
      )

      expect(result.authorized).toBe(false)
      expect(result.reason).toContain('insufficient_privileges')
      expect(result.requiredRole).toContain('clinic_manager')
    })
  })

  describe('Regulatory Compliance', () => {
    it('should enforce CFM (Conselho Federal de Medicina) regulations', async () => {
      const professionalData = {
        cfmLicense: 'CRM-12345-SP',
        specialty: 'aesthetic_medicine',
        anvisaRegistrations: ['REG-12345', 'REG-67890'],
        continuingEducation: true,
      }

      const cfmCompliance = await aestheticSecurityService.validateCFMCompliance(
        professionalData,
      )

      expect(cfmCompliance.compliant).toBe(true)
      expect(cfmCompliance.licenseValid).toBe(true)
      expect(cfmCompliance.specialtyMatch).toBe(true)
      expect(cfmCompliance.educationCurrent).toBe(true)
    })

    it('should validate advertising and marketing compliance', async () => {
      const marketingContent = {
        platform: 'instagram',
        content: 'Botox treatments available',
        beforeAfterPhotos: false,
        pricingInfo: true,
        testimonials: false,
      }

      const marketingCheck = await aestheticSecurityService.validateMarketingCompliance(
        marketingContent,
      )

      expect(marketingCheck.compliant).toBe(false) // Pricing in ads is typically prohibited
      expect(marketingCheck.violations).toContain('pricing_disclosure')
      expect(marketingCheck.requiredChanges).toBeDefined()
    })

    it('should implement patient data retention policies', async () => {
      const dataRetentionRequest = {
        dataType: 'before_after_photos',
        patientId: 'patient-456',
        retentionPeriod: '10_years', // Aesthetic procedures typically require longer retention
        reason: 'legal_compliance',
      }

      const retentionValidation = await aestheticSecurityService.validateDataRetention(
        dataRetentionRequest,
      )

      expect(retentionValidation.authorized).toBe(true)
      expect(retentionValidation.retentionPeriodValid).toBe(true)
      expect(retentionValidation.complianceWithANVISA).toBe(true)
    })
  })

  describe('Security Monitoring and Threat Detection', () => {
    it('should detect unusual procedure patterns', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const procedurePattern = {
        physicianId: 'user-123',
        proceduresInDay: 15, // Unusually high
        averagePerDay: 5,
        procedureTypes: ['botox_injection'],
        totalBotoxUnits: 2000, // Very high
      }

      const threatDetection = await aestheticSecurityService.analyzeProcedurePatterns(
        procedurePattern,
      )

      expect(threatDetection.suspicious).toBe(true)
      expect(threatDetection.threatScore).toBeGreaterThan(0.7)
      expect(threatDetection.recommendations).toContain('review_procedure_volume')
    })

    it('should monitor inventory diversion risks', async () => {
      const inventoryData = {
        product: 'botox_vials',
        expectedUsage: 10,
        actualUsage: 15,
        wastageReported: 2,
        discrepancy: 3,
      }

      const riskAssessment = await aestheticSecurityService.assessInventoryDiversionRisk(
        inventoryData,
      )

      expect(riskAssessment.riskLevel).toBe('medium')
      expect(riskAssessment.diversionSuspected).toBe(true)
      expect(riskAssessment.investigationRecommended).toBe(true)
    })

    it('should validate patient consent for marketing materials', async () => {
      vi.spyOn(lgpdService, 'validateConsent').mockResolvedValueOnce({
        valid: true,
        consentType: 'marketing_usage',
        expiresAt: new Date('2025-12-31'),
        specificConsent: true,
      })

      const marketingUsage = {
        patientId: 'patient-456',
        content: 'before_after_photo',
        platform: 'clinic_website',
        purpose: 'patient_testimonial',
      }

      const consentCheck = await aestheticSecurityService.validateMarketingConsent(
        marketingUsage,
      )

      expect(consentCheck.authorized).toBe(true)
      expect(consentCheck.consentValid).toBe(true)
      expect(consentCheck.platformAllowed).toBe(true)
    })
  })

  describe('Performance and Scalability', () => {
    it('should validate procedure access within acceptable time', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const accessRequest = {
        procedureType: 'botox_injection',
        patientId: 'patient-456',
        accessReason: 'treatment',
      }

      const startTime = performance.now()
      await aestheticSecurityService.validateProcedureAccess(accessRequest, 'session-123')
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle concurrent security validations', async () => {
      const concurrentRequests = 15
      const requests = []

      vi.spyOn(sessionService, 'validateSession').mockResolvedValue({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          aestheticSecurityService.validateProcedureAccess(
            {
              procedureType: 'botox_injection',
              patientId: `patient-${i}`,
              accessReason: 'treatment',
            },
            'session-123',
          ),
        )
      }

      const results = await Promise.allSettled(requests)
      const successfulResults = results.filter(
        (result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled',
      )

      expect(successfulResults.length).toBe(concurrentRequests)
      successfulResults.forEach(result => {
        expect(result.value.authorized).toBe(true)
      })
    })
  })

  describe('Error Handling and Security', () => {
    it('should handle certification validation failures', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'INVALID-LICENSE', // Invalid license
          isActive: true,
        },
      })

      const accessRequest = {
        procedureType: 'botox_injection',
        patientId: 'patient-456',
        accessReason: 'treatment',
      }

      const result = await aestheticSecurityService.validateProcedureAccess(
        accessRequest,
        'session-123',
      )

      expect(result.authorized).toBe(false)
      expect(result.reason).toContain('invalid_license')
    })

    it('should detect and prevent data breaches', async () => {
      vi.spyOn(validationService, 'detectMedicalDataBreach').mockResolvedValueOnce({
        breachDetected: true,
        breachType: 'unauthorized_photo_access',
        confidence: 0.9,
        affectedRecords: ['patient-456', 'patient-789'],
      })

      const breachAnalysis = await aestheticSecurityService.analyzePotentialBreach({
        eventType: 'bulk_photo_download',
        userId: 'user-123',
        downloadCount: 50,
        timeWindow: '5_minutes',
      })

      expect(breachAnalysis.breachDetected).toBe(true)
      expect(breachAnalysis.severity).toBe('high')
      expect(breachAnalysis.immediateActionRequired).toBe(true)
    })

    it('should implement proper error logging for security events', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock security validation failure
      vi.spyOn(validationService, 'validateHealthcareDataAccess').mockRejectedValueOnce(
        new Error('Security validation failed'),
      )

      const accessRequest = {
        imageType: 'before_after_photo',
        patientId: 'patient-456',
        accessReason: 'treatment_evaluation',
      }

      await expect(
        aestheticSecurityService.validateImageAccess(accessRequest, 'session-123'),
      ).rejects.toThrow('Security validation failed')

      // Verify error was logged appropriately
      expect(validationService.validateHealthcareDataAccess).toHaveBeenCalled()
    })
  })
})
