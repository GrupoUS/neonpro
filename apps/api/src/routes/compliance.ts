/**
 * ⚖️ Compliance Routes - NeonPro API
 * ===================================
 *
 * Rotas para compliance LGPD, ANVISA e auditoria
 * para clínicas de estética brasileiras.
 */

import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants.js";

// Zod schemas for compliance
const AuditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
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
  type: z.enum([
    "access",
    "portability",
    "deletion",
    "rectification",
    "objection",
  ]),
  patientId: z.string(),
  requesterName: z.string(),
  requesterEmail: z.string().email(),
  justification: z.string().min(10),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});

const AnvisaReportSchema = z.object({
  reportType: z.enum([
    "monthly_procedures",
    "adverse_events",
    "product_tracking",
    "facility_inspection",
  ]),
  period: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  includeDetails: z.boolean().default(true),
});

const ConsentUpdateSchema = z.object({
  patientId: z.string(),
  consentType: z.enum(["data_processing", "marketing", "research", "photos"]),
  granted: z.boolean(),
  version: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Create compliance router
export const complianceRoutes = new Hono()
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
  })
  // 📋 LGPD Overview
  .get("/lgpd/overview", async (c) => {
    try {
      const mockOverview = {
        complianceScore: 94.2, // percentage
        totalPatients: 89,
        activeConsents: 89,
        pendingRequests: 3,
        completedRequests: 127,
        lastAudit: "2024-01-15T10:00:00Z",

        consentBreakdown: {
          dataProcessing: { granted: 89, denied: 0 },
          marketing: { granted: 67, denied: 22 },
          research: { granted: 34, denied: 55 },
          photos: { granted: 78, denied: 11 },
        },

        recentActivity: [
          {
            id: "act_1",
            type: "consent_granted",
            description:
              "Paciente Maria Silva concedeu consentimento para fotos",
            timestamp: new Date(Date.now() - 3_600_000).toISOString(),
          },
          {
            id: "act_2",
            type: "data_exported",
            description: "Dados de João Santos exportados por solicitação",
            timestamp: new Date(Date.now() - 7_200_000).toISOString(),
          },
          {
            id: "act_3",
            type: "consent_updated",
            description: "Ana Costa atualizou preferências de marketing",
            timestamp: new Date(Date.now() - 10_800_000).toISOString(),
          },
        ],

        riskAssessment: {
          level: "low",
          score: 12, // out of 100, lower is better
          factors: [
            { factor: "Data minimization", status: "compliant", risk: 0 },
            { factor: "Consent management", status: "compliant", risk: 2 },
            { factor: "Data retention", status: "needs_attention", risk: 8 },
            { factor: "Third-party sharing", status: "compliant", risk: 2 },
          ],
        },
      };

      const response: ApiResponse<typeof mockOverview> = {
        success: true,
        data: mockOverview,
        message: "Visão geral LGPD carregada",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar visão geral LGPD",
        },
        500,
      );
    }
  })
  // 📊 Audit logs
  .get("/audit/logs", zValidator("query", AuditLogQuerySchema), async (c) => {
    const {
      page,
      limit,
      // startDate, endDate, userId, action, resourceType
    } = c.req.valid("query");

    try {
      // Build audit log query with filters
      const offset = (page - 1) * limit;
      
      // Base query for audit logs
      let query = `
        SELECT 
          al.id,
          al.timestamp,
          al.user_id,
          u.name as user_name,
          al.action,
          al.resource_type,
          al.resource_id,
          al.details,
          al.ip_address,
          al.user_agent,
          al.session_id
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Apply filters
      if (startDate) {
        query += ` AND al.timestamp >= $${paramIndex}`;
        queryParams.push(new Date(startDate));
        paramIndex++;
      }
      
      if (endDate) {
        query += ` AND al.timestamp <= $${paramIndex}`;
        queryParams.push(new Date(endDate));
        paramIndex++;
      }
      
      if (userId) {
        query += ` AND al.user_id = $${paramIndex}`;
        queryParams.push(userId);
        paramIndex++;
      }
      
      if (action) {
        query += ` AND al.action = $${paramIndex}`;
        queryParams.push(action);
        paramIndex++;
      }
      
      if (resourceType) {
        query += ` AND al.resource_type = $${paramIndex}`;
        queryParams.push(resourceType);
        paramIndex++;
      }
      
      // Add ordering and pagination
      query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);
      
      // Count query for total records
      let countQuery = `
        SELECT COUNT(*) as total
        FROM audit_logs al
        WHERE 1=1
      `;
      
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      // Apply same filters to count query
      if (startDate) {
        countQuery += ` AND al.timestamp >= $${countParamIndex}`;
        countParams.push(new Date(startDate));
        countParamIndex++;
      }
      
      if (endDate) {
        countQuery += ` AND al.timestamp <= $${countParamIndex}`;
        countParams.push(new Date(endDate));
        countParamIndex++;
      }
      
      if (userId) {
        countQuery += ` AND al.user_id = $${countParamIndex}`;
        countParams.push(userId);
        countParamIndex++;
      }
      
      if (action) {
        countQuery += ` AND al.action = $${countParamIndex}`;
        countParams.push(action);
        countParamIndex++;
      }
      
      if (resourceType) {
        countQuery += ` AND al.resource_type = $${countParamIndex}`;
        countParams.push(resourceType);
        countParamIndex++;
      }
      
      // Execute queries with Supabase
      try {
        const { supabase } = await import("../lib/supabase.js");
        
        // Build Supabase query for audit logs
        let logsQuery = supabase
          .from('audit_logs')
          .select(`
            audit_id,
            timestamp,
            user_id,
            user_email,
            operation,
            path,
            resource_id,
            client_ip,
            status_code,
            lgpd_relevant,
            personal_data_accessed,
            metadata
          `)
          .order('timestamp', { ascending: false })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (startDate) {
          logsQuery = logsQuery.gte('timestamp', startDate);
        }
        if (endDate) {
          logsQuery = logsQuery.lte('timestamp', endDate);
        }
        if (userId) {
          logsQuery = logsQuery.eq('user_id', userId);
        }
        if (action) {
          logsQuery = logsQuery.eq('operation', action);
        }
        if (resourceType) {
          logsQuery = logsQuery.like('path', `%${resourceType}%`);
        }

        const { data: logs, error: logsError } = await logsQuery;
        
        if (logsError) {
          throw new Error(`Database query failed: ${logsError.message}`);
        }

        // Get total count for pagination
        let countQuery = supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true });

        // Apply same filters for count
        if (startDate) {
          countQuery = countQuery.gte('timestamp', startDate);
        }
        if (endDate) {
          countQuery = countQuery.lte('timestamp', endDate);
        }
        if (userId) {
          countQuery = countQuery.eq('user_id', userId);
        }
        if (action) {
          countQuery = countQuery.eq('operation', action);
        }
        if (resourceType) {
          countQuery = countQuery.like('path', `%${resourceType}%`);
        }

        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw new Error(`Count query failed: ${countError.message}`);
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Transform data to match expected format
        const transformedLogs = logs?.map(log => ({
          id: log.audit_id,
          timestamp: log.timestamp,
          user_id: log.user_id,
          user_name: log.user_email || 'Unknown User',
          action: log.operation,
          resourceType: log.path?.split('/')[1] || 'unknown',
          resourceId: log.resource_id,
          clientIP: log.client_ip,
          statusCode: log.status_code,
          lgpdRelevant: log.lgpd_relevant,
          personalDataAccessed: log.personal_data_accessed,
          metadata: log.metadata
        })) || [];

        return c.json<ApiResponse<any>>({
          success: true,
          data: {
            logs: transformedLogs,
            pagination: {
              page,
              limit,
              total: totalCount,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          },
        });
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        return c.json<ApiResponse<never>>({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch audit logs',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
        }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    }
  );




  // ✉️ LGPD requests management
  .get("/lgpd/requests", async (c) => {
    try {
      // Query LGPD requests from database
      const query = `
        SELECT 
          lr.id,
          lr.type,
          lr.patient_id,
          p.name as patient_name,
          lr.requester_name,
          lr.requester_email,
          lr.status,
          lr.priority,
          lr.justification,
          lr.created_at,
          lr.due_date,
          lr.processed_at,
          lr.processor_id,
          u.name as processor_name,
          lr.response_data,
          lr.notes
        FROM lgpd_requests lr
        LEFT JOIN patients p ON lr.patient_id = p.id
        LEFT JOIN users u ON lr.processor_id = u.id
        ORDER BY 
          CASE lr.priority 
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END,
          lr.created_at DESC
      `;
      
      // Execute query using Supabase
      const { data: requests, error } = await supabase
        .from('lgpd_requests')
        .select(`
          id,
          type,
          patient_id,
          patients!inner(name),
          requester_name,
          requester_email,
          status,
          priority,
          justification,
          created_at,
          due_date,
          processed_at,
          processor_id,
          users(name),
          response_data,
          notes
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching LGPD requests:', error);
        return c.json<ApiResponse<never>>({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch LGPD requests',
            details: error.message
          },
        }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      // Transform data to match expected format
      const transformedRequests = requests?.map(req => ({
        id: req.id,
        type: req.type,
        patientId: req.patient_id,
        patientName: req.patients?.name || 'Unknown',
        requesterName: req.requester_name,
        requesterEmail: req.requester_email,
        status: req.status,
        priority: req.priority,
        justification: req.justification,
        createdAt: req.created_at,
        dueDate: req.due_date,
        processedAt: req.processed_at,
        processorId: req.processor_id,
        processorName: req.users?.name,
        responseData: req.response_data,
        notes: req.notes
      })) || [];
      // Calculate summary statistics
      const now = new Date();
      const summary = {
        total: transformedRequests.length,
        pending: transformedRequests.filter(r => r.status === 'pending').length,
        inProgress: transformedRequests.filter(r => r.status === 'in_progress').length,
        completed: transformedRequests.filter(r => r.status === 'completed').length,
        overdue: transformedRequests.filter(r => 
          r.status !== 'completed' && r.dueDate && new Date(r.dueDate) < now
        ).length,
      };

      return c.json<ApiResponse<{
        requests: typeof transformedRequests;
        summary: typeof summary;
      }>>({
        success: true,
        data: {
          requests: transformedRequests,
          summary,
        },
        message: "Solicitações LGPD carregadas",
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar solicitações LGPD",
        },
        500,
      );
    }
  })
  // ➕ Create LGPD request
  .post("/lgpd/requests", zValidator("json", LGPDRequestSchema), async (c) => {
    const requestData = c.req.valid("json");

    try {
      const newRequest = {
        id: `req_${Date.now()}`,
        ...requestData,
        status: "pending",
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        processedAt: undefined,
        processorId: undefined,
      };

      const response: ApiResponse<typeof newRequest> = {
        success: true,
        data: newRequest,
        message: "Solicitação LGPD criada com sucesso",
      };

      return c.json(response, HTTP_STATUS.CREATED);
    } catch {
      return c.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Erro ao criar solicitação LGPD",
        },
        400,
      );
    }
  })
  // 🏥 ANVISA compliance overview
  .get("/anvisa/overview", async (c) => {
    try {
      // ANVISA compliance overview
      const mockAnvisaOverview = {
        complianceScore: 96.8, // percentage
        facilityLicense: {
          number: "AFE-SP-123456789",
          status: "active",
          expirationDate: "2025-06-15",
          daysUntilExpiration: 147,
        },

        registeredProducts: {
          total: 45,
          active: 42,
          expired: 2,
          pending: 1,
        },

        procedures: {
          thisMonth: 156,
          previousMonth: 142,
          growth: 9.9,
          reportingCompliant: true,
        },

        inspections: {
          last: "2023-08-15T10:00:00Z",
          next: "2024-08-15T10:00:00Z",
          result: "approved",
          recommendations: 2,
        },

        adverseEvents: {
          reported: 0,
          pending: 0,
          resolved: 3,
          lastIncident: "2023-12-10T15:30:00Z",
        },

        certifications: [
          {
            name: "Boas Práticas de Fabricação",
            status: "valid",
            expirationDate: "2025-03-20",
          },
          {
            name: "ISO 13485",
            status: "valid",
            expirationDate: "2025-11-10",
          },
        ],

        recentAlerts: [
          {
            id: "alert_1",
            type: "product_recall",
            description: "Recall de lote específico de ácido hialurônico",
            severity: "medium",
            timestamp: "2024-01-18T09:00:00Z",
          },
          {
            id: "alert_2",
            type: "regulation_update",
            description: "Nova RDC sobre procedimentos estéticos",
            severity: "high",
            timestamp: "2024-01-15T14:00:00Z",
          },
        ],
      };

      const response: ApiResponse<typeof mockAnvisaOverview> = {
        success: true,
        data: mockAnvisaOverview,
        message: "Visão geral ANVISA carregada",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar visão geral ANVISA",
        },
        500,
      );
    }
  })
  // 📋 Generate ANVISA report
  .post(
    "/anvisa/reports",
    zValidator("json", AnvisaReportSchema),
    async (c) => {
      const { reportType, period, includeDetails } = c.req.valid("json");

      try {
        // ANVISA report generation
        const mockReport = {
          reportId: `anvisa_${Date.now()}`,
          type: reportType,
          period,
          generatedAt: new Date().toISOString(),

          summary: {
            totalProcedures: 156,
            uniquePatients: 89,
            productsUsed: 23,
            adverseEvents: 0,
            complianceScore: 98.5,
          },

          procedures: includeDetails
            ? [
                {
                  date: "2024-01-20",
                  patientId: "pat_123_anonymized",
                  procedure: "Aplicação de Botox",
                  product: "Botox Allergan 100UI",
                  batchNumber: "BT20240115",
                  professionalId: "prof_1",
                  duration: 30,
                  outcome: "success",
                },
                // ... more procedures
              ]
            : [],

          products: [
            {
              name: "Botox Allergan",
              anvisaCode: "ALS123456",
              batchesUsed: ["BT20240115", "BT20240118"],
              totalUnits: 450,
              expirationTracking: "compliant",
            },
            // ... more products
          ],

          downloadUrl: `/api/v1/compliance/anvisa/reports/anvisa_${Date.now()}/download`,
          submissionDeadline: "2024-02-15T23:59:59Z",
        };

        const response: ApiResponse<typeof mockReport> = {
          success: true,
          data: mockReport,
          message: "Relatório ANVISA gerado com sucesso",
        };

        return c.json(response, HTTP_STATUS.CREATED);
      } catch {
        return c.json(
          {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Erro ao gerar relatório ANVISA",
          },
          500,
        );
      }
    },
  )
  // 🔐 Update patient consent
  .put("/lgpd/consent", zValidator("json", ConsentUpdateSchema), async (c) => {
    const consentData = c.req.valid("json");

    try {
      // Consent update
      const updatedConsent = {
        id: `consent_${Date.now()}`,
        ...consentData,
        updatedAt: new Date().toISOString(),
        source: "api",
        valid: true,
      };

      const response: ApiResponse<typeof updatedConsent> = {
        success: true,
        data: updatedConsent,
        message: "Consentimento atualizado com sucesso",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Erro ao atualizar consentimento",
        },
        400,
      );
    }
  })
  // 📊 Compliance dashboard export
  .get("/export/dashboard", async (c) => {
    try {
      // Dashboard export
      const mockExport = {
        exportId: `exp_${Date.now()}`,
        format: "pdf",
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/v1/compliance/downloads/exp_${Date.now()}.pdf`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours

        contents: {
          lgpdCompliance: true,
          anvisaCompliance: true,
          auditTrail: true,
          riskAssessment: true,
          recommendations: true,
        },

        fileSize: "2.4 MB",
        pages: 15,
      };

      const response: ApiResponse<typeof mockExport> = {
        success: true,
        data: mockExport,
        message: "Dashboard de compliance exportado",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao exportar dashboard",
        },
        500,
      );
    }
  });
