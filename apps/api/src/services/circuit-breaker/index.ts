/**
 * Circuit Breaker Package Index
 * T084 - External Service Reliability Package
 *
 * Main exports for circuit breaker functionality including:
 * - Core circuit breaker service
 * - Health checking system
 * - Integration examples
 * - Healthcare compliance features
 */

// Core circuit breaker service
export {
  CircuitBreakerService,
  CircuitBreakerRegistry,
  CircuitBreakerConfig,
  CircuitBreakerMetrics,
  CircuitState,
  HealthStatus,
  RequestContext,
  CircuitBreakerEvent,
  HEALTHCARE_CIRCUIT_CONFIG,
  STANDARD_CIRCUIT_CONFIG,
  createCircuitBreaker,
  withCircuitBreaker,
} from './circuit-breaker-service';

// Health checking system
export {
  ExternalServiceHealthChecker,
  HealthCheckConfig,
  ServiceDependency,
  ComprehensiveHealthStatus,
  ServiceHealth,
  ServiceMetrics,
  HealthCheckEvent,
  HealthIncident,
  HEALTHCARE_HEALTH_CONFIG,
  STANDARD_HEALTH_CONFIG,
  createHealthChecker,
} from './health-checker';

// Integration examples and utilities
export {
  AguiServiceWithCircuitBreaker,
  GoogleCalendarServiceWithCircuitBreaker,
  AIAgentServiceWithCircuitBreaker,
  withCircuitBreakerProtection,
  setupHealthMonitoring,
} from './integration-example';

// Default exports
export { default as CircuitBreakerService } from './circuit-breaker-service';
export { default as ExternalServiceHealthChecker } from './health-checker';

// Package version and info
export const CIRCUIT_BREAKER_VERSION = '1.0.0';
export const CIRCUIT_BREAKER_DESCRIPTION = 'Healthcare-compliant circuit breaker patterns for external service reliability';