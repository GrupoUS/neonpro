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

// Re-export specific OpenTelemetry utilities for convenience
export {
  trace,
  context,
  Span,
  SpanContext,
  SpanStatusCode,
  TraceFlags,
  Tracer,
  TracerProvider,
  Sampler,
  SamplingDecision,
  SamplingResult,
  diag,
  DiagLogger,
} from '@opentelemetry/api';

export {
  Meter,
  MeterProvider,
  Counter,
  Histogram,
  UpDownCounter,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
} from '@opentelemetry/api';

export {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';