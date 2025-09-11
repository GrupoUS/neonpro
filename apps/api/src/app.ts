import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getEnvironmentInfo, validateEnvironment } from './lib/env-validation';
import { initializeErrorTracking } from './lib/error-tracking';
import { logger } from './lib/logger';
import {
  errorLoggingMiddleware,
  loggingMiddleware,
  performanceLoggingMiddleware,
  securityLoggingMiddleware,
} from './middleware/logging-middleware';
import { getErrorTrackingMiddlewareStack } from './middleware/error-tracking-middleware';
import appointments from './routes/appointments';
import auth from './routes/auth';
import patients from './routes/patients';

// Validate environment at startup
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  logger.error('Environment validation failed', {
    errors: envValidation.errors,
    warnings: envValidation.warnings,
  });
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment configuration');
  }
}

if (envValidation.warnings.length > 0) {
  logger.warn('Environment validation warnings', {
    warnings: envValidation.warnings,
  });
}

// Initialize error tracking
initializeErrorTracking().catch((error) => {
  logger.warn('Error tracking initialization failed', { error: error.message });
});

logger.info('NeonPro API starting', {
  environment: process.env.NODE_ENV,
  version: '1.0.0',
  region: process.env.VERCEL_REGION,
});

// Minimal Hono application exported for Vercel handler consumption.
// Note: We use basePath('/api') so that requests rewritten from
// '/api/*' map cleanly to these routes.
const app = new Hono().basePath('/api');

// CORS configuration
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://neonpro.vercel.app', 'https://your-app.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-Request-ID'],
}));

// Apply middleware in order
// Error tracking middleware stack (includes context, performance, security, and error handling)
const errorTrackingStack = getErrorTrackingMiddlewareStack();
errorTrackingStack.forEach(middleware => app.use('*', middleware));

// Legacy logging middleware (for backward compatibility)
app.use('*', errorLoggingMiddleware());
app.use('*', securityLoggingMiddleware());
app.use('*', loggingMiddleware());

// Performance logging only in development/staging
if (process.env.NODE_ENV !== 'production') {
  app.use('*', performanceLoggingMiddleware());
}

app.get('/', c =>
  c.json({
    name: 'NeonPro API',
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    deployment: 'vercel-fixed',
  }));

// T011: Simplified health route for contract test; returns minimal object to satisfy test.
app.get('/health', c => c.json({ status: 'ok' }));

// Versioned router group
const v1 = new Hono();

v1.get('/health', c =>
  c.json({
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: getEnvironmentInfo(),
  }));

v1.get('/info', c =>
  c.json({
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
  }));

v1.route('/auth', auth);
v1.route('/patients', patients);
v1.route('/appointments', appointments);

app.route('/v1', v1);

// T012: OpenAPI route (minimal stub) - will be expanded later.
app.get(
  '/openapi.json',
  c => c.json({ openapi: '3.1.0', info: { title: 'NeonPro API', version: '0.1.0' } }),
);

export { app };
