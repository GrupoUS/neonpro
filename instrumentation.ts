// This file is used to initialize instrumentation in Next.js 15
// Optimized for serverless performance with conditional loading
// VITEST AND BIOME OPTIMIZED VERSION

export async function register() {
  // Temporarily disabled - observability setup not yet implemented
  return;

  // Only enable instrumentation in production for performance monitoring
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // Initialize OpenTelemetry only if explicitly enabled
    if (process.env.OTEL_ENABLED === 'true') {
      const { SimpleTelemetry } = await import(
        './lib/observability/opentelemetry-setup'
      );
      await SimpleTelemetry.initialize();
    }
  } catch (_error) {
    // Don't throw - allow app to continue without instrumentation
  }
}
