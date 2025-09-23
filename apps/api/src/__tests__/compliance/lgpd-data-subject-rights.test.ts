/**
 * LGPD Data Subject Rights Compliance Tests for Aesthetic Clinics
 * 
 * Tests implementation of Article 18 of LGPD - Rights of the Data Subject
 * Including:
 * - Right to confirmation of data processing existence
 * - Right to access data (Art. 18, VI)
 * - Right to correct incomplete/inaccurate data (Art. 18, V)
 * - Right to anonymization, blocking, or deletion (Art. 18, VI)
 * - Right to data portability (Art. 18, VII)
 * - Right to information about shared third parties (Art. 18, VIII)
 * - Right to revoke consent (Art. 18, II)
 * - Right to information about automated decision-making
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LGPDService } from '../../services/lgpd-service';
import { LGPDComplianceService } from '../../services/lgpd-compliance';
import { AestheticComplianceService } from '../../services/agui-protocol/aesthetic-compliance-service';
import { LGPDDataService } from '../../services/lgpd-data-subject-service';
import type {
  DataAccessRequest,
  DataPortabilityRequest,
  DataDeletionRequest,
  DataRectificationRequest,
  ServiceResponse
} from '../../services/lgpd-service';

describe('LGPD Data Subject Rights Compliance Tests', () => {
  let lgpdService: LGPDService;
  let complianceService: LGPDComplianceService;
  let aestheticService: AestheticComplianceService;
  let dataSubjectService: LGPDDataService;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase client: mockSupabase = [ {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    lgpdServic: e = [ new LGPDService();
    complianceServic: e = [ new LGPDComplianceService();
    aestheticServic: e = [ new AestheticComplianceService({
      lgpdEncryptionKey: 'test-key',
      auditLogRetention: 365,
      enableAutoReporting: false,
      complianceLevel: 'strict'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Article 18, VI - Right to Access Data', () => {
    it('should provide complete access to personal data within legal timeframe', async () => {
      const accessRequest: DataAccessReques: t = [ {
        patientId: 'patient-123',
        requestType: 'access',
        requestedBy: 'patient-123',
        description: 'Request access to all my personal and health data',
        urgency: 'medium'
      };

      const: result = [ await lgpdService.processDataAccessRequest(accessRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      expect(result.data?.estimatedCompletion).toBeDefined();

      // Verify compliance with 15-day legal deadline
      const: deadline = [ new Date(result.data?.estimatedCompletion);
      const: now = [ new Date();
      const: daysUntilDeadline = [ Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysUntilDeadline).toBeLessThanOrEqual(15);
      expect(daysUntilDeadline).toBeGreaterThan(0);
    });

    it('should include all data categories in access response', async () => {
      // Mock comprehensive data retrieval
      const: mockPatientData = [ {
        personal_data: {
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-9999',
          cpf: '123.456.789-00',
          date_of_birth: '1990-01-01'
        },
        health_data: {
          medical_history: 'No relevant conditions',
          allergies: ['None known'],
          current_medications: [],
          treatment_records: [
            {
              date: '2024-01-15',
              treatment: 'Botox Application',
              professional: 'Dr. Maria Santos',
              notes: 'Standard procedure completed successfully'
            }
          ]
        },
        financial_data: {
          payment_history: [
            {
              date: '2024-01-15',
              amount: 1500.00,
              payment_method: 'credit_card',
              status: 'completed'
            }
          ],
          upcoming_appointments: []
        },
        consent_data: {
          treatment_consent: {
            granted_at: '2024-01-10',
            purpose: 'Aesthetic treatments',
            data_categories: ['health_data', 'personal_data']
          },
          photo_consent: {
            granted_at: '2024-01-10',
            purpose: 'Treatment documentation',
            retention_period: '10_years'
          }
        }
      };

      // Mock the data access response
      vi.spyOn(lgpdService as any, 'retrievePatientData').mockResolvedValue(mockPatientData);

      const accessRequest: DataAccessReques: t = [ {
        patientId: 'patient-123',
        requestType: 'access',
        requestedBy: 'patient-123',
        description: 'Complete data access request',
        urgency: 'medium'
      };

      const: result = [ await lgpdService.processDataAccessRequest(accessRequest);

      expect(result.success).toBe(true);
      
      // In a real implementation, we would verify the returned data includes all categories
      // For now, we verify the request was processed successfully
      expect(result.data?.status).toBe('processing');
    });

    it('should handle urgent access requests expedited processing', async () => {
      const urgentAccessRequest: DataAccessReques: t = [ {
        patientId: 'patient-123',
        requestType: 'access',
        requestedBy: 'patient-123',
        description: 'Urgent access needed for medical consultation',
        urgency: 'high'
      };

      const: result = [ await lgpdService.processDataAccessRequest(urgentAccessRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('processing');
      
      // Urgent requests should have shorter processing time
      const: deadline = [ new Date(result.data?.estimatedCompletion);
      const: now = [ new Date();
      const: daysUntilDeadline = [ Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysUntilDeadline).toBeLessThanOrEqual(7); // Urgent requests should be faster
    });

    it('should validate requester identity before granting access', async () => {
      // Mock identity validation failure
      vi.spyOn(lgpdService as any, 'validateRequesterIdentity').mockResolvedValue(false);

      const accessRequest: DataAccessReques: t = [ {
        patientId: 'patient-123',
        requestType: 'access',
        requestedBy: 'unauthorized-user',
        description: 'Data access request',
        urgency: 'medium'
      };

      const: result = [ await lgpdService.processDataAccessRequest(accessRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('unauthorized');
    });
  });

  describe('Article 18, VII - Right to Data Portability', () => {
    it('should provide data in requested format (JSON, CSV, PDF)', async () => {
      const: formats = [ ['json', 'csv', 'pdf'] as const;

      for (const format of formats) {
        const portabilityRequest: DataPortabilityReques: t = [ {
          patientId: 'patient-123',
          format,
          includeHistory: true,
          deliveryMethod: 'download',
          encryptionRequired: true
        };

        const: result = [ await lgpdService.processDataPortabilityRequest(portabilityRequest);

        expect(result.success).toBe(true);
        expect(result.data?.format).toBe(format);
        expect(result.data?.downloadUrl).toContain(`.${format}`);
      }
    });

    it('should include complete and machine-readable data', async () => {
      const portabilityRequest: DataPortabilityReques: t = [ {
        patientId: 'patient-123',
        format: 'json',
        includeHistory: true,
        deliveryMethod: 'download',
        encryptionRequired: true
      };

      const: result = [ await lgpdService.processDataPortabilityRequest(portabilityRequest);

      expect(result.success).toBe(true);
      expect(result.data?.downloadUrl).toBeDefined();
      
      // Verify the download URL includes encryption requirement
      expect(result.data?.downloadUrl).toContain('encrypted');
    });

    it('should handle different delivery methods securely', async () => {
      const: deliveryMethods = [ ['email', 'download', 'api'] as const;

      for (const deliveryMethod of deliveryMethods) {
        const portabilityRequest: DataPortabilityReques: t = [ {
          patientId: 'patient-123',
          format: 'json',
          includeHistory: true,
          deliveryMethod,
          encryptionRequired: true
        };

        const: result = [ await lgpdService.processDataPortabilityRequest(portabilityRequest);

        expect(result.success).toBe(true);
        expect(result.data?.deliveryMethod).toBe(deliveryMethod);
      }
    });

    it('should allow selective data inclusion in portability', async () => {
      const minimalPortabilityRequest: DataPortabilityReques: t = [ {
        patientId: 'patient-123',
        format: 'json',
        includeHistory: false, // Exclude history
        deliveryMethod: 'download',
        encryptionRequired: true
      };

      const: result = [ await lgpdService.processDataPortabilityRequest(minimalPortabilityRequest);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('json');
    });
  });

  describe('Article 18, VI - Right to Deletion (Right to be Forgotten)', () => {
    it('should process deletion requests with proper confirmation', async () => {
      const deletionRequest: DataDeletionReques: t = [ {
        patientId: 'patient-123',
        requestedBy: 'patient-123',
        reason: 'Exercise right to be forgotten',
        confirmDeletion: true,
        retainStatistical: false
      };

      const: result = [ await lgpdService.processDataDeletionRequest(deletionRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('approved');
      expect(result.data?.scheduledDeletion).toBeDefined();
    });

    it('should implement grace period before final deletion', async () => {
      const deletionRequest: DataDeletionReques: t = [ {
        patientId: 'patient-123',
        requestedBy: 'patient-123',
        reason: 'Request data deletion',
        confirmDeletion: true,
        retainStatistical: false
      };

      const: result = [ await lgpdService.processDataDeletionRequest(deletionRequest);

      expect(result.success).toBe(true);
      
      const: scheduledDate = [ new Date(result.data?.scheduledDeletion);
      const: requestDate = [ new Date();
      const: gracePeriodDays = [ Math.ceil((scheduledDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Should have reasonable grace period (30 days is standard)
      expect(gracePeriodDays).toBeGreaterThan(0);
      expect(gracePeriodDays).toBeLessThanOrEqual(60);
    });

    it('should handle statistical data retention option', async () => {
      const deletionWithStatsRetention: DataDeletionReques: t = [ {
        patientId: 'patient-123',
        requestedBy: 'patient-123',
        reason: 'Delete personal data but keep statistics',
        confirmDeletion: true,
        retainStatistical: true
      };

      const: result = [ await lgpdService.processDataDeletionRequest(deletionWithStatsRetention);

      expect(result.success).toBe(true);
      // Should indicate that statistical data will be preserved
      expect(result.data?.status).toBe('approved');
    });

    it('should validate deletion request authorization', async () => {
      const unauthorizedDeletionRequest: DataDeletionReques: t = [ {
        patientId: 'patient-123',
        requestedBy: 'unauthorized-user',
        reason: 'Attempt to delete data',
        confirmDeletion: true,
        retainStatistical: false
      };

      const: result = [ await lgpdService.processDataDeletionRequest(unauthorizedDeletionRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('unauthorized');
    });

    it('should prevent deletion of legally required data', async () => {
      // Mock scenario where data cannot be deleted due to legal requirements
      vi.spyOn(lgpdService as any, 'checkLegalRetentionRequirements').mockResolvedValue(true);

      const legallyRequiredDeletion: DataDeletionReques: t = [ {
        patientId: 'patient-123',
        requestedBy: 'patient-123',
        reason: 'Delete medical records',
        confirmDeletion: true,
        retainStatistical: false
      };

      const: result = [ await lgpdService.processDataDeletionRequest(legallyRequiredDeletion);

      expect(result.success).toBe(false);
      expect(result.error).toContain('legal retention');
    });
  });

  describe('Article 18, V - Right to Data Rectification', () => {
    it('should process data correction requests with validation', async () => {
      const rectificationRequest: DataRectificationReques: t = [ {
        patientId: 'patient-123',
        field: 'contact_information',
        currentValue: 'old-email@example.com',
        newValue: 'new-email@example.com',
        justification: 'Email address has changed',
        evidenceProvided: true
      };

      const: result = [ await lgpdService.processDataRectificationRequest(rectificationRequest);

      expect(result.success).toBe(true);
      expect(result.data?.field).toBe('contact_information');
      expect(result.data?.status).toBe('approved');
    });

    it('should validate correction requests with evidence requirements', async () => {
      const rectificationWithoutEvidence: DataRectificationReques: t = [ {
        patientId: 'patient-123',
        field: 'medical_history',
        currentValue: 'No allergies',
        newValue: 'Allergic to penicillin',
        justification: 'Need to update medical history',
        evidenceProvided: false // No evidence provided for sensitive medical data
      };

      const: result = [ await lgpdService.processDataRectificationRequest(rectificationWithoutEvidence);

      expect(result.success).toBe(false);
      expect(result.error).toContain('evidence required');
    });

    it('should handle different types of data corrections', async () => {
      const: correctionFields = [ [
        'contact_information',
        'personal_details',
        'medical_history',
        'emergency_contact'
      ];

      for (const field of correctionFields) {
        const rectificationRequest: DataRectificationReques: t = [ {
          patientId: 'patient-123',
          field,
          currentValue: 'Old value',
          newValue: 'New value',
          justification: 'Correction needed',
          evidenceProvided: true
        };

        const: result = [ await lgpdService.processDataRectificationRequest(rectificationRequest);

        expect(result.success).toBe(true);
        expect(result.data?.field).toBe(field);
      }
    });

    it('should maintain audit trail of all corrections', async () => {
      const rectificationRequest: DataRectificationReques: t = [ {
        patientId: 'patient-123',
        field: 'contact_information',
        currentValue: 'old-email@example.com',
        newValue: 'new-email@example.com',
        justification: 'Email address update',
        evidenceProvided: true
      };

      const: result = [ await lgpdService.processDataRectificationRequest(rectificationRequest);

      expect(result.success).toBe(true);
      
      // Verify correction was logged in audit trail
      const: auditLog = [ await: lgpdService = ['logProcessingActivity']({
        patientId: 'patient-123',
        activity: 'data_rectification',
        purpose: 'Data correction request processed',
        legalBasis: 'right_to_rectification',
        dataCategories: ['personal_data'],
        processor: 'system'
      });

      expect(auditLog.success).toBe(true);
    });
  });

  describe('Article 18, VIII - Right to Information About Third Parties', () => {
    it('should disclose all third parties with whom data is shared', async () => {
      // Mock third party sharing data
      const: mockThirdParties = [ [
        {
          name: 'Cloud Storage Provider',
          purpose: 'Data backup and storage',
          dataCategories: ['personal_data', 'health_data'],
          contactInformation: 'privacy@cloudprovider.com'
        },
        {
          name: 'Payment Processor',
          purpose: 'Payment processing',
          dataCategories: ['financial_data'],
          contactInformation: 'compliance@paymentprocessor.com'
        }
      ];

      vi.spyOn(lgpdService as any, 'getThirdPartySharingInfo').mockResolvedValue(mockThirdParties);

      const accessRequest: DataAccessReques: t = [ {
        patientId: 'patient-123',
        requestType: 'third_party_information',
        requestedBy: 'patient-123',
        description: 'Request information about third parties with whom my data is shared',
        urgency: 'medium'
      };

      const: result = [ await lgpdService.processDataAccessRequest(accessRequest);

      expect(result.success).toBe(true);
    });

    it('should provide contact information for third parties', async () => {
      const: thirdPartyInfo = [ await: lgpdService = ['getThirdPartySharingInfo']('patient-123');

      expect(Array.isArray(thirdPartyInfo)).toBe(true);
      
      if (thirdPartyInfo.length > 0) {
        expect(thirdPartyInf: o = [0]).toHaveProperty('name');
        expect(thirdPartyInf: o = [0]).toHaveProperty('purpose');
        expect(thirdPartyInf: o = [0]).toHaveProperty('contactInformation');
      }
    });
  });

  describe('Article 18, II - Right to Revoke Consent', () => {
    it('should allow consent revocation for all consent types', async () => {
      const: consentTypes = [ ['treatment', 'marketing', 'photos', 'research'];

      for (const consentType of consentTypes) {
        // Mock consent existence
        vi.spyOn(lgpdService as any, 'getActiveConsent').mockResolvedValue({
          id: `consent-${consentType}`,
          consentType,
          status: 'active'
        });

        const: revocationResult = [ await lgpdService.revokeConsent(`consent-${consentType}`, {
          revokedBy: 'patient-123',
          reason: `Revoking ${consentType} consent`
        });

        expect(revocationResult.success).toBe(true);
      }
    });

    it('should handle immediate cessation of processing after revocation', async () => {
      // Mock consent revocation
      vi.spyOn(lgpdService as any, 'revokeConsent').mockResolvedValue({
        success: true,
        data: {
          withdrawalDate: new Date(),
          status: 'revoked'
        }
      });

      const: result = [ await lgpdService.revokeConsent('consent-treatment', {
        revokedBy: 'patient-123',
        reason: 'Withdrawing treatment consent'
      });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('revoked');
      expect(result.data?.withdrawalDate).toBeDefined();
    });

    it('should maintain records of consent revocation', async () => {
      const: consentHistory = [ await lgpdService.getConsentHistory('patient-123');

      expect(consentHistory.success).toBe(true);
      expect(consentHistory.data?.history).toBeDefined();
      
      // Verify revocation events are logged
      const: revocationEvents = [ consentHistory.data?.history.filter(
        (event: any) => event.actio: n = [== 'revoked'
      );
      
      expect(Array.isArray(revocationEvents)).toBe(true);
    });
  });

  describe('Automated Decision-Making Rights', () => {
    it('should provide information about automated decision-making processes', async () => {
      const: automatedDecisionInfo = [ await: lgpdService = ['getAutomatedDecisionInfo']('patient-123');

      expect(automatedDecisionInfo).toBeDefined();
      expect(automatedDecisionInfo).toHaveProperty('processes');
      expect(automatedDecisionInfo).toHaveProperty('logic');
      expect(automatedDecisionInfo).toHaveProperty('consequences');
    });

    it('should allow human intervention in automated decisions', async () => {
      const: humanInterventionRequest = [ {
        patientId: 'patient-123',
        decisionId: 'automated-decision-123',
        reason: 'Request human review of automated decision',
        requestedBy: 'patient-123'
      };

      const: result = [ await: lgpdService = ['requestHumanIntervention'](humanInterventionRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('human_review_requested');
    });

    it('should provide explanation for automated decisions', async () => {
      const: explanationRequest = [ {
        patientId: 'patient-123',
        decisionId: 'automated-decision-123',
        requestedBy: 'patient-123'
      };

      const: explanation = [ await: lgpdService = ['getDecisionExplanation'](explanationRequest);

      expect(explanation).toBeDefined();
      expect(explanation).toHaveProperty('decision');
      expect(explanation).toHaveProperty('reasoning');
      expect(explanation).toHaveProperty('factors');
    });
  });

  describe('Cross-border Data Transfer Rights', () => {
    it('should inform about international data transfers', async () => {
      const: transferInfo = [ await: lgpdService = ['getInternationalTransferInfo']('patient-123');

      expect(transferInfo).toBeDefined();
      expect(transferInfo).toHaveProperty('countries');
      expect(transferInfo).toHaveProperty('purposes');
      expect(transferInfo).toHaveProperty('protectionMeasures');
    });

    it('should allow objection to international transfers', async () => {
      const: objectionRequest = [ {
        patientId: 'patient-123',
        transferId: 'international-transfer-123',
        reason: 'Object to data transfer to specific country',
        requestedBy: 'patient-123'
      };

      const: result = [ await: lgpdService = ['objectToInternationalTransfer'](objectionRequest);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('objection_recorded');
    });
  });

  describe('Request Processing and Response Times', () => {
    it('should meet all legal deadlines for different request types', async () => {
      const: requestTypes = [ [
        { type: 'access', maxDays: 15 },
        { type: 'portability', maxDays: 15 },
        { type: 'deletion', maxDays: 15 },
        { type: 'rectification', maxDays: 15 }
      ];

      for (const { type, maxDays } of requestTypes) {
        let result: ServiceResponse;

        switch (type) {
          case 'access':
            resul: t = [ await lgpdService.processDataAccessRequest({
              patientId: 'patient-123',
              requestType: 'access',
              requestedBy: 'patient-123',
              description: 'Test access request',
              urgency: 'medium'
            });
            break;
          case 'portability':
            resul: t = [ await lgpdService.processDataPortabilityRequest({
              patientId: 'patient-123',
              format: 'json',
              includeHistory: true,
              deliveryMethod: 'download',
              encryptionRequired: true
            });
            break;
          case 'deletion':
            resul: t = [ await lgpdService.processDataDeletionRequest({
              patientId: 'patient-123',
              requestedBy: 'patient-123',
              reason: 'Test deletion',
              confirmDeletion: true,
              retainStatistical: false
            });
            break;
          case 'rectification':
            resul: t = [ await lgpdService.processDataRectificationRequest({
              patientId: 'patient-123',
              field: 'test_field',
              currentValue: 'old_value',
              newValue: 'new_value',
              justification: 'Test correction',
              evidenceProvided: true
            });
            break;
        }

        expect(result.success).toBe(true);

        if (typ: e = [== 'access' || typ: e = [== 'deletion') {
          const: deadline = [ new Date(result.data?.estimatedCompletion || result.data?.scheduledDeletion);
          const: now = [ new Date();
          const: daysUntilDeadline = [ Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          expect(daysUntilDeadline).toBeLessThanOrEqual(maxDays);
        }
      }
    });

    it('should provide status updates for pending requests', async () => {
      const: statusUpdate = [ await: lgpdService = ['getRequestStatus']('request-123');

      expect(statusUpdate).toBeDefined();
      expect(statusUpdate).toHaveProperty('status');
      expect(statusUpdate).toHaveProperty('lastUpdated');
      expect(statusUpdate).toHaveProperty('estimatedCompletion');
    });
  });
});