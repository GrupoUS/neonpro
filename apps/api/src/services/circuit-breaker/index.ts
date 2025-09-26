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
  CircuitBreakerConfig,
  CircuitBreakerEvent,
  CircuitBreakerMetrics,
  CircuitBreakerRegistry,
  CircuitBreakerService,
  CircuitState,
  createCircuitBreaker,
  HEALTHCARE_CIRCUIT_CONFIG,
  HealthStatus,
  RequestContext,
  STANDARD_CIRCUIT_CONFIG,
  withCircuitBreaker,
} from './circuit-breaker-service'

// Health checking system
export {
  ComprehensiveHealthStatus,
  createHealthChecker,
  ExternalServiceHealthChecker,
  HEALTHCARE_HEALTH_CONFIG,
  HealthCheckConfig,
  HealthCheckEvent,
  HealthIncident,
  ServiceDependency,
  ServiceHealth,
  ServiceMetrics,
  STANDARD_HEALTH_CONFIG,
} from './health-checker'

// Integration examples and utilities
export {
  AguiServiceWithCircuitBreaker,
  AIAgentServiceWithCircuitBreaker,
  GoogleCalendarServiceWithCircuitBreaker,
  setupHealthMonitoring,
  withCircuitBreakerProtection,
} from './integration-example'



// Package version and info
export const CIRCUIT_BREAKER_VERSION = '1.0.0'
export const CIRCUIT_BREAKER_DESCRIPTION =
  'Healthcare-compliant circuit breaker patterns for external service reliability'
