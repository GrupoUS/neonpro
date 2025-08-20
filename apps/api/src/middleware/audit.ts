/**
 * Audit Middleware
 * Comprehensive audit logging for security and compliance
 */

import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '@/types/env';

export const auditMiddleware = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const startTime = Date.now();

    // Extract request information
    const method = c.req.method;
    const path = c.req.path;
    const ipAddress = c.get('ip_address') || 'unknown';
    const userAgent = c.get('user_agent') || 'unknown';
    const requestId = c.get('request_id');

    // Process request
    await next();

    // Get response information
    const statusCode = c.res.status;
    const processingTime = Date.now() - startTime;
    const user = c.get('user');

    // Determine if this action requires audit logging
    if (shouldAuditLog(method, path, statusCode)) {
      await logAuditEvent({
        request_id: requestId || 'unknown',
        user_id: user?.id || 'anonymous',
        action: `${method} ${path}`,
        resource_type: extractResourceType(path),
        resource_id: extractResourceId(path),
        status_code: statusCode,
        ip_address: ipAddress,
        user_agent: userAgent,
        processing_time: processingTime,
        timestamp: new Date().toISOString(),
        clinic_id: user?.clinic_id || null,
        success: statusCode < 400,
      });
    }
  };
};

/**
 * Determine if the request should be audit logged
 */
function shouldAuditLog(
  method: string,
  path: string,
  statusCode: number
): boolean {
  // Always log data modification operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }

  // Log failed requests
  if (statusCode >= 400) {
    return true;
  }

  // Log access to sensitive endpoints
  const sensitiveEndpoints = [
    '/api/v1/auth',
    '/api/v1/patients',
    '/api/v1/appointments',
    '/api/v1/compliance',
    '/api/v1/analytics',
  ];

  return sensitiveEndpoints.some((endpoint) => path.startsWith(endpoint));
}

/**
 * Extract resource type from URL path
 */
function extractResourceType(path: string): string {
  const pathParts = path.split('/');

  // /api/v1/patients -> 'patients'
  if (pathParts.length >= 4) {
    return pathParts[3];
  }

  return 'unknown';
}

/**
 * Extract resource ID from URL path
 */
function extractResourceId(path: string): string | null {
  const pathParts = path.split('/');

  // /api/v1/patients/123 -> '123'
  if (pathParts.length >= 5) {
    const id = pathParts[4];
    // Check if it looks like an ID (UUID or numeric)
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      ) ||
      /^\d+$/.test(id)
    ) {
      return id;
    }
  }

  return null;
}

/**
 * Log audit event
 * TODO: Implement actual database logging
 */
async function logAuditEvent(_event: {
  request_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  status_code: number;
  ip_address: string;
  user_agent: string;
  processing_time: number;
  timestamp: string;
  clinic_id: string | null;
  success: boolean;
}): Promise<void> {}
