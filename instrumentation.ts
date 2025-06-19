// NEONPRO OpenTelemetry Instrumentation
// Migrated to @vercel/otel for better Vercel compatibility
// Replaces manual OpenTelemetry configuration

import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'neonpro',
    traceExporter: 'auto',
    spanProcessors: ['auto'],
  });
}
