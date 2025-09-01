import { zValidator } from "@hono/zod-validator";
import { UnifiedAuditService, AuditEventType, AuditSeverity } from '@neonpro/security';;
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants";
import type { ApiResponse } from "../types/api";

// Schema definitions
const AuditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().optional(),
  action: z
    .enum(["create", "read", "update", "delete", "login", "logout", "export"])
    .optional(),
  resourceType: z
    .enum(["patient", "appointment", "professional", "service", "user"])
    .optional(),
});

const LGPDRequestSchema = z.object({
  type: z.enum(["access", "rectification", "deletion", "portability", "objection"]),
  patientId: z.string().min(1),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  justification: z.string().min(10),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

const AnvisaReportSchema = z.object({
  reportType: z.enum(["monthly", "quarterly", "annual", "adverse_events"]),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  includeDetails: z.boolean().default(false),
});

const ConsentUpdateSchema = z.object({
  patientId: z.string().min(1),
  consentType: z.enum(["treatment", "marketing", "analytics", "sharing"]),
  granted: z.boolean(),
  timestamp: z.string().optional(),
});

const complianceRoutes = new Hono()
  // Authentication middleware
  .use("*", async (c, next) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Token de acesso obrigatório" },
        401,
      );
    }
    await next();
  });

// 📋 LGPD Overview with Audit Integration
complianceRoutes.get("/lgpd/overview", async (c) => {
  try {
    return c.json({
      success: true,
      data: { message: "LGPD Overview" },
    });
  } catch (error) {
    console.error("Error fetching LGPD overview:", error);
    return c.json({
      success: false,
      error: "Failed to fetch overview",
    }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

export default complianceRoutes;
