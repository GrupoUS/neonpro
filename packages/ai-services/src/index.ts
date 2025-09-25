// NeonPro Unified AI Services
// Healthcare-optimized AI provider management system

// Main exports
export * from './providers/index.js';
export * from './services/index.js';

// AI Management (absorbed from ai-providers)
export * from './services/ai-management/pii-redaction.js';
export * from './services/ai-management/ai-service-management.js';
export * from './types/ai-management.js';

// Types and interfaces
export type {
  // Provider interfaces
  IUnifiedAIProvider,
  ProviderConfig,
  ProviderCapabilities,
  ProviderHealth,
  ProviderStats,
  
  // Response types
  CompletionResponse,
  CompletionChunk,
  CompletionOptions,
  ImageAnalysisResponse,
  ImageAnalysisOptions,
  TokenUsage,
  Tool,
  ToolCall,
  
  // Healthcare compliance
  HealthcareComplianceConfig,
  
  // Service types (temporarily commented for consolidation)
  // ProviderManagementConfig,
  // ProviderMetrics,
  // ProviderAlert,
  // HealthcareContext,
  // ComplianceCheckResult,
  // ComplianceViolation,
  // ComplianceAuditLog,
  // PIIType,
  // PIIRedactionStrategy,
  // ViolationSeverity,
  // BrazilianRegulatoryFramework,
} from './providers/index.js';

// Provider implementations
export {
  OpenAIProvider,
  AnthropicProvider,
  GoogleAIProvider,
  BaseAIProvider,
} from './providers/index.js';

// Factory and management
export {
  AIProviderFactory,
  providerFactory,
  createProvider,
} from './providers/index.js';

// Services
export {
  ProviderManagementService,
  HealthcareComplianceService,
  providerManagementService,
  healthcareComplianceService,
} from './services/index.js';

// Enums (temporarily commented during consolidation)
// export {
//   AlertLevel,
//   AlertType,
// } from './services/index.js';

/**
 * Initialize AI services with default configuration
 */
// Temporarily disabled during consolidation
// export function initializeAIServices(config?: {
//   providerFactory?: any;
//   providerManagement?: any;
//   healthcareCompliance?: any;
// }) {
//   if (config?.providerFactory) {
//     AIProviderFactory.getInstance(config.providerFactory);
//   }
//
//   if (config?.providerManagement) {
//     ProviderManagementService.getInstance(
//       AIProviderFactory.getInstance(),
//       config.providerManagement
//     );
//   }
//
//   if (config?.healthcareCompliance) {
//     HealthcareComplianceService.getInstance(config.healthcareCompliance);
//   }
//
//   return {
//     providerFactory: AIProviderFactory.getInstance(),
//     providerManagement: ProviderManagementService.getInstance(),
//     healthcareCompliance: HealthcareComplianceService.getInstance(),
//   };
// }

/**
 * Get dashboard data for monitoring
 * Temporarily disabled during consolidation
 */
// export function getAIDashboardData() {
//   return {
//     providers: providerManagementService.getDashboardData(),
//     compliance: healthcareComplianceService.getComplianceStats(),
//   };
// }