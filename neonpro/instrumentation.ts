// This file is used to initialize instrumentation in Next.js 15
// Optimized for serverless performance with conditional loading
// TEMPORARILY DISABLED TO FIX OPENTELEMETRY MODULE ERROR

export async function register() {
  // Temporarily disabled to fix OpenTelemetry module error
  console.log('🔧 Instrumentation temporarily disabled');
  return;
  
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Skip instrumentation in development for faster cold starts
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Skipping instrumentation in development mode');
        return;
      }
      
      console.log('🔧 Registering NeonPro instrumentation...')
      
      // Initialize OpenTelemetry only if explicitly enabled
      if (process.env.OTEL_ENABLED === 'true') {
        const { SimpleTelemetry } = await import('./lib/observability/opentelemetry-setup');
        await SimpleTelemetry.initialize();
        console.log('🔧 OpenTelemetry initialized');
      }
      
      // Initialize Sentry only in production
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        const { initSentry } = await import('./lib/observability/sentry-setup');
        initSentry();
        console.log('🔧 Sentry initialized');
      }
      
    } catch (error) {
      console.error('🚨 Instrumentation failed:', error);
      // Don't throw - allow app to continue without instrumentation
    }
  }
  */
}