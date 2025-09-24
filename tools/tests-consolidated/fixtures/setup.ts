/**
 * Setup consolidado para testes
 * Configuração simples seguindo KISS e YAGNI
 */

import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'

// Configuração global simples
beforeAll(async () => {
  // Setup inicial necessário
  process.env.NODE_ENV = 'test'

  // Configuração de timezone para consistency
  process.env.TZ = 'UTC'

  // Suprimir logs desnecessários em testes
  if (!process.env.DEBUG_TESTS) {
    console.log = () => {}
    console.warn = () => {}
  }
})

afterAll(async () => {
  // Cleanup global se necessário
})

beforeEach(async () => {
  // Reset para cada teste
  vi.clearAllMocks()
})

afterEach(async () => {
  // Cleanup por teste
  vi.restoreAllMocks()
})

// Utilitários de teste globais simples
declare global {
  interface CustomMatchers<R = unknown> {
    toBeValidHealthcareData(): R
    toMatchSnapshot(): R
  }
}

// Matchers customizados simples para healthcare
expect.extend({
  toBeValidHealthcareData(received: unknown) {
    const isValid = received &&
      typeof received === 'object' &&
      received !== null &&
      Object.keys(received).length > 0

    if (isValid) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid healthcare data`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid healthcare data`,
        pass: false,
      }
    }
  },
})

// Mock factories simples
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@neonpro.com',
  name: 'Test User',
  role: 'user',
  ...overrides,
})

export const createMockAppointment = (overrides = {}) => ({
  id: '1',
  patientId: '1',
  professionalId: '1',
  date: new Date('2024-01-01T10:00:00Z'),
  status: 'scheduled',
  ...overrides,
})

export const createMockClinic = (overrides = {}) => ({
  id: '1',
  name: 'Test Clinic',
  cnpj: '12345678000123',
  address: 'Test Address',
  ...overrides,
})
