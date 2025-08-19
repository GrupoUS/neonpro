import { type RenderOptions, render } from '@testing-library/react';
import type React from 'react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

// Healthcare-specific test context providers
type HealthcareTestProviderProps = {
  children: React.ReactNode;
  initialPatient?: any;
  initialDoctor?: any;
  initialClinicSettings?: any;
};

// Mock healthcare context provider for testing
export function HealthcareTestProvider({
  children,
  initialPatient = null,
  initialDoctor = null,
  initialClinicSettings = {},
}: HealthcareTestProviderProps) {
  const _mockHealthcareContext = {
    patient: initialPatient,
    doctor: initialDoctor,
    clinicSettings: {
      timezone: 'America/Sao_Paulo',
      workingHours: { start: '08:00', end: '18:00' },
      appointmentDuration: 60,
      lgpdCompliance: true,
      anvisaCompliance: true,
      ...initialClinicSettings,
    },

    // Mock functions for healthcare operations
    updatePatient: vi.fn(),
    createAppointment: vi.fn(),
    updateTreatment: vi.fn(),
    recordConsent: vi.fn(),
    generateAuditLog: vi.fn(),
  };

  return <div data-testid="healthcare-provider">{children}</div>;
}

// Custom render function with healthcare providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialPatient?: any;
  initialDoctor?: any;
  initialClinicSettings?: any;
}

export function renderWithHealthcareProvider(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialPatient,
    initialDoctor,
    initialClinicSettings,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <HealthcareTestProvider
        initialClinicSettings={initialClinicSettings}
        initialDoctor={initialDoctor}
        initialPatient={initialPatient}
      >
        {children}
      </HealthcareTestProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Healthcare data generators for testing
export const healthcareTestData = {
  createMockPatient: (overrides = {}) => ({
    id: 'patient-test-123',
    cpf: '123.456.789-09',
    name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    phone: '+55 11 99999-9999',
    dateOfBirth: '1985-03-15',
    gender: 'F',
    address: {
      street: 'Avenida Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'BR',
    },
    emergencyContact: {
      name: 'João Silva',
      relationship: 'spouse',
      phone: '+55 11 88888-8888',
    },
    lgpdConsent: {
      granted: true,
      grantedAt: new Date().toISOString(),
      purposes: ['medical-treatment', 'communication'],
    },
    medicalHistory: [],
    allergies: ['Látex'],
    medications: [],
    ...overrides,
  }),

  createMockDoctor: (overrides = {}) => ({
    id: 'doctor-test-123',
    name: 'Dr. Ana Costa',
    crmNumber: '123456-SP',
    crmState: 'SP',
    specialty: 'Dermatologia',
    email: 'dr.ana@neonpro.com',
    phone: '+55 11 77777-7777',
    licenseStatus: 'active',
    licenseExpiry: '2025-12-31',
    digitalSignature: 'dr-ana-signature-123',
    workingHours: {
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '17:00' },
    },
    ...overrides,
  }),

  createMockAppointment: (overrides = {}) => ({
    id: 'appointment-test-123',
    patientId: 'patient-test-123',
    doctorId: 'doctor-test-123',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 60,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Consulta de rotina',
    reminderSent: false,
    lgpdConsentConfirmed: true,
    ...overrides,
  }),

  createMockTreatment: (overrides = {}) => ({
    id: 'treatment-test-123',
    patientId: 'patient-test-123',
    doctorId: 'doctor-test-123',
    type: 'botox-application',
    name: 'Aplicação de Botox',
    description: 'Tratamento para rugas de expressão',
    products: [
      {
        id: 'product-123',
        name: 'Botox Allergan',
        anvisaCode: 'ANVISA-BOT-001',
        batch: 'BATCH-2024-001',
        expiryDate: '2025-06-30',
        quantity: 50,
        unit: 'UI',
      },
    ],
    contraindications: [],
    sideEffects: [],
    followUpRequired: true,
    followUpDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days later
    ...overrides,
  }),

  createMockMedicalRecord: (overrides = {}) => ({
    id: 'record-test-123',
    patientId: 'patient-test-123',
    treatmentId: 'treatment-test-123',
    doctorId: 'doctor-test-123',
    date: new Date().toISOString(),
    type: 'treatment-record',
    diagnosis: 'Rugas de expressão na região frontal',
    treatmentPerformed: 'Aplicação de toxina botulínica',
    dosage: '50 UI de Botox Allergan',
    applicationSites: ['Frontal', 'Glabela'],
    patientResponse: 'Paciente tolerou bem o procedimento',
    observations: 'Orientado sobre cuidados pós-tratamento',
    nextVisit: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    digitalSignature: 'record-signature-123',
    attachments: [],
    ...overrides,
  }),
};

// Healthcare-specific assertions
export const healthcareAssertions = {
  expectCPFToBeValid: (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    expect(cleanCPF).toHaveLength(11);
    expect(cleanCPF).not.toBe('00000000000');
    expect(cleanCPF).not.toBe('11111111111');
  },

  expectLGPDConsentToBeRecorded: (consent: any) => {
    expect(consent).toHaveProperty('granted', true);
    expect(consent).toHaveProperty('grantedAt');
    expect(consent).toHaveProperty('purposes');
    expect(Array.isArray(consent.purposes)).toBe(true);
    expect(consent.purposes.length).toBeGreaterThan(0);
  },

  expectANVISAComplianceToBeValid: (product: any) => {
    expect(product).toHaveProperty('anvisaCode');
    expect(product.anvisaCode).toMatch(/^ANVISA-/);
    expect(product).toHaveProperty('batch');
    expect(product).toHaveProperty('expiryDate');
    expect(new Date(product.expiryDate)).toBeInstanceOf(Date);
  },

  expectDigitalSignatureToBePresent: (record: any) => {
    expect(record).toHaveProperty('digitalSignature');
    expect(record.digitalSignature).toBeTruthy();
    expect(typeof record.digitalSignature).toBe('string');
  },

  expectAuditTrailToBeComplete: (auditLog: any) => {
    expect(auditLog).toHaveProperty('action');
    expect(auditLog).toHaveProperty('userId');
    expect(auditLog).toHaveProperty('timestamp');
    expect(auditLog).toHaveProperty('ipAddress');
    expect(auditLog).toHaveProperty('userAgent');
  },
};

// Healthcare form testing utilities
export const healthcareFormUtils = {
  fillPatientForm: async (user: any, patientData: any) => {
    const nameInput = document.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const cpfInput = document.querySelector(
      'input[name="cpf"]'
    ) as HTMLInputElement;
    const emailInput = document.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const phoneInput = document.querySelector(
      'input[name="phone"]'
    ) as HTMLInputElement;

    if (nameInput) {
      await user.type(nameInput, patientData.name);
    }
    if (cpfInput) {
      await user.type(cpfInput, patientData.cpf);
    }
    if (emailInput) {
      await user.type(emailInput, patientData.email);
    }
    if (phoneInput) {
      await user.type(phoneInput, patientData.phone);
    }
  },

  submitFormWithLGPDConsent: async (user: any) => {
    const lgpdCheckbox = document.querySelector(
      'input[name="lgpdConsent"]'
    ) as HTMLInputElement;
    const submitButton = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    if (lgpdCheckbox) {
      await user.click(lgpdCheckbox);
    }
    if (submitButton) {
      await user.click(submitButton);
    }
  },

  expectFormValidationErrors: (requiredFields: string[]) => {
    requiredFields.forEach((field) => {
      const errorElement = document.querySelector(
        `[data-testid="${field}-error"]`
      );
      expect(errorElement).toBeInTheDocument();
    });
  },
};

// Mock healthcare API responses
export const mockHealthcareAPI = {
  validateCPF: vi.fn(async (cpf: string) => ({
    isValid: !['00000000000', '11111111111'].includes(cpf.replace(/\D/g, '')),
    formatted: cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  })),

  checkANVISACompliance: vi.fn(async (_productCode: string) => ({
    isCompliant: true,
    productInfo: {
      name: 'Test Medical Product',
      registrationStatus: 'active',
      expiryDate: '2025-12-31',
    },
  })),

  recordLGPDConsent: vi.fn(async (_consentData: any) => ({
    success: true,
    consentId: 'consent-123',
    timestamp: new Date().toISOString(),
  })),

  generateAuditLog: vi.fn(async (action: string, resourceId: string) => ({
    auditId: 'audit-123',
    action,
    resourceId,
    timestamp: new Date().toISOString(),
  })),
};

// Re-export everything for convenience
export * from '@testing-library/react';
export { vi } from 'vitest';
