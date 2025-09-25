/**
 * AI Providers Package Entry Point
 *
 * Comprehensive AI provider management for healthcare applications
 * with LGPD compliance and specialized healthcare features
 */

// Types
export type {
  AIProvider,
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  HealthcareAuditEvent,
  HealthcareJobContext,
  HealthcareJobType,
  JobData,
  JobHandler,
  JobHandlerFunction,
  JobQueue,
  StreamChunk,
  WorkerConfig,
} from './types/index.js'

// Providers
export { AnthropicProvider } from './providers/anthropic-provider.js'
export { GoogleAIProvider } from './providers/google-provider.js'
export { OpenAIProvider } from './providers/openai-provider.js'

// Services
export { AIServiceManagement, aiServiceManagement } from './services/ai-service-management.js'
export { AIService } from './services/AIService.js'
export { PIIRedactionService } from './services/pii-redaction.js'

// Utility functions
export async function checkAIServiceHealth() {
  const { checkAIServiceHealth } = await import('./services/ai-service-management.js')
  return checkAIServiceHealth()
}

export async function checkModelAvailability(provider?: string, model?: string) {
  const { checkModelAvailability } = await import('./services/ai-service-management.js')
  return checkModelAvailability(provider, model)
}

export async function getAIUsageStats(provider?: string, period?: { start: Date; end: Date }) {
  const { getAIUsageStats } = await import('./services/ai-service-management.js')
  return getAIUsageStats(provider, period)
}

// Provider creation helpers
export function createOpenAIProvider(apiKey: string, options?: any) {
  const { createOpenAIProvider } = require('./providers/openai-provider.js')
  return createOpenAIProvider(apiKey, options)
}

// Version information
export const AI_PROVIDERS_VERSION = '1.0.0'
export const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'mock'] as const

// Default configurations
export const DEFAULT_AI_CONFIG = {
  openai: {
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.1,
  },
  anthropic: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    temperature: 0.7,
  },
  google: {
    model: 'gemini-1.5-pro-latest',
    maxOutputTokens: 4096,
    temperature: 0.7,
  },
} as const
