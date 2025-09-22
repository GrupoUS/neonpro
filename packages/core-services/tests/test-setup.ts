/**
 * Test Setup for AI Service Logging Tests
 * Extends test setup with AI-specific logging configurations
 */

import { vi } from 'vitest';

// Mock console methods globally for all AI service tests
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});

// Store original console methods for restoration
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// Test environment setup
export const setupAIServiceLoggingTests = () => {
  // Clear all mock calls before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore original console methods after all tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    mockConsoleLog,
    mockConsoleError,
    mockConsoleWarn,
    mockConsoleInfo,
    originalConsole
  };
};

// AI-specific test utilities
export const aiTestUtils = {
  // Check for AI model API keys in logs
  hasAiApiKeyExposure: (output: string[][]) => {
    const apiKeyPatterns = [
      'sk-ant-api', // Anthropic
      'sk-', // OpenAI/Sklearn
      'AIza', // Google AI
      'pk__, // Stripe-like patterns
      'live__, // Live keys
      'test__, // Test keys
      'api_key_,
      'secret_key_,
      'anthropic',
      'openai',
      'google'
    ];

    return output.some(log => 
      apiKeyPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  // Check for patient data in AI prompts/responses
  hasPatientDataInAiLogs: (output: string[][]) => {
    const patientDataPatterns = [
      // Common medical terms
      'diabetes',
      'hypertension',
      'cancer',
      'heart disease',
      'stroke',
      // Medical procedures
      'surgery',
      'chemotherapy',
      'radiation',
      'dialysis',
      // Medications
      'metformin',
      'lisinopril',
      'atorvastatin',
      'insulin',
      // Patient demographics
      'years old',
      'age',
      'gender',
      'male/female',
      // Vitals
      'blood pressure',
      'heart rate',
      'temperature',
      'oxygen saturation'
    ];

    return output.some(log => 
      patientDataPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  // Check for AI model configuration exposure
  hasAiConfigExposure: (output: string[][]) => {
    const configPatterns = [
      'temperature',
      'max_tokens_,
      'model',
      'prompt',
      'system_prompt_,
      'gpt-',
      'claude-',
      'gemini-',
      'top_p_,
      'frequency_penalty_,
      'presence_penalty_
    ];

    return output.some(log => 
      configPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  // Check for AI billing/cost information
  hasAiBillingData: (output: string[][]) => {
    const billingPatterns = [
      'cost',
      'price',
      'billing',
      'invoice',
      'payment',
      'subscription',
      'usage',
      'tokens',
      'requests',
      'dollars',
      'usd',
      'credits'
    ];

    return output.some(log => 
      billingPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  // Check for AI performance metrics
  hasAiPerformanceMetrics: (output: string[][]) => {
    const metricPatterns = [
      'latency',
      'response_time_,
      'processing_time_,
      'accuracy',
      'confidence',
      'score',
      'probability',
      'prediction',
      'classification',
      'model_version_,
      'deploy_id_
    ];

    return output.some(log => 
      metricPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  // Check for structured AI logging
  hasStructuredAiLogging: (output: string[][]) => {
    const requiredFields = [
      'aiModel',
      'requestId',
      'timestamp',
      'processingTime',
      'tokensUsed',
      'cost',
      'success',
      'metadata'
    ];

    return output.some(call => {
      const logStr = JSON.stringify(call);
      return requiredFields.some(field => logStr.includes(field));
    });
  },

  // Check for AI service integration details
  hasAiIntegrationDetails: (output: string[][]) => {
    const integrationPatterns = [
      'endpoint',
      'api_url_,
      'base_url_,
      'webhook',
      'callback',
      'integration',
      'connector',
      'adapter',
      'service_url_,
      'api_endpoint_
    ];

    return output.some(log => 
      integrationPatterns.some(pattern => 
        JSON.stringify(log).toLowerCase().includes(pattern.toLowerCase())
      )
    );
  },

  getConsoleOutput: () => ({
    logs: mockConsoleLog.mock.calls,
    errors: mockConsoleError.mock.calls,
    warnings: mockConsoleWarn.mock.calls,
    info: mockConsoleInfo.mock.calls
  }),

  resetConsoleMocks: () => {
    mockConsoleLog.mockReset();
    mockConsoleError.mockReset();
    mockConsoleWarn.mockReset();
    mockConsoleInfo.mockReset();
  }
};