export {
  createHealthcareTelemetryManager,
  getGlobalTelemetryManager,
  HealthcareOperations,
  HealthcareSpanAttributes,
  HealthcareTelemetryManager,
  initializeGlobalTelemetry,
  shutdownGlobalTelemetry,
  TELEMETRY_CONFIGS,
} from './opentelemetry-config';

export type { HealthcareTelemetryConfig } from './opentelemetry-config';

// Re-export specific OpenTelemetry utilities for convenience
export type {
  DiagLogger,
  Sampler,
  SamplingDecision,
  SamplingResult,
  Span,
  SpanContext,
  SpanStatusCode,
  TraceFlags,
  Tracer,
  TracerProvider,
} from '@opentelemetry/api';

export type {
  Counter,
  Histogram,
  Meter,
  MeterProvider,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
} from '@opentelemetry/api';

export type {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

export { context, diag, trace } from '@opentelemetry/api';
