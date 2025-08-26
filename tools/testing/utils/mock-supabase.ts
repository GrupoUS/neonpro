/**
 * Mock Supabase Client for Testing
 * Provides comprehensive mocking for all Supabase operations
 */

export interface MockQueryResult {
  data?: any;
  error?: any;
  count?: number;
}

export interface MockSupabaseClient {
  from: jest.MockedFunction<any>;
  rpc: jest.MockedFunction<any>;
  auth: {
    getUser: jest.MockedFunction<any>;
    signInWithPassword: jest.MockedFunction<any>;
    signOut: jest.MockedFunction<any>;
  };
  storage: {
    from: jest.MockedFunction<any>;
  };
}

/**
 * Creates a mock Supabase client with all common operations
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  const mockClient: MockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockResolvedValue({ data: undefined, error: undefined }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: undefined,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: undefined,
      }),
      signOut: jest.fn().mockResolvedValue({ error: undefined }),
    },
    storage: {
      from: jest.fn().mockReturnThis(),
    },
  };

  // Chain-able query methods
  const chainableMethods = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
    explain: jest.fn().mockReturnThis(),
    rollback: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnThis(),
  };

  // Apply chainable methods to the client
  Object.entries(chainableMethods).forEach(([method, mock]) => {
    Object.defineProperty(mockClient, method, {
      value: mock,
      writable: true,
      configurable: true,
    });
  });

  // Add chainable methods to from() return value
  mockClient.from.mockImplementation(() => {
    const queryBuilder = { ...chainableMethods };

    // Default successful responses for common operations
    queryBuilder.select.mockResolvedValue({ data: [], error: undefined });
    queryBuilder.insert.mockResolvedValue({ data: [], error: undefined });
    queryBuilder.update.mockResolvedValue({ data: [], error: undefined });
    queryBuilder.delete.mockResolvedValue({ data: [], error: undefined });
    queryBuilder.upsert.mockResolvedValue({ data: [], error: undefined });

    return queryBuilder;
  });

  return mockClient;
} /**
 * Creates a mock Supabase client with preset successful responses
 */

export function createSuccessfulMockSupabaseClient(
  data: any = [],
): MockSupabaseClient {
  const client = createMockSupabaseClient();

  // Override with successful responses
  client.from.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue({ data, error: undefined }),
    insert: jest.fn().mockResolvedValue({ data, error: undefined }),
    update: jest.fn().mockResolvedValue({ data, error: undefined }),
    delete: jest.fn().mockResolvedValue({ data, error: undefined }),
    upsert: jest.fn().mockResolvedValue({ data, error: undefined }),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
  }));

  return client;
}

/**
 * Creates a mock Supabase client with preset error responses
 */
export function createErrorMockSupabaseClient(error: any): MockSupabaseClient {
  const client = createMockSupabaseClient();

  // Override with error responses
  client.from.mockImplementation(() => ({
    select: jest.fn().mockResolvedValue({ data: undefined, error }),
    insert: jest.fn().mockResolvedValue({ data: undefined, error }),
    update: jest.fn().mockResolvedValue({ data: undefined, error }),
    delete: jest.fn().mockResolvedValue({ data: undefined, error }),
    upsert: jest.fn().mockResolvedValue({ data: undefined, error }),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
  }));

  return client;
}

// Export for backward compatibility
export { createMockSupabaseClient as createMockSupabaseC }; /**
 * Mock Patient Data Generators
 * These functions create realistic patient data for testing scenarios
 */

export function createMockPatientData(overrides: any = {}) {
  return {
    id: "patient-12345",
    name: "João Silva",
    age: 45,
    cpf: "123.456.789-00",
    email: "joao.silva@email.com",
    phone: "+55 11 99999-9999",
    demographicFactors: {
      gender: "masculino",
      ethnicity: "pardo",
      socioeconomicStatus: "media",
      region: "sudeste",
      urbanRural: "urbano",
    },
    medicalHistory: {
      chronicConditions: ["hipertensão"],
      previousSurgeries: [],
      allergies: [],
      medications: ["losartana"],
      familyHistory: ["diabetes", "hipertensão"],
    },
    vitalSigns: {
      heartRate: 75,
      bloodPressure: "130/85",
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
    },
    riskFactors: {
      smoking: false,
      alcoholConsumption: "moderado",
      physicalActivity: "regular",
      diet: "balanceada",
    },
    insuranceInfo: {
      provider: "SUS",
      policyNumber: "SUS-12345",
      coverage: "completa",
    },
    emergencyContact: {
      name: "Maria Silva",
      relationship: "esposa",
      phone: "+55 11 88888-8888",
    },
    consent: {
      dataProcessing: true,
      research: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createLowRiskPatientData() {
  return createMockPatientData({
    age: 30,
    medicalHistory: {
      chronicConditions: [],
      previousSurgeries: [],
      allergies: [],
      medications: [],
      familyHistory: [],
    },
    vitalSigns: {
      heartRate: 70,
      bloodPressure: "120/80",
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 99,
    },
    riskFactors: {
      smoking: false,
      alcoholConsumption: "nenhum",
      physicalActivity: "regular",
      diet: "balanceada",
    },
  });
}

export function createHighRiskPatientData() {
  return createMockPatientData({
    age: 70,
    medicalHistory: {
      chronicConditions: ["diabetes", "hipertensão", "doença cardíaca"],
      previousSurgeries: ["bypass", "angioplastia"],
      allergies: ["penicilina"],
      medications: ["metformina", "losartana", "atorvastatina"],
      familyHistory: ["diabetes", "hipertensão", "doença cardíaca", "avc"],
    },
    vitalSigns: {
      heartRate: 95,
      bloodPressure: "160/95",
      temperature: 37,
      respiratoryRate: 20,
      oxygenSaturation: 94,
    },
    riskFactors: {
      smoking: true,
      alcoholConsumption: "alto",
      physicalActivity: "sedentário",
      diet: "inadequada",
    },
  });
}
export function createCriticalPatientData() {
  return createMockPatientData({
    age: 85,
    medicalHistory: {
      chronicConditions: [
        "diabetes",
        "hipertensão",
        "doença cardíaca",
        "insuficiência renal",
        "DPOC",
      ],
      previousSurgeries: ["bypass", "angioplastia", "marca-passo"],
      allergies: ["penicilina", "sulfa"],
      medications: [
        "metformina",
        "losartana",
        "atorvastatina",
        "furosemida",
        "digoxina",
      ],
      familyHistory: [
        "diabetes",
        "hipertensão",
        "doença cardíaca",
        "avc",
        "câncer",
      ],
    },
    vitalSigns: {
      heartRate: 110,
      bloodPressure: "180/100",
      temperature: 38.5,
      respiratoryRate: 24,
      oxygenSaturation: 88,
    },
    riskFactors: {
      smoking: true,
      alcoholConsumption: "alto",
      physicalActivity: "sedentário",
      diet: "inadequada",
    },
    emergencyFlags: {
      criticalRisk: true,
      immediateAttention: true,
      intensiveCareRecommended: true,
    },
  });
}

export default {
  createMockSupabaseClient,
  createSuccessfulMockSupabaseClient,
  createErrorMockSupabaseClient,
  createMockSupabaseC: createMockSupabaseClient,
  createMockPatientData,
  createLowRiskPatientData,
  createHighRiskPatientData,
  createCriticalPatientData,
};
