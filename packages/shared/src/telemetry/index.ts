export {
  HealthcareTelemetryManager,
  HealthcareTelemetryConfig,
  HealthcareSpanAttributes,
  HealthcareOperations,
  createHealthcareTelemetryManager,
  initializeGlobalTelemetry,
  getGlobalTelemetryManager,
  shutdownGlobalTelemetry,
  TELEMETRY_CONFIGS,
} from './opentelemetry-config';

// Re-export common OpenTelemetry utilities for convenience
export * from '@opentelemetry/api';
export * from '@opentelemetry/sdk-trace-base';
export * from '@opentelemetry/sdk-metrics';