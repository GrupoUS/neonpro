import { Router } from "express";
import { z } from "zod";
import { auditMiddleware, AuditResourceType } from "../middleware/auditMiddleware";
import { authenticateToken } from "../middleware/auth";
import type { AuditLogQuery } from "../services/AuditService";
import { AuditService } from "../services/AuditService";

const router = Router();

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

// Apply authentication and audit middleware to all routes
router.use(authenticateToken);
router.use(auditMiddleware(AuditResourceType.SYSTEM, {
  skipRoutes: ["/health"], // Skip health check
  lgpdBasis: "Audit Management",
}));

/**
 * GET /api/audit/logs
 * Query audit logs with filters
 */
router.get("/logs", async (req, res) => {
  try {
    // Validate query parameters
    const queryResult = auditQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: queryResult.error.errors,
      });
    }

    const params: AuditLogQuery = queryResult.data;

    // Non-admin users can only see their own logs
    if (!req.user?.is_admin) {
      params.user_id = req.user?.id;
    }

    const logs = await AuditService.query(params);

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error("Failed to query audit logs:", error);
    res.status(500).json({
      error: "Failed to retrieve audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/audit/statistics
 * Get audit statistics and metrics
 */
router.get("/statistics", async (req, res) => {
  try {
    // Only admins can view statistics
    if (!req.user?.is_admin) {
      return res.status(403).json({
        error: "Access denied",
        message: "Only administrators can view audit statistics",
      });
    }

    const { start_date, end_date } = req.query;

    const statistics = await AuditService.getStatistics(
      start_date as string,
      end_date as string,
    );

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Failed to get audit statistics:", error);
    res.status(500).json({
      error: "Failed to retrieve audit statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/audit/lgpd
 * Get LGPD-related audit events
 */
router.get("/lgpd", async (req, res) => {
  try {
    // Only admins and DPOs can view LGPD events
    if (!req.user?.is_admin && !req.user?.is_dpo) {
      return res.status(403).json({
        error: "Access denied",
        message: "Only administrators and DPOs can view LGPD audit events",
      });
    }

    const { start_date, end_date } = req.query;

    const events = await AuditService.getLGPDEvents(
      start_date as string,
      end_date as string,
    );

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Failed to get LGPD audit events:", error);
    res.status(500).json({
      error: "Failed to retrieve LGPD audit events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/audit/export
 * Export audit logs in JSON or CSV format
 */
router.get("/export", async (req, res) => {
  try {
    // Only admins can export logs
    if (!req.user?.is_admin) {
      return res.status(403).json({
        error: "Access denied",
        message: "Only administrators can export audit logs",
      });
    }

    // Validate query parameters
    const queryResult = exportQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: queryResult.error.errors,
      });
    }

    const { format, ...params } = queryResult.data;

    const exportData = await AuditService.exportLogs(params, format);

    // Set appropriate headers based on format
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      );
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.json"`,
      );
    }

    res.send(exportData);
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    res.status(500).json({
      error: "Failed to export audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/audit/user/:userId
 * Get audit logs for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Users can only see their own logs unless they're admin
    if (!req.user?.is_admin && req.user?.id !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only view your own audit logs",
      });
    }

    const logs = await AuditService.query({
      user_id: userId,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length,
      user_id: userId,
    });
  } catch (error) {
    console.error("Failed to get user audit logs:", error);
    res.status(500).json({
      error: "Failed to retrieve user audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/audit/health
 * Health check endpoint (no audit logging)
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "audit-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;
