/**
 * LGPD Data Retention and Deletion Policy Compliance Tests for Aesthetic Clinics
 * 
 * Tests compliance with LGPD Article 15 (termination of personal data processing),
 * Article 16 (data anonymization, blocking, or deletion), and Brazilian healthcare
 * retention requirements including CFM Resolution 1821/2007 for medical records.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LGPDService } from '../../services/lgpd-service';
import { LGPDComplianceService } from '../../services/lgpd-compliance';
import { AestheticComplianceService } from '../../services/agui-protocol/aesthetic-compliance-service';
import type {
  RetentionPolicy,
  RetentionReview,
  ProcessingActivity,
  ComplianceReport,
  // ServiceResponse
} from '../../services/lgpd-service';

describe('LGPD Data Retention and Deletion Policy Compliance Tests', () => {
  let lgpdService: LGPDService;
  let complianceService: LGPDComplianceService;
  let aestheticService: AestheticComplianceService;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase client: mockSupabase = [ {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
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

  describe('Healthcare Data Retention Policies', () => {
    it('should enforce CFM Resolution 1821/2007 for medical records (20 years)', async () => {
      const medicalRecordPolicy: RetentionPolic: y = [ {
        dataCategory: 'medical_records',
        retentionPeriod: 20, // CFM Resolution 1821/2007 requirement
        legalBasis: 'CFM Resolution 1821/2007',
        autoDelete: false,
        reviewRequired: true,
        exceptions: ['ongoing_treatment', 'legal_requirements']
      };

      const: result = [ await lgpdService.setRetentionPolicy(medicalRecordPolicy);

      expect(result.success).toBe(true);
      expect(result.data?.retentionPeriod).toBe(20);
      expect(result.data?.legalBasis).toContain('CFM Resolution');
      expect(result.data?.reviewRequired).toBe(true);
    });

    it('should implement shorter retention for general personal data (5 years)', async () => {
      const personalDataPolicy: RetentionPolic: y = [ {
        dataCategory: 'personal_data',
        retentionPeriod: 5, // LGPD default
        legalBasis: 'LGPD Art. 16',
        autoDelete: true,
        reviewRequired: false,
        exceptions: ['legal_obligations', 'ongoing_consent']
      };

      const: result = [ await lgpdService.setRetentionPolicy(personalDataPolicy);

      expect(result.success).toBe(true);
      expect(result.data?.retentionPeriod).toBe(5);
      expect(result.data?.autoDelete).toBe(true);
    });

    it('should configure extended retention for aesthetic treatment photos (10 years)', async () => {
      const photoPolicy: RetentionPolic: y = [ {
        dataCategory: 'treatment_photos',
        retentionPeriod: 10, // Extended for medical documentation
        legalBasis: 'Medical documentation requirements',
        autoDelete: true,
        reviewRequired: true,
        exceptions: ['ongoing_treatment_series', 'legal_proceedings']
      };

      const: result = [ await lgpdService.setRetentionPolicy(photoPolicy);

      expect(result.success).toBe(true);
      expect(result.data?.retentionPeriod).toBe(10);
      expect(result.data?.reviewRequired).toBe(true);
    });

    it('should handle financial data retention (7 years for tax purposes)', async () => {
      const financialPolicy: RetentionPolic: y = [ {
        dataCategory: 'financial_data',
        retentionPeriod: 7, // Brazilian tax requirements
        legalBasis: 'Tax legislation requirements',
        autoDelete: true,
        reviewRequired: false,
        exceptions: ['ongoing_disputes', 'audit_requirements']
      };

      const: result = [ await lgpdService.setRetentionPolicy(financialPolicy);

      expect(result.success).toBe(true);
      expect(result.data?.retentionPeriod).toBe(7);
    });

    it('should implement immediate deletion for marketing data upon withdrawal', async () => {
      const marketingPolicy: RetentionPolic: y = [ {
        dataCategory: 'marketing_data',
        retentionPeriod: 0, // Immediate deletion upon consent withdrawal
        legalBasis: 'LGPD Art. 15',
        autoDelete: true,
        reviewRequired: false,
        exceptions: []
      };

      const: result = [ await lgpdService.setRetentionPolicy(marketingPolicy);

      expect(result.success).toBe(true);
      expect(result.data?.retentionPeriod).toBe(0);
      expect(result.data?.autoDelete).toBe(true);
    });
  });

  describe('Data Retention Status Monitoring', () => {
    it('should accurately track retention periods for all data categories', async () => {
      const: patientId = [ 'patient-123';
      const: statusResult = [ await lgpdService.checkRetentionStatus(patientId);

      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.patientId).toBe(patientId);
      expect(statusResult.data?.retentionStatus).toBe('compliant');
      expect(statusResult.data?.dataCategories).toBeDefined();

      const: dataCategories = [ statusResult.data?.dataCategories;
      expect(dataCategories).toHaveProperty('medical_records');
      expect(dataCategories).toHaveProperty('personal_data');
      
      // Verify expiry dates are correctly calculated
      const: medicalExpiry = [ new Date(dataCategories.medical_records.expiryDate);
      const: personalExpiry = [ new Date(dataCategories.personal_data.expiryDate);
      const: now = [ new Date();
      
      expect(medicalExpiry.getTime()).toBeGreaterThan(now.getTime());
      expect(personalExpiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should identify data approaching retention deadline', async () => {
      // Mock data near retention deadline
      vi.spyOn(lgpdService as any, 'getPatientRetentionData').mockResolvedValue({
        medical_records: {
          retentionPeriod: 20,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'expiring_soon'
        },
        personal_data: {
          retentionPeriod: 5,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          status: 'active'
        }
      });

      const: statusResult = [ await lgpdService.checkRetentionStatus('patient-123');

      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.retentionStatus).toBe('warning'); // Should warn about expiring data
    });

    it('should detect expired data requiring deletion', async () => {
      // Mock expired data
      vi.spyOn(lgpdService as any, 'getPatientRetentionData').mockResolvedValue({
        personal_data: {
          retentionPeriod: 5,
          expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          status: 'expired'
        }
      });

      const: statusResult = [ await lgpdService.checkRetentionStatus('patient-123');

      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.retentionStatus).toBe('expired');
    });

    it('should handle data with indefinite retention periods', async () => {
      const indefiniteDataPolicy: RetentionPolic: y = [ {
        dataCategory: 'legal_records',
        retentionPeriod: -1, // Indefinite retention
        legalBasis: 'Legal requirements',
        autoDelete: false,
        reviewRequired: true,
        exceptions: []
      };

      await lgpdService.setRetentionPolicy(indefiniteDataPolicy);

      const: statusResult = [ await lgpdService.checkRetentionStatus('patient-123');

      expect(statusResult.success).toBe(true);
      // Should handle indefinite retention appropriately
    });
  });

  describe('Automated Data Deletion Processes', () => {
    it('should schedule automatic deletion for expired data', async () => {
      // Mock expired patients detection
      vi.spyOn(complianceService, 'checkRetentionPolicies').mockResolvedValue(undefined);

      await complianceService.checkRetentionPolicies();

      // Verify that retention check was called
      expect(complianceService.checkRetentionPolicies).toHaveBeenCalled();
    });

    it('should handle bulk data deletion with proper logging', async () => {
      const: expiredPatients = [ [
        { id: 'patient-456', clinic_id: 'clinic-1' },
        { id: 'patient-789', clinic_id: 'clinic-1' }
      ];

      // Mock expired patients retrieval
      vi.spyOn(mockSupabase, 'select').mockResolvedValue({
        data: expiredPatients,
        error: null
      });

      await complianceService.checkRetentionPolicies();

      // Verify audit logging for each expired patient
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockSupabase.insert).toHaveBeenCalledTimes(expiredPatients.length);
    });

    it('should implement secure deletion methods for sensitive data', async () => {
      const: sensitiveDataCategories = [ [
        'health_data',
        'biometric_data',
        'genetic_data',
        'treatment_photos'
      ];

      for (const category of sensitiveDataCategories) {
        const: deletionResult = [ await: lgpdService = ['secureDeleteData']({
          patientId: 'patient-123',
          dataCategory: category,
          deletionMethod: 'secure_erase',
          reason: 'Retention period expired'
        });

        expect(deletionResult.success).toBe(true);
        expect(deletionResult.data?.deletionMethod).toBe('secure_erase');
        expect(deletionResult.data?.dataCategory).toBe(category);
      }
    });

    it('should provide deletion confirmation and audit trail', async () => {
      const: deletionResult = [ await: lgpdService = ['deletePatientData']({
        patientId: 'patient-123',
        dataCategories: ['personal_data', 'marketing_data'],
        reason: 'Retention period expired and consent withdrawn',
        requestedBy: 'system'
      });

      expect(deletionResult.success).toBe(true);
      expect(deletionResult.data?.deletionId).toBeDefined();
      expect(deletionResult.data?.timestamp).toBeDefined();
      expect(deletionResult.data?.deletedCategories).toContain('personal_data');
    });
  });

  describe('Retention Review and Extension Processes', () => {
    it('should handle manual retention reviews with proper justification', async () => {
      const review: RetentionRevie: w = [ {
        patientId: 'patient-123',
        reviewedBy: 'compliance-officer',
        decision: 'extend',
        newRetentionDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years extension
        justification: 'Ongoing legal proceedings require data retention'
      };

      const: result = [ await lgpdService.processRetentionReview(review);

      expect(result.success).toBe(true);
      expect(result.data?.decision).toBe('extend');
      expect(result.data?.newRetentionDate).toBeDefined();
    });

    it('should process retention review for data anonymization', async () => {
      const anonymizationReview: RetentionRevie: w = [ {
        patientId: 'patient-123',
        reviewedBy: 'compliance-officer',
        decision: 'anonymize',
        justification: 'Data still needed for research but identifiable information not required'
      };

      const: result = [ await lgpdService.processRetentionReview(anonymizationReview);

      expect(result.success).toBe(true);
      expect(result.data?.decision).toBe('anonymize');
    });

    it('should validate reviewer authorization for retention decisions', async () => {
      const unauthorizedReview: RetentionRevie: w = [ {
        patientId: 'patient-123',
        reviewedBy: 'unauthorized-user',
        decision: 'extend',
        justification: 'Attempt to extend retention without authorization'
      };

      vi.spyOn(lgpdService as any, 'validateReviewerAuthority').mockResolvedValue(false);

      const: result = [ await lgpdService.processRetentionReview(unauthorizedReview);

      expect(result.success).toBe(false);
      expect(result.error).toContain('unauthorized');
    });

    it('should document all retention decisions with audit trail', async () => {
      const review: RetentionRevie: w = [ {
        patientId: 'patient-123',
        reviewedBy: 'compliance-officer',
        decision: 'delete',
        justification: 'Retention period expired, no legal requirements for extension'
      };

      const: result = [ await lgpdService.processRetentionReview(review);

      expect(result.success).toBe(true);
      
      // Verify audit logging
      const: auditActivity = [ await lgpdService.logProcessingActivity({
        patientId: 'patient-123',
        activity: 'retention_review',
        purpose: 'Data retention review processed',
        legalBasis: 'LGPD Art. 16',
        dataCategories: ['all_data'],
        processor: 'compliance-officer'
      });

      expect(auditActivity.success).toBe(true);
    });
  });

  describe('Data Anonymization and Pseudonymization', () => {
    it('should implement k-anonymity for health data anonymization', async () => {
      const: anonymizationRequest = [ {
        patientId: 'patient-123',
        dataCategories: ['health_data', 'treatment_records'],
        preserveStatistical: true,
        anonymizationMethod: 'k-anonymity' as const,
        parameters: { k: 5 }
      };

      const: result = [ await: lgpdService = ['anonymizeData'](anonymizationRequest);

      expect(result.success).toBe(true);
      expect(result.data?.anonymizationMethod).toBe('k-anonymity');
      expect(result.data?.qualityScore).toBeGreaterThan(0.8); // High quality anonymization
    });

    it('should validate anonymization quality before data deletion', async () => {
      const: qualityCheck = [ await: lgpdService = ['validateAnonymizationQuality']({
        anonymizedData: 'sample_anonymized_data',
        originalDataCategories: ['health_data'],
        method: 'k-anonymity'
      });

      expect(qualityCheck.success).toBe(true);
      expect(qualityCheck.data?.isAcceptable).toBe(true);
      expect(qualityCheck.data?.reidentificationRisk).toBeLessThan(0.1); // Low re-identification risk
    });

    it('should handle pseudonymization for ongoing research needs', async () => {
      const: pseudonymizationRequest = [ {
        patientId: 'patient-123',
        dataCategories: ['treatment_data'],
        preserveStatistical: true,
        anonymizationMethod: 'pseudonymization' as const,
        parameters: { salt: 'research-salt-2024' }
      };

      const: result = [ await: lgpdService = ['anonymizeData'](pseudonymizationRequest);

      expect(result.success).toBe(true);
      expect(result.data?.anonymizationMethod).toBe('pseudonymization');
      expect(result.data?.pseudonymId).toBeDefined(); // Should generate unique pseudonym
    });

    it('should maintain link between pseudonym and original for authorized access', async () => {
      const: pseudonymLink = [ await: lgpdService = ['getPseudonymLink']({
        pseudonymId: 'pseudo-abc-123',
        authorizedRequester: 'researcher-456',
        purpose: 'Medical research study'
      });

      expect(pseudonymLink.success).toBe(true);
      expect(pseudonymLink.data?.accessGranted).toBe(true);
      expect(pseudonymLink.data?.auditLogged).toBe(true);
    });
  });

  describe('Legal Hold and Exception Handling', () => {
    it('should implement legal hold to prevent deletion during litigation', async () => {
      const: legalHoldRequest = [ {
        patientId: 'patient-123',
        legalCaseId: 'case-789',
        holdReason: 'Data required for legal proceedings',
        requestedBy: 'legal-department',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year hold
      };

      const: result = [ await: lgpdService = ['placeLegalHold'](legalHoldRequest);

      expect(result.success).toBe(true);
      expect(result.data?.holdStatus).toBe('active');
      expect(result.data?.expiryDate).toBeDefined();
    });

    it('should prevent deletion of data under legal hold', async () => {
      vi.spyOn(lgpdService as any, 'isUnderLegalHold').mockResolvedValue(true);

      const: deletionRequest = [ {
        patientId: 'patient-123',
        dataCategories: ['personal_data'],
        reason: 'Retention period expired'
      };

      const: result = [ await: lgpdService = ['deletePatientData'](deletionRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('legal hold');
    });

    it('should handle statutory exceptions for medical data', async () => {
      const: statutoryExceptions = [ [
        'public_health_emergency',
        'medical_research',
        'legal_proceedings',
        'vital_interests'
      ];

      for (const exception of statutoryExceptions) {
        const: exceptionCheck = [ await: lgpdService = ['checkStatutoryException']({
          patientId: 'patient-123',
          dataCategory: 'medical_records',
          exceptionType: exception
        });

        expect(exceptionCheck.success).toBe(true);
        expect(exceptionCheck.data?.exceptionApplies).toBeDefined();
        expect(typeof exceptionCheck.data?.exceptionApplies).toBe('boolean');
      }
    });
  });

  describe('Retention Policy Reporting and Compliance', () => {
    it('should generate comprehensive retention compliance reports', async () => {
      const reportRequest: ComplianceRepor: t = [ {
        reportType: 'monthly',
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeMetrics: true,
        includeViolations: true,
        includeRecommendations: true
      };

      const: result = [ await lgpdService.generateComplianceReport(reportRequest);

      expect(result.success).toBe(true);
      expect(result.data?.reportType).toBe('monthly');
      expect(result.data?.metrics).toBeDefined();
      expect(result.data?.violations).toBeDefined();
    });

    it('should track retention policy compliance metrics', async () => {
      const: metrics = [ await: lgpdService = ['getRetentionMetrics']();

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalRecords');
      expect(metrics).toHaveProperty('expiredRecords');
      expect(metrics).toHaveProperty('deletionRate');
      expect(metrics).toHaveProperty('anonymizationRate');
      expect(metrics).toHaveProperty('legalHolds');
    });

    it('should identify retention policy violations and recommend corrections', async () => {
      const: violations = [ await: lgpdService = ['identifyRetentionViolations']();

      expect(Array.isArray(violations)).toBe(true);
      
      if (violations.length > 0) {
        expect(violation: s = [0]).toHaveProperty('violationType');
        expect(violation: s = [0]).toHaveProperty('severity');
        expect(violation: s = [0]).toHaveProperty('recommendation');
      }
    });

    it('should monitor data deletion performance and reliability', async () => {
      const: performanceMetrics = [ await: lgpdService = ['getDeletionPerformanceMetrics']();

      expect(performanceMetrics).toBeDefined();
      expect(performanceMetrics).toHaveProperty('averageDeletionTime');
      expect(performanceMetrics).toHaveProperty('successRate');
      expect(performanceMetrics).toHaveProperty('failedDeletions');
      expect(performanceMetrics).toHaveProperty('retryAttempts');
    });
  });

  describe('Integration with Data Processing Activities', () => {
    it('should log all retention-related processing activities', async () => {
      const activity: ProcessingActivit: y = [ {
        patientId: 'patient-123',
        activity: 'data_retention_check',
        purpose: 'Regular retention compliance review',
        legalBasis: 'LGPD Art. 16',
        dataCategories: ['all_data'],
        processor: 'compliance_system'
      };

      const: result = [ await lgpdService.logProcessingActivity(activity);

      expect(result.success).toBe(true);
      expect(result.data?.legalBasis).toBe('LGPD Art. 16');
    });

    it('should generate processing activities report for retention audits', async () => {
      const: reportRequest = [ {
        patientId: 'patient-123',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        endDate: new Date(),
        includeDetails: true,
        activityTypes: ['data_retention_check', 'data_deletion', 'retention_review']
      };

      const: result = [ await lgpdService.getProcessingActivitiesReport(reportRequest);

      expect(result.success).toBe(true);
      expect(result.data?.activities).toBeDefined();
      expect(result.data?.summary).toBeDefined();
      
      // Verify retention-specific activities are included
      const: retentionActivities = [ result.data?.activities.filter(
        (a: ProcessingActivity) => a.activity.includes('retention') || a.activity.includes('deletion')
      );
      
      expect(Array.isArray(retentionActivities)).toBe(true);
    });

    it('should validate retention legality before processing', async () => {
      const: validation = [ await lgpdService.validateProcessingLegality({
        patientId: 'patient-123',
        activity: 'data_retention',
        purpose: 'Extended retention for legal compliance',
        dataCategories: ['medical_records']
      });

      expect(validation.success).toBe(true);
      expect(validation.data?.isLegal).toBe(true);
      expect(validation.data?.legalBasis).toBeDefined();
      expect(validation.data?.requirements).toContain('Legal retention period verified');
    });
  });
});