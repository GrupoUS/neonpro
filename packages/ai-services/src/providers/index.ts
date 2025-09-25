// Unified AI Provider Interfaces and Implementations
export * from './base-ai-provider.js';
export * from './provider-factory.js';
export * from './openai-provider.js';
export * from './anthropic-provider.js';
export * from './google-ai-provider.js';

// Re-export the old base provider for backward compatibility
export * from './base-provider.js';

// Main exports
export {
  // Factory
  AIProviderFactory,
  type ProviderFactoryConfig,
  type ProviderRegistry,
  type FallbackConfig,
  type ProviderSelectionCriteria,
  
  // Base classes
  BaseAIProvider,
  type IUnifiedAIProvider,
  type ProviderConfig,
  type ProviderCapabilities,
  type ProviderHealth,
  type ProviderStats,
  
  // Response types
  type CompletionResponse,
  type CompletionChunk,
  type CompletionOptions,
  type ImageAnalysisResponse,
  type ImageAnalysisOptions,
  type TokenUsage,
  type Tool,
  type ToolCall,
  
  // Healthcare compliance
  type HealthcareComplianceConfig,
} from './base-ai-provider.js';

// Provider implementations
export {
  OpenAIProvider,
  AnthropicProvider,
  GoogleAIProvider,
} from './base-ai-provider.js';

/**
 * Create a provider instance with factory
 */
export { createProvider } from './provider-factory';

/**
 * Default provider factory instance
 */
export const providerFactory = AIProviderFactory.getInstance();