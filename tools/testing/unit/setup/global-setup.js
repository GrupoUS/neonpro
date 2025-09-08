// Global Healthcare Testing Setup for NeonPro
// LGPD, ANVISA, and CFM compliance global configuration

import { setupHealthcareEnvironment, } from './test-env.js'

// Global setup executed before all tests
export default async () => {
  // Setup healthcare environment variables
  await setupHealthcareEnvironment()

  // Setup LGPD compliance test environment
  setupLGPDGlobals()

  // Setup ANVISA test environment
  setupANVISAGlobals()

  // Setup CFM test environment
  setupCFMGlobals()

  // Setup database test environment
  await setupDatabaseGlobals()
}

function setupLGPDGlobals() {
  // Set LGPD compliance test flags
  process.env.LGPD_TEST_MODE = 'true'
  process.env.DATA_PROTECTION_LEVEL = 'maximum'
}

function setupANVISAGlobals() {
  // Set ANVISA compliance test flags
  process.env.ANVISA_TEST_MODE = 'true'
  process.env.MEDICAL_DEVICE_VALIDATION = 'enabled'
}

function setupCFMGlobals() {
  // Set CFM compliance test flags
  process.env.CFM_TEST_MODE = 'true'
  process.env.PROFESSIONAL_VALIDATION = 'enabled'
}

async function setupDatabaseGlobals() {
  // Setup test database configuration
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'test-db-url'
  process.env.SUPABASE_TEST_MODE = 'true'
}
