/**
 * Test Helpers and Utilities
 * Common utilities for API testing
 */

import { vi, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface MockContext {
  req?: {
    url?: string
    headers?: {
      get: (name: string) => string | null
    }
    method?: string
  }
  session?: {
    id: string
    email?: string
    user_metadata?: Record<string, any>
  }
  clinicId: string
  supabase: SupabaseClient
  compliance?: any
}

export const createMockSupabaseClient = () => {
  const mockClient = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          range: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        gte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        neq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        is: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  } as any

  // Add chain methods
  mockClient.from.mockReturnThis()
  mockClient.select.mockReturnThis()
  mockClient.eq.mockReturnThis()
  mockClient.single.mockReturnThis()
  mockClient.order.mockReturnThis()
  mockClient.range.mockReturnThis()
  mockClient.insert.mockReturnThis()
  mockClient.update.mockReturnThis()
  mockClient.delete.mockReturnThis()

  return mockClient
}

export const createTestContext = (overrides: Partial<MockContext> = {}): MockContext => {
  const mockSupabase = createMockSupabaseClient()

  return {
    clinicId: '123e4567-e89b-12d3-a456-426614174000',
    session: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'test@example.com',
      user_metadata: {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'admin',
      },
    },
    req: {
      url: '/api/test',
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'user-agent': 'test-agent',
            'x-forwarded-for': '127.0.0.1',
            'authorization': 'Bearer test-token',
          }
          return headers[name] || null
        }),
      },
      method: 'POST',
    },
    supabase: mockSupabase,
    ...overrides,
  }
}

export const createMockPatientData = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  full_name: 'João Silva',
  email: 'joao.silva@example.com',
  phone_primary: '+5511999999999',
  birth_date: '1990-01-01',
  gender: 'male',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockProfessionalData = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  name: 'Dra. Maria Santos',
  email: 'maria.santos@example.com',
  specialty: 'Dermatologia',
  council_type: 'CRM',
  council_number: '123456',
  council_state: 'SP',
  license_status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockClinicData = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Clínica Estética Test',
  email: 'contato@clinicatestest.com.br',
  phone_primary: '+5511888888888',
  address_line1: 'Rua Test, 123',
  city: 'São Paulo',
  state: 'SP',
  postal_code: '01234-567',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockAppointmentData = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174004',
  patient_id: '123e4567-e89b-12d3-a456-426614174002',
  professional_id: '123e4567-e89b-12d3-a456-426614174003',
  clinic_id: '123e4567-e89b-12d3-a456-426614174000',
  service_id: '123e4567-e89b-12d3-a456-426614174005',
  scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  duration_minutes: 60,
  status: 'scheduled',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Database helpers
export const mockSuccessfulQuery = (data: any) => ({
  data,
  error: null,
})

export const mockFailedQuery = (error: any) => ({
  data: null,
  error,
})

// Time helpers
export const mockDate = (isoString: string) => new Date(isoString)

export const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addHours = (date: Date, hours: number) => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

// Performance testing helpers
export const measureExecutionTime = async (fn: () => Promise<any> | any) => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return {
    result,
    executionTime: end - start,
  }
}

export const expectPerformanceUnder = (maxMs: number) => (executionTime: number) => {
  expect(executionTime).toBeLessThan(maxMs)
}

// Security testing helpers
export const createMaliciousPayload = () => ({
  '<script>alert("xss")</script>': 'XSS attempt',
  'DROP TABLE users;': 'SQL injection attempt',
  '../../etc/passwd': 'Path traversal attempt',
  '{{7*7}}': 'Template injection attempt',
})

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/drop\s+table/gi, '')
    .replace(/\.\.\/\.\//g, '')
    .replace(/\{\{.*?\}\}/g, '')
}

// Compliance testing helpers
export const createMockComplianceData = () => ({
  lgpd: {
    consentRequired: true,
    consentObtained: true,
    dataMinimization: true,
    purposeLimitation: true,
    retentionPeriod: 365,
  },
  anvisa: {
    medicalDeviceCompliance: true,
    adverseEventReporting: true,
    qualityManagement: true,
    documentation: true,
  },
  cfm: {
    professionalLicense: true,
    ethicalStandards: true,
    recordKeeping: true,
    confidentiality: true,
  },
  overall: {
    compliant: true,
    score: 100,
    violations: [],
    recommendations: [],
  },
})

// Mock HTTP responses
export const createMockResponse = (status: number, data: any) => ({
  status,
  data,
  headers: new Headers({
    'content-type': 'application/json',
  }),
})

export const createMockErrorResponse = (status: number, message: string) => ({
  status,
  error: message,
  headers: new Headers({
    'content-type': 'application/json',
  }),
})

// Async testing helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return
    }
    await waitFor(interval)
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

// Random data generators
export const generateRandomUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const generateRandomEmail = () => {
  const domains = ['example.com', 'test.com', 'demo.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const username = Math.random().toString(36).substring(2, 8)
  return `${username}@${domain}`
}

export const generateRandomPhone = () => {
  const ddd = Math.floor(Math.random() * 90) + 10
  const prefix = Math.floor(Math.random() * 9000) + 1000
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `+55${ddd}${prefix}${suffix}`
}

// Validation helpers
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidBrazilianPhone = (phone: string): boolean => {
  const phoneRegex = /^\+55\d{10,11}$/
  return phoneRegex.test(phone)
}

// Environment helpers
export const setTestEnvironment = () => {
  process.env['NODE_ENV'] = 'test'
  process.env['SUPABASE_URL'] = 'https://test.supabase.co'
  process.env['SUPABASE_ANON_KEY'] = 'test-key'
}

export const cleanupTestEnvironment = () => {
  delete process.env['NODE_ENV']
  delete process.env['SUPABASE_URL']
  delete process.env['SUPABASE_ANON_KEY']
}

// Export all mocks for easy import
export const mocks = {
  supabase: createMockSupabaseClient,
  context: createTestContext,
  patient: createMockPatientData,
  professional: createMockProfessionalData,
  clinic: createMockClinicData,
  appointment: createMockAppointmentData,
  compliance: createMockComplianceData,
}

// Export generators
export const generators = {
  uuid: generateRandomUUID,
  email: generateRandomEmail,
  phone: generateRandomPhone,
}

// Export validators
export const validators = {
  uuid: isValidUUID,
  email: isValidEmail,
  phone: isValidBrazilianPhone,
}