// This file is used to initialize instrumentation in Next.js 15
// Optimized for serverless performance with conditional loading
// VITEST AND BIOME OPTIMIZED VERSION

export async function register() {
  // Only enable instrumentation in production for performance monitoring
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Skipping instrumentation in development mode');
    return;
  }

  try {
    console.log('🔧 Registering NeonPro instrumentation...');
    
    // Initialize OpenTelemetry only if explicitly enabled
    if (process.env.OTEL_ENABLED === 'true') {
      const { SimpleTelemetry } = await import('./lib/observability/opentelemetry-setup');
      await SimpleTelemetry.initialize();
      console.log('🔧 OpenTelemetry initialized');
    }
    
    console.log('🔧 Instrumentation initialized successfully');
  } catch (error) {
    console.error('🚨 Instrumentation failed:', error);
    // Don't throw - allow app to continue without instrumentation
  }
}
