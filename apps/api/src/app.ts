import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';
import chatRouter from './routes/chat';

// Import security and monitoring libraries
import security from '@neonpro/security';
import { initializeErrorTracking, errorTracker } from './lib/error-tracking';
import { initializeLogger, logger } from './lib/logger';

// Extract middleware functions from security package
const { getSecurityMiddlewareStack, getProtectedRoutesMiddleware } = security.middleware;

// Initialize error tracking and logger
Promise.all([
  initializeErrorTracking({
    enabled: true,
    environment: process.env.NODE_ENV as any || 'development',
    sampleRate: 1.0,
    maxBreadcrumbs: 100,
    ignoreErrors: [
      'AbortError',
      'NetworkError',
      'TimeoutError',
    ],
    ignoreUrls: [
      '/health',
      '/v1/health',
      '/v1/info',
    ],
  }),
  initializeLogger({
    level: process.env.NODE_ENV === 'production' ? 1 : 0, // INFO in production, DEBUG in development
    environment: process.env.NODE_ENV as any || 'development',
    enableConsole: true,
    enableFile: false,
    enableStructured: true,
    sanitizeContext: true,
  }),
]).then(() => {
  logger.info('Application monitoring initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize monitoring:', error);
});

// Create Hono app
const app = new Hono();

// Apply security middleware stack
app.use('*', ...getSecurityMiddlewareStack());

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://neonpro.vercel.app',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposeHeaders: ['X-Request-ID'],
  }),
);

// Global error handler with enhanced error tracking
app.use('*', errorHandler);

// Enhanced error handling middleware
app.use('*', async (c, next) => {
  const startTime = Date.now();
  const requestId = c.get('requestId');
  
  try {
    // Add breadcrumb for request start
    errorTracker.addBreadcrumb(
      'Request started',
      'request',
      {
        method: c.req.method,
        endpoint: c.req.path,
        requestId,
      }
    );

    await next();

    const duration = Date.now() - startTime;
    
    // Log successful request
    logger.info('Request completed', {
      requestId,
      method: c.req.method,
      endpoint: c.req.path,
      statusCode: c.res.status,
    }, { duration });

    // Add breadcrumb for request completion
    errorTracker.addBreadcrumb(
      'Request completed',
      'request',
      {
        method: c.req.method,
        endpoint: c.req.path,
        statusCode: c.res.status,
        duration,
        requestId,
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Capture error with context
    const errorContext = errorTracker.extractContextFromHono(c);
    errorTracker.captureException(error as Error, errorContext, {
      duration,
      requestId,
    });

    // Log error
    logger.error('Request failed', {
      requestId,
      method: c.req.method,
      endpoint: c.req.path,
    }, { errorMessage: (error as Error).message, duration });

    // Add breadcrumb for error
    errorTracker.addBreadcrumb(
      'Request failed',
      'error',
      {
        method: c.req.method,
        endpoint: c.req.path,
        errorMessage: (error as Error).message,
        duration,
        requestId,
      }
    );

    throw error;
  }
});

// Mount chat routes under /v1/chat
app.route('/v1/chat', chatRouter);

// Basic health endpoints with enhanced monitoring
app.get('/health', (c) => {
  const requestId = c.get('requestId');
  
  logger.debug('Health check requested', { requestId });
  
  return c.json({ 
    status: 'ok',
    requestId,
    timestamp: new Date().toISOString(),
  });
});

app.get('/v1/health', (c) => {
  const requestId = c.get('requestId');
  
  logger.info('Detailed health check requested', { requestId });
  
  const healthData = {
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId,
    environment: {
      isProduction: process.env.NODE_ENV === 'production',
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.SUPABASE_URL,
      version: process.env.npm_package_version,
      region: process.env.VERCEL_REGION,
    },
    monitoring: {
      errorTracking: errorTracker.getStats(),
      logger: logger.getStats(),
    },
  };

  logger.healthcare('health_check', 'Detailed health check completed', { requestId }, healthData);
  
  return c.json(healthData);
});

app.get('/v1/info', (c) => {
  const requestId = c.get('requestId');
  
  logger.debug('System info requested', { requestId });
  
  const infoData = {
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
    requestId,
    security: {
      version: '1.0.0',
      features: [
        'encryption',
        'input_validation',
        'rate_limiting',
        'csrf_protection',
        'security_headers',
        'healthcare_data_protection',
      ],
    },
  };

  logger.audit('system_info', 'System information accessed', { requestId }, infoData);
  
  return c.json(infoData);
});

// Security endpoints (protected)
app.get('/v1/security/status', ...getProtectedRoutesMiddleware(['admin']), (c) => {
  const requestId = c.get('requestId');
  const user = c.get('user');
  
  logger.security('security_status', 'Security status accessed', { 
    requestId, 
    userId: user?.id 
  });
  
  const securityStatus = {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: 'enabled',
    },
    rateLimiting: {
      enabled: true,
      defaultLimit: 100,
      windowMs: 60000,
    },
    inputValidation: {
      enabled: true,
      xssProtection: 'enabled',
      sqlInjectionProtection: 'enabled',
    },
    healthcareCompliance: {
      lgpdEnabled: true,
      dataEncryption: 'enabled',
      auditLogging: 'enabled',
    },
    monitoring: {
      errorTracking: errorTracker.getStats(),
      logger: logger.getStats(),
    },
    timestamp: new Date().toISOString(),
    requestId,
  };

  logger.audit('security_status', 'Security status retrieved', { requestId }, securityStatus);
  
  return c.json(securityStatus);
});

// LGPD compliance endpoint
app.get('/v1/compliance/lgpd', ...getProtectedRoutesMiddleware(['admin', 'compliance']), (c) => {
  const requestId = c.get('requestId');
  const user = c.get('user');
  
  logger.lgpd('compliance_check', 'LGPD compliance status requested', { 
    requestId, 
    userId: user?.id 
  });
  
  const complianceData = {
    lgpdCompliance: {
      enabled: true,
      dataProcessing: {
        lawfulBasis: ['consent', 'legitimate_interest'],
        purposeLimitation: 'enabled',
        dataMinimization: 'enabled',
        storageLimitation: 'enabled',
      },
      dataSubjectRights: {
        access: 'enabled',
        rectification: 'enabled',
        erasure: 'enabled',
        portability: 'enabled',
        objection: 'enabled',
      },
      securityMeasures: {
        encryption: 'AES-256-GCM',
        accessControl: 'role_based',
        auditLogging: 'enabled',
        breachNotification: 'enabled',
      },
      dataRetention: {
        policy: 'defined',
        automatedDeletion: 'enabled',
        consentExpiration: 'enabled',
      },
    },
    timestamp: new Date().toISOString(),
    requestId,
  };

  logger.lgpd('compliance_status', 'LGPD compliance status retrieved', { requestId }, complianceData);
  
  return c.json(complianceData);
});

// Error tracking test endpoint (for development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/v1/test/error', (c) => {
    const requestId = c.get('requestId');
    
    logger.warn('Error test endpoint called', { requestId });
    
    // Test error tracking
    try {
      throw new Error('This is a test error for error tracking');
    } catch (error) {
      errorTracker.captureException(error as Error, { requestId, endpoint: 'test' });
      return c.json({ message: 'Test error captured', requestId });
    }
  });
}

// 404 handler with logging
app.notFound((c) => {
  const requestId = c.get('requestId');
  
  logger.warn('Route not found', {
    requestId,
    method: c.req.method,
    endpoint: c.req.path,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
  });
  
  return c.json({ 
    error: 'Not Found',
    message: 'The requested resource was not found',
    requestId,
    timestamp: new Date().toISOString(),
  }, 404);
});

// Global error handler
app.onError((err, c) => {
  const requestId = c.get('requestId');
  
  // Capture error with full context
  const errorContext = errorTracker.extractContextFromHono(c);
  errorTracker.captureException(err, errorContext, {
    requestId,
    unhandled: true,
  });
  
  // Log error
  logger.error('Unhandled error occurred', {
    requestId,
    method: c.req.method,
    endpoint: c.req.path,
  }, { errorMessage: err.message, stack: err.stack });
  
  // Return appropriate error response
  if (process.env.NODE_ENV === 'production') {
    return c.json({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      requestId,
      timestamp: new Date().toISOString(),
    }, 500);
  } else {
    return c.json({ 
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack,
      requestId,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export default app;
