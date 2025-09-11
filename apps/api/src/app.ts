import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getEnvironmentInfo, getDetailedEnvironmentInfo, validateEnvironment } from './lib/env-validation';
import { initializeErrorTracking } from './lib/error-tracking';
import { logger } from './lib/logger';
import { getErrorTrackingMiddlewareStack } from './middleware/error-tracking-middleware';
import {
  errorLoggingMiddleware,
  loggingMiddleware,
  performanceLoggingMiddleware,
  securityLoggingMiddleware,
} from './middleware/logging-middleware';
import appointments from './routes/appointments';
import auth from './routes/auth';
import clients from './routes/clients';
import metricsApi from './routes/metrics';
import { createOpenAPIApp, setupOpenAPIDocumentation } from './schemas/openapi-config';
import {
  apiInfoRoute,
  authStatusRoute,
  detailedHealthRoute,
  getClientAppointmentsRoute,
  getClientByIdRoute,
  healthRoute,
  listAppointmentsRoute,
  listClientsRoute,
} from './schemas/openapi-routes';

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
initializeErrorTracking().catch(error => {
  logger.warn('Error tracking initialization failed', { error: error.message });
});

logger.info('NeonPro API starting', {
  environment: process.env.NODE_ENV,
  version: '1.0.0',
  region: process.env.VERCEL_REGION,
});

// Minimal Hono application exported for Vercel handler consumption.
// Note: Vercel rewrites '/api/*' to this function, so no basePath needed
const app = createOpenAPIApp();

// CORS configuration
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://neonpro.vercel.app', 'https://your-app.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-Request-ID'],
  }),
);

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

// Root route with OpenAPI definition
app.openapi(healthRoute, c =>
  c.json({
    status: 'ok',
  }));

// Basic health check for backward compatibility
app.get('/health', c => c.json({ status: 'ok' }));

// Versioned router group with OpenAPI routes
const v1 = new Hono();

// OpenAPI-documented health route
app.openapi(detailedHealthRoute, c =>
  c.json({
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: getEnvironmentInfo(),
  }));

// OpenAPI-documented info route
app.openapi(apiInfoRoute, c =>
  c.json({
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
  }));

// OpenAPI-documented auth status route
app.openapi(authStatusRoute, c =>
  c.json({
    status: 'ok',
    feature: 'auth',
  }));

// OpenAPI-documented client routes
app.openapi(listClientsRoute, c =>
  c.json({
    items: [
      {
        id: 'client_001',
        fullName: 'João Silva',
        email: 'j***@email.com',
        phonePrimary: '+55 11 *****-****',
        lgpdConsentGiven: true,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        clinic: {
          id: 'clinic_001',
          name: 'Clínica Exemplo'
        }
      },
    ],
  }));

app.openapi(getClientByIdRoute, c =>
  c.json({
    client: {
      id: 'patient_001',
      fullName: 'João Silva',
      email: 'joao.silva@email.com',
      phonePrimary: '+55 11 99999-9999',
      lgpdConsentGiven: true,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      clinic: {
        id: 'clinic_001',
        name: 'Clínica Exemplo'
      }
    },
  }));

// OpenAPI-documented appointment routes
app.openapi(listAppointmentsRoute, c =>
  c.json({
    items: [
      {
        id: 'appt_001',
        startTime: '2024-02-15T14:30:00Z',
        endTime: '2024-02-15T15:30:00Z',
        status: 'scheduled',
        client: {
          id: 'client_001',
          fullName: 'João Silva',
          email: 'j***@email.com',
          phonePrimary: '+55 11 *****-****',
          lgpdConsentGiven: true,
        },
        clinic: {
          id: 'clinic_001',
          name: 'Clínica Exemplo'
        },
        professional: {
          id: 'prof_001',
          fullName: 'Dra. Maria Silva',
          specialization: 'Dermatologia'
        }
      },
    ],
  }));

app.openapi(getClientAppointmentsRoute, c =>
  c.json({
    items: [
      {
        id: 'appt_001',
        startTime: '2024-02-15T14:30:00Z',
        endTime: '2024-02-15T15:30:00Z',
        status: 'scheduled',
        client: {
          id: 'client_001',
          fullName: 'João Silva',
          email: 'j***@email.com',
          phonePrimary: '+55 11 *****-****',
          lgpdConsentGiven: true,
        },
        clinic: {
          id: 'clinic_001',
          name: 'Clínica Exemplo'
        },
        professional: {
          id: 'prof_001',
          fullName: 'Dra. Maria Silva',
          specialization: 'Dermatologia'
        }
      },
    ],
  }));

// Standard v1 routes for backward compatibility
v1.get('/health', c =>
  c.json({
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: getDetailedEnvironmentInfo(),
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

// Keep existing route handlers for backward compatibility
v1.route('/auth', auth);
v1.route('/clients', clients);
v1.route('/appointments', appointments);
v1.route('/metrics', metricsApi);

app.route('/v1', v1);

// Setup OpenAPI documentation endpoints
setupOpenAPIDocumentation(app);

// Export for Vercel deployment (Official Hono + Vercel Pattern)
// This allows Vercel to automatically convert Hono routes to Vercel Functions
export default app;
