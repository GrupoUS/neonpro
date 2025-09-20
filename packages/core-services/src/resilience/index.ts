/**
 * Resilience Framework exports
 * Comprehensive resilience patterns for healthcare systems
 */

export {
  ResilienceFramework,
  EnhancedCircuitBreaker,
  RetryPolicy,
  TimeoutManager,
  HealthMonitor,
  ResilienceError,
  CircuitState,
  RetryStrategy,
  DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
  EMERGENCY_RESILIENCE_CONFIG,
  type ResilienceConfig,
  type ServiceHealth,
  type ResilienceMetrics,
  type ExecutionContext,
  ResilienceConfigSchema
} from './resilience-framework';

export {
  HealthcareResilienceService,
  DEFAULT_HEALTHCARE_RESILIENCE_SERVICE_CONFIG,
  type HealthcareExecutionContext,
  type HealthcareResilienceConfig
} from './healthcare-resilience-service';