/**
 * Healthcare Test Data
 *
 * Provides realistic healthcare test data while ensuring compliance
 * with LGPD and other healthcare regulations.
 */

import type { AuditTrailEntry, ConsentRecord } from "../compliance/types";
import { TEST_IDS } from "./index";

export interface MockPatient {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: Date;
  clinicId: string;
  consentGiven: boolean;
  dataProcessingPurpose: string;
  auditTrail: AuditTrailEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MockClinic {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface MockProfessional {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
  clinicId: string;
  licenseValid: boolean;
  createdAt: Date;
}

/**
 * Create mock patient data
 */
export function createMockPatient(
  overrides: Partial<MockPatient> = {},
): MockPatient {
  const now = new Date();

  return {
    id: TEST_IDS.PATIENT,
    name: "João Silva Santos",
    email: "joao.silva@email.com",
    cpf: "123.456.789-00",
    birthDate: new Date("1985-03-15"),
    clinicId: TEST_IDS.CLINIC,
    consentGiven: true,
    dataProcessingPurpose:
      "Prestação de serviços de saúde e acompanhamento médico",
    auditTrail: [
      {
        timestamp: now,
        action: "patient_created",
        userId: TEST_IDS.PROFESSIONAL,
        resourceType: "patient",
        resourceId: TEST_IDS.PATIENT,
        details: { reason: "Patient registration" },
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create mock clinic data
 */
export function createMockClinic(
  overrides: Partial<MockClinic> = {},
): MockClinic {
  return {
    id: TEST_IDS.CLINIC,
    name: "Clínica São Paulo",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 1234-5678",
    email: "contato@clinicasp.com.br",
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock professional data
 */
export function createMockProfessional(
  overrides: Partial<MockProfessional> = {},
): MockProfessional {
  return {
    id: TEST_IDS.PROFESSIONAL,
    name: "Dr. Maria Santos",
    email: "maria.santos@clinicasp.com.br",
    crm: "CRM/SP 123456",
    specialty: "Cardiologia",
    clinicId: TEST_IDS.CLINIC,
    licenseValid: true,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock consent record
 */
export function createMockConsentRecord(
  overrides: Partial<ConsentRecord> = {},
): ConsentRecord {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years from now

  return {
    id: "consent-123",
    dataSubjectId: TEST_IDS.PATIENT,
    purpose:
      "Prestação de serviços de saúde, acompanhamento médico e comunicação sobre tratamentos",
    consentGiven: true,
    consentDate: now,
    expiryDate,
    legalBasis: "Art. 7º, I - consentimento do titular",
    ...overrides,
  };
}

/**
 * Create healthcare-compliant test data set
 */
export function createHealthcareTestDataSet() {
  const clinic = createMockClinic();
  const professional = createMockProfessional({ clinicId: clinic.id });
  const patient = createMockPatient({ clinicId: clinic.id });
  const consent = createMockConsentRecord({ dataSubjectId: patient.id });

  return {
    clinic,
    professional,
    patient,
    consent,
    // Additional test scenarios
    scenarios: {
      validConsent: createMockConsentRecord({ consentGiven: true }),
      expiredConsent: createMockConsentRecord({
        consentGiven: true,
        expiryDate: new Date("2020-01-01"), // Expired
      }),
      withdrawnConsent: createMockConsentRecord({
        consentGiven: false,
        withdrawalDate: new Date(),
      }),
      invalidLicense: createMockProfessional({ licenseValid: false }),
      minorPatient: createMockPatient({
        birthDate: new Date("2010-01-01"), // Minor
        dataProcessingPurpose:
          "Prestação de serviços de saúde pediátrica com consentimento dos responsáveis",
      }),
    },
  };
}

/**
 * LGPD-compliant test data patterns
 */
export const LGPD_TEST_PATTERNS = {
  VALID_PURPOSES: [
    "Prestação de serviços de saúde",
    "Acompanhamento médico e tratamento",
    "Comunicação sobre consultas e exames",
    "Gestão administrativa da clínica",
    "Cumprimento de obrigações legais e regulatórias",
  ],

  INVALID_PURPOSES: [
    "", // Empty purpose
    "Marketing", // Without explicit consent
    "Venda de dados", // Prohibited
    "Uso indefinido", // Too vague
  ],

  REQUIRED_AUDIT_ACTIONS: [
    "patient_created",
    "patient_accessed",
    "patient_updated",
    "consent_given",
    "consent_withdrawn",
    "data_exported",
    "data_deleted",
  ],
} as const;
