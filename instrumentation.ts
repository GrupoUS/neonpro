// This file is used to initialize instrumentation in Next.js 15
// Enhanced with intelligent error handling and optional OpenTelemetry

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      console.log('🔧 Registering NeonPro instrumentation...')
      
      // Initialize OpenTelemetry (only if enabled)
      const { SimpleTelemetry } = await import('./lib/observability/opentelemetry-setup');
      await SimpleTelemetry.initialize();
      
      // Initialize intelligent error handler
      const { intelligentErrorHandler } = await import('./lib/error-handling/intelligent-error-handler');
      console.log('🔧 Intelligent error handler initialized');
      
      // Sentry instrumentation disabled for development
      // await import('./lib/sentry')
      
      console.log('✅ NeonPro instrumentation registered successfully')
    } catch (error) {
      console.error('❌ Failed to register instrumentation:', error)
    }
  }
}
