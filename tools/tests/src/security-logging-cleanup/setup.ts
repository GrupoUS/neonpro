/**
 * Global Setup for Security Logging Cleanup Tests
 * 
 * This file provides global setup for all RED phase test scenarios,
 * ensuring consistent test environment and configuration.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Global test configuration
export const testConfig = {
  // Test timeouts
  timeouts: {
    test: 30000,
    hook: 10000,
    assertion: 5000
  },
  
  // Mock configuration
  mocks: {
    console: true,
    timers: true,
    network: false
  },
  
  // Security test data
  securityTestData: {
    sampleUserData: {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    },
    
    sampleSensitiveData: {
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      phone: '(11) 99999-8888',
      address: 'Rua Teste, 123'
    },
    
    sampleMedicalData: {
      patientId: 'PAT-123456',
      diagnosis: 'Test Diagnosis',
      medication: 'Test Medication',
      dosage: 'Test Dosage'
    }
  },
  
  // Compliance test scenarios
  complianceScenarios: {
    lgpd: {
      dataSubjectRequest: {
        id: 'LGPD-REQ-001',
        type: 'access',
        subjectId: 'PAT-123456',
        status: 'pending'
      },
      
      dataBreach: {
        id: 'BREACH-001',
        affectedRecords: 150,
        severity: 'high',
        reportedToANPD: false
      }
    },
    
    anvisa: {
      medicalDevice: {
        id: 'MD-2024-BRA-001234',
        type: 'ventilator',
        serialNumber: 'SN-001234',
        status: 'active'
      },
      
      adverseEvent: {
        id: 'AE-2024-001',
        medication: 'Test Medication',
        reaction: 'Test Reaction',
        severity: 'severe'
      }
    },
    
    cfm: {
      professional: {
        crm: 'CRM-SP-12345',
        name: 'Dr. Test Silva',
        specialty: 'Testologia'
      },
      
      telemedicineSession: {
        id: 'TELEMED-2024-001',
        professionalId: 'CRM-SP-12345',
        patientId: 'PAT-123456',
        duration: 45
      }
    }
  }
}

// Global setup function
export function setupTests() {
  beforeAll(() => {
    // Set up global test environment
    console.log('🧪 Setting up Security Logging Cleanup Tests Environment')
    
    // Set environment variables for testing
    process.env.NODE_ENV = 'test'
    process.env.LOG_LEVEL = 'debug'
    process.env.TEST_MODE = 'true'
    
    // Configure global test timeouts
    vi.setConfig({
      testTimeout: testConfig.timeouts.test,
      hookTimeout: testConfig.timeouts.hook
    })
  })
  
  afterAll(() => {
    // Clean up global test environment
    console.log('🧹 Cleaning up Security Logging Cleanup Tests Environment')
    
    // Restore environment variables
    delete process.env.NODE_ENV
    delete process.env.LOG_LEVEL
    delete process.env.TEST_MODE
    
    // Clear all mocks
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  
  beforeEach(() => {
    // Set up before each test
    vi.clearAllMocks()
    vi.restoreAllMocks()
    
    // Reset console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    }
    
    // Mock console methods to detect usage
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })
  
  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks()
  })
}

// Test utilities
export const testUtils = {
  /**
   * Create mock console spy for detecting console usage
   */
  createConsoleSpy() {
    return {
      log: vi.spyOn(console, 'log'),
      error: vi.spyOn(console, 'error'),
      warn: vi.spyOn(console, 'warn'),
      info: vi.spyOn(console, 'info'),
      debug: vi.spyOn(console, 'debug')
    }
  },
  
  /**
   * Reset all console mocks
   */
  resetConsoleMocks() {
    vi.mocked(console.log).mockReset()
    vi.mocked(console.error).mockReset()
    vi.mocked(console.warn).mockReset()
    vi.mocked(console.info).mockReset()
    vi.mocked(console.debug).mockReset()
  },
  
  /**
   * Get test data for specific scenarios
   */
  getTestData(type: 'user' | 'sensitive' | 'medical') {
    switch (type) {
      case 'user':
        return testConfig.securityTestData.sampleUserData
      case 'sensitive':
        return testConfig.securityTestData.sampleSensitiveData
      case 'medical':
        return testConfig.securityTestData.sampleMedicalData
      default:
        throw new Error(`Unknown test data type: ${type}`)
    }
  },
  
  /**
   * Get compliance test scenarios
   */
  getComplianceScenario(framework: 'lgpd' | 'anvisa' | 'cfm', scenario: string) {
    const scenarios = testConfig.complianceScenarios[framework]
    if (!scenarios[scenario as keyof typeof scenarios]) {
      throw new Error(`Unknown ${framework.toUpperCase()} scenario: ${scenario}`)
    }
    return scenarios[scenario as keyof typeof scenarios]
  },
  
  /**
   * Create test timeout promise
   */
  createTimeout(timeout: number = 5000): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timed out')), timeout)
    })
  },
  
  /**
   * Retry function for flaky tests
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 100
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('Max retries exceeded')
  }
}

// Export global setup
export default setupTests

// Global test extensions
declare module 'vitest' {
  export interface TestContext {
    testConfig: typeof testConfig
    testUtils: typeof testUtils
  }
}