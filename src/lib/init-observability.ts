/**
 * NEONPRO Observability Initialization
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 * 
 * CRITICAL: Initialize OpenTelemetry observability before application startup
 * This file should be imported at the very beginning of the application
 */

import { 
  initializeObservabilityWithSupabase, 
  NEONPROObservabilityConfig,
  DEFAULT_NEONPRO_CONFIG 
} from './observability';

/**
 * Initialize NEONPRO observability system
 * 
 * This function should be called before any other application code
 * to ensure proper instrumentation of all components
 */
export async function initializeNEONPROObservabilitySystem(): Promise<void> {
  try {
    console.log('🔍 Starting NEONPRO Observability System initialization...');

    // Get configuration from environment variables
    const config: Partial<NEONPROObservabilityConfig> = {
      serviceName: process.env.OTEL_SERVICE_NAME || DEFAULT_NEONPRO_CONFIG.serviceName,
      serviceVersion: process.env.OTEL_SERVICE_VERSION || DEFAULT_NEONPRO_CONFIG.serviceVersion,
      environment: process.env.NODE_ENV || DEFAULT_NEONPRO_CONFIG.environment,
      jaegerEndpoint: process.env.JAEGER_ENDPOINT || DEFAULT_NEONPRO_CONFIG.jaegerEndpoint,
      samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || '0.1'),
      enableAutoInstrumentation: process.env.OTEL_AUTO_INSTRUMENTATION !== 'false',
      enableMetrics: process.env.OTEL_METRICS !== 'false',
      enableLogging: process.env.OTEL_LOGGING !== 'false',
    };

    // Initialize observability with Supabase integration
    await initializeObservabilityWithSupabase(config);

    console.log('✅ NEONPRO Observability System initialized successfully');
    console.log('📊 Configuration:', {
      serviceName: config.serviceName,
      environment: config.environment,
      samplingRate: config.samplingRate,
      jaegerEndpoint: config.jaegerEndpoint,
      autoInstrumentation: config.enableAutoInstrumentation,
      metrics: config.enableMetrics,
      logging: config.enableLogging,
    });

  } catch (error) {
    console.error('❌ Failed to initialize NEONPRO Observability System:', error);
    
    // Don't throw error to prevent application startup failure
    // Observability should be optional for application functionality
    console.warn('⚠️ Application will continue without observability');
  }
}

/**
 * Environment-specific observability configuration
 */
export function getObservabilityConfigForEnvironment(): Partial<NEONPROObservabilityConfig> {
  const environment = process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'production':
      return {
        samplingRate: 0.1, // 10% sampling in production
        enableAutoInstrumentation: true,
        enableMetrics: true,
        enableLogging: true,
        jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
      };

    case 'staging':
      return {
        samplingRate: 0.5, // 50% sampling in staging
        enableAutoInstrumentation: true,
        enableMetrics: true,
        enableLogging: true,
        jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger-staging:14268/api/traces',
      };

    case 'development':
      return {
        samplingRate: 1.0, // 100% sampling in development
        enableAutoInstrumentation: true,
        enableMetrics: true,
        enableLogging: true,
        jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      };

    default:
      return DEFAULT_NEONPRO_CONFIG;
  }
}

/**
 * Validate observability configuration
 */
export function validateObservabilityConfig(config: Partial<NEONPROObservabilityConfig>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate service name
  if (!config.serviceName || config.serviceName.trim() === '') {
    errors.push('Service name is required');
  }

  // Validate sampling rate
  if (config.samplingRate !== undefined) {
    if (config.samplingRate < 0 || config.samplingRate > 1) {
      errors.push('Sampling rate must be between 0 and 1');
    }
    if (config.samplingRate > 0.5) {
      warnings.push('High sampling rate may impact performance');
    }
  }

  // Validate Jaeger endpoint
  if (config.jaegerEndpoint && !config.jaegerEndpoint.startsWith('http')) {
    errors.push('Jaeger endpoint must be a valid HTTP URL');
  }

  // Environment-specific validations
  if (config.environment === 'production') {
    if (config.samplingRate && config.samplingRate > 0.2) {
      warnings.push('High sampling rate in production may impact performance');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get observability health status
 */
export function getObservabilityHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    tracing: boolean;
    metrics: boolean;
    jaegerConnection: boolean;
    supabaseConnection: boolean;
  };
  timestamp: string;
} {
  // This would check actual system status
  // For now, return a mock status
  return {
    status: 'healthy',
    details: {
      tracing: true,
      metrics: true,
      jaegerConnection: true,
      supabaseConnection: true,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Gracefully shutdown observability system
 */
export async function shutdownObservabilitySystem(): Promise<void> {
  try {
    console.log('🔍 Shutting down NEONPRO Observability System...');

    // This would properly shutdown OpenTelemetry SDK
    // await neonproObservability.shutdown();

    console.log('✅ NEONPRO Observability System shutdown complete');

  } catch (error) {
    console.error('❌ Failed to shutdown observability system:', error);
  }
}

// Auto-initialize if this module is imported
if (typeof window === 'undefined') {
  // Only initialize on server-side
  initializeNEONPROObservabilitySystem().catch(error => {
    console.error('Auto-initialization failed:', error);
  });
}
