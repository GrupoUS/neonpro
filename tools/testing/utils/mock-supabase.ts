/**
 * Mock Supabase Client for Testing
 * Provides comprehensive mocking for all Supabase operations
 */

import type { Mock, } from 'vitest'
import { vi, } from 'vitest'

export interface MockQueryResult {
  data?: unknown
  error?: unknown
  count?: number
}

export interface MockSupabaseClient {
  from: Mock<unknown, unknown[]>
  rpc: Mock<unknown, unknown[]>
  auth: {
    getUser: Mock<unknown, unknown[]>
    signInWithPassword: Mock<unknown, unknown[]>
    signOut: Mock<unknown, unknown[]>
  }
  storage: {
    from: Mock<unknown, unknown[]>
  }
}

/**
 * Creates a mock Supabase client with all common operations
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  const mockClient: MockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockResolvedValue({ data: undefined, error: undefined, },),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', }, },
        error: undefined,
      },),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', }, },
        error: undefined,
      },),
      signOut: vi.fn().mockResolvedValue({ error: undefined, },),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
    },
  }

  // Chain-able query methods
  const chainableMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    csv: vi.fn().mockReturnThis(),
    explain: vi.fn().mockReturnThis(),
    rollback: vi.fn().mockReturnThis(),
    returns: vi.fn().mockReturnThis(),
  }

  // Apply chainable methods to the client
  Object.entries(chainableMethods,).forEach(([method, mock,],) => {
    Object.defineProperty(mockClient, method, {
      value: mock,
      writable: true,
      configurable: true,
    },)
  },)

  // Add chainable methods to from() return value
  mockClient.from.mockImplementation(() => {
    const queryBuilder = { ...chainableMethods, }

    // Default successful responses for common operations
    queryBuilder.select.mockResolvedValue({ data: [], error: undefined, },)
    queryBuilder.insert.mockResolvedValue({ data: [], error: undefined, },)
    queryBuilder.update.mockResolvedValue({ data: [], error: undefined, },)
    queryBuilder.delete.mockResolvedValue({ data: [], error: undefined, },)
    queryBuilder.upsert.mockResolvedValue({ data: [], error: undefined, },)

    return queryBuilder
  },)

  return mockClient
} /**
 * Creates a mock Supabase client with preset successful responses
 */

export function createSuccessfulMockSupabaseClient(
  data: unknown = [],
): MockSupabaseClient {
  const client = createMockSupabaseClient()

  // Override with successful responses
  client.from.mockImplementation(() => ({
    select: vi.fn().mockResolvedValue({ data, error: undefined, },),
    insert: vi.fn().mockResolvedValue({ data, error: undefined, },),
    update: vi.fn().mockResolvedValue({ data, error: undefined, },),
    delete: vi.fn().mockResolvedValue({ data, error: undefined, },),
    upsert: vi.fn().mockResolvedValue({ data, error: undefined, },),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }))

  return client
}

/**
 * Creates a mock Supabase client with preset error responses
 */
export function createErrorMockSupabaseClient(
  error: unknown,
): MockSupabaseClient {
  const client = createMockSupabaseClient()

  // Override with error responses
  client.from.mockImplementation(() => ({
    select: vi.fn().mockResolvedValue({ data: undefined, error, },),
    insert: vi.fn().mockResolvedValue({ data: undefined, error, },),
    update: vi.fn().mockResolvedValue({ data: undefined, error, },),
    delete: vi.fn().mockResolvedValue({ data: undefined, error, },),
    upsert: vi.fn().mockResolvedValue({ data: undefined, error, },),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }))

  return client
}

// Export for backward compatibility
export { createMockSupabaseClient as createMockSupabaseC, } /**
 * Mock Patient Data Generators
 * These functions create realistic patient data for testing scenarios
 */

export function createMockPatientData(overrides: unknown = {},) {
  return {
    id: 'patient-12345',
    name: 'João Silva',
    age: 45,
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    demographicFactors: {
      gender: 'masculino',
      ethnicity: 'pardo',
      socioeconomicStatus: 'media',
      region: 'sudeste',
      urbanRural: 'urbano',
    },
    medicalHistory: {
      chronicConditions: ['hipertensão',],
      previousSurgeries: [],
      allergies: [],
      medications: ['losartana',],
      familyHistory: ['diabetes', 'hipertensão',],
    },
    vitalSigns: {
      heartRate: 75,
      bloodPressure: '130/85',
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
    },
    riskFactors: {
      smoking: false,
      alcoholConsumption: 'moderado',
      physicalActivity: 'regular',
      diet: 'balanceada',
    },
    insuranceInfo: {
      provider: 'SUS',
      policyNumber: 'SUS-12345',
      coverage: 'completa',
    },
    emergencyContact: {
      name: 'Maria Silva',
      relationship: 'esposa',
      phone: '+55 11 88888-8888',
    },
    consent: {
      dataProcessing: true,
      research: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  }
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
      bloodPressure: '120/80',
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 99,
    },
    riskFactors: {
      smoking: false,
      alcoholConsumption: 'nenhum',
      physicalActivity: 'regular',
      diet: 'balanceada',
    },
  },)
}

export function createHighRiskPatientData() {
  return createMockPatientData({
    age: 70,
    medicalHistory: {
      chronicConditions: ['diabetes', 'hipertensão', 'doença cardíaca',],
      previousSurgeries: ['bypass', 'angioplastia',],
      allergies: ['penicilina',],
      medications: ['metformina', 'losartana', 'atorvastatina',],
      familyHistory: ['diabetes', 'hipertensão', 'doença cardíaca', 'avc',],
    },
    vitalSigns: {
      heartRate: 95,
      bloodPressure: '160/95',
      temperature: 37,
      respiratoryRate: 20,
      oxygenSaturation: 94,
    },
    riskFactors: {
      smoking: true,
      alcoholConsumption: 'alto',
      physicalActivity: 'sedentário',
      diet: 'inadequada',
    },
  },)
}
export function createCriticalPatientData() {
  return createMockPatientData({
    age: 85,
    medicalHistory: {
      chronicConditions: [
        'diabetes',
        'hipertensão',
        'doença cardíaca',
        'insuficiência renal',
        'DPOC',
      ],
      previousSurgeries: ['bypass', 'angioplastia', 'marca-passo',],
      allergies: ['penicilina', 'sulfa',],
      medications: [
        'metformina',
        'losartana',
        'atorvastatina',
        'furosemida',
        'digoxina',
      ],
      familyHistory: [
        'diabetes',
        'hipertensão',
        'doença cardíaca',
        'avc',
        'câncer',
      ],
    },
    vitalSigns: {
      heartRate: 110,
      bloodPressure: '180/100',
      temperature: 38.5,
      respiratoryRate: 24,
      oxygenSaturation: 88,
    },
    riskFactors: {
      smoking: true,
      alcoholConsumption: 'alto',
      physicalActivity: 'sedentário',
      diet: 'inadequada',
    },
    emergencyFlags: {
      criticalRisk: true,
      immediateAttention: true,
      intensiveCareRecommended: true,
    },
  },)
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
}
