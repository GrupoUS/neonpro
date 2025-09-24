/**
 * Testing setup utilities for NeonPro quality tests
 * Provides global mocks and utilities for healthcare compliance testing
 */

// Test environment configuration
export const TEST_CONFIG = {
  DATABASE_URL: process.env.TEST_DATABASE_URL
    || 'postgresql://test:test@localhost:5432/neonpro_test',
  API_BASE_URL: process.env.TEST_API_URL || 'http://localhost:3000',
  PERFORMANCE_TIMEOUT: 60000,
  HEALTHCARE_COMPLIANCE_MODE: true,
  LGPD_VALIDATION_ENABLED: true,
  AUDIT_LOGGING_ENABLED: true,
}

// Extend global interface for test utilities
declare global {
  const simulateDirectAPICall: (
    endpoint: string,
  ) => Promise<{ status: number; data: any }>
  const simulateAuditedOperation: (
    operation: string,
    resourceId: string,
  ) => Promise<{ operation: string; resourceId: string; auditId: string }>
  const validatePatientConsent: (
    patientId: string,
    consentType: string,
  ) => Promise<boolean>
  const simulateDatabaseQuery: (
    queryType: string,
    options: Record<string, unknown>,
  ) => Promise<any>
  const simulateDatabaseOperation: (
    connection: unknown,
    operation: string,
  ) => Promise<boolean>
  const simulateDBConnectionRelease: (connection: unknown) => Promise<void>
  const simulateLGPDOperation: (
    operationType: string,
    data: Record<string, unknown>,
  ) => Promise<boolean>
  const simulateAuditLogCreation: (
    logData: Record<string, unknown>,
  ) => Promise<string>
  const simulateEmergencyScenario: (
    scenarioType: string,
    options: Record<string, unknown>,
  ) => Promise<void>
  const simulateHealthcareOperation: (
    operationType: string,
    options: Record<string, unknown>,
  ) => Promise<boolean>
}

// Mock global functions for performance testing
global.simulateDirectAPICall = async (endpoint: string) => {
  // Simulate API call without middleware overhead
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10))
  return { status: 200, data: { endpoint, timestamp: Date.now() } }
}

global.simulateAuditedOperation = async (
  operation: string,
  resourceId: string,
) => {
  // Simulate operation with audit logging
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
  return { operation, resourceId, auditId: `audit_${Date.now()}` }
}

global.validatePatientConsent = async (
  _patientId: string,
  _consentType: string,
) => {
  // Simulate LGPD consent validation
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 3))
  return true // Assume consent granted for tests
}

global.simulateDatabaseQuery = async (
  queryType: string,
  options: Record<string, unknown>,
) => {
  // Simulate database query with healthcare compliance
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20))

  if (queryType === 'patient_data') {
    return {
      id: 'patient_123',
      name: 'Test Patient',
      ...options,
    }
  }

  return { queryType, options, result: 'success' }
}

global.simulateDatabaseOperation = async (
  connection: unknown,
  operation: string,
) => {
  // Simulate database operation (create, update, delete)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 15))
  return operation !== 'error_simulation'
}

global.simulateDBConnectionRelease = async (_connection: unknown) => {
  // Simulate connection cleanup
  await new Promise((resolve) => setTimeout(resolve, 1))
}

global.simulateLGPDOperation = async (
  operationType: string,
  _data: Record<string, unknown>,
) => {
  // Simulate LGPD compliance operations
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10))
  return (
    operationType === 'data_deletion' || operationType === 'consent_validation'
  )
}

global.simulateAuditLogCreation = async (_logData: Record<string, unknown>) => {
  // Simulate audit log creation
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

global.simulateEmergencyScenario = async (
  scenarioType: string,
  options: Record<string, unknown>,
) => {
  // Simulate emergency access scenarios
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 8))

  // Use secure logging for LGPD compliance - mask sensitive data
  const maskSensitiveData = (data: string, maskChar: string = '*') => {
    // Simple masking for test purposes
    return data
      .replace(/"password":"[^"]*"/g, `"password":"${maskChar.repeat(8)}"`)
      .replace(/"cpf":"[^"]*"/g, `"cpf":"${maskChar.repeat(11)}"`)
      .replace(
        /"email":"[^"]*"/g,
        `"email":"${maskChar.repeat(8)}@${maskChar.repeat(4)}.${maskChar.repeat(3)}"`,
      )
  }
  const maskedOptions = maskSensitiveData(JSON.stringify(options))

  // Log emergency scenario without exposing sensitive data
  console.log(
    `[EMERGENCY SIMULATION] Scenario type: ${scenarioType}, Data: ${maskedOptions}`,
  )
}

global.simulateHealthcareOperation = async (
  operationType: string,
  _options: Record<string, unknown>,
) => {
  // Simulate healthcare-specific operations
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 12))
  return !operationType.includes('unauthorized')
}

// Setup function to initialize test environment
export function setupQualityTests(): void {
  console.error('🏥 Quality test environment initialized')
  console.error('   - Healthcare compliance mode enabled')
  console.error('   - LGPD validation enabled')
  console.error('   - Audit logging enabled')
}
