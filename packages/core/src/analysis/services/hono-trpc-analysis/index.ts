// Hono + tRPC v11 Edge-First Architecture Analysis Service
// Brazilian Healthcare Compliance Focused
// OXLint Optimized for 50-100x Performance Improvement

export * from './edge-performance-analysis.service.js';
export * from './trpc-type-safety-analysis.service.js';
export * from './concurrent-request-handling-analysis.service.js';
export * from './error-boundary-pattern-analysis.service.js';
export * from './middleware-integration-pattern-analysis.service.js';
export * from './route-optimization-analysis.service.js';
export * from './type-propagation-analysis.service.js';
export * from './server-client-type-synchronization-analysis.service.js';
export * from './performance-benchmarking.service.js';
export * from './edge-deployment-pattern-analysis.service.js';

// Main service orchestrator
export { HonoTrpcAnalysisService } from './hono-trpc-analysis.service.js';

export type {
  EdgePerformanceAnalysisResult,
  TrpcTypeSafetyAnalysisResult,
  ConcurrentRequestHandlingAnalysisResult,
  ErrorBoundaryPatternAnalysisResult,
  MiddlewareIntegrationPatternAnalysisResult,
  RouteOptimizationAnalysisResult,
  TypePropagationAnalysisResult,
  ServerClientTypeSynchronizationAnalysisResult,
  PerformanceBenchmarkingResult,
  EdgeDeploymentPatternAnalysisResult,
  HonoTrpcAnalysisServiceResult,
} from './types/hono-trpc-analysis.types.js';