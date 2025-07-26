// This file is used to initialize instrumentation in Next.js 15
// Optimized for serverless performance with conditional loading

export async function register() {
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
      
      // Initialize intelligent error handler (lightweight)
      try {
        const { intelligentErrorHandler } = await import('./lib/error-handling/intelligent-error-handler');
        console.log('🔧 Intelligent error handler initialized');
      } catch (error) {
        // Gracefully handle missing error handler
        console.warn('⚠️ Error handler not available:', error.message);
      }
      
      // Sentry instrumentation for production only
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        try {
          await import('./lib/sentry');
          console.log('🔧 Sentry initialized');
        } catch (error) {
          console.warn('⚠️ Sentry initialization failed:', error.message);
        }
      }
      
      console.log('✅ NeonPro instrumentation registered successfully')
    } catch (error) {
      console.error('❌ Failed to register instrumentation:', error)
      // Don't throw - allow app to continue without instrumentation
    }
  }
}
