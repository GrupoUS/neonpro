// Config package exports
export {
  AI_MODEL_CONFIG,
  AI_PROVIDER,
  aiConfig,
  ANTHROPIC_API_KEY,
  GOOGLE_AI_API_KEY,
  OPENAI_API_KEY,
} from './ai'
export { AI_ENV } from './env'
export { getPreferredModel, PLAN_CONFIG, validateFeatureAccess, validateModelAccess } from './plans'
export { QUOTA_CONFIGURATION } from './quotas'

// Validation schemas (consolidated from schemas package)
export * from './schemas'

// Placeholder exports - will be populated with actual configuration
export const complianceConfig = {}
export const governanceConfig = {}
