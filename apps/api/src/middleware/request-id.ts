/**
 * 🆔 Request ID Middleware - NeonPro API
 * ======================================
 *
 * Middleware para geração e rastreamento de Request IDs únicos
 * para debugging, logging e correlação de requests.
 */

import type { Context, MiddlewareHandler } from 'hono';
import { nanoid } from 'nanoid';
import { REQUEST_ID } from '../lib/constants';

// Request ID configuration
interface RequestIdConfig {
  header?: string; // Header name for request ID
  generator?: () => string; // Custom ID generator function
  setResponseHeader?: boolean; // Whether to set response header
}

/**
 * Default request ID generator using nanoid
 */
const defaultGenerator = (): string => {
  return `req_${Date.now()}_${nanoid(REQUEST_ID.DEFAULT_ID_LENGTH)}`;
};

/**
 * Request ID middleware factory
 */
export const requestIdMiddleware = (
  config: RequestIdConfig = {},
): MiddlewareHandler => {
  const {
    header = 'X-Request-ID',
    generator = defaultGenerator,
    setResponseHeader = true,
  } = config;

  return async (c, next) => {
    // Try to get existing request ID from headers
    let requestId = c.req.header(header)
      || c.req.header('X-Request-Id')
      || c.req.header('x-request-id');

    // Generate new request ID if none provided
    if (!requestId) {
      requestId = generator();
    }

    // Validate request ID format (basic validation)
    if (
      typeof requestId !== 'string'
      || requestId.length > REQUEST_ID.MAX_LENGTH
    ) {
      requestId = generator();
    }

    // Store request ID in context for use by other middleware and handlers
    c.set('requestId', requestId);

    // Set response header if configured
    if (setResponseHeader) {
      c.res.headers.set(header, requestId);
    }

    // Set correlation headers for better tracing
    c.res.headers.set('X-Correlation-ID', requestId);

    await next();
  };
};

/**
 * Get request ID from context
 */
export const getRequestId = (c: Context): string => {
  return c.get('requestId') || 'unknown';
};

/**
 * Create child request ID for internal operations
 */
export const createChildRequestId = (
  parentRequestId: string,
  operation: string,
): string => {
  return `${parentRequestId}_${operation}_${nanoid(REQUEST_ID.CHILD_ID_LENGTH)}`;
};

/**
 * Request correlation utilities
 */
export const requestCorrelation = {
  // Create trace ID for spanning multiple requests
  createTraceId: (): string => `trace_${Date.now()}_${nanoid(REQUEST_ID.TRACE_ID_LENGTH)}`,

  // Create span ID for internal operations
  createSpanId: (): string => `span_${nanoid(REQUEST_ID.SPAN_ID_LENGTH)}`,

  // Extract trace context from headers
  extractTraceContext: (c: Context) => {
    return {
      traceId: c.req.header('X-Trace-ID')
        || c.req.header('traceparent')?.split('-')[1],
      spanId: c.req.header('X-Span-ID') || c.req.header('traceparent')?.split('-')[2],
      requestId: getRequestId(c),
    };
  },

  // Set trace headers
  setTraceHeaders: (c: Context, traceId: string, spanId: string) => {
    c.res.headers.set('X-Trace-ID', traceId);
    c.res.headers.set('X-Span-ID', spanId);
    // W3C Trace Context format
    c.res.headers.set('traceparent', `00-${traceId}-${spanId}-01`);
  },
};

// Export for testing
export { defaultGenerator };
