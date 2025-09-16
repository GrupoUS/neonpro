/**
 * LGPD Test Fixtures
 * Test data for Lei Geral de Proteção de Dados compliance testing
 */

export interface LGPDConsentData {
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
  version: string;
  purposes: string[];
  dataCategories: string[];
  processingBasis: string;
  retentionPeriod: string;
}

export interface DataSubjectRequest {
  requestId: string;
  userId: string;
  requestType: 'data_access' | 'data_portability' | 'data_correction' | 'data_deletion' | 'processing_restriction' | 'consent_withdrawal';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedAt: string;
  completedAt?: string;
  details: Record<string, any>;
}

export interface DataProcessingRecord {
  id: string;
  controller: string;
  processor: string;
  purposes: string[];
  categories: string[];
  retention: string;
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  adequacyDecision?: string;
  safeguards?: string[];
}

export const LGPD_CONSENT_FIXTURES: LGPDConsentData[] = [
  {
    userId: 'patient-001',
    consentType: 'medical_data_processing',
    granted: true,
    timestamp: '2023-01-01T00:00:00Z',
    version: '1.0',
    purposes: ['medical_treatment', 'health_monitoring', 'clinical_research'],
    dataCategories: ['health_data', 'personal_data', 'contact_data'],
    processingBasis: 'consent',
    retentionPeriod: '7_years',
  },
  {
    userId: 'patient-002',
    consentType: 'telemedicine_consultation',
    granted: true,
    timestamp: '2023-01-15T10:00:00Z',
    version: '1.1',
    purposes: ['telemedicine_consultation', 'appointment_scheduling'],
    dataCategories: ['health_data', 'personal_data', 'biometric_data'],
    processingBasis: 'consent',
    retentionPeriod: '5_years',
  },
  {
    userId: 'patient-003',
    consentType: 'research_participation',
    granted: false,
    timestamp: '2023-02-01T14:30:00Z',
    version: '1.0',
    purposes: ['clinical_research', 'statistical_analysis'],
    dataCategories: ['health_data', 'demographic_data'],
    processingBasis: 'consent',
    retentionPeriod: '10_years',
  },
];

export const DATA_SUBJECT_REQUEST_FIXTURES: DataSubjectRequest[] = [
  {
    requestId: 'dsr-001',
    userId: 'patient-001',
    requestType: 'data_access',
    status: 'completed',
    submittedAt: '2023-03-01T09:00:00Z',
    completedAt: '2023-03-05T16:00:00Z',
    details: {
      requestedData: ['medical_records', 'appointment_history'],
      deliveryMethod: 'secure_download',
      format: 'pdf',
    },
  },
  {
    requestId: 'dsr-002',
    userId: 'patient-002',
    requestType: 'data_portability',
    status: 'in_progress',
    submittedAt: '2023-03-10T11:30:00Z',
    details: {
      requestedData: ['all_personal_data'],
      deliveryMethod: 'secure_api',
      format: 'json',
    },
  },
  {
    requestId: 'dsr-003',
    userId: 'patient-003',
    requestType: 'consent_withdrawal',
    status: 'completed',
    submittedAt: '2023-03-15T08:45:00Z',
    completedAt: '2023-03-15T09:00:00Z',
    details: {
      consentType: 'research_participation',
      reason: 'no_longer_interested',
      dataRetention: 'delete_immediately',
    },
  },
];

export const DATA_PROCESSING_RECORD_FIXTURES: DataProcessingRecord[] = [
  {
    id: 'dpr-001',
    controller: 'Clínica NeonPro',
    processor: 'Sistema NeonPro',
    purposes: ['medical_treatment', 'appointment_scheduling'],
    categories: ['health_data', 'personal_data', 'contact_data'],
    retention: '7_years_after_last_consultation',
    securityMeasures: ['encryption_at_rest', 'encryption_in_transit', 'access_control', 'audit_logging'],
    crossBorderTransfer: false,
  },
  {
    id: 'dpr-002',
    controller: 'Hospital Parceiro',
    processor: 'Plataforma de Telemedicina NeonPro',
    purposes: ['telemedicine_consultation', 'specialist_referral'],
    categories: ['health_data', 'biometric_data', 'consultation_records'],
    retention: '5_years_after_consultation',
    securityMeasures: ['end_to_end_encryption', 'multi_factor_authentication', 'session_recording_protection'],
    crossBorderTransfer: false,
  },
  {
    id: 'dpr-003',
    controller: 'Universidade de Pesquisa',
    processor: 'NeonPro Research Analytics',
    purposes: ['clinical_research', 'statistical_analysis', 'academic_publication'],
    categories: ['anonymized_health_data', 'demographic_data'],
    retention: '10_years_after_study_completion',
    securityMeasures: ['data_anonymization', 'differential_privacy', 'secure_research_environment'],
    crossBorderTransfer: true,
    adequacyDecision: 'european_commission_adequacy',
    safeguards: ['standard_contractual_clauses', 'bcr_certification'],
  },
];

export class LGPDTestDataGenerator {
  static generateConsentData(overrides: Partial<LGPDConsentData> = {}): LGPDConsentData {
    const base: LGPDConsentData = {
      userId: `patient-${Date.now()}`,
      consentType: 'medical_data_processing',
      granted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
      purposes: ['medical_treatment'],
      dataCategories: ['health_data', 'personal_data'],
      processingBasis: 'consent',
      retentionPeriod: '7_years',
    };

    return { ...base, ...overrides };
  }

  static generateDataSubjectRequest(overrides: Partial<DataSubjectRequest> = {}): DataSubjectRequest {
    const base: DataSubjectRequest = {
      requestId: `dsr-${Date.now()}`,
      userId: `patient-${Date.now()}`,
      requestType: 'data_access',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      details: {},
    };

    return { ...base, ...overrides };
  }

  static generateDataProcessingRecord(overrides: Partial<DataProcessingRecord> = {}): DataProcessingRecord {
    const base: DataProcessingRecord = {
      id: `dpr-${Date.now()}`,
      controller: 'Test Healthcare Provider',
      processor: 'Test NeonPro System',
      purposes: ['medical_treatment'],
      categories: ['health_data'],
      retention: '7_years',
      securityMeasures: ['encryption', 'access_control'],
      crossBorderTransfer: false,
    };

    return { ...base, ...overrides };
  }

  static generateMaskedPatientData() {
    return {
      id: 'patient-masked-001',
      personalInfo: {
        name: 'João ***',
        cpf: '***.***.**-**',
        rg: '**.***.***-*',
        phone: '(**) *****-****',
        email: 'j****@****.com',
        address: {
          street: 'Rua *** ***',
          number: '***',
          zipCode: '*****-***',
          city: 'São Paulo',
          state: 'SP',
        },
      },
      medicalInfo: {
        medicalRecordNumber: 'MRN-***-***',
        allergies: ['Penicilina'], // Not masked for safety
        chronicConditions: ['***'], // Masked for privacy
      },
      metadata: {
        maskedAt: new Date().toISOString(),
        maskingReason: 'lgpd_compliance',
        dataRetentionExpiry: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 years
      },
    };
  }
}