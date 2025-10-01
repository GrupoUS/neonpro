/**
 * NeonPro Bun Test Preload
 * Healthcare Compliance: LGPD, ANVISA, CFM
 * 
 * This file is preloaded before running tests with Bun
 * It sets up the test environment and global configurations
 */

// Set up test environment
process.env.NODE_ENV = 'test'
process.env.LGPD_MODE = 'true'
process.env.HEALTHCARE_COMPLIANCE = 'true'
process.env.AUDIT_LOGGING = 'true'
process.env.DATA_RESIDENCY = 'local'

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Add typed shapes for test utilities
type Patient = {
  id: string
  name: string
  email: string
  phone: string
}

type Appointment = {
  id: string
  patientId: string
  professionalId: string
  date: string
  status: string
}

type TestUtils = {
  createMockPatient: (overrides?: Partial<Patient>) => Patient
  createMockAppointment: (overrides?: Partial<Appointment>) => Appointment
}

// Tell TypeScript that `global.testUtils` exists
declare global {
  // add testUtils to the global scope
  var testUtils: TestUtils
}

// Set up global test utilities
global.testUtils = {
  // Helper to create mock patient data (LGPD compliant)
  createMockPatient: (overrides = {}) => ({
    id: 'test-patient-id',
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '+5511999999999',
    ...overrides,
  }),
  
  // Helper to create mock appointment data
  createMockAppointment: (overrides = {}) => ({
    id: 'test-appointment-id',
    patientId: 'test-patient-id',
    professionalId: 'test-professional-id',
    date: new Date().toISOString(),
    status: 'scheduled',
    ...overrides,
  }),
}

// Export for TypeScript
export {}