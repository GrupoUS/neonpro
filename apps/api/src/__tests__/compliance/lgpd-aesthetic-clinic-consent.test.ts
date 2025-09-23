/**
 * LGPD Compliance Tests for Aesthetic Clinic Consent Management
 * 
 * Tests compliance with Lei Geral de Proteção de Dados (LGPD - Law 13.709/2018)
 * specifically for aesthetic clinic operations including:
 * - Article 7: Legal bases for personal data processing
 * - Article 11: Processing of sensitive personal data (health data)
 * - Article 18: Rights of the data subject
 * - Special requirements for aesthetic treatments, photos, and minor patients
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LGPDService } from '../../services/lgpd-service';
import { AestheticComplianceService } from '../../services/agui-protocol/aesthetic-compliance-service';
import type { 
  LGPDConsentData, 
  LGPDConsentVerification,
  ConsentCreation,
  ConsentUpdate,
  ConsentRevocation 
} from '../../services/lgpd-service';

describe('LGPD Aesthetic Clinic Consent Compliance Tests', () => {
  let lgpdService: LGPDService;
  let aestheticService: AestheticComplianceService;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    lgpdService = new LGPDService();
    aestheticService = new AestheticComplianceService({
      lgpdEncryptionKey: 'test-key',
      auditLogRetention: 365,
      enableAutoReporting: false,
      complianceLevel: 'strict'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Article 7 Compliance - Legal Bases for Processing', () => {
    it('should validate consent as legal basis for aesthetic treatments', async () => {
      const consentData: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: true,
        legalBasis: 'consent',
        purpose: 'Aesthetic treatment procedures and patient management'
      };

      const result = await lgpdService.createConsent(consentData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.legalBasis).toBe('consent');
      expect(result.data?.purpose).toContain('Aesthetic treatment');
    });

    it('should validate legal obligation as legal basis for medical records', async () => {
      const consentData: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: true,
        legalBasis: 'legal_obligation',
        purpose: 'Medical record retention as required by CFM Resolution 1821/2007'
      };

      const result = await lgpdService.createConsent(consentData);

      expect(result.success).toBe(true);
      expect(result.data?.legalBasis).toBe('legal_obligation');
      expect(result.data?.purpose).toContain('CFM Resolution');
    });

    it('should reject consent without valid legal basis', async () => {
      const consentData: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: true,
        legalBasis: 'invalid_basis',
        purpose: 'Test purpose'
      };

      const result = await lgpdService.createConsent(consentData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.field === 'legalBasis')).toBe(true);
    });

    it('should validate multiple legal bases for complex processing', async () => {
      // Test case where both consent and vital interests apply
      const emergencyConsent: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: false,
        legalBasis: 'vital_interests',
        purpose: 'Emergency aesthetic treatment procedure'
      };

      const result = await lgpdService.createConsent(emergencyConsent);

      expect(result.success).toBe(true);
      expect(result.data?.legalBasis).toBe('vital_interests');
    });
  });

  describe('Article 11 Compliance - Sensitive Personal Data Processing', () => {
    it('should require explicit consent for health data processing', async () => {
      const consentData: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Processing of sensitive health data for aesthetic treatments',
        dataCategories: ['health_data', 'medical_history', 'treatment_records'],
        retentionPeriod: '5_years',
        thirdPartyShares: [],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(consentData);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('treatment');
      expect(verification.verificationResult.purposeLimitation).toBe(true);
    });

    it('should validate photo processing consent with enhanced requirements', async () => {
      const photoConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'photos',
        purpose: 'Before and after treatment photos for medical documentation',
        dataCategories: ['biometric_data', 'visual_data'],
        retentionPeriod: '10_years',
        thirdPartyShares: [],
        withdrawalAllowed: true,
        automaticExpiration: true,
        expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const verification = await aestheticService.verifyLGPDConsent(photoConsent);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('photos');
      expect(verification.verificationResult.dataMinimization).toBe(true);
      expect(verification.verificationResult.securityMeasures).toBe(true);
    });

    it('should require specific consent for genetic data processing', async () => {
      const geneticConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'research',
        purpose: 'Genetic analysis for personalized treatment planning',
        dataCategories: ['genetic_data', 'health_data'],
        retentionPeriod: '20_years',
        thirdPartyShares: ['research_laboratory'],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(geneticConsent);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('research');
      expect(verification.verificationResult.rightsGuarantees).toBe(true);
    });

    it('should reject overly broad data categories for sensitive data', async () => {
      const broadConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'General data processing',
        dataCategories: Array(15).fill('excessive_data_category'), // Too many categories
        retentionPeriod: '5_years',
        thirdPartyShares: [],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(broadConsent);

      expect(verification.isConsentValid).toBe(false);
      expect(verification.issues.some(i => i.type === 'data_minimization')).toBe(true);
    });
  });

  describe('Data Subject Rights Implementation', () => {
    it('should process data access requests within legal timeframe', async () => {
      const accessRequest = {
        patientId: 'patient-123',
        requestType: 'access',
        requestedBy: 'patient-123',
        description: 'Request access to all my personal and health data',
        urgency: 'medium'
      };

      const result = await lgpdService.processDataAccessRequest(accessRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      
      // LGPD requires response within 15 days
      const estimatedDate = new Date(result.data?.estimatedCompletion);
      const requestDate = new Date();
      const daysDifference = Math.ceil((estimatedDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeLessThanOrEqual(15);
      expect(daysDifference).toBeGreaterThan(0);
    });

    it('should process data portability requests in specified format', async () => {
      const portabilityRequest = {
        patientId: 'patient-123',
        format: 'json' as const,
        includeHistory: true,
        deliveryMethod: 'download' as const,
        encryptionRequired: true
      };

      const result = await lgpdService.processDataPortabilityRequest(portabilityRequest);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('json');
      expect(result.data?.downloadUrl).toContain('.json');
    });

    it('should process data deletion requests with proper grace period', async () => {
      const deletionRequest = {
        patientId: 'patient-123',
        requestedBy: 'patient-123',
        reason: 'Exercise right to be forgotten',
        confirmDeletion: true,
        retainStatistical: false
      };

      const result = await lgpdService.processDataDeletionRequest(deletionRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('approved');
      
      // Should schedule deletion for future date (grace period)
      const scheduledDate = new Date(result.data?.scheduledDeletion);
      const requestDate = new Date();
      const daysDifference = Math.ceil((scheduledDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeGreaterThan(0); // Should not be immediate
    });

    it('should process data rectification requests with validation', async () => {
      const rectificationRequest = {
        patientId: 'patient-123',
        field: 'contact_information',
        currentValue: 'old-email@example.com',
        newValue: 'new-email@example.com',
        justification: 'Email address has changed',
        evidenceProvided: true
      };

      const result = await lgpdService.processDataRectificationRequest(rectificationRequest);

      expect(result.success).toBe(true);
      expect(result.data?.field).toBe('contact_information');
      expect(result.data?.status).toBe('approved');
    });
  });

  describe('Aesthetic Clinic Specific Consent Scenarios', () => {
    it('should handle treatment photo consent with proper data minimization', async () => {
      const photoConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'photos',
        purpose: 'Before and after treatment photos for medical record and progress tracking',
        dataCategories: ['visual_data'],
        retentionPeriod: '10_years',
        thirdPartyShares: [],
        withdrawalAllowed: true,
        ipAddress: '127.0.0.1',
        userAgent: 'NeonPro/1.0'
      };

      const consentId = await aestheticService.registerLGPDConsent(photoConsent);
      const verification = await aestheticService.verifyLGPDConsent(photoConsent);

      expect(consentId).toBeDefined();
      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('photos');
    });

    it('should validate marketing consent separately from treatment consent', async () => {
      const marketingConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'marketing',
        purpose: 'Send promotional materials about new aesthetic treatments',
        dataCategories: ['contact_data'],
        retentionPeriod: '2_years',
        thirdPartyShares: [],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(marketingConsent);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('marketing');
    });

    it('should handle emergency contact consent with vital interests basis', async () => {
      const emergencyConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'emergency_contact',
        purpose: 'Emergency contact information for treatment safety',
        dataCategories: ['contact_data', 'health_data'],
        retentionPeriod: '5_years',
        thirdPartyShares: ['emergency_services'],
        withdrawalAllowed: false // Cannot withdraw emergency contact consent
      };

      const verification = await aestheticService.verifyLGPDConsent(emergencyConsent);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.consentRecord.consentType).toBe('emergency_contact');
    });

    it('should validate consent withdrawal and data processing cessation', async () => {
      const consentData: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'General aesthetic treatment',
        dataCategories: ['health_data'],
        retentionPeriod: '5_years',
        withdrawalAllowed: true
      };

      const consentId = await aestheticService.registerLGPDConsent(consentData);
      
      // Withdraw consent
      const withdrawn = await aestheticService.withdrawLGPDConsent(consentId, 'Patient requested withdrawal');
      
      expect(withdrawn).toBe(true);
    });
  });

  describe('Consent History and Audit Trail', () => {
    it('should maintain complete consent history with timestamps', async () => {
      const consentData: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: true,
        legalBasis: 'consent',
        purpose: 'Initial treatment consent'
      };

      const createResult = await lgpdService.createConsent(consentData);
      expect(createResult.success).toBe(true);

      const historyResult = await lgpdService.getConsentHistory('patient-123');
      expect(historyResult.success).toBe(true);
      expect(historyResult.data?.history).toBeDefined();
      expect(historyResult.data?.currentConsent).toBeDefined();
    });

    it('should track consent modifications with proper audit trail', async () => {
      // Create initial consent
      const initialConsent: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: false,
        legalBasis: 'consent',
        purpose: 'Initial consent'
      };

      const createResult = await lgpdService.createConsent(initialConsent);
      const consentId = createResult.data?.id || '';

      // Update consent
      const update: ConsentUpdate = {
        analytics: true,
        updatedBy: 'patient-123',
        reason: 'Patient wants to enable analytics'
      };

      const updateResult = await lgpdService.updateConsent(consentId, update);
      expect(updateResult.success).toBe(true);

      // Verify history contains update
      const history = await lgpdService.getConsentHistory('patient-123');
      expect(history.data?.history.some(h => h.action === 'updated')).toBe(true);
    });

    it('should log consent revocation with detailed reasoning', async () => {
      const consentData: ConsentCreation = {
        patientId: 'patient-123',
        dataProcessing: true,
        marketing: false,
        analytics: true,
        legalBasis: 'consent',
        purpose: 'Treatment consent'
      };

      const createResult = await lgpdService.createConsent(consentData);
      const consentId = createResult.data?.id || '';

      // Revoke consent
      const revocation: ConsentRevocation = {
        revokedBy: 'patient-123',
        reason: 'No longer receiving treatments at this clinic',
        effectiveDate: new Date()
      };

      const revokeResult = await lgpdService.revokeConsent(consentId, revocation);
      expect(revokeResult.success).toBe(true);

      // Verify revocation is logged
      const history = await lgpdService.getConsentHistory('patient-123');
      expect(history.data?.history.some(h => h.action === 'revoked')).toBe(true);
    });
  });

  describe('Data Minimization and Purpose Limitation', () => {
    it('should enforce data minimization principles', async () => {
      const excessiveConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Simple facial treatment',
        dataCategories: Array(20).fill('unnecessary_data_category'), // Excessive data
        retentionPeriod: '5_years',
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(excessiveConsent);

      expect(verification.isConsentValid).toBe(false);
      expect(verification.issues.some(i => i.type === 'data_minimization')).toBe(true);
    });

    it('should validate purpose limitation compliance', async () => {
      const vaguePurposeConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'For various purposes and uses', // Too vague
        dataCategories: ['health_data'],
        retentionPeriod: '5_years',
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(vaguePurposeConsent);

      expect(verification.isConsentValid).toBe(false);
      expect(verification.issues.some(i => i.description.includes('purpose'))).toBe(true);
    });

    it('should validate appropriate retention periods', async () => {
      const invalidRetentionConsent: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Facial treatment',
        dataCategories: ['health_data'],
        retentionPeriod: '50_years', // Excessive retention period
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(invalidRetentionConsent);

      expect(verification.isConsentValid).toBe(false);
      expect(verification.issues.some(i => i.description.includes('retention'))).toBe(true);
    });
  });

  describe('Cross-border Data Transfer Compliance', () => {
    it('should validate international data transfer restrictions', async () => {
      const internationalTransfer: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'Treatment with international data processing',
        dataCategories: ['health_data'],
        retentionPeriod: '5_years',
        thirdPartyShares: ['international_cloud_provider'],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(internationalTransfer);

      // Should have specific validation for international transfers
      expect(verification.verificationResult.rightsGuarantees).toBe(true);
    });

    it('should require enhanced consent for international health data transfers', async () => {
      const internationalHealthTransfer: LGPDConsentData = {
        clientId: 'patient-123',
        consentType: 'treatment',
        purpose: 'International health data processing for consultation',
        dataCategories: ['health_data', 'sensitive_health_data'],
        retentionPeriod: '5_years',
        thirdPartyShares: ['international_medical_consultant'],
        withdrawalAllowed: true
      };

      const verification = await aestheticService.verifyLGPDConsent(internationalHealthTransfer);

      expect(verification.isConsentValid).toBe(true);
      expect(verification.verificationResult.securityMeasures).toBe(true);
    });
  });
});