/**
 * LGPD Compliance Middleware
 * Handles consent validation, data processing logging, and privacy controls
 */

import type { MiddlewareHandler } from 'hono';
import { nanoid } from 'nanoid';
import type { AppEnv } from '@/types/env';

export const lgpdMiddleware = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const startTime = Date.now();

    // Generate request ID for tracking
    const requestId = nanoid();
    c.set('request_id', requestId);
    c.set('start_time', startTime);

    // Extract client information
    const ipAddress =
      c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    c.set('ip_address', ipAddress);
    c.set('user_agent', userAgent);

    // Set LGPD compliance headers
    c.header('X-Request-ID', requestId);
    c.header('X-Privacy-Policy', 'https://neonpro.com.br/privacidade');
    c.header('X-Data-Protection', 'LGPD-Compliant');

    // Process request
    await next();

    // Log data processing event for LGPD compliance
    const processingTime = Date.now() - startTime;
    const user = c.get('user');

    // TODO: Implement actual LGPD logging
    if (user && shouldLogDataProcessing(c.req.method, c.req.path)) {
      await logDataProcessing({
        request_id: requestId,
        user_id: user.id,
        action: `${c.req.method} ${c.req.path}`,
        ip_address: ipAddress,
        user_agent: userAgent,
        processing_time: processingTime,
        timestamp: new Date().toISOString(),
        legal_basis: determineLegalBasis(c.req.path, c.req.method),
      });
    }

    // Add processing time header
    c.header('X-Response-Time', `${processingTime}ms`);
  };
};

/**
 * Determine if the request should be logged for LGPD compliance
 */
function shouldLogDataProcessing(method: string, path: string): boolean {
  // Log all data modification operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }

  // Log sensitive data access
  const sensitiveEndpoints = [
    '/api/v1/patients',
    '/api/v1/appointments',
    '/api/v1/analytics',
    '/api/v1/compliance',
  ];

  return sensitiveEndpoints.some((endpoint) => path.startsWith(endpoint));
}

/**
 * Determine the legal basis for data processing under LGPD
 */
function determineLegalBasis(path: string, method: string): string {
  // Healthcare data typically requires consent or legitimate interest
  if (path.includes('/patients') || path.includes('/appointments')) {
    return 'consent'; // LGPD Art. 7, II
  }

  // Analytics and reporting
  if (path.includes('/analytics')) {
    return 'legitimate_interest'; // LGPD Art. 7, IX
  }

  // Compliance and audit
  if (path.includes('/compliance')) {
    return 'legal_obligation'; // LGPD Art. 7, II
  }

  // Authentication and security
  if (path.includes('/auth')) {
    return 'contract_performance'; // LGPD Art. 7, V
  }

  return 'legitimate_interest';
}

/**
 * Log data processing event for LGPD compliance
 * TODO: Implement actual database logging
 */
async function logDataProcessing(event: {
  request_id: string;
  user_id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  processing_time: number;
  timestamp: string;
  legal_basis: string;
}): Promise<void> {
  // TODO: Store in database for LGPD audit trail
  console.log('LGPD Data Processing Event:', event);
}
