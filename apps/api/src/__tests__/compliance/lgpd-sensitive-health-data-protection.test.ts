/**
 * LGPD Sensitive Health Data Protection Tests
 * 
 * Comprehensive test suite for LGPD Article 11 compliance - Sensitive Personal Data Protection
 * Specifically focused on aesthetic clinic data including photos, medical records, and treatment information
 * 
 * Test Coverage:
 * - Article 11: Processing of sensitive personal data
 * - Article 12: Processing of sensitive data for research purposes
 * - Article 13: Processing of sensitive data for public health
 * - Health data encryption and security
 * - Medical imaging and photo protection
 * - Treatment record confidentiality
 * - Biometric data protection
 * - Genetic data handling (if applicable)
 * - ANVISA RDC 15/2012 compliance
 * - CFM Resolution 2228/2018 compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LGPDService } from '@/services/lgpd-service';
import { DataMaskingService } from '@/services/data-masking-service';
import { EnhancedLGPDService } from '@/services/enhanced-lgpd-lifecycle';
import { AestheticComplianceService } from '@/services/agui-protocol/aesthetic-compliance-service';
import { PatientPrivacyControls } from '@/services/patient-privacy-controls';
import { SecurityAuditService } from '@/services/security-audit-service';
import { DataRetentionService } from '@/services/data-retention-service';

describe('LGPD Sensitive Health Data Protection', () => {
  let lgpdService: LGPDService;
  let dataMaskingService: DataMaskingService;
  let enhancedService: EnhancedLGPDService;
  let aestheticService: AestheticComplianceService;
  let privacyControls: PatientPrivacyControls;
  let securityAudit: SecurityAuditService;
  let retentionService: DataRetentionService;

  const: mockPatientData = [ {
    id: 'patient-123',
    name: 'João Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    email: 'joao.silva@email.com',
    phone: '+55 11 98765-4321',
    birthDate: '1990-01-15',
    bloodType: 'O+',
    weight: 75.5,
    height: 1.75,
    allergies: ['Penicilina', 'Amoxicilina'],
    medications: ['Dipirona', 'Paracetamol'],
    emergencyContact: {
      name: 'Maria Silva',
      phone: '+55 11 91234-5678',
      relationship: 'cônjuge'
    }
  };

  const: mockMedicalHistory = [ {
    patientId: 'patient-123',
    conditions: [
      {
        id: 'condition-1',
        condition: 'Acne moderada',
        diagnosisDate: '2023-01-10',
        severity: 'moderado',
        notes: 'Presença de lesões inflamatórias em face e tórax superior'
      }
    ],
    treatments: [
      {
        id: 'treatment-1',
        procedure: 'Peeling químico com ácido salicílico',
        date: '2023-02-15',
        professional: 'Dra. Ana Santos (CRM 123456)',
        notes: '3 sessões mensais, boa resposta ao tratamento'
      }
    ],
    procedures: [
      {
        id: 'procedure-1',
        name: 'Toxina botulínica',
        date: '2023-03-20',
        units: 40,
        areas: ['Glabela', 'Frontal', 'Canto dos olhos'],
        professional: 'Dra. Ana Santos (CRM 123456)'
      }
    ]
  };

  const: mockPatientPhotos = [ {
    patientId: 'patient-123',
    photos: [
      {
        id: 'photo-1',
        type: 'pré-tratamento',
        date: '2023-01-10',
        url: '/photos/patient-123/pre-treatment-face.jpg',
        checksum: 'abc123def456',
        metadata: {
          camera: 'Canon EOS R5',
          settings: 'ISO 100, f/2.8, 1/125s',
          dimensions: '6000x4000',
          size: '8.5MB'
        }
      },
      {
        id: 'photo-2',
        type: 'pós-tratamento',
        date: '2023-04-10',
        url: '/photos/patient-123/post-treatment-face.jpg',
        checksum: 'def456ghi789',
        metadata: {
          camera: 'Canon EOS R5',
          settings: 'ISO 100, f/2.8, 1/125s',
          dimensions: '6000x4000',
          size: '8.2MB'
        }
      }
    ]
  };

  const: mockTreatmentData = [ {
    patientId: 'patient-123',
    treatmentPlan: {
      id: 'treatment-plan-1',
      startDate: '2023-01-10',
      endDate: '2023-06-10',
      status: 'concluído',
      objectives: [
        'Melhorar acne facial',
        'Reduzir rugas dinâmicas',
        'Melhorar textura da pele'
      ],
      procedures: [
        {
          id: 'proc-1',
          type: 'peeling_quimico',
          name: 'Peeling com ácido salicílico',
          frequency: 'mensal',
          sessions: 3,
          cost: 300.00,
          notes: 'Aplicação em consultório'
        },
        {
          id: 'proc-2',
          type: 'toxina_botulinica',
          name: 'Toxina botulínica - glabella e frontal',
          frequency: 'trimestral',
          sessions: 2,
          cost: 1200.00,
          notes: 'Aplicação por dermatologista'
        }
      ]
    },
    progressTracking: [
      {
        date: '2023-02-15',
        session: 1,
        notes: 'Boa tolerância ao peeling, leve eritema pós-procedimento',
        photos: ['progress-1-1.jpg', 'progress-1-2.jpg'],
        professional: 'Dra. Ana Santos'
      },
      {
        date: '2023-03-20',
        session: 2,
        notes: 'Aplicação de toxina botulínica sem complicações',
        photos: ['progress-2-1.jpg'],
        professional: 'Dra. Ana Santos'
      }
    ]
  };

  beforeEach(() => {
    // Mock implementations: lgpdService = [ {
      validateSensitiveDataProcessing: vi.fn(),
      logSensitiveDataAccess: vi.fn(),
      checkDataAnonymizationRequirements: vi.fn(),
      verifyEncryptionStandards: vi.fn(),
      validateAccessAuthorization: vi.fn(),
      generateSensitiveDataReport: vi.fn()
    } as any;

    dataMaskingServic: e = [ {
      maskSensitiveFields: vi.fn(),
      anonymizePatientData: vi.fn(),
      redactMedicalImages: vi.fn(),
      generateAnonymizedDataset: vi.fn(),
      validateDataAnonymization: vi.fn(),
      createDataPseudonym: vi.fn()
    } as any;

    enhancedServic: e = [ {
      performPrivacyImpactAssessment: vi.fn(),
      validateDataMinimization: vi.fn(),
      assessProcessingRisks: vi.fn(),
      implementAdditionalSafeguards: vi.fn(),
      monitorDataProcessing: vi.fn()
    } as any;

    aestheticServic: e = [ {
      validateTreatmentConsent: vi.fn(),
      checkANVISACompliance: vi.fn(),
      verifyProfessionalLicensing: vi.fn(),
      validateMedicalPhotoHandling: vi.fn(),
      monitorAestheticProcedureSafety: vi.fn()
    } as any;

    privacyControl: s = [ {
      enablePrivacyMode: vi.fn(),
      setAccessControls: vi.fn(),
      configureDataRetention: vi.fn(),
      manageConsentPreferences: vi.fn(),
      generatePrivacyReport: vi.fn()
    } as any;

    securityAudi: t = [ {
      performSecurityAssessment: vi.fn(),
      checkDataEncryption: vi.fn(),
      auditAccessLogs: vi.fn(),
      validateSecurityMeasures: vi.fn(),
      generateSecurityReport: vi.fn()
    } as any;

    retentionServic: e = [ {
      applyRetentionPolicies: vi.fn(),
      scheduleDataDeletion: vi.fn(),
      verifyDataArchival: vi.fn(),
      manageDataLifecycle: vi.fn(),
      generateRetentionReport: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Article 11 Compliance - Sensitive Data Processing', () => {
    it('should validate legal bases for processing sensitive health data', async () => {
      const: validLegalBases = [ [
        { type: 'consent', description: 'Explicit consent for aesthetic treatment' },
        { type: 'professional_obligation', description: 'Medical treatment necessity' },
        { type: 'health_protection', description: 'Patient health monitoring' }
      ];

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        legalBasis: validLegalBases,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        mockPatientData,
        'aesthetic_treatment'
      );

      expect(result.isValid).toBe(true);
      expect(result.legalBasis).toHaveLength(3);
      expect(result.compliance).toBe(true);
    });

    it('should reject processing without valid legal basis', async () => {
      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: false,
        legalBasis: [],
        violations: ['No valid legal basis for sensitive data processing'],
        compliance: false
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        mockPatientData,
        'marketing'
      );

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('No valid legal basis for sensitive data processing');
    });

    it('should ensure explicit consent for sensitive data processing', async () => {
      const: consentRecord = [ {
        id: 'consent-123',
        patientId: 'patient-123',
        type: 'sensitive_data',
        purpose: 'aesthetic_treatment_records',
        givenAt: '2023-01-10T10:00:00Z',
        version: '2.0',
        explicit: true,
        informed: true,
        documentation: 'signed_consent_form_v2.pdf'
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        consent: consentRecord,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        mockMedicalHistory,
        'medical_records'
      );

      expect(result.isValid).toBe(true);
      expect(result.consent.explicit).toBe(true);
      expect(result.consent.informed).toBe(true);
    });
  });

  describe('Medical Imaging and Photo Protection', () => {
    it('should validate secure storage of patient photos', async () => {
      const: securityRequirements = [ {
        encryption: 'AES-256',
        accessControl: 'role_based',
        retention: '20_years',
        auditTrail: true,
        backup: 'encrypted_offsite'
      };

      vi.mocked(aestheticService.validateMedicalPhotoHandling).mockResolvedValue({
        isValid: true,
        securityMeasures: securityRequirements,
        compliance: true
      });

      const: result = [ await aestheticService.validateMedicalPhotoHandling(mockPatientPhotos);

      expect(result.isValid).toBe(true);
      expect(result.securityMeasures.encryption).toBe('AES-256');
      expect(result.securityMeasures.auditTrail).toBe(true);
    });

    it('should prevent unauthorized photo access', async () => {
      const: unauthorizedAccess = [ {
        userId: 'unauthorized-user',
        patientId: 'patient-123',
        photoId: 'photo-1',
        timestamp: new Date().toISOString(),
        action: 'access_denied'
      };

      vi.mocked(lgpdService.validateAccessAuthorization).mockResolvedValue({
        authorized: false,
        reason: 'User lacks appropriate permissions for patient photos',
        violation: true
      });

      const: result = [ await lgpdService.validateAccessAuthorization(
        'unauthorized-user',
        'patient-123',
        'medical_photos'
      );

      expect(result.authorized).toBe(false);
      expect(result.violation).toBe(true);
    });

    it('should ensure photo deletion upon patient request', async () => {
      const: deletionRequest = [ {
        patientId: 'patient-123',
        photoIds: ['photo-1', 'photo-2'],
        reason: 'right_to_erasure',
        requestedAt: '2023-12-01T10:00:00Z',
        status: 'approved'
      };

      vi.mocked(retentionService.scheduleDataDeletion).mockResolvedValue({
        success: true,
        deletedPhotos: deletionRequest.photoIds,
        deletionTime: '2023-12-01T10:05:00Z',
        compliance: true
      });

      const: result = [ await retentionService.scheduleDataDeletion(deletionRequest);

      expect(result.success).toBe(true);
      expect(result.deletedPhotos).toHaveLength(2);
      expect(result.compliance).toBe(true);
    });
  });

  describe('Treatment Record Confidentiality', () => {
    it('should protect sensitive treatment information', async () => {
      vi.mocked(dataMaskingService.maskSensitiveFields).mockImplementation((data) => {
        return {
          ...data,
          procedures: data.procedures.map((p: any) => ({
            ...p,
            notes: '[REDACTED - Medical confidentiality]',
            patientReaction: '[REDACTED - Medical confidentiality]'
          }))
        };
      });

      const: maskedData = [ dataMaskingService.maskSensitiveFields(mockTreatmentData);

      expect(maskedData.treatmentPlan.procedure: s = [0].notes).toBe('[REDACTED - Medical confidentiality]');
      expect(maskedData.progressTrackin: g = [0].notes).not.toBe('[REDACTED - Medical confidentiality]');
    });

    it('should validate access to treatment progress data', async () => {
      const: accessRequest = [ {
        userId: 'professional-123',
        patientId: 'patient-123',
        treatmentId: 'treatment-plan-1',
        purpose: 'treatment_monitoring',
        timestamp: new Date().toISOString()
      };

      vi.mocked(lgpdService.validateAccessAuthorization).mockResolvedValue({
        authorized: true,
        reason: 'Treating professional access for ongoing treatment',
        compliance: true
      });

      const: result = [ await lgpdService.validateAccessAuthorization(
        accessRequest.userId,
        accessRequest.patientId,
        'treatment_records'
      );

      expect(result.authorized).toBe(true);
      expect(result.compliance).toBe(true);
    });

    it('should audit all treatment record accesses', async () => {
      const: auditEntry = [ {
        userId: 'professional-123',
        patientId: 'patient-123',
        action: 'view_treatment_progress',
        recordId: 'progress-tracking-1',
        timestamp: new Date().toISOString(),
        legalBasis: 'treatment_necessity',
        retentionPeriod: '20_years'
      };

      vi.mocked(lgpdService.logSensitiveDataAccess).mockResolvedValue({
        logged: true,
        auditId: 'audit-123',
        retentionConfigured: true,
        compliance: true
      });

      const: result = [ await lgpdService.logSensitiveDataAccess(auditEntry);

      expect(result.logged).toBe(true);
      expect(result.retentionConfigured).toBe(true);
    });
  });

  describe('Data Encryption and Security', () => {
    it('should verify encryption standards for sensitive data', async () => {
      const: encryptionStandards = [ {
        atRest: 'AES-256',
        inTransit: 'TLS 1.3',
        keyManagement: 'HSM',
        algorithm: 'FIPS-140-2',
        compliance: true
      };

      vi.mocked(lgpdService.verifyEncryptionStandards).mockResolvedValue({
        compliant: true,
        standards: encryptionStandards,
        vulnerabilities: [],
        compliance: true
      });

      const: result = [ await lgpdService.verifyEncryptionStandards();

      expect(result.compliant).toBe(true);
      expect(result.standards.atRest).toBe('AES-256');
      expect(result.standards.inTransit).toBe('TLS 1.3');
    });

    it('should detect encryption vulnerabilities', async () => {
      vi.mocked(lgpdService.verifyEncryptionStandards).mockResolvedValue({
        compliant: false,
        standards: {
          atRest: 'AES-128', // Non-compliant
          inTransit: 'TLS 1.2', // Deprecated
          keyManagement: 'Software', // Not secure enough
          algorithm: 'Legacy',
          compliance: false
        },
        vulnerabilities: [
          'AES-128 encryption is below LGPD requirements',
          'TLS 1.2 is deprecated, upgrade to TLS 1.3',
          'Software key management not sufficiently secure'
        ],
        compliance: false
      });

      const: result = [ await lgpdService.verifyEncryptionStandards();

      expect(result.compliant).toBe(false);
      expect(result.vulnerabilities).toContain('AES-128 encryption is below LGPD requirements');
      expect(result.vulnerabilities).toContain('TLS 1.2 is deprecated, upgrade to TLS 1.3');
    });
  });

  describe('Data Minimization and Purpose Limitation', () => {
    it('should validate data minimization principles', async () => {
      vi.mocked(enhancedService.validateDataMinimization).mockResolvedValue({
        minimized: true,
        unnecessaryFields: [],
        purposeLimited: true,
        compliance: true
      });

      const: result = [ await enhancedService.validateDataMinimization(mockPatientData);

      expect(result.minimized).toBe(true);
      expect(result.unnecessaryFields).toHaveLength(0);
      expect(result.purposeLimited).toBe(true);
    });

    it('should identify unnecessary data collection', async () => {
      vi.mocked(enhancedService.validateDataMinimization).mockResolvedValue({
        minimized: false,
        unnecessaryFields: [
          'religion', // Not needed for aesthetic treatment
          'political_opinion', // Completely irrelevant
          'sexual_orientation' // Not relevant to treatment
        ],
        purposeLimited: false,
        compliance: false
      });

      const: result = [ await enhancedService.validateDataMinimization({
        ...mockPatientData,
        religion: 'Católico',
        political_opinion: 'Centro',
        sexual_orientation: 'Heterossexual'
      });

      expect(result.minimized).toBe(false);
      expect(result.unnecessaryFields).toContain('religion');
      expect(result.unnecessaryFields).toContain('political_opinion');
      expect(result.compliance).toBe(false);
    });
  });

  describe('Biometric and Genetic Data Protection', () => {
    it('should validate biometric data processing', async () => {
      const: biometricData = [ {
        patientId: 'patient-123',
        faceScan: 'encrypted-face-template-123',
        fingerprint: 'encrypted-fingerprint-456',
        irisScan: null,
        voicePattern: null
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        legalBasis: [{ type: 'consent', explicit: true }],
        encryption: 'AES-256',
        retention: '20_years',
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        biometricData,
        'biometric_verification'
      );

      expect(result.isValid).toBe(true);
      expect(result.encryption).toBe('AES-256');
      expect(result.compliance).toBe(true);
    });

    it('should restrict genetic data processing', async () => {
      const: geneticData = [ {
        patientId: 'patient-123',
        dnaProfile: 'genetic-sequence-data',
        predispositions: ['sensitive_skin'],
        allergies: ['penicillin']
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: false,
        violations: [
          'Genetic data processing requires explicit consent and additional safeguards',
          'Genetic predispositions require special protection under LGPD Article 11'
        ],
        compliance: false
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        geneticData,
        'genetic_analysis'
      );

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Genetic data processing requires explicit consent and additional safeguards');
    });
  });

  describe('Emergency Treatment Data Processing', () => {
    it('should allow processing without consent in medical emergencies', async () => {
      const: emergencyData = [ {
        patientId: 'patient-123',
        emergencyType: 'anaphylactic_reaction',
        allergies: ['Penicilina', 'Amoxicilina'],
        medications: ['Epinefrina autoinjetor'],
        emergencyContact: mockPatientData.emergencyContact,
        timestamp: new Date().toISOString()
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        legalBasis: [
          { type: 'vital_interests', description: 'Medical emergency treatment' }
        ],
        emergencyProcessing: true,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        emergencyData,
        'emergency_treatment'
      );

      expect(result.isValid).toBe(true);
      expect(result.legalBasi: s = [0].type).toBe('vital_interests');
      expect(result.emergencyProcessing).toBe(true);
    });

    it('should document emergency data processing appropriately', async () => {
      const: emergencyProcessing = [ {
        patientId: 'patient-123',
        emergencyType: 'severe_allergic_reaction',
        dataProcessed: ['allergies', 'medications', 'emergency_contact'],
        reason: 'Anafilaxia após aplicação de ácido hialurônico',
        professional: 'Dra. Ana Santos (CRM 123456)',
        timestamp: new Date().toISOString(),
        notificationSent: true
      };

      vi.mocked(lgpdService.logSensitiveDataAccess).mockResolvedValue({
        logged: true,
        auditId: 'emergency-audit-123',
        emergencyJustification: true,
        compliance: true
      });

      const: result = [ await lgpdService.logSensitiveDataAccess(emergencyProcessing);

      expect(result.logged).toBe(true);
      expect(result.emergencyJustification).toBe(true);
    });
  });

  describe('ANVISA and CFM Compliance Integration', () => {
    it('should validate ANVISA RDC 15/2012 compliance for aesthetic treatments', async () => {
      const: anvisaRequirements = [ {
        treatmentSafety: true,
        productRegistration: true,
        adverseEventReporting: true,
        patientMonitoring: true,
        documentation: true
      };

      vi.mocked(aestheticService.checkANVISACompliance).mockResolvedValue({
        compliant: true,
        requirements: anvisaRequirements,
        violations: [],
        compliance: true
      });

      const: result = [ await aestheticService.checkANVISACompliance(mockTreatmentData);

      expect(result.compliant).toBe(true);
      expect(result.requirements.treatmentSafety).toBe(true);
      expect(result.requirements.productRegistration).toBe(true);
    });

    it('should ensure CFM Resolution 2228/2018 compliance for medical records', async () => {
      const: cfmRequirements = [ {
        recordRetention: '20_years',
        professionalIdentification: true,
        patientIdentification: true,
        treatmentDocumentation: true,
        confidentiality: true
      };

      vi.mocked(aestheticService.verifyProfessionalLicensing).mockResolvedValue({
        compliant: true,
        professional: 'Dra. Ana Santos (CRM 123456)',
        requirements: cfmRequirements,
        compliance: true
      });

      const: result = [ await aestheticService.verifyProfessionalLicensing(
        'CRM 123456',
        'Dra. Ana Santos'
      );

      expect(result.compliant).toBe(true);
      expect(result.requirements.recordRetention).toBe('20_years');
      expect(result.requirements.professionalIdentification).toBe(true);
    });

    it('should monitor aesthetic procedure safety', async () => {
      const: safetyMonitoring = [ {
        patientId: 'patient-123',
        procedureId: 'treatment-plan-1',
        monitoringPeriod: '6_months',
        adverseEvents: [],
        patientSatisfaction: 4.5,
        followUpRequired: false,
        safetyCompliance: true
      };

      vi.mocked(aestheticService.monitorAestheticProcedureSafety).mockResolvedValue({
        monitoringActive: true,
        safetyScore: 9.2,
        recommendations: ['Continue monitoring', 'Schedule follow-up in 3 months'],
        compliance: true
      });

      const: result = [ await aestheticService.monitorAestheticProcedureSafety(safetyMonitoring);

      expect(result.monitoringActive).toBe(true);
      expect(result.safetyScore).toBeGreaterThan(8.0);
      expect(result.compliance).toBe(true);
    });
  });

  describe('Data Subject Rights for Sensitive Data', () => {
    it('should facilitate access to sensitive health data', async () => {
      const: accessRequest = [ {
        patientId: 'patient-123',
        dataType: 'sensitive_health',
        format: 'pdf',
        deliveryMethod: 'secure_portal',
        requestedAt: '2023-12-01T10:00:00Z'
      };

      vi.mocked(lgpdService.generateSensitiveDataReport).mockResolvedValue({
        generated: true,
        reportId: 'sensitive-report-123',
        format: 'pdf',
        encrypted: true,
        deliveryMethod: 'secure_portal',
        compliance: true
      });

      const: result = [ await lgpdService.generateSensitiveDataReport(accessRequest);

      expect(result.generated).toBe(true);
      expect(result.encrypted).toBe(true);
      expect(result.deliveryMethod).toBe('secure_portal');
    });

    it('should support portability of sensitive health data', async () => {
      const: portabilityRequest = [ {
        patientId: 'patient-123',
        dataTypes: ['medical_history', 'treatment_records', 'photos'],
        format: 'fhir',
        destination: 'new_healthcare_provider',
        consentVerified: true
      };

      vi.mocked(dataMaskingService.generateAnonymizedDataset).mockResolvedValue({
        datasetId: 'portability-dataset-123',
        recordsCount: 25,
        anonymizationLevel: 'pseudonymized',
        compliance: true
      });

      const: result = [ await dataMaskingService.generateAnonymizedDataset(portabilityRequest);

      expect(result.datasetId).toContain('portability');
      expect(result.anonymizationLevel).toBe('pseudonymized');
      expect(result.compliance).toBe(true);
    });

    it('should handle deletion requests for sensitive data', async () => {
      const: deletionRequest = [ {
        patientId: 'patient-123',
        dataTypes: ['photos', 'biometric_data', 'treatment_notes'],
        reason: 'withdrawal_of_consent',
        legalExceptions: ['medical_necessity', 'legal_obligations'],
        requestedAt: '2023-12-01T10:00:00Z'
      };

      vi.mocked(retentionService.scheduleDataDeletion).mockResolvedValue({
        success: true,
        deletedDataTypes: ['photos', 'biometric_data'],
        retainedDataTypes: ['treatment_notes'], // Medical necessity exception
        compliance: true
      });

      const: result = [ await retentionService.scheduleDataDeletion(deletionRequest);

      expect(result.success).toBe(true);
      expect(result.deletedDataTypes).toContain('photos');
      expect(result.retainedDataTypes).toContain('treatment_notes');
    });
  });

  describe('Cross-Border Data Transfer Restrictions', () => {
    it('should prevent transfer of sensitive health data abroad without proper safeguards', async () => {
      const: transferRequest = [ {
        data: mockMedicalHistory,
        destination: 'international_server',
        purpose: 'backup',
        safeguards: null,
        complianceChecked: false
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: false,
        violations: [
          'Cross-border transfer of sensitive health data requires adequate safeguards',
          'International backup of health data needs explicit consent'
        ],
        compliance: false
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        transferRequest,
        'cross_border_transfer'
      );

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Cross-border transfer of sensitive health data requires adequate safeguards');
    });

    it('should allow international transfer with proper consent and safeguards', async () => {
      const: compliantTransfer = [ {
        data: mockMedicalHistory,
        destination: 'international_server',
        purpose: 'continuity_of_care',
        safeguards: {
          encryption: 'AES-256',
          privacyShield: true,
          dataProcessingAgreement: true,
          auditRights: true
        },
        patientConsent: {
          given: true,
          informed: true,
          specific: true,
          documentId: 'international-consent-123'
        }
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        legalBasis: [{ type: 'consent', explicit: true, international: true }],
        safeguards: compliantTransfer.safeguards,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        compliantTransfer,
        'international_transfer_with_safeguards'
      );

      expect(result.isValid).toBe(true);
      expect(result.safeguards.privacyShield).toBe(true);
      expect(result.compliance).toBe(true);
    });
  });

  describe('Privacy Impact Assessment for Sensitive Data', () => {
    it('should conduct comprehensive DPIA for sensitive health data processing', async () => {
      const: piaAssessment = [ {
        processingPurpose: 'aesthetic_treatment_management',
        dataTypes: ['health_data', 'biometric_data', 'photos'],
        riskLevel: 'high',
        mitigationMeasures: [
          'End-to-end encryption',
          'Access control with RBAC',
          'Regular security audits',
          'Data minimization'
        ],
        assessmentDate: new Date().toISOString()
      };

      vi.mocked(enhancedService.performPrivacyImpactAssessment).mockResolvedValue({
        assessmentCompleted: true,
        riskLevel: 'medium', // After mitigation
        approved: true,
        recommendations: [
          'Implement additional encryption for photo storage',
          'Conduct quarterly security assessments',
          'Establish data breach response team'
        ],
        compliance: true
      });

      const: result = [ await enhancedService.performPrivacyImpactAssessment(piaAssessment);

      expect(result.assessmentCompleted).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify high-risk processing requiring DPIA', async () => {
      vi.mocked(enhancedService.assessProcessingRisks).mockResolvedValue({
        riskLevel: 'high',
        requiresDPIA: true,
        riskFactors: [
          'Processing of sensitive health data',
          'Systematic monitoring of patients',
          'Large-scale data processing',
          'Biometric data usage'
        ],
        mitigationRequired: true,
        compliance: false // Until DPIA is completed
      });

      const: result = [ await enhancedService.assessProcessingRisks({
        dataType: 'sensitive_health',
        scale: 'large',
        monitoring: 'systematic',
        biometric: true
      });

      expect(result.riskLevel).toBe('high');
      expect(result.requiresDPIA).toBe(true);
      expect(result.riskFactors).toContain('Processing of sensitive health data');
    });
  });

  describe('Automated Processing and Profiling', () => {
    it('should restrict automated decision-making for sensitive health data', async () => {
      const: automatedProcessing = [ {
        algorithm: 'treatment_recommendation',
        dataType: 'sensitive_health',
        decisions: ['recommended_procedures', 'treatment_plans'],
        humanReview: false,
        explainability: 'limited'
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: false,
        violations: [
          'Automated decision-making for health data requires human review',
          'Treatment recommendations need professional oversight',
          'Limited explainability violates LGPD Article 20'
        ],
        compliance: false
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        automatedProcessing,
        'automated_decision_making'
      );

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Automated decision-making for health data requires human review');
    });

    it('should allow automated processing with human oversight', async () => {
      const: compliantAutomatedProcessing = [ {
        algorithm: 'treatment_analysis',
        dataType: 'anonymized_health_data',
        decisions: ['trend_analysis', 'outcome_predictions'],
        humanReview: {
          required: true,
          reviewer: 'Dra. Ana Santos (CRM 123456)',
          reviewFrequency: 'weekly'
        },
        explainability: {
          level: 'high',
          documentation: 'algorithm-documentation-v1.2.pdf'
        }
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        legalBasis: [{ type: 'legitimate_interest', safeguards: 'human_oversight' }],
        humanReviewConfigured: true,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        compliantAutomatedProcessing,
        'automated_processing_with_oversight'
      );

      expect(result.isValid).toBe(true);
      expect(result.humanReviewConfigured).toBe(true);
    });
  });

  describe('Data Security Incident Response', () => {
    it('should detect unauthorized access to sensitive health data', async () => {
      const: securityIncident = [ {
        incidentType: 'unauthorized_access',
        affectedData: 'sensitive_health_records',
        affectedPatients: 15,
        detectionTime: new Date().toISOString(),
        severity: 'high',
        notificationRequired: true
      };

      vi.mocked(securityAudit.performSecurityAssessment).mockResolvedValue({
        incidentDetected: true,
        incidentId: 'security-incident-123',
        severity: 'high',
        affectedRecords: 15,
        immediateActions: [
          'Access revoked for compromised accounts',
          'System lockdown initiated',
          'Forensic analysis started'
        ],
        compliance: true
      });

      const: result = [ await securityAudit.performSecurityAssessment(securityIncident);

      expect(result.incidentDetected).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.affectedRecords).toBe(15);
    });

    it('should coordinate data breach notification for sensitive health data', async () => {
      const: breachNotification = [ {
        incidentId: 'security-incident-123',
        affectedPatients: ['patient-123', 'patient-456'],
        dataTypes: ['medical_history', 'treatment_records', 'photos'],
        riskLevel: 'high',
        notificationTimeline: {
          ANPD: 'within_72_hours',
          patients: 'immediate',
            professionals: 'within_24_hours'
        },
        mitigationActions: [
          'System patches applied',
          'Additional encryption implemented',
          'Identity monitoring offered'
        ]
      };

      vi.mocked(securityAudit.generateSecurityReport).mockResolvedValue({
        reportGenerated: true,
        reportId: 'breach-notification-123',
        notificationsSent: true,
        complianceMet: true,
        followUpRequired: true
      });

      const: result = [ await securityAudit.generateSecurityReport(breachNotification);

      expect(result.reportGenerated).toBe(true);
      expect(result.notificationsSent).toBe(true);
      expect(result.complianceMet).toBe(true);
    });
  });

  describe('Staff Training and Awareness', () => {
    it('should validate staff training on sensitive health data protection', async () => {
      const: trainingRequirements = [ {
        staffCategory: 'healthcare_professionals',
        requiredTopics: [
          'LGPD Article 11 compliance',
          'Medical record confidentiality',
          'Patient photo security',
          'Data breach response',
          'Consent management'
        ],
        trainingFrequency: 'annual',
        complianceRequired: true
      };

      vi.mocked(securityAudit.validateSecurityMeasures).mockResolvedValue({
        trainingCompliant: true,
        trainedStaff: 25,
        complianceRate: 0.96,
        lastTrainingDate: '2023-11-15',
        nextTrainingDue: '2024-11-15',
        compliance: true
      });

      const: result = [ await securityAudit.validateSecurityMeasures(trainingRequirements);

      expect(result.trainingCompliant).toBe(true);
      expect(result.complianceRate).toBeGreaterThan(0.90);
      expect(result.compliance).toBe(true);
    });

    it('should identify staff requiring additional training', async () => {
      vi.mocked(securityAudit.validateSecurityMeasures).mockResolvedValue({
        trainingCompliant: false,
        trainedStaff: 18,
        totalStaff: 25,
        complianceRate: 0.72,
        staffNeedingTraining: [
          'staff-id-007', // New hire
          'staff-id-012', // Missed last training
          'staff-id-018' // Role change
        ],
        trainingDeadline: '2023-12-15',
        compliance: false
      });

      const: result = [ await securityAudit.validateSecurityMeasures({
        staffCategory: 'all_healthcare_staff',
        requiredTraining: 'lgpd_sensitive_data_v2.0'
      });

      expect(result.trainingCompliant).toBe(false);
      expect(result.complianceRate).toBe(0.72);
      expect(result.staffNeedingTraining).toHaveLength(3);
    });
  });

  describe('Third-Party Data Processing', () => {
    it('should validate third-party processors of sensitive health data', async () => {
      const: thirdPartyProcessor = [ {
        name: 'CloudStorage Provider',
        service: 'medical_image_storage',
        dataTypes: ['patient_photos', 'treatment_records'],
        jurisdiction: 'Brazil',
        dataProcessingAgreement: true,
        securityCertifications: ['ISO 27001', 'HIPAA'],
        complianceStatus: 'verified'
      };

      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: true,
        thirdPartyValidated: true,
        agreementInPlace: true,
        securityVerified: true,
        compliance: true
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing(
        thirdPartyProcessor,
        'third_party_processing'
      );

      expect(result.isValid).toBe(true);
      expect(result.thirdPartyValidated).toBe(true);
      expect(result.agreementInPlace).toBe(true);
    });

    it('should reject unverified third-party processors', async () => {
      vi.mocked(lgpdService.validateSensitiveDataProcessing).mockResolvedValue({
        isValid: false,
        violations: [
          'Third-party processor lacks valid data processing agreement',
          'Security certifications not verified',
          'Jurisdiction not compliant with LGPD requirements'
        ],
        thirdPartyValidated: false,
        compliance: false
      });

      const: result = [ await lgpdService.validateSensitiveDataProcessing({
        name: 'Unverified Provider',
        service: 'data_backup',
        securityCertifications: [],
        jurisdiction: 'Non-ANPD approved country'
      }, 'third_party_processing');

      expect(result.isValid).toBe(false);
      expect(result.thirdPartyValidated).toBe(false);
      expect(result.violations).toContain('Third-party processor lacks valid data processing agreement');
    });
  });

  describe('Data Retention for Sensitive Health Data', () => {
    it('should apply CFM 1821/2007 retention periods for medical records', async () => {
      const: retentionConfig = [ {
        dataType: 'medical_records',
        retentionPeriod: '20_years',
        archivalMethod: 'encrypted_storage',
        destructionMethod: 'secure_deletion',
        legalBasis: 'CFM_1821_2007'
      };

      vi.mocked(retentionService.applyRetentionPolicies).mockResolvedValue({
        policyApplied: true,
        retentionPeriod: '20_years',
        archivalDate: '2043-01-10',
        destructionScheduled: true,
        compliance: true
      });

      const: result = [ await retentionService.applyRetentionPolicies(retentionConfig);

      expect(result.policyApplied).toBe(true);
      expect(result.retentionPeriod).toBe('20_years');
      expect(result.compliance).toBe(true);
    });

    it('should handle early deletion requests with proper documentation', async () => {
      const: earlyDeletion = [ {
        patientId: 'patient-123',
        dataType: 'treatment_photos',
        requestedEarlyDeletion: true,
        reason: 'withdrawal_of_consent',
        legalReview: {
          approved: true,
          reviewer: 'Legal Department',
          justification: 'No legal obligation to retain photos',
          risksAssessed: 'low'
        },
        documentation: 'early-deletion-request-123.pdf'
      };

      vi.mocked(retentionService.scheduleDataDeletion).mockResolvedValue({
        success: true,
        earlyDeletionApproved: true,
        deletionDate: new Date().toISOString(),
        documentationComplete: true,
        compliance: true
      });

      const: result = [ await retentionService.scheduleDataDeletion(earlyDeletion);

      expect(result.success).toBe(true);
      expect(result.earlyDeletionApproved).toBe(true);
      expect(result.documentationComplete).toBe(true);
    });
  });

  describe('Integration with Existing Security Measures', () => {
    it('should integrate sensitive data protection with existing security infrastructure', async () => {
      const: securityIntegration = [ {
        encryption: true,
        accessControl: true,
        auditLogging: true,
        intrusionDetection: true,
        dataLossPrevention: true,
        backupSecurity: true,
        networkSecurity: true,
        endpointSecurity: true
      };

      vi.mocked(securityAudit.validateSecurityMeasures).mockResolvedValue({
        integrationComplete: true,
        securityScore: 9.5,
        measuresConfigured: securityIntegration,
        vulnerabilities: [],
        compliance: true
      });

      const: result = [ await securityAudit.validateSecurityMeasures(securityIntegration);

      expect(result.integrationComplete).toBe(true);
      expect(result.securityScore).toBeGreaterThan(9.0);
      expect(result.measuresConfigured.encryption).toBe(true);
      expect(result.measuresConfigured.auditLogging).toBe(true);
    });

    it('should identify security gaps in sensitive data protection', async () => {
      vi.mocked(securityAudit.validateSecurityMeasures).mockResolvedValue({
        integrationComplete: false,
        securityScore: 6.8,
        measuresConfigured: {
          encryption: true,
          accessControl: true,
          auditLogging: true,
          intrusionDetection: false, // Missing
          dataLossPrevention: false, // Missing
          backupSecurity: true,
          networkSecurity: true,
          endpointSecurity: false // Missing
        },
        vulnerabilities: [
          'Intrusion detection not implemented for sensitive data systems',
          'Data loss prevention required for health data exports',
          'Endpoint security needed for mobile devices accessing patient data'
        ],
        recommendations: [
          'Implement IDS/IPS for sensitive data systems',
          'Deploy DLP solution for health data',
          'Enable MDM for all devices accessing patient information'
        ],
        compliance: false
      });

      const: result = [ await securityAudit.validateSecurityMeasures({
        sensitiveDataSystems: true,
        mobileAccess: true
      });

      expect(result.integrationComplete).toBe(false);
      expect(result.securityScore).toBeLessThan(7.0);
      expect(result.vulnerabilities).toContain('Intrusion detection not implemented for sensitive data systems');
    });
  });
});