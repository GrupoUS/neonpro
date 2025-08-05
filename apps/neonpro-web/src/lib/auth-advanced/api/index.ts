// API Routes Index
// Story 1.4: Session Management & Security Implementation

export { createDeviceRoutes, DeviceRoutes } from "./device-routes";
export { createSecurityRoutes, SecurityRoutes } from "./security-routes";
export { createSessionRoutes, SessionRoutes } from "./session-routes";

// Combined API routes factory
export function createAuthAPIRoutes(sessionManager: any, securityMonitor: any, deviceManager: any) {
  return {
    session: createSessionRoutes(sessionManager, securityMonitor),
    security: createSecurityRoutes(securityMonitor, sessionManager),
    device: createDeviceRoutes(deviceManager, sessionManager, securityMonitor),
  };
}

// Route utilities
export const RouteUtils = {
  /**
   * Extract client IP from request
   */
  getClientIP(request: Request): string {
    const headers = request.headers;
    const forwarded = headers.get("x-forwarded-for");
    const realIP = headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIP || "unknown";
  },

  /**
   * Extract session token from authorization header
   */
  extractSessionToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  },

  /**
   * Create error response
   */
  createErrorResponse(message: string, status: number = 400) {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  },

  /**
   * Create success response
   */
  createSuccessResponse(data: any, status: number = 200) {
    return new Response(JSON.stringify({ success: true, ...data }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  },

  /**
   * Validate request body
   */
  async validateRequestBody(
    request: Request,
    requiredFields: string[],
  ): Promise<{ valid: boolean; data?: any; error?: string }> {
    try {
      const body = await request.json();

      for (const field of requiredFields) {
        if (!body[field]) {
          return {
            valid: false,
            error: `Missing required field: ${field}`,
          };
        }
      }

      return { valid: true, data: body };
    } catch (error) {
      return {
        valid: false,
        error: "Invalid JSON body",
      };
    }
  },

  /**
   * Parse query parameters
   */
  parseQueryParams(url: string): Record<string, string> {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  },

  /**
   * Add security headers to response
   */
  addSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers);

    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Content-Security-Policy", "default-src 'self'");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

// API route patterns
export const API_ROUTES = {
  // Session routes
  SESSION_CREATE: "/api/auth/sessions",
  SESSION_GET: "/api/auth/sessions/:sessionId",
  SESSION_UPDATE: "/api/auth/sessions/:sessionId/activity",
  SESSION_EXTEND: "/api/auth/sessions/:sessionId/extend",
  SESSION_TERMINATE: "/api/auth/sessions/:sessionId/terminate",
  SESSION_USER: "/api/auth/sessions/user/:userId",
  SESSION_VALIDATE: "/api/auth/sessions/validate",
  SESSION_METRICS: "/api/auth/sessions/metrics",
  SESSION_CLEANUP: "/api/auth/sessions/cleanup",

  // Security routes
  SECURITY_EVENTS: "/api/auth/security/events",
  SECURITY_ALERTS: "/api/auth/security/alerts",
  SECURITY_DISMISS_ALERT: "/api/auth/security/alerts/:alertId/dismiss",
  SECURITY_METRICS: "/api/auth/security/metrics",
  SECURITY_REPORT: "/api/auth/security/report",
  SECURITY_RISK: "/api/auth/security/risk",
  SECURITY_BLOCK_IP: "/api/auth/security/block-ip",
  SECURITY_UNBLOCK_IP: "/api/auth/security/unblock-ip/:ip",
  SECURITY_BLOCKED_IPS: "/api/auth/security/blocked-ips",
  SECURITY_EXPORT: "/api/auth/security/export",

  // Device routes
  DEVICE_REGISTER: "/api/auth/devices/register",
  DEVICE_USER: "/api/auth/devices/user/:userId",
  DEVICE_GET: "/api/auth/devices/:deviceId",
  DEVICE_TRUST: "/api/auth/devices/:deviceId/trust",
  DEVICE_BLOCK: "/api/auth/devices/:deviceId/block",
  DEVICE_REMOVE: "/api/auth/devices/:deviceId",
  DEVICE_VALIDATE: "/api/auth/devices/validate",
  DEVICE_ANALYTICS: "/api/auth/devices/analytics",
  DEVICE_UPDATE: "/api/auth/devices/:deviceId",
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

// Response status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden - insufficient permissions",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input data",
  SESSION_EXPIRED: "Session has expired",
  DEVICE_NOT_TRUSTED: "Device is not trusted",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  INTERNAL_ERROR: "Internal server error",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: "Session created successfully",
  SESSION_UPDATED: "Session updated successfully",
  SESSION_TERMINATED: "Session terminated successfully",
  DEVICE_REGISTERED: "Device registered successfully",
  DEVICE_TRUSTED: "Device trusted successfully",
  DEVICE_BLOCKED: "Device blocked successfully",
  SECURITY_EVENT_LOGGED: "Security event logged successfully",
  ALERT_DISMISSED: "Alert dismissed successfully",
} as const;
