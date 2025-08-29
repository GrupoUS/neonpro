import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auditMiddleware } from "../middleware/auditMiddleware";
import { AuditResourceType } from "../services/AuditService";
import { authMiddleware } from "../middleware/auth";
import type { AuditLogQuery } from "../services/AuditService";
import { AuditService } from "../services/AuditService";
import { HTTP_STATUS } from "../lib/constants";
import type { ApiResponse } from "@neonpro/shared/types";

const auditRoutes = new Hono();

// Validation schemas
const auditQuerySchema = z.object({
  user_id: z.string().optional(),
  action: z.enum([
    "CREATE",
    "READ",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "EXPORT",
    "IMPORT",
    "CONSENT_UPDATE",
    "DATA_ACCESS",
    "DATA_EXPORT",
  ]).optional(),
  resource_type: z.enum([
    "USER",
    "PATIENT",
    "DOCUMENT",
    "CONSENT",
    "LGPD_REQUEST",
    "SYSTEM",
    "AUTH",
  ]).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

const exportQuerySchema = auditQuerySchema.extend({
  format: z.enum(["json", "csv"]).optional().default("json"),
});

const statisticsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

const userAuditQuerySchema = z.object({
  limit: z.number().min(1).max(1000).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

// Apply middleware to all routes
auditRoutes.use("*", authMiddleware());
auditRoutes.use("*", auditMiddleware(AuditResourceType.SYSTEM, {
  skipRoutes: ["/health"], // Skip health check
  lgpdBasis: "Audit Management",
}));

/**
 * @route GET /api/audit/logs
 * @desc Get audit logs with filtering
 */
auditRoutes.get("/logs", zValidator("query", auditQuerySchema), async (c) => {
  try {
    const params: AuditLogQuery = c.req.valid("query");

    // Non-admin users can only see their own logs
    const user = c.get("user");
    if (!user?.is_admin) {
      params.user_id = user?.id;
    }

    const logs = await AuditService.query(params);

    const response: ApiResponse<typeof logs> = {
      success: true,
      data: logs,
      count: logs.length,
    };

    return c.json(response);
  } catch (error) {
    console.error("Failed to query audit logs:", error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: "Failed to retrieve audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return c.json(errorResponse, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * @route GET /api/audit/statistics
 * @desc Get audit statistics and metrics
 */
auditRoutes.get("/statistics", zValidator("query", statisticsQuerySchema), async (c) => {
  try {
    // Only admins can view statistics
    const user = c.get("user");
    if (!user?.is_admin) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Access denied",
        message: "Only administrators can view audit statistics",
      };
      return c.json(errorResponse, HTTP_STATUS.FORBIDDEN);
    }

    const { start_date, end_date } = c.req.valid("query");

    const statistics = await AuditService.getStatistics(
      start_date,
      end_date,
    );

    const response: ApiResponse<typeof statistics> = {
      success: true,
      data: statistics,
    };

    return c.json(response);
  } catch (error) {
    console.error("Failed to get audit statistics:", error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: "Failed to retrieve audit statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return c.json(errorResponse, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * @route GET /api/audit/lgpd
 * @desc Get LGPD-related audit events
 */
auditRoutes.get("/lgpd", zValidator("query", statisticsQuerySchema), async (c) => {
  try {
    // Only admins and DPOs can view LGPD events
    const user = c.get("user");
    if (!user?.is_admin && !user?.is_dpo) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Access denied",
        message: "Only administrators and DPOs can view LGPD audit events",
      };
      return c.json(errorResponse, HTTP_STATUS.FORBIDDEN);
    }

    const { start_date, end_date } = c.req.valid("query");

    const events = await AuditService.getLGPDEvents(
      start_date,
      end_date,
    );

    const response: ApiResponse<typeof events> = {
      success: true,
      data: events,
      count: events.length,
    };

    return c.json(response);
  } catch (error) {
    console.error("Failed to get LGPD audit events:", error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: "Failed to retrieve LGPD audit events",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return c.json(errorResponse, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * @route GET /api/audit/export
 * @desc Export audit logs in JSON or CSV format
 */
auditRoutes.get("/export", zValidator("query", exportQuerySchema), async (c) => {
  try {
    // Only admins can export logs
    const user = c.get("user");
    if (!user?.is_admin) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Access denied",
        message: "Only administrators can export audit logs",
      };
      return c.json(errorResponse, HTTP_STATUS.FORBIDDEN);
    }

    const { format, ...params } = c.req.valid("query");

    const exportData = await AuditService.exportLogs(params, format);

    // Set appropriate headers based on format
    const filename = `audit-logs-${new Date().toISOString().split("T")[0]}`;
    
    if (format === "csv") {
      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename="${filename}.csv"`);
    } else {
      c.header("Content-Type", "application/json");
      c.header("Content-Disposition", `attachment; filename="${filename}.json"`);
    }

    return c.body(exportData);
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: "Failed to export audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return c.json(errorResponse, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * GET /api/audit/user/:userId
 * Get audit logs for a specific user
 */
auditRoutes.get("/user/:userId", zValidator("query", userAuditQuerySchema), async (c) => {
  try {
    const userId = c.req.param("userId");
    const { limit, offset } = c.req.valid("query");
    const user = c.get("user");

    // Users can only see their own logs unless they're admin
    if (!user?.is_admin && user?.id !== userId) {
      return c.json({
        error: "Access denied",
        message: "You can only view your own audit logs",
      }, HTTP_STATUS.FORBIDDEN);
    }

    const logs = await AuditService.query({
      user_id: userId,
      limit,
      offset,
    });

    return c.json({
      success: true,
      data: logs,
      count: logs.length,
      user_id: userId,
    });
  } catch (error) {
    console.error("Failed to get user audit logs:", error);
    return c.json({
      error: "Failed to retrieve user audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

/**
 * GET /api/audit/health
 * Health check endpoint (no audit logging)
 */
auditRoutes.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default auditRoutes;
