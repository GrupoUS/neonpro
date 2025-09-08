import type { NextFunction, Request, Response } from "express";
import { AuditAction, AuditResourceType, AuditService } from "../services/AuditService";

// Extend Express Request interface to include audit context and user
declare global {
  namespace Express {
    interface Request {
      auditContext?: {
        action?: AuditAction;
        resourceType?: AuditResourceType;
        resourceId?: string;
        lgpdBasis?: string;
        skipAudit?: boolean;
      };
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Middleware to automatically log audit events based on HTTP methods and routes
 */
export const auditMiddleware = (
  resourceType: AuditResourceType,
  options: {
    skipRoutes?: string[];
    customActionMapping?: Record<string, AuditAction>;
    extractResourceId?: (req: Request) => string | undefined;
    lgpdBasis?: string;
  } = {},
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip audit for certain routes
    if (options.skipRoutes?.some(route => req.path.includes(route))) {
      return next();
    }

    // Skip if explicitly disabled
    if (req.auditContext?.skipAudit) {
      return next();
    }

    // Map HTTP methods to audit actions
    const methodToAction: Record<string, AuditAction> = {
      GET: AuditAction.READ,
      POST: AuditAction.CREATE,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
      ...options.customActionMapping,
    };

    const action = req.auditContext?.action || methodToAction[req.method];
    const resourceId = req.auditContext?.resourceId
      || options.extractResourceId?.(req)
      || req.params.id;

    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody: unknown;
    let oldValues: unknown;
    let newValues: unknown;

    // Capture request body for CREATE/UPDATE operations
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      newValues = req.body;
    }

    // Override response methods to capture response data
    res.send = function(body: unknown) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.json = function(body: unknown) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Replace unsafe `any` cast with `unknown` + typed function cast
    res.end = function(this: Response, ...args: unknown[]) {
      const [first] = args;
      if (
        typeof first === "string"
        || (typeof Buffer !== "undefined" && Buffer.isBuffer(first as unknown as Buffer))
      ) {
        responseBody = first;
      }
      // Call the original `end` using a safe cast through `unknown`
      return (originalEnd as unknown as (...a: unknown[]) => unknown).apply(this, args);
    } as unknown as typeof res.end;

    // Hook into response finish event to log audit
    res.on("finish", async () => {
      try {
        // Only log if we have a valid action and user
        if (action && req.user?.id) {
          // For UPDATE operations, try to extract old values from response
          if (action === AuditAction.UPDATE && responseBody) {
            try {
              const parsed = typeof responseBody === "string"
                ? JSON.parse(responseBody)
                : responseBody;
              if (parsed.oldValues) {
                oldValues = parsed.oldValues;
              }
            } catch {
              // Ignore parsing errors
            }
          }

          await AuditService.logFromRequest(
            req,
            action,
            req.auditContext?.resourceType || resourceType,
            resourceId,
            oldValues as Record<string, unknown> | undefined,
            newValues as Record<string, unknown> | undefined,
            req.auditContext?.lgpdBasis || options.lgpdBasis,
          );
        }
      } catch (error) {
        console.error("Audit logging failed:", error);
        // Don't throw error to avoid breaking the response
      }
    });

    next();
  };
};

/**
 * Middleware specifically for LGPD-related operations
 */
export const lgpdAuditMiddleware = (
  lgpdBasis: string,
  resourceType: AuditResourceType = AuditResourceType.LGPD_REQUEST,
) => {
  return auditMiddleware(resourceType, {
    lgpdBasis,
    customActionMapping: {
      GET: AuditAction.DATA_ACCESS,
      POST: AuditAction.CONSENT_UPDATE,
    },
  });
};

/**
 * Middleware for authentication-related audit events
 */
export const authAuditMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    let responseBody: unknown;

    res.send = function(body: unknown) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.json = function(body: unknown) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.on("finish", async () => {
      try {
        let action: AuditAction;
        let userId = "anonymous";

        // Determine action based on route and response
        if (req.path.includes("/login")) {
          action = AuditAction.LOGIN;
          // Try to extract user ID from response
          if (responseBody && res.statusCode === 200) {
            try {
              const parsed = typeof responseBody === "string"
                ? JSON.parse(responseBody)
                : responseBody;
              userId = parsed.user?.id || parsed.id || "anonymous";
            } catch {
              // Ignore parsing errors
            }
          }
        } else if (req.path.includes("/logout")) {
          action = AuditAction.LOGOUT;
          userId = req.user?.id || "anonymous";
        } else {
          return; // Skip non-auth routes
        }

        await AuditService.logFromRequest(
          req,
          action,
          AuditResourceType.AUTH,
          userId,
          undefined,
          undefined,
          "Authentication",
        );
      } catch (error) {
        console.error("Auth audit logging failed:", error);
      }
    });

    next();
  };
};

/**
 * Helper function to set audit context for specific operations
 */
export const setAuditContext = (
  req: Request,
  context: {
    action?: AuditAction;
    resourceType?: AuditResourceType;
    resourceId?: string;
    lgpdBasis?: string;
    skipAudit?: boolean;
  },
) => {
  req.auditContext = { ...req.auditContext, ...context };
};

/**
 * Middleware to skip audit logging for specific routes
 */
export const skipAudit = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    setAuditContext(req, { skipAudit: true });
    next();
  };
};
