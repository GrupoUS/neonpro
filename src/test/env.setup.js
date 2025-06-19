/**
 * Environment Setup for Jest Testing
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 * 
 * Sets up environment variables for testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JAEGER_ENDPOINT = 'http://localhost:14268/api/traces';
process.env.OTEL_SERVICE_NAME = 'neonpro-test';
process.env.OTEL_SERVICE_VERSION = '1.0.0-test';
process.env.OTEL_SAMPLING_RATE = '1.0';
process.env.OTEL_AUTO_INSTRUMENTATION = 'false';
process.env.OTEL_METRICS = 'false';
process.env.OTEL_LOGGING = 'false';
