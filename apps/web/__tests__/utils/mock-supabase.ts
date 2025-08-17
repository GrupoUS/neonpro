// ============================================================================
// MOCK SUPABASE CLIENT - CONSTITUTIONAL HEALTHCARE TESTING
// ============================================================================

export function createMockSupabaseClient() {
  const mockFrom = jest.fn();
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockOrder = jest.fn();
  const mockLimit = jest.fn();

  // Setup method chaining for Supabase query builder
  mockEq.mockReturnThis();
  mockOrder.mockReturnThis();
  mockLimit.mockReturnThis();
  mockSelect.mockReturnThis();

  const mockQueryBuilder = {
    insert: mockInsert.mockReturnValue({
      then: (callback: (result: { error: null }) => void) =>
        callback({ error: null }),
    }),
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle.mockReturnValue({
          then: (
            callback: (result: { data: null; error: { code: string } }) => void,
          ) => callback({ data: null, error: { code: 'PGRST116' } }),
        }),
        order: mockOrder.mockReturnValue({
          limit: mockLimit.mockReturnValue({
            then: (
              callback: (result: { data: unknown[]; error: null }) => void,
            ) => callback({ data: [], error: null }),
          }),
        }),
      }),
    }),
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
    limit: mockLimit,
  };

  mockFrom.mockReturnValue(mockQueryBuilder);

  return {
    from: mockFrom,
    auth: {
      persistSession: false,
    },
  };
}

// Mock patient data generators for testing
export const createMockPatientData = (
  overrides: Record<string, unknown> = {},
) => ({
  patientId: '12345678-1234-1234-1234-123456789012',
  tenantId: '87654321-4321-4321-4321-210987654321',
  assessmentDate: new Date(),
  assessmentType: 'PRE_PROCEDURE',

  demographicFactors: {
    age: 45,
    gender: 'MALE',
    bmi: 25.0,
    geneticPredispositions: [],
    smokingStatus: 'NEVER',
    alcoholConsumption: 'NONE',
    physicalActivityLevel: 'MODERATE',
    ...overrides.demographicFactors,
  },

  medicalHistory: {
    chronicConditions: [],
    previousSurgeries: [],
    allergies: [],
    familyHistory: [],
    currentMedications: [],
    immunizationStatus: {},
    ...overrides.medicalHistory,
  },

  currentCondition: {
    vitalSigns: {
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
        timestamp: new Date(),
      },
      heartRate: {
        bpm: 72,
        rhythm: 'REGULAR',
        timestamp: new Date(),
      },
      temperature: {
        celsius: 36.5,
        timestamp: new Date(),
      },
      respiratoryRate: {
        rpm: 16,
        timestamp: new Date(),
      },
      oxygenSaturation: {
        percentage: 99,
        timestamp: new Date(),
      },
    },
    currentSymptoms: [],
    painLevel: 0,
    mentalStatus: 'ALERT',
    mobilityStatus: 'AMBULATORY',
    ...overrides.currentCondition,
  },

  environmental: {
    supportSystem: {
      hasCaregiver: true,
      familySupport: 'STRONG',
      socialIsolation: false,
      languageBarriers: false,
    },
    accessibilityFactors: {
      transportationAvailable: true,
      distanceToClinic: 10,
      financialConstraints: false,
      insuranceCoverage: 'FULL',
    },
    complianceHistory: {
      previousAppointmentAttendance: 95,
      medicationCompliance: 'EXCELLENT',
      followUpCompliance: 'EXCELLENT',
    },
    ...overrides.environmental,
  },

  // LGPD Compliance
  consentGiven: true,
  consentDate: new Date(),
  dataProcessingPurpose: ['risk_assessment'],
  retentionPeriod: 2555, // 7 years

  ...overrides,
});

// High-risk patient scenario
export const createHighRiskPatientData = () =>
  createMockPatientData({
    demographicFactors: {
      age: 75,
      bmi: 35,
      smokingStatus: 'CURRENT',
      alcoholConsumption: 'HEAVY',
    },
    medicalHistory: {
      chronicConditions: ['diabetes', 'cardiopatia', 'insuficiência renal'],
      currentMedications: Array.from({ length: 8 }, (_, i) => ({
        name: `Medication ${i + 1}`,
        dosage: '10mg',
        frequency: '1x/dia',
        startDate: new Date(),
        indication: 'Treatment',
      })),
      allergies: [
        {
          allergen: 'Anestesia',
          severity: 'SEVERE',
          reaction: 'Broncoespasmo',
        },
      ],
    },
    currentCondition: {
      vitalSigns: {
        bloodPressure: { systolic: 185, diastolic: 115, timestamp: new Date() },
        heartRate: { bpm: 110, rhythm: 'IRREGULAR', timestamp: new Date() },
        oxygenSaturation: { percentage: 88, timestamp: new Date() },
      },
      currentSymptoms: [
        {
          symptom: 'Dor torácica',
          severity: 4,
          duration: '2 horas',
          onset: new Date(),
        },
      ],
      painLevel: 8,
    },
  });

// Critical patient scenario
export const createCriticalPatientData = () =>
  createMockPatientData({
    currentCondition: {
      vitalSigns: {
        bloodPressure: { systolic: 200, diastolic: 130, timestamp: new Date() },
        heartRate: { bpm: 45, rhythm: 'IRREGULAR', timestamp: new Date() },
        oxygenSaturation: { percentage: 75, timestamp: new Date() },
        temperature: { celsius: 39.5, timestamp: new Date() },
      },
      mentalStatus: 'UNCONSCIOUS',
      painLevel: 10,
    },
  });

// Stable low-risk patient scenario
export const createLowRiskPatientData = () =>
  createMockPatientData({
    demographicFactors: {
      age: 25,
      bmi: 22,
      smokingStatus: 'NEVER',
      physicalActivityLevel: 'INTENSE',
    },
    medicalHistory: {
      chronicConditions: [],
      currentMedications: [],
    },
  });

export default {
  createMockSupabaseClient,
  createMockPatientData,
  createHighRiskPatientData,
  createCriticalPatientData,
  createLowRiskPatientData,
};
