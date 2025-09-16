/**
 * Healthcare Compliance Testing Utilities
 * Specialized testing helpers for LGPD, ANVISA, and CFM compliance validation
 */

import { expect } from 'vitest';
import { createLogger, LogLevel } from '@neonpro/tools-shared';

const healthcareLogger = createLogger('HealthcareTesting', {
  level: LogLevel.DEBUG,
  format: 'pretty',
  enableConstitutional: true,
});

// LGPD (Lei Geral de Proteção de Dados) Compliance Testing
export class LGPDTestUtils {
  static validateConsentData(consentData: any) {
    expect(consentData).toHaveProperty('userId');
    expect(consentData).toHaveProperty('consentType');
    expect(consentData).toHaveProperty('granted');
    expect(consentData).toHaveProperty('timestamp');
    expect(consentData).toHaveProperty('version');
    expect(consentData).toHaveProperty('purposes');

    expect(typeof consentData.granted).toBe('boolean');
    expect(Array.isArray(consentData.purposes)).toBe(true);
    expect(consentData.purposes.length).toBeGreaterThan(0);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'LGPD consent data validation passed',
      {
        compliance: true,
        requirement: 'LGPD Consent Management',
        standard: 'LGPD',
      }
    );
  }

  static validateDataSubjectRights(request: any) {
    const validRequestTypes = [
      'data_access',
      'data_portability',
      'data_correction',
      'data_deletion',
      'processing_restriction',
      'consent_withdrawal'
    ];

    expect(request).toHaveProperty('requestId');
    expect(request).toHaveProperty('userId');
    expect(request).toHaveProperty('requestType');
    expect(request).toHaveProperty('status');
    expect(request).toHaveProperty('submittedAt');

    expect(validRequestTypes).toContain(request.requestType);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'LGPD data subject rights validation passed',
      {
        compliance: true,
        requirement: 'LGPD Data Subject Rights',
        standard: 'LGPD',
      }
    );
  }

  static validateDataProcessingRecord(record: any) {
    expect(record).toHaveProperty('id');
    expect(record).toHaveProperty('controller');
    expect(record).toHaveProperty('processor');
    expect(record).toHaveProperty('purposes');
    expect(record).toHaveProperty('categories');
    expect(record).toHaveProperty('retention');
    expect(record).toHaveProperty('securityMeasures');

    expect(Array.isArray(record.purposes)).toBe(true);
    expect(Array.isArray(record.categories)).toBe(true);
    expect(Array.isArray(record.securityMeasures)).toBe(true);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'LGPD data processing record validation passed',
      {
        compliance: true,
        requirement: 'LGPD Data Processing Records',
        standard: 'LGPD',
      }
    );
  }

  static validateDataMasking(data: any) {
    const sensitiveFields = ['cpf', 'rg', 'phone', 'email'];

    for (const field of sensitiveFields) {
      if (data[field]) {
        expect(data[field]).toMatch(/\*+/);
      }
    }

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'LGPD data masking validation passed',
      {
        compliance: true,
        requirement: 'LGPD Data Privacy Protection',
        standard: 'LGPD',
      }
    );
  }
}

// ANVISA (Agência Nacional de Vigilância Sanitária) Compliance Testing
export class ANVISATestUtils {
  static validateMedicalDevice(device: any) {
    const validClassifications = ['Class I', 'Class II', 'Class III', 'Class IV'];
    const validRiskLevels = ['low', 'medium', 'high', 'very_high'];

    expect(device).toHaveProperty('id');
    expect(device).toHaveProperty('name');
    expect(device).toHaveProperty('classification');
    expect(device).toHaveProperty('registration');
    expect(device).toHaveProperty('riskLevel');
    expect(device).toHaveProperty('intendedUse');

    expect(validClassifications).toContain(device.classification);
    expect(validRiskLevels).toContain(device.riskLevel);
    expect(device.registration).toMatch(/ANVISA-\d+/);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'ANVISA medical device validation passed',
      {
        compliance: true,
        requirement: 'ANVISA Medical Device Registration',
        standard: 'ANVISA',
      }
    );
  }

  static validateClinicalEvaluation(evaluation: any) {
    const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
    const validRiskLevels = ['low', 'medium', 'high'];
    const validOverallAssessments = ['acceptable', 'unacceptable', 'conditional'];

    expect(evaluation).toHaveProperty('deviceId');
    expect(evaluation).toHaveProperty('evaluationId');
    expect(evaluation).toHaveProperty('status');
    expect(evaluation).toHaveProperty('evaluatedAt');
    expect(evaluation).toHaveProperty('riskAssessment');

    expect(validStatuses).toContain(evaluation.status);
    expect(evaluation.riskAssessment).toHaveProperty('clinical');
    expect(evaluation.riskAssessment).toHaveProperty('technical');
    expect(evaluation.riskAssessment).toHaveProperty('overall');

    expect(validRiskLevels).toContain(evaluation.riskAssessment.clinical);
    expect(validRiskLevels).toContain(evaluation.riskAssessment.technical);
    expect(validOverallAssessments).toContain(evaluation.riskAssessment.overall);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'ANVISA clinical evaluation validation passed',
      {
        compliance: true,
        requirement: 'ANVISA Clinical Evaluation',
        standard: 'ANVISA',
      }
    );
  }

  static validatePostMarketSurveillance(surveillance: any) {
    expect(surveillance).toHaveProperty('deviceId');
    expect(surveillance).toHaveProperty('reportId');
    expect(surveillance).toHaveProperty('period');
    expect(surveillance).toHaveProperty('incidents');
    expect(surveillance).toHaveProperty('adverseEvents');
    expect(surveillance).toHaveProperty('userFeedback');

    expect(typeof surveillance.incidents).toBe('number');
    expect(typeof surveillance.adverseEvents).toBe('number');
    expect(surveillance.incidents).toBeGreaterThanOrEqual(0);
    expect(surveillance.adverseEvents).toBeGreaterThanOrEqual(0);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'ANVISA post-market surveillance validation passed',
      {
        compliance: true,
        requirement: 'ANVISA Post-Market Surveillance',
        standard: 'ANVISA',
      }
    );
  }
}

// CFM (Conselho Federal de Medicina) Compliance Testing
export class CFMTestUtils {
  static validateMedicalProfessional(professional: any) {
    expect(professional).toHaveProperty('id');
    expect(professional).toHaveProperty('crm');
    expect(professional).toHaveProperty('name');
    expect(professional).toHaveProperty('specialty');
    expect(professional).toHaveProperty('licenseStatus');
    expect(professional).toHaveProperty('telemedicineEnabled');
    expect(professional).toHaveProperty('lastValidation');

    expect(professional.crm).toMatch(/\d+\/[A-Z]{2}/);
    expect(['active', 'suspended', 'revoked']).toContain(professional.licenseStatus);
    expect(typeof professional.telemedicineEnabled).toBe('boolean');

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'CFM medical professional validation passed',
      {
        compliance: true,
        requirement: 'CFM Professional Registration',
        standard: 'CFM',
      }
    );
  }

  static validateTelemedicineSession(session: any) {
    const validTypes = ['consultation', 'follow_up', 'emergency', 'second_opinion'];

    expect(session).toHaveProperty('sessionId');
    expect(session).toHaveProperty('professionalId');
    expect(session).toHaveProperty('patientId');
    expect(session).toHaveProperty('startTime');
    expect(session).toHaveProperty('endTime');
    expect(session).toHaveProperty('type');
    expect(session).toHaveProperty('compliance');

    expect(validTypes).toContain(session.type);

    expect(session.compliance).toHaveProperty('patientConsent');
    expect(session.compliance).toHaveProperty('professionalValidation');
    expect(session.compliance).toHaveProperty('technicalRequirements');

    expect(session.compliance.patientConsent).toBe(true);
    expect(session.compliance.professionalValidation).toBe(true);
    expect(session.compliance.technicalRequirements).toBe(true);

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'CFM telemedicine session validation passed',
      {
        compliance: true,
        requirement: 'CFM Telemedicine Standards',
        standard: 'CFM',
      }
    );
  }

  static validateDigitalPrescription(prescription: any) {
    expect(prescription).toHaveProperty('prescriptionId');
    expect(prescription).toHaveProperty('professionalId');
    expect(prescription).toHaveProperty('patientId');
    expect(prescription).toHaveProperty('medications');
    expect(prescription).toHaveProperty('digitalSignature');
    expect(prescription).toHaveProperty('timestamp');

    expect(Array.isArray(prescription.medications)).toBe(true);
    expect(prescription.medications.length).toBeGreaterThan(0);

    for (const medication of prescription.medications) {
      expect(medication).toHaveProperty('name');
      expect(medication).toHaveProperty('dosage');
      expect(medication).toHaveProperty('frequency');
      expect(medication).toHaveProperty('duration');
    }

    expect(prescription.digitalSignature).toBe('valid');

    healthcareLogger.constitutional(
      LogLevel.INFO,
      'CFM digital prescription validation passed',
      {
        compliance: true,
        requirement: 'CFM Digital Prescription Standards',
        standard: 'CFM',
      }
    );
  }
}

// Comprehensive Healthcare Compliance Validator
export class HealthcareComplianceValidator {
  static async validateFullCompliance(data: any) {
    const results = {
      lgpd: { compliant: false, errors: [] as string[] },
      anvisa: { compliant: false, errors: [] as string[] },
      cfm: { compliant: false, errors: [] as string[] },
      overall: { compliant: false, score: 0 }
    };

    try {
      if (data.lgpd) {
        LGPDTestUtils.validateConsentData(data.lgpd.consent);
        LGPDTestUtils.validateDataSubjectRights(data.lgpd.dataSubjectRequest);
        LGPDTestUtils.validateDataProcessingRecord(data.lgpd.dataProcessingRecord);
        results.lgpd.compliant = true;
      }
    } catch (error) {
      results.lgpd.errors.push((error as Error).message);
    }

    try {
      if (data.anvisa) {
        ANVISATestUtils.validateMedicalDevice(data.anvisa.medicalDevice);
        ANVISATestUtils.validateClinicalEvaluation(data.anvisa.clinicalEvaluation);
        ANVISATestUtils.validatePostMarketSurveillance(data.anvisa.postMarketSurveillance);
        results.anvisa.compliant = true;
      }
    } catch (error) {
      results.anvisa.errors.push((error as Error).message);
    }

    try {
      if (data.cfm) {
        CFMTestUtils.validateMedicalProfessional(data.cfm.medicalProfessional);
        CFMTestUtils.validateTelemedicineSession(data.cfm.telemedicineSession);
        CFMTestUtils.validateDigitalPrescription(data.cfm.digitalPrescription);
        results.cfm.compliant = true;
      }
    } catch (error) {
      results.cfm.errors.push((error as Error).message);
    }

    const compliantCount = [results.lgpd.compliant, results.anvisa.compliant, results.cfm.compliant].filter(Boolean).length;
    results.overall.score = Math.round((compliantCount / 3) * 100);
    results.overall.compliant = results.overall.score >= 90;

    healthcareLogger.constitutional(
      LogLevel.INFO,
      `Healthcare compliance validation completed. Score: ${results.overall.score}%`,
      {
        compliance: results.overall.compliant,
        requirement: 'Full Healthcare Compliance Validation',
        standard: 'LGPD,ANVISA,CFM',
      }
    );

    return results;
  }
}

// Healthcare-specific test data generators
export class HealthcareTestDataGenerator {
  static generateCompliantPatientData() {
    return {
      id: 'patient-test-123',
      personalInfo: {
        name: 'João da Silva',
        birthDate: '1985-03-15',
        cpf: '***.***.**-**',
        rg: '**.***.***-*',
        phone: '(**) *****-****',
        email: '****@****.com',
      },
      consent: {
        dataProcessing: true,
        telemedicine: true,
        dataSharing: false,
        timestamp: new Date().toISOString(),
      },
      medicalHistory: [
        {
          date: '2023-01-15',
          diagnosis: 'Routine checkup',
          treatment: 'Preventive care',
          professionalCrm: '12345/SP',
        },
      ],
    };
  }

  static generateCompliantMedicalProfessional() {
    return {
      id: 'prof-test-456',
      crm: '54321/RJ',
      name: 'Dr. Maria Santos',
      specialty: 'cardiologia',
      licenseStatus: 'active',
      telemedicineEnabled: true,
      lastValidation: new Date().toISOString(),
      certifications: [
        {
          type: 'CFM_TELEMEDICINE',
          issuedAt: '2023-01-01T00:00:00Z',
          expiresAt: '2024-01-01T00:00:00Z',
        },
      ],
    };
  }

  static generateCompliantAuditTrail() {
    return {
      id: 'audit-test-789',
      timestamp: new Date().toISOString(),
      userId: 'user-test-123',
      action: 'patient_data_access',
      resource: 'patient_medical_history',
      details: {
        patientId: 'patient-test-123',
        dataType: 'medical_records',
        purpose: 'clinical_consultation',
        professionalCrm: '54321/RJ',
      },
      compliance: {
        lgpd: {
          consentValidated: true,
          purposeMatched: true,
          dataMinimization: true,
        },
        anvisa: {
          deviceCompliance: true,
          safetyRequirements: true,
        },
        cfm: {
          professionalValidation: true,
          medicalEthics: true,
        },
      },
      ipAddress: '***.***.***.**',
      userAgent: 'Healthcare App v1.0.0',
    };
  }
}

export {
  healthcareLogger,
};