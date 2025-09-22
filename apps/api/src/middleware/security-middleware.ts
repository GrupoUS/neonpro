import { Context, Next } from 'hono';
import {
  getSecurityHeaders,
  isSafeHeaderValue,
  isSafeRedirectUrl,
  RateLimiter,
  validateAndSanitizeInput,
  validatePassword,
} from '../types/guards';

// Security configuration
const SECURITY_CONFIG = {
  maxRequestBodySize: '10mb',
  maxRequestParamSize: '1mb',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  blockedUserAgents: [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zgrab',
    'curl',
    'wget',
    'python-requests',
    'bot',
    'spider',
    'crawler',
  ],
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'set-cookie',
    'proxy-authorization',
    'www-authenticate',
  ],
  sensitivePaths: [
    '/api/auth',
    '/api/users',
    '/api/patients',
    '/api/appointments',
    '/api/admin',
  ],
} as const;

// Rate limiter instance
const rateLimiter = new RateLimiter(
  60 * 1000, // 1 minute window
  100, // max requests per window
);

// Authentication rate limiter (more strict)
const authRateLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minute window
  5, // max attempts per window
);

// Security middleware
export const securityMiddleware = async (c: Context, next: Next) => {
  // Apply security headers
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    c.header(key, value);
  });

  // Check for blocked user agents
  const userAgent = c.req.header('user-agent')?.toLowerCase() || '';
  if (SECURITY_CONFIG.blockedUserAgents.some(agent => userAgent.includes(agent))) {
    return c.json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Access denied',
      },
    }, 403);
  }

  // Rate limiting
  const clientIP = c.req.header('cf-connecting-ip')
    || c.req.header('x-forwarded-for')
    || c.req.header('x-real-ip')
    || 'unknown';

  if (!rateLimiter.isAllowed(clientIP)) {
    return c.json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
      },
    }, 429);
  }

  // Add rate limit headers
  c.header('X-RateLimit-Limit', '100');
  c.header('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(clientIP).toString());
  c.header('X-RateLimit-Reset', (Date.now() + 60 * 1000).toString());

  await next();
};

// Authentication middleware with enhanced security
export const authMiddleware = async (c: Context, next: Next) => {
  const clientIP = c.req.header('cf-connecting-ip')
    || c.req.header('x-forwarded-for')
    || c.req.header('x-real-ip')
    || 'unknown';

  // Apply stricter rate limiting for auth endpoints
  if (!authRateLimiter.isAllowed(clientIP)) {
    return c.json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again later.',
      },
    }, 429);
  }

  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'MISSING_AUTH',
        message: 'Authorization header required',
      },
    }, 401);
  }

  const token = authHeader.substring(7);

  // Validate token format
  if (!token || token.length < 10) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token format',
      },
    }, 401);
  }

  // Add token to context for validation in subsequent middleware
  c.set('authToken', token);

  await next();
};

// Input validation middleware
export const inputValidationMiddleware = async (c: Context, next: Next) => {
  // Check request body size
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
    return c.json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body too large',
      },
    }, 413);
  }

  // Validate content type
  const contentType = c.req.header('content-type');
  if (contentType && !contentType.includes('application/json')) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_CONTENT_TYPE',
        message: 'Content-Type must be application/json',
      },
    }, 415);
  }

  // Sanitize headers
  Object.keys(c.req.header()).forEach(key => {
    const value = c.req.header(key);
    if (value && SECURITY_CONFIG.sensitiveHeaders.includes(key.toLowerCase())) {
      // Don't log sensitive headers
      c.set('sanitizedHeaders', {
        ...c.get('sanitizedHeaders'),
        [key]: '[REDACTED]',
      });
    } else if (value && !isSafeHeaderValue(value)) {
      c.header(key, '');
    }
  });

  await next();
};

// CORS middleware with security enhancements
export const corsMiddleware = async (c: Context, next: Next) => {
  const origin = c.req.header('origin');

  // Validate origin
  if (origin && SECURITY_CONFIG.allowedOrigins.length > 0) {
    if (!SECURITY_CONFIG.allowedOrigins.includes(origin)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_ORIGIN',
          message: 'Origin not allowed',
        },
      }, 403);
    }
  }

  // Set CORS headers
  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    c.header('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};

// Request logging middleware (security-focused)
export const securityLoggingMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const clientIP = c.req.header('cf-connecting-ip')
    || c.req.header('x-forwarded-for')
    || c.req.header('x-real-ip')
    || 'unknown';

  try {
    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;

    // Log security-relevant information
    if (status >= 400 || c.req.path.startsWith('/api/auth')) {
      console.log({
        timestamp: new Date().toISOString(),
        method: c.req.method,
        path: c.req.path,
        status,
        duration,
        clientIP,
        userAgent: c.req.header('user-agent'),
        // Don't log sensitive data
        hasAuth: !!c.req.header('authorization'),
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log errors with security context
    console.error({
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: c.req.path,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      clientIP,
      userAgent: c.req.header('user-agent'),
      hasAuth: !!c.req.header('authorization'),
    });

    throw error;
  }
};

// Healthcare data protection middleware
export const healthcareDataProtectionMiddleware = async (c: Context, next: Next) => {
  // Check if this is a healthcare data endpoint
  const isHealthcareEndpoint = SECURITY_CONFIG.sensitivePaths.some(path =>
    c.req.path.startsWith(path)
  );

  if (isHealthcareEndpoint) {
    // Ensure HTTPS in production
    if (process.env.NODE_ENV === 'production' && c.req.header('x-forwarded-proto') !== 'https') {
      return c.json({
        success: false,
        error: {
          code: 'HTTPS_REQUIRED',
          message: 'HTTPS is required for healthcare data',
        },
      }, 403);
    }

    // Add healthcare-specific headers
    c.header('X-Healthcare-Data', 'true');
    c.header('X-LGPD-Compliant', 'true');

    // Log healthcare data access (compliance)
    console.log({
      timestamp: new Date().toISOString(),
      eventType: 'HEALTHCARE_DATA_ACCESS',
      path: c.req.path,
      method: c.req.method,
      clientIP: c.req.header('cf-connecting-ip') || 'unknown',
      userId: c.get('userId') || 'anonymous',
    });
  }

  await next();
};

// CSRF protection middleware
export const csrfMiddleware = async (c: Context, next: Next) => {
  // Only apply to state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
    const csrfToken = c.req.header('x-csrf-token');
    const sessionToken = c.get('sessionToken');

    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CSRF',
          message: 'Invalid CSRF token',
        },
      }, 403);
    }
  }

  await next();
};

// Combine all security middleware
export const securityMiddlewares = [
  securityLoggingMiddleware,
  corsMiddleware,
  securityMiddleware,
  inputValidationMiddleware,
  healthcareDataProtectionMiddleware,
];
