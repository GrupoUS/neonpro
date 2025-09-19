export {
  HealthcareTelemetryManager,
  HealthcareSpanAttributes,
  HealthcareOperations,
  createHealthcareTelemetryManager,
  initializeGlobalTelemetry,
  getGlobalTelemetryManager,
  shutdownGlobalTelemetry,
  TELEMETRY_CONFIGS,
} from './opentelemetry-config';

export type {
  HealthcareTelemetryConfig,
} from './opentelemetry-config';

// Re-export specific OpenTelemetry utilities for convenience
export type {
  Span,
  SpanContext,
  SpanStatusCode,
  TraceFlags,
  Tracer,
  TracerProvider,
  Sampler,
  SamplingDecision,
  SamplingResult,
  DiagLogger,
} from '@opentelemetry/api';

export type {
  Meter,
  MeterProvider,
  Counter,
  Histogram,
  UpDownCounter,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
} from '@opentelemetry/api';

export type {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

export {
  trace,
  context,
  diag,
} from '@opentelemetry/api';